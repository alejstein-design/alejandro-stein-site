// WARNING: Running this script multiple times will create duplicate collections
// and artworks. Only run once, or delete existing content in Sanity Studio first.
//
// Usage: npx tsx scripts/import-artworks.ts

import dotenv from 'dotenv'
dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname })
import { createClient } from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId) {
  console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('❌ Missing SANITY_API_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ─── Collection mapping ───────────────────────────────────────────────────────

interface CollectionMeta {
  titleEn: string
  titleEs: string
  category: string
  descriptionEn: string
  descriptionEs: string
  year: string
  mediumEn: string
  mediumEs: string
  featured: boolean
  sortOrder: number
}

const COLLECTION_MAP: Record<string, CollectionMeta> = {
  tapestries: {
    titleEn: 'Tapestries',
    titleEs: 'Tapices y Alfombras',
    category: 'tapestries',
    descriptionEn:
      'Hand-tufted textiles exploring geometric symbolism and chromatic energy. Each piece transforms traditional craft into contemporary visual systems.',
    descriptionEs:
      'Textiles hechos a mano que exploran el simbolismo geométrico y la energía cromática.',
    year: '2020 — Present',
    mediumEn: 'Hand-tufted textile',
    mediumEs: 'Textil hecho a mano',
    featured: true,
    sortOrder: 1,
  },
  murals: {
    titleEn: 'Murals',
    titleEs: 'Murales',
    category: 'murals',
    descriptionEn:
      'Large-scale geometric interventions transforming architectural surfaces into optical experiences. Site-specific works in Buenos Aires and beyond.',
    descriptionEs:
      'Intervenciones geométricas a gran escala que transforman superficies arquitectónicas en experiencias ópticas.',
    year: '2022 — Present',
    mediumEn: 'Acrylic on wall',
    mediumEs: 'Acrílico sobre pared',
    featured: true,
    sortOrder: 2,
  },
  handmade: {
    titleEn: 'Handmade',
    titleEs: 'Obra Manual',
    category: 'handmade',
    descriptionEn:
      'Paintings on canvas and paper exploring the intersection of sacred geometry, op-art illusion, and fractal growth. Each work is born from a seed that grows boundlessly.',
    descriptionEs:
      'Pinturas sobre tela y papel que exploran la intersección de la geometría sagrada, la ilusión óptica y el crecimiento fractal.',
    year: '2012 — Present',
    mediumEn: 'Mixed media on canvas / paper',
    mediumEs: 'Técnica mixta sobre tela / papel',
    featured: true,
    sortOrder: 3,
  },
  doors: {
    titleEn: 'Doors',
    titleEs: 'Puertas',
    category: 'doors',
    descriptionEn:
      'Painted doors as functional art objects. Each door becomes a portal — a threshold between the everyday and the geometric imagination.',
    descriptionEs:
      'Puertas pintadas como objetos de arte funcional. Cada puerta se convierte en un portal entre lo cotidiano y la imaginación geométrica.',
    year: '2020 — Present',
    mediumEn: 'Acrylic on wood door',
    mediumEs: 'Acrílico sobre puerta de madera',
    featured: true,
    sortOrder: 4,
  },
  'mixed-media': {
    titleEn: 'Mixed Media Objects',
    titleEs: 'Objetos de Técnica Mixta',
    category: 'mixed-media',
    descriptionEn:
      'Three-dimensional painted objects combining geometric painting with sculptural form.',
    descriptionEs:
      'Objetos tridimensionales pintados que combinan la pintura geométrica con la forma escultórica.',
    year: '2019 — Present',
    mediumEn: 'Acrylic on wood, mixed media',
    mediumEs: 'Acrílico sobre madera, técnica mixta',
    featured: false,
    sortOrder: 5,
  },
  'combinacion-1': {
    titleEn: 'Combinación I',
    titleEs: 'Combinación I',
    category: 'combinacion',
    descriptionEn:
      'Black and white op-art series. A circle divided into quadrants, each filled with interlocking patterns — swirling rosettes, checkerboard spheres, striped waves. The same vocabulary recombined across seven variations.',
    descriptionEs:
      'Serie de op-art en blanco y negro. Un círculo dividido en cuadrantes, cada uno con patrones entrelazados. El mismo vocabulario visual recombinado en siete variaciones.',
    year: '2018',
    mediumEn: 'Acrylic on canvas',
    mediumEs: 'Acrílico sobre tela',
    featured: true,
    sortOrder: 6,
  },
  'combinacion-2': {
    titleEn: 'Combinación II',
    titleEs: 'Combinación II',
    category: 'combinacion',
    descriptionEn:
      'Second series of systematic black and white explorations. Diamond spirals radiating from center with sweeping curved bands, each piece shifting the balance and rotation.',
    descriptionEs:
      'Segunda serie de exploraciones sistemáticas en blanco y negro. Espirales de diamantes irradiando desde el centro con bandas curvas.',
    year: '2019',
    mediumEn: 'Acrylic on canvas',
    mediumEs: 'Acrílico sobre tela',
    featured: false,
    sortOrder: 7,
  },
  'mosaico-refractario': {
    titleEn: 'Mosaico Refractario',
    titleEs: 'Mosaico Refractario',
    category: 'mosaico-refractario',
    descriptionEn:
      'An extensive series of handmade tile-pattern paintings, each built from a single repeating geometric unit painted across a grid. Five sub-series (A through E) explore different seeds, color palettes, and pattern systems.',
    descriptionEs:
      'Una serie extensa de pinturas de patrones de mosaico hechas a mano, cada una construida a partir de una unidad geométrica repetida en una grilla. Cinco sub-series (A a E) exploran diferentes semillas, paletas de color y sistemas de patrones.',
    year: '2015 — 2020',
    mediumEn: 'Acrylic on canvas, tiled composition',
    mediumEs: 'Acrílico sobre tela, composición en mosaico',
    featured: true,
    sortOrder: 8,
  },
  'architectural-patterns': {
    titleEn: 'Architectural Patterns',
    titleEs: 'Patrones Arquitectónicos',
    category: 'architectural-patterns',
    descriptionEn:
      'Digital line drawings that take real buildings — Bofill, Gaudí, Miami Art Deco — and kaleidoscope them into impossible symmetrical structures. Architecture becomes pattern.',
    descriptionEs:
      'Dibujos digitales de línea que toman edificios reales y los transforman en estructuras simétricas imposibles. La arquitectura se convierte en patrón.',
    year: '2020 — Present',
    mediumEn: 'Digital drawing',
    mediumEs: 'Dibujo digital',
    featured: true,
    sortOrder: 9,
  },
  'digital-patterns': {
    titleEn: 'Digital Pattern Studies',
    titleEs: 'Estudios de Patrones Digitales',
    category: 'digital',
    descriptionEn:
      'Pure black and white digital op-art patterns — circular bocetos, spiraling squares, and Fibonacci-based tessellations.',
    descriptionEs:
      'Patrones digitales puros de op-art en blanco y negro — bocetos circulares, cuadrados espiralados y teselaciones basadas en Fibonacci.',
    year: '2019 — Present',
    mediumEn: 'Digital art',
    mediumEs: 'Arte digital',
    featured: false,
    sortOrder: 10,
  },
  'digital-birds': {
    titleEn: 'Birds in Architecture',
    titleEs: 'Aves en Arquitectura',
    category: 'digital',
    descriptionEn: 'Birds placed within geometric architectural spaces — nature meets pattern.',
    descriptionEs:
      'Aves situadas en espacios arquitectónicos geométricos. La naturaleza se encuentra con el patrón.',
    year: '2022',
    mediumEn: 'Digital art',
    mediumEs: 'Arte digital',
    featured: false,
    sortOrder: 11,
  },
  'digital-portraits': {
    titleEn: 'Portraits',
    titleEs: 'Retratos',
    category: 'portraits',
    descriptionEn:
      'Digital portrait series — each figure set against a different black and white op-art background, wearing elaborately patterned clothing, often accompanied by an animal companion.',
    descriptionEs:
      'Serie de retratos digitales — cada figura sobre un fondo diferente de op-art en blanco y negro, vestida con ropa de patrones elaborados.',
    year: '2021 — Present',
    mediumEn: 'Digital art, vector illustration',
    mediumEs: 'Arte digital, ilustración vectorial',
    featured: true,
    sortOrder: 12,
  },
  'cultural-figures': {
    titleEn: 'All Tribes',
    titleEs: 'Todas las Tribus',
    category: 'digital',
    descriptionEn:
      'A celebration of global ceremonial costume and pattern — masked and costumed figures from cultures worldwide.',
    descriptionEs:
      'Una celebración del traje ceremonial y los patrones globales — figuras enmascaradas y disfrazadas de culturas de todo el mundo.',
    year: '2023',
    mediumEn: 'Digital art, vector illustration',
    mediumEs: 'Arte digital, ilustración vectorial',
    featured: false,
    sortOrder: 13,
  },
  canvas: {
    titleEn: 'Canvas',
    titleEs: 'Canvas',
    category: 'handmade',
    descriptionEn:
      'Large-format acrylic paintings on canvas. Dense geometric compositions where patterns intersect, layer, and create depth — the core of the studio practice.',
    descriptionEs:
      'Pinturas de gran formato en acrílico sobre tela. Composiciones geométricas densas donde los patrones se intersectan, se superponen y crean profundidad.',
    year: '2025',
    mediumEn: 'Acrylic on canvas',
    mediumEs: 'Acrílico sobre tela',
    featured: true,
    sortOrder: 14,
  },
  guardians: {
    titleEn: 'Guardians',
    titleEs: 'Guardianes',
    category: 'portraits',
    descriptionEn:
      'Digital portrait series of futuristic guardian figures — each set against a distinct op-art background, adorned in elaborate patterned armor and accompanied by animal companions.',
    descriptionEs:
      'Serie de retratos digitales de figuras guardianas futuristas — cada una sobre un fondo de op-art distinto, adornada con armaduras de patrones elaborados y acompañada de animales.',
    year: '2023 — Present',
    mediumEn: 'Digital art, vector illustration',
    mediumEs: 'Arte digital, ilustración vectorial',
    featured: true,
    sortOrder: 15,
  },
  bw: {
    titleEn: 'B&W',
    titleEs: 'Blanco y Negro',
    category: 'digital',
    descriptionEn:
      'Pure black and white digital works — op-art patterns, geometric studies, and optical illusions stripped to their essential contrast.',
    descriptionEs:
      'Obras digitales en blanco y negro puro — patrones de op-art, estudios geométricos e ilusiones ópticas reducidas a su contraste esencial.',
    year: '2019 — Present',
    mediumEn: 'Digital art',
    mediumEs: 'Arte digital',
    featured: false,
    sortOrder: 16,
  },
  ethnicities: {
    titleEn: 'Ethnicities',
    titleEs: 'Etnias',
    category: 'portraits',
    descriptionEn:
      'Digital portraits celebrating global identity and cultural adornment — figures from diverse backgrounds rendered in rich color against geometric op-art fields, each wearing the patterns of their heritage.',
    descriptionEs:
      'Retratos digitales que celebran la identidad global y la ornamentación cultural — figuras de diversos orígenes sobre campos geométricos de op-art.',
    year: '2022 — Present',
    mediumEn: 'Digital art, vector illustration',
    mediumEs: 'Arte digital, ilustración vectorial',
    featured: true,
    sortOrder: 17,
  },
  'mutatis-mutandis': {
    titleEn: 'Mutatis Mutandis',
    titleEs: 'Mutatis Mutandis',
    category: 'handmade',
    descriptionEn:
      "Mutatis Mutandis — 'changing what needs to be changed.' A series exploring transformation and variation within geometric systems. The same structure, altered by new rules.",
    descriptionEs:
      "Mutatis Mutandis — 'cambiando lo que necesita ser cambiado.' Una serie que explora la transformación y variación dentro de sistemas geométricos. La misma estructura, alterada por nuevas reglas.",
    year: '2024',
    mediumEn: 'Mixed media',
    mediumEs: 'Técnica mixta',
    featured: true,
    sortOrder: 18,
  },
  'patterned-insects': {
    titleEn: 'Patterned Insects',
    titleEs: 'Insectos con Patrones',
    category: 'digital',
    descriptionEn:
      'Insects reimagined through the lens of geometric pattern — natural forms fused with op-art systems, blurring the line between organism and ornament.',
    descriptionEs:
      'Insectos reimaginados a través del lente del patrón geométrico — formas naturales fusionadas con sistemas de op-art, difuminando la línea entre organismo y ornamento.',
    year: '2023',
    mediumEn: 'Digital art, vector illustration',
    mediumEs: 'Arte digital, ilustración vectorial',
    featured: false,
    sortOrder: 19,
  },
  'ray-of-creation': {
    titleEn: 'Ray of Creation',
    titleEs: 'Rayo de Creación',
    category: 'handmade',
    descriptionEn:
      'A series inspired by the esoteric concept of the Ray of Creation — the chain of worlds from the absolute to the moon. Geometric compositions channeling cosmic order and spiritual resonance.',
    descriptionEs:
      'Una serie inspirada en el concepto esotérico del Rayo de Creación — la cadena de mundos desde el absoluto hasta la luna. Composiciones geométricas que canalizan el orden cósmico y la resonancia espiritual.',
    year: '2024',
    mediumEn: 'Mixed media on canvas',
    mediumEs: 'Técnica mixta sobre tela',
    featured: true,
    sortOrder: 20,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** "my_file-name.jpg" → "My File Name" */
function humanizeName(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, '')
  return withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/** "My File Name.jpg" → "my-file-name" */
function slugifyName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Homepage size assignment ─────────────────────────────────────────────────
// The first 3 featured artworks across ALL collections get distinctive sizes.
let featuredArtworkCount = 0

function nextHomepageSize(
  isFeaturedCollection: boolean,
  indexInCollection: number,
): 'large' | 'wide' | 'tall' | 'small' {
  if (!isFeaturedCollection || indexInCollection >= 2) return 'small'
  featuredArtworkCount++
  if (featuredArtworkCount === 1) return 'large'
  if (featuredArtworkCount === 2) return 'wide'
  if (featuredArtworkCount === 3) return 'tall'
  return 'small'
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Accept folder names with spaces ("Ale Images") or hyphens ("ale-images")
  const imagesRoot = ['Ale Images', 'ale-images']
    .map((n) => path.join(process.cwd(), n))
    .find((p) => fs.existsSync(p))

  if (!imagesRoot) {
    console.error('❌ Images folder not found. Expected "Ale Images" or "ale-images" in project root.')
    process.exit(1)
  }

  console.log(`📁 Using images folder: ${path.basename(imagesRoot)}`)

  // Optional: --only "Folder Name" to process a single folder
  const onlyFolder = process.argv[2] === '--only' ? process.argv[3] : null

  // All subfolders on disk (optionally filtered)
  const subfolders = fs
    .readdirSync(imagesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !onlyFolder || name === onlyFolder)
    .sort()

  let totalCollections = 0
  let totalArtworks = 0

  // Explicit overrides for folder names that don't normalize cleanly
  const FOLDER_OVERRIDES: Record<string, string> = {
    'B&W': 'bw',
    'Mosaico Fractario': 'mosaico-refractario',
  }

  for (const folder of subfolders) {
    // Check explicit override first, then generic normalization
    const mappingKey =
      FOLDER_OVERRIDES[folder] ?? folder.toLowerCase().replace(/\s+/g, '-')

    // ── Failsafe: skip folders with no mapping ──────────────────────────────
    const meta = COLLECTION_MAP[mappingKey]
    if (!meta) {
      console.warn(`⚠  Skipping folder '${folder}' — no mapping found`)
      continue
    }

    const folderPath = path.join(imagesRoot, folder)

    // ── Create Collection document ──────────────────────────────────────────
    const collectionDoc = await client.create({
      _type: 'collection',
      title: { en: meta.titleEn, es: meta.titleEs },
      slug: { _type: 'slug', current: mappingKey },
      description: { en: meta.descriptionEn, es: meta.descriptionEs },
      category: meta.category,
      year: meta.year,
      medium: { en: meta.mediumEn, es: meta.mediumEs },
      featured: meta.featured,
      sortOrder: meta.sortOrder,
      layoutStyle: 'grid',
    })
    console.log(`✓ Created collection: ${meta.titleEn}`)
    totalCollections++

    // ── Read & sort image files ─────────────────────────────────────────────
    const imageFiles = fs
      .readdirSync(folderPath)
      .filter((f) => IMAGE_EXTENSIONS.test(f))
      .sort()

    if (imageFiles.length === 0) {
      console.log(`  (no images in ${folder})`)
      continue
    }

    let firstAssetRef: string | null = null

    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i]
      const filePath = path.join(folderPath, filename)

      try {
        // Upload image asset
        const asset = await client.assets.upload(
          'image',
          fs.createReadStream(filePath),
          { filename },
        )

        if (i === 0) firstAssetRef = asset._id

        const title = humanizeName(filename)
        const slug = slugifyName(filename)
        const isFeatured = meta.featured && i < 2
        const homepageSize = nextHomepageSize(meta.featured, i)

        // Create Artwork document
        await client.create({
          _type: 'artwork',
          title: { en: title, es: title },
          slug: { _type: 'slug', current: slug },
          collection: { _type: 'reference', _ref: collectionDoc._id },
          images: [
            {
              _type: 'image',
              _key: randomKey(),
              asset: { _type: 'reference', _ref: asset._id },
            },
          ],
          sortOrder: i + 1,
          featured: isFeatured,
          homepageSize,
        })

        console.log(`  ↳ Uploaded ${filename} → ${meta.titleEn}`)
        totalArtworks++
      } catch (err) {
        console.error(`  ✗ Failed to upload ${filename}:`, (err as Error).message)
      }

      // Rate-limit buffer
      await sleep(500)
    }

    // ── Patch collection with cover image ────────────────────────────────────
    if (firstAssetRef) {
      await client
        .patch(collectionDoc._id)
        .set({
          coverImage: {
            _type: 'image',
            asset: { _type: 'reference', _ref: firstAssetRef },
          },
        })
        .commit()
    }
  }

  // ─── Singleton documents (idempotent via createOrReplace) ─────────────────
  // Skip when using --only (singletons already exist from the initial import)
  if (onlyFolder) {
    console.log(`\n✅ Import complete. Created ${totalCollections} collections and ${totalArtworks} artworks.`)
    return
  }

  await client.createOrReplace({
    _type: 'siteSettings',
    _id: 'siteSettings',
    artistName: 'Alejandro Stein',
    tagline: {
      en: 'Geometric forms. Sacred patterns. Fractal growth.',
      es: 'Formas geométricas. Patrones sagrados. Crecimiento fractal.',
    },
    contactEmail: 'alejandrosteinart@gmail.com',
    socialLinks: [
      {
        _key: 'ig',
        platform: 'instagram',
        url: 'https://instagram.com/alustein',
      },
    ],
  })
  console.log('✓ Created SiteSettings')

  await client.createOrReplace({
    _type: 'page',
    _id: 'page-about',
    title: { en: 'About', es: 'Sobre' },
    slug: { _type: 'slug', current: 'about' },
  })
  console.log('✓ Created page: About')

  await client.createOrReplace({
    _type: 'page',
    _id: 'page-statement',
    title: { en: 'Statement', es: 'Declaración' },
    slug: { _type: 'slug', current: 'statement' },
  })
  console.log('✓ Created page: Statement')

  await client.createOrReplace({
    _type: 'page',
    _id: 'page-contact',
    title: { en: 'Contact', es: 'Contacto' },
    slug: { _type: 'slug', current: 'contact' },
  })
  console.log('✓ Created page: Contact')

  console.log(
    `\n✅ Import complete. Created ${totalCollections} collections and ${totalArtworks} artworks.`,
  )
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
