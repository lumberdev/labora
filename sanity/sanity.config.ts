import {defineConfig} from 'sanity'
import {vercelDeployTool} from 'sanity-plugin-vercel-deploy'

import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Labora',

  projectId: '3qdm36yh', // Replace with your actual project ID
  dataset: 'production',

  plugins: [
    structureTool({
      structure,
    }),
    vercelDeployTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
