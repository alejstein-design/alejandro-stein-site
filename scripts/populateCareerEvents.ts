/**
 * Populate career events in Sanity.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=<token> npx tsx scripts/populateCareerEvents.ts
 *
 * Get a write token from: https://www.sanity.io/manage → project → API → Tokens
 * Choose "Editor" or "Deploy Studio" permission level.
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'o85g5pkk',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-01-01',
})

const events: Array<Record<string, unknown>> = [
  {
    _type: 'careerEvent',
    title: 'ALLIN — Solo Exhibition',
    titleEs: 'ALLIN — Exposición Individual',
    year: 2024,
    eventType: 'solo',
    venue: 'ArtLab Siroco',
    location: 'Madrid, Spain',
    locationEs: 'Madrid, España',
    description: 'Collaboration with Venezuelan artist Alberto Pereney',
    descriptionEs: 'En colaboración con el artista venezolano Alberto Pereney',
    highlight: true,
  },
  {
    _type: 'careerEvent',
    title: 'Apertura No.1',
    titleEs: 'Apertura No.1',
    year: 2023,
    eventType: 'group',
    venue: 'PISO13',
    location: 'Buenos Aires, Argentina',
    locationEs: 'Buenos Aires, Argentina',
    description: 'Part of the Microcentro Cuenta event',
    descriptionEs: 'Parte del evento Microcentro Cuenta',
    highlight: false,
  },
  {
    _type: 'careerEvent',
    title: '14th Bancor Painting Prize — Young Artist Mention',
    titleEs: '14a Premio de Pintura Bancor — Mención Arte Bancor Joven Adquisición',
    year: 2021,
    eventType: 'award',
    venue: 'Museo Arq. Francisco Tamburini',
    location: 'Córdoba, Argentina',
    locationEs: 'Córdoba, Argentina',
    description: 'Received the Young Artist Acquisition Mention at the 14th edition of the Bancor Painting Prize',
    descriptionEs: 'Obtuvo una Mención Arte Bancor Joven Adquisición en la 14a edición del Premio de Pintura Bancor',
    highlight: true,
  },
  {
    _type: 'careerEvent',
    title: 'Temporal Atemporal',
    titleEs: 'Temporal Atemporal',
    year: 2021,
    eventType: 'group',
    venue: 'CCD',
    location: 'Punta del Este, Uruguay',
    locationEs: 'Punta del Este, Uruguay',
    highlight: false,
  },
  {
    _type: 'careerEvent',
    title: 'Monólogo Aparte',
    titleEs: 'Monólogo Aparte',
    year: 2021,
    eventType: 'group',
    venue: 'BSM Art Building',
    location: 'Buenos Aires, Argentina',
    locationEs: 'Buenos Aires, Argentina',
    highlight: false,
  },
  {
    _type: 'careerEvent',
    title: 'Dynamic Scenarios — National Visual Arts Competition',
    titleEs: 'Escenarios Dinámicos — Concurso de Artes Visuales del Fondo Nacional de las Artes',
    year: 2019,
    eventType: 'group',
    venue: 'Casa Nacional del Bicentenario',
    location: 'Buenos Aires, Argentina',
    locationEs: 'Buenos Aires, Argentina',
    description: 'Selected for the 2019 Visual Arts Competition by the National Endowment for the Arts',
    descriptionEs: 'Seleccionado para el Concurso de Artes Visuales 2019 del Fondo Nacional de las Artes',
    highlight: true,
  },
  {
    _type: 'careerEvent',
    title: 'Like Home',
    titleEs: 'Like Home',
    year: 2018,
    eventType: 'group',
    venue: 'Loop-Raum GLINT',
    location: 'Berlin, Germany',
    locationEs: 'Berlín, Alemania',
    highlight: false,
  },
  {
    _type: 'careerEvent',
    title: 'Optic Party — First Solo Exhibition',
    titleEs: 'Optic Party — Primera Exposición Individual',
    year: 2016,
    eventType: 'solo',
    venue: 'Ben Ami Gallery',
    location: 'Tel Aviv, Israel',
    locationEs: 'Tel Aviv, Israel',
    description: 'First solo exhibition',
    descriptionEs: 'Primera exposición individual',
    highlight: true,
  },
  {
    _type: 'careerEvent',
    title: 'Color and Movement Celebration',
    titleEs: 'Color and Movement Celebration',
    year: 2016,
    eventType: 'group',
    venue: 'Al Hagaam Gallery',
    location: 'Raanana, Israel',
    locationEs: 'Raanana, Israel',
    highlight: false,
  },
  {
    _type: 'careerEvent',
    title: 'Neon Slaught',
    titleEs: 'Neon Slaught',
    year: 2012,
    eventType: 'group',
    venue: 'New York Kills Artists',
    location: 'Brooklyn, New York, USA',
    locationEs: 'Brooklyn, Nueva York, EEUU',
    description: 'One of the earliest group exhibitions',
    descriptionEs: 'Una de las primeras muestras grupales',
    highlight: false,
  },
]

async function populate() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error('Missing SANITY_WRITE_TOKEN environment variable.')
    process.exit(1)
  }

  // Check for existing events to avoid duplicates
  const existing = await client.fetch<Array<{ title: string; year: number }>>(
    `*[_type == "careerEvent"]{ title, year }`
  )
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing career event(s):`)
    existing.forEach((e) => console.log(`  - ${e.year} — ${e.title}`))
    console.log('\nAbort: events already exist. Delete them first if you want to re-seed.')
    process.exit(0)
  }

  console.log(`Creating ${events.length} career events...`)
  for (const event of events) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.create(event as any)
    console.log(`✓ Created: ${result._id} — ${event.year} — ${event.title}`)
  }
  console.log('\nDone!')
}

populate().catch((err) => {
  console.error(err)
  process.exit(1)
})
