import { defineField, defineType } from 'sanity'

export const artwork = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      fields: [
        { name: 'es', title: 'Spanish', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'object',
              fields: [
                { name: 'es', title: 'Spanish', type: 'string' },
                { name: 'en', title: 'English', type: 'string' },
              ],
            },
          ],
        },
      ],
      validation: (Rule) => Rule.min(1).required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g. "120 × 90 cm"',
    }),
    defineField({
      name: 'medium',
      title: 'Medium / Technique',
      type: 'object',
      fields: [
        { name: 'es', title: 'Spanish', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        {
          name: 'es',
          title: 'Spanish',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'en',
          title: 'English',
          type: 'array',
          of: [{ type: 'block' }],
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'homepageSize',
      title: 'Homepage Grid Size',
      type: 'string',
      description: 'Only used when featured is true',
      options: {
        list: [
          { title: 'Small (1×1)', value: 'small' },
          { title: 'Medium (1×1 large)', value: 'medium' },
          { title: 'Large (2×2)', value: 'large' },
          { title: 'Wide (2×1)', value: 'wide' },
          { title: 'Tall (1×2)', value: 'tall' },
        ],
      },
      initialValue: 'small',
      hidden: ({ document }) => !document?.featured,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Order within the collection',
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      images: 'images',
      subtitle: 'collection.title.en',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare({ title, images, subtitle }: any) {
      return {
        title: title ?? 'Untitled',
        subtitle,
        media: Array.isArray(images) ? images[0] : images,
      }
    },
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    {
      title: 'Year (newest first)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
})
