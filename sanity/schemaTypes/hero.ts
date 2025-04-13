import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'copy1',
      title: 'Copy 1',
      type: 'blockContent',
      description: 'Use Shift+Enter for line breaks, Enter for new paragraphs',
    }),
    defineField({
      name: 'copy2',
      title: 'Copy 2',
      type: 'blockContent',
      description: 'Use Shift+Enter for line breaks, Enter for new paragraphs',
    })
  ]
})