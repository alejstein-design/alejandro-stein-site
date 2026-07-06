/**
 * Translate artwork descriptions ES → EN in Sanity.
 *
 * Finds artworks that have a Spanish description (description.es) but no English
 * one (description.en) and fills description.en with a faithful curatorial
 * translation, produced by Claude. Never overwrites an existing English text.
 *
 * SAFE BY DEFAULT: dry-run (prints the translations, writes nothing).
 * Pass `--write` to apply.
 *
 * Required env:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 *   ANTHROPIC_API_KEY
 *   SANITY_API_TOKEN   (only for --write; Editor permission)
 *
 * Run: ./node_modules/.bin/tsx scripts/translate-descriptions.ts          (dry-run)
 *      ./node_modules/.bin/tsx scripts/translate-descriptions.ts --write  (apply)
 */
import { createClient } from '@sanity/client'
import { randomUUID } from 'node:crypto'

const WRITE = process.argv.includes('--write')
const MODEL = 'claude-sonnet-4-6'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_TOKEN
const anthropicKey = process.env.ANTHROPIC_API_KEY

if (!projectId) throw new Error('Falta NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!anthropicKey) throw new Error('Falta ANTHROPIC_API_KEY')
if (WRITE && !token) throw new Error('Para --write necesitás SANITY_API_TOKEN (Editor)')

const sanity = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

/** Portable Text (bloques) → texto plano con saltos de párrafo */
function blocksToText(blocks: unknown[]): string {
  return (blocks ?? [])
    .map((b) => {
      const block = b as { _type?: string; children?: { text?: string }[] }
      if (block?._type !== 'block') return ''
      return (block.children ?? []).map((c) => c.text ?? '').join('')
    })
    .filter(Boolean)
    .join('\n\n')
}

/** texto plano → Portable Text (un block por párrafo) */
function toPortableText(text: string) {
  return String(text)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((p) => ({
      _type: 'block',
      _key: randomUUID().slice(0, 12),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: randomUUID().slice(0, 12), text: p, marks: [] }],
    }))
}

async function translate(text: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system:
        'You are a professional art translator. Translate the Spanish curatorial text about a visual artwork into English. ' +
        'Keep the register: precise, contemporary art writing — never flowery or added. Be faithful: do not add, remove, or reinterpret meaning. ' +
        'Preserve paragraph breaks. Output ONLY the English translation, no preamble, no quotes.',
      messages: [{ role: 'user', content: text }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { content: { type: string; text: string }[] }
  return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
}

interface Art { _id: string; title?: { es?: string; en?: string }; description?: { es?: unknown[]; en?: unknown[] } }

async function main() {
  const arts: Art[] = await sanity.fetch(
    `*[_type=="artwork" && count(description.es) > 0 && (!defined(description.en) || count(description.en) == 0)]{_id,title,description}`
  )
  console.log(`\n${arts.length} obras con descripción ES y sin EN.\n`)
  if (arts.length === 0) return

  const patches: { id: string; en: ReturnType<typeof toPortableText>; label: string }[] = []
  for (const a of arts) {
    const label = a.title?.es || a.title?.en || a._id
    const es = blocksToText(a.description!.es!)
    process.stdout.write(`• ${label} … `)
    const en = await translate(es)
    console.log(`ok (${en.length} chars)`)
    console.log(`    ${en.slice(0, 140)}${en.length > 140 ? '…' : ''}`)
    patches.push({ id: a._id, en: toPortableText(en), label })
  }

  if (!WRITE) { console.log('\nDRY-RUN: no se escribió nada. Corré con --write para aplicar.\n'); return }

  console.log(`\nAplicando ${patches.length} traducciones en Sanity...`)
  let tx = sanity.transaction()
  for (const p of patches) tx = tx.patch(p.id, (patch) => patch.set({ 'description.en': p.en }))
  await tx.commit()
  console.log('✓ Listo.\n')
}

main().catch((e) => { console.error(e); process.exit(1) })
