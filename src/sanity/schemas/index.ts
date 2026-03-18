import type { SchemaTypeDefinition } from 'sanity'
import { collection } from './collection'
import { artwork } from './artwork'
import { page } from './page'
import { siteSettings } from './siteSettings'
import { exhibition } from './exhibition'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  collection,
  artwork,
  page,
  exhibition,
]
