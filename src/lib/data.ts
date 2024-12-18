import cefLogo from '../assets/logos/CEF.png?url'
import cesLogo from '../assets/logos/CES.png?url'
import segenLogo from '../assets/logos/Segen.png?url'
import soligentLogo from '../assets/logos/Soligent.png?url'
export type CountryKey = keyof typeof coordinates

export type Company = {
  name: string
  logo: string
  countries: {
    name: CountryKey
    id: string
  }[]
}

type LocationGroup = {
  label: string
  companies: Company[]
}

export type LocationKey = Company['name']

export const locations: LocationGroup[] = [
  {
    label: 'Electrical',
    companies: [
      {
        name: 'City Electric Supplies (CES)',
        logo: cesLogo,
        countries: [
          { name: 'United States', id: '840' },
          { name: 'Canada', id: '124' },
        ],
      },
      {
        name: 'City Electrical Factors (CEF)',
        logo: cefLogo,
        countries: [
          { name: 'United Kingdom', id: '826' },
          { name: 'Ireland', id: '372' },
          { name: 'Spain', id: '724' },
          { name: 'Australia', id: '036' },
          {
            name: 'Offshore Islands (Guernsey, Gibraltar, Isle Of Man, Jersey)',
            id: '4',
          },
        ],
      },
    ],
  },
  {
    label: 'Solar / Renewable',
    companies: [
      {
        name: 'Segen',
        logo: segenLogo,
        countries: [
          { name: 'United Kingdom', id: '826' },
          { name: 'South Africa', id: '710' },
          { name: 'Germany', id: '276' },
        ],
      },
      {
        name: 'Soligent',
        logo: soligentLogo,
        countries: [{ name: 'United States', id: '840' }],
      },
    ],
  },
]

export const coordinates = {
  'United Kingdom': { lat: 55.3781, lon: -3.436 },
  'South Africa': { lat: -29.0468, lon: 24.1755 },
  Germany: { lat: 51.1657, lon: 6.8542 },
  'United States': { lat: 37.0902, lon: -109.4125 },
  Canada: { lat: 56.1304, lon: -106.3468 },
  'Offshore Islands (Guernsey, Gibraltar, Isle Of Man, Jersey)': {
    lat: 49.4656,
    lon: -2.1186,
  },
  Australia: { lat: -25.2744, lon: 133.7751 },
  Ireland: { lat: 53.3498, lon: -8.2437 },
  Spain: { lat: 40.4637, lon: -3.7492 },
} as const
