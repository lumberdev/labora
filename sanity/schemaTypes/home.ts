import {defineType, defineField} from 'sanity'

// This is set up as a singleton, with only one instance of this document
export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'hero',
    }),
    defineField({
      name: 'companies',
      title: 'Companies Section',
      type: 'companies',
    }),
    defineField({
      name: 'vision',
      title: 'Vision Section',
      type: 'vision',
    }),
    defineField({
      name: 'impact',
      title: 'Impact Section',
      type: 'impact',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
