import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: '3qdm36yh',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-02-06',
})

export const query = `*[_type == "home"][0]{
  hero{
    heading,
    copy1,
    copy2
  },
  companies{
    heading,
    copy
  },
  vision{
    heading,
    copy
  },
  impact{
    heading,
    subHeading,
    copy
  }
}`
