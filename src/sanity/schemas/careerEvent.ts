import { defineField, defineType } from 'sanity'

export const careerEvent = defineType({
  name: 'careerEvent',
  title: 'Career Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (EN)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleEs',
      title: 'Title (ES)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().min(2000).max(2030),
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'Solo Exhibition', value: 'solo' },
          { title: 'Group Exhibition', value: 'group' },
          { title: 'Award / Prize', value: 'award' },
          { title: 'Milestone', value: 'milestone' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue / Organization',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location (EN)',
      type: 'string',
      description: 'City, Country',
    }),
    defineField({
      name: 'locationEs',
      title: 'Location (ES)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description (EN)',
      type: 'text',
      rows: 2,
      description: 'Optional short description or context',
    }),
    defineField({
      name: 'descriptionEs',
      title: 'Description (ES)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional photo from the exhibition or event',
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight',
      type: 'boolean',
      description: 'Mark as a key career moment (shown with image in the timeline)',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Year (Newest First)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      eventType: 'eventType',
      venue: 'venue',
      media: 'image',
    },
    prepare({
      title,
      year,
      eventType,
      venue,
      media,
    }: {
      title?: string
      year?: number
      eventType?: string
      venue?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      media?: any
    }) {
      return {
        title: `${year ?? '?'} — ${title ?? 'Untitled'}`,
        subtitle: `${eventType ?? ''} ${venue ? '@ ' + venue : ''}`.trim(),
        media,
      }
    },
  },
})
