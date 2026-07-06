/**
 * Sync artwork metadata from the Manager app (Supabase `obras`) into Sanity.
 *
 * Fills the sparse per-artwork fields on the portfolio site (year, dimensions,
 * medium, Spanish description) using the richer catalog already curated in the
 * Manager. Matches Manager works to Sanity artworks by normalized title.
 *
 * SAFE BY DEFAULT: runs in dry-run mode (reads only, writes nothing) and prints
 * exactly what it would change. Pass `--write` to actually apply the patches.
 * With `--write` it only fills fields that are currently EMPTY in Sanity, so it
 * never clobbers anything you edited by hand.
 *
 * Required env vars:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID   (already in .env.local)
 *   NEXT_PUBLIC_SANITY_DATASET      (defaults to "production")
 *   SUPABASE_URL                    (Manager Supabase project URL)
 *   SUPABASE_SERVICE_ROLE_KEY       (Manager service role key — read only here)
 *   SANITY_API_TOKEN                (only needed for --write; Editor permission)
 *
 * Run:  ./node_modules/.bin/tsx scripts/sync-from-manager.ts          (dry-run)
 *       ./node_modules/.bin/tsx scripts/sync-from-manager.ts --write  (apply)
 */
import { createClient } from '@sanity/client'
import { randomUUID } from 'node:crypto'

const WRITE = process.argv.includes('--write')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const token = process.env.SANITY_API_TOKEN

if (!projectId) throw new Error('Falta NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!supabaseUrl || !supabaseKey) throw new Error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
if (WRITE && !token) throw new Error('Para --write necesitás SANITY_API_TOKEN (permiso Editor)')

const sanity = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

/** lowercase, sin tildes, espacios colapsados, sin puntuación de borde */
function norm(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/["'“”‘’.,!¡?¿]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "2026" → 2026 (number) | null */
function parseYear(v: unknown): number | null {
  const m = String(v ?? '').match(/\d{4}/)
  return m ? Number(m[0]) : null
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

interface Obra {
  titulo: string; serie?: string; año?: string; dimensiones?: string
  tecnica?: string; concepto?: string
}
interface Art {
  _id: string; title?: { es?: string; en?: string }
  year?: number; dimensions?: string
  medium?: { es?: string; en?: string }
  description?: { es?: unknown[]; en?: unknown[] }
}

async function main() {
  // 1) Catálogo del Manager
  const res = await fetch(
    `${supabaseUrl}/rest/v1/obras?select=titulo,serie,año,dimensiones,tecnica,concepto`,
    { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } }
  )
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  const obras: Obra[] = await res.json()

  // 2) Obras del sitio (Sanity)
  const arts: Art[] = await sanity.fetch(
    `*[_type=="artwork"]{_id,title,year,dimensions,medium,description}`
  )

  // índice de obras del Manager por título normalizado
  const byTitle = new Map<string, Obra>()
  for (const o of obras) byTitle.set(norm(o.titulo), o)

  // Títulos genéricos o repetidos NO se pueden matchear sin ambigüedad:
  // varias "Sin título" distintas terminarían con el mismo texto.
  const GENERIC = new Set(['', 'sin titulo', 'untitled', 's/t', 'st'])
  const sanityTitleCount = new Map<string, number>()
  for (const a of arts) {
    const k = norm(a.title?.es || a.title?.en || '')
    sanityTitleCount.set(k, (sanityTitleCount.get(k) ?? 0) + 1)
  }
  const skippedAmbiguous: string[] = []

  let matched = 0
  const patches: { id: string; set: Record<string, unknown>; label: string; fields: string[] }[] = []

  for (const a of arts) {
    const key = norm(a.title?.es || a.title?.en || '')
    const o = byTitle.get(key)
    if (!o) continue
    // saltear ambiguos: título genérico o repetido en varias obras del sitio
    if (GENERIC.has(key) || (sanityTitleCount.get(key) ?? 0) > 1) {
      skippedAmbiguous.push(a.title?.es || a.title?.en || a._id)
      continue
    }
    matched++

    const set: Record<string, unknown> = {}
    const fields: string[] = []

    // solo completar lo que está vacío en Sanity
    const year = parseYear(o.año)
    if (a.year == null && year != null) { set['year'] = year; fields.push(`year=${year}`) }

    if (!a.dimensions && o.dimensiones?.trim()) { set['dimensions'] = o.dimensiones.trim(); fields.push(`dimensions="${o.dimensiones.trim()}"`) }

    if (!a.medium?.es && o.tecnica?.trim()) { set['medium.es'] = o.tecnica.trim(); fields.push(`medium.es="${o.tecnica.trim()}"`) }

    const hasDescEs = Array.isArray(a.description?.es) && a.description!.es!.length > 0
    if (!hasDescEs && o.concepto?.trim()) {
      set['description.es'] = toPortableText(o.concepto)
      fields.push(`description.es (${o.concepto.trim().length} chars)`)
    }

    if (fields.length) patches.push({ id: a._id, set, label: a.title?.es || a.title?.en || a._id, fields })
  }

  // Reporte
  console.log(`\nManager: ${obras.length} obras · Sanity: ${arts.length} artworks`)
  console.log(`Match por título: ${matched} · con datos para completar: ${patches.length}\n`)
  for (const p of patches) console.log(`• ${p.label}\n    ${p.fields.join('\n    ')}`)

  if (skippedAmbiguous.length) {
    console.log(`\n${skippedAmbiguous.length} salteadas por título ambiguo/genérico (ej. "Sin título"): ${skippedAmbiguous.join(', ')}`)
  }
  const noMatch = arts.filter((a) => !byTitle.has(norm(a.title?.es || a.title?.en || '')))
  console.log(`\n${noMatch.length} obras del sitio sin match en el Manager (quedan como están).`)
  console.log(`Nota: description.en (inglés) NO se completa — el Manager solo tiene español.\n`)

  if (!WRITE) { console.log('DRY-RUN: no se escribió nada. Corré con --write para aplicar.\n'); return }

  console.log(`Aplicando ${patches.length} patches en Sanity...`)
  let tx = sanity.transaction()
  for (const p of patches) tx = tx.patch(p.id, (patch) => patch.set(p.set))
  await tx.commit()
  console.log('✓ Listo.\n')
}

main().catch((e) => { console.error(e); process.exit(1) })
