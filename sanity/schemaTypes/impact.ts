import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'impact',
  title: 'Impact',
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
      name: 'subHeading',
      title: 'Sub Heading',
      type: 'blockContent',
      description: 'Use Shift+Enter for line breaks, Enter for new paragraphs',
    }),
    defineField({
      name: 'copy',
      title: 'Copy',
      type: 'blockContent',
      description: 'Use Shift+Enter for line breaks, Enter for new paragraphs',
    }),
  ],
})
