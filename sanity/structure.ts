import {StructureBuilder} from 'sanity/structure'

// This is the structure builder configuration for the Sanity Studio
// It sets up a singleton pattern for the page, making it the only item visible in the studio
export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home')
        .id('home')
        .child(S.document().schemaType('home').documentId('home')),
    ])
