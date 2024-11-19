export type CountryKey = keyof typeof coordinates

type Company = {
  name: string
  countries: CountryKey[]
}

type LocationGroup = {
  label: string
  companies: Company[]
}

export const locations: LocationGroup[] = [
  {
    label: 'Electrical Building Materials Distribution',
    companies: [
      {
        name: 'City Electric Supplies (CES)',
        countries: ['United States', 'Canada'],
      },
      {
        name: 'City Electrical Factors (CEF)',
        countries: [
          'United Kingdom',
          'Ireland',
          'Spain',
          'Offshore Islands (Guernsey, Gibraltar, Isle of Man, Jersey)',
          'Australia',
        ],
      },
    ],
  },
  {
    label: 'Solar/Remewable Products Distribution',
    companies: [
      {
        name: 'Segen',
        countries: ['United Kingdom', 'South Africa', 'Germany'],
      },
      {
        name: 'Soligent',
        countries: ['United States'],
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
  'Offshore Islands (Guernsey, Gibraltar, Isle of Man, Jersey)': {
    lat: 49.4656,
    lon: -2.1186,
  },
  Australia: { lat: -25.2744, lon: 133.7751 },
  Ireland: { lat: 53.3498, lon: -8.2437 },
  Spain: { lat: 40.4637, lon: -3.7492 },
} as const
