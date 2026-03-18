import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemas'

const SITE_SETTINGS_DOC_ID = 'siteSettings'

export default defineConfig({
  name: 'alejandro-stein',
  title: 'Alejandro Stein',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // ── Site Settings ────────────────────────────────────────────────
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId(SITE_SETTINGS_DOC_ID)
              ),
            S.divider(),
            // ── All content ──────────────────────────────────────────────────
            S.listItem()
              .title('Collections')
              .schemaType('collection')
              .child(S.documentTypeList('collection').title('Collections')),
            S.listItem()
              .title('Artworks')
              .schemaType('artwork')
              .child(S.documentTypeList('artwork').title('Artworks')),
            S.divider(),
            S.listItem()
              .title('Pages')
              .schemaType('page')
              .child(S.documentTypeList('page').title('Pages')),
            S.listItem()
              .title('Exhibitions')
              .schemaType('exhibition')
              .child(S.documentTypeList('exhibition').title('Exhibitions')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
