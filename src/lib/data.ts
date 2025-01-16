import cefLogo from '../assets/logos/CEF.png?url'
import cesLogo from '../assets/logos/CES.png?url'
import segenLogo from '../assets/logos/Segen.png?url'
import soligentLogo from '../assets/logos/Soligent.png?url'
export type CountryKey = keyof typeof coordinates

export type Company = {
  name: string
  logo: string
  website: string
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
        name: 'City Electric Supply (CES)',
        logo: cesLogo,
        website: 'https://www.cityelectricsupply.com/',
        countries: [
          { name: 'United States', id: '840' },
          { name: 'Canada', id: '124' },
          { name: 'China', id: '156' },
          { name: 'Puerto Rico', id: '630' },
        ],
      },
      {
        name: 'City Electrical Factors (CEF)',
        logo: cefLogo,
        website: 'https://www.cef.co.uk/',
        countries: [
          { name: 'United Kingdom', id: '826' },
          { name: 'Ireland', id: '372' },
          { name: 'Spain', id: '724' },
          { name: 'Australia', id: '036' },
          {
            name: 'Offshore Islands (Guernsey, Gibraltar, Isle Of Man, Jersey)',
            id: '4',
          },
          { name: 'China', id: '156' },
          { name: 'Netherlands', id: '528' },
          { name: 'Turkey', id: '792' },
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
        website: 'https://www.segen.co.uk/',
        countries: [
          { name: 'United Kingdom', id: '826' },
          { name: 'South Africa', id: '710' },
          { name: 'Germany', id: '276' },
          { name: 'Ireland', id: '372' },
          { name: 'Namibia', id: '516' },
          { name: 'Botswana', id: '072' },
          { name: 'Zimbabwe', id: '716' },
          { name: 'Zambia', id: '894' },
          { name: 'Angola', id: '024' },
          { name: 'Tanzania', id: '834' },
          { name: 'Uganda', id: '800' },
          { name: 'Kenya', id: '404' },
          { name: 'Eswatini', id: '748' },
          { name: 'Swaziland', id: '748' },
          { name: 'DRC', id: '180' },
          { name: 'Mozambique', id: '508' },
          { name: 'Mauritius', id: '480' },
          { name: 'Ethiopia', id: '231' },
          { name: 'Rwanda', id: '646' },
          { name: 'Nigeria', id: '566' },
          { name: 'Ghana', id: '288' },
          { name: 'Belgium', id: '056' },
          { name: 'Poland', id: '616' },
          { name: 'Switzerland', id: '756' },
          { name: 'Austria', id: '040' },
          { name: 'Bulgaria', id: '100' },
          { name: 'Croatia', id: '191' },
          { name: 'Czech Republic', id: '203' },
          { name: 'Denmark', id: '208' },
          { name: 'Finland', id: '246' },
          { name: 'France', id: '250' },
          { name: 'Hungary', id: '348' },
          { name: 'Italy', id: '380' },
          { name: 'Kosovo', id: '383' },
          { name: 'Latvia', id: '428' },
          { name: 'Lithuania', id: '440' },
          { name: 'Luxembourg', id: '442' },
          { name: 'Malta', id: '470' },
          { name: 'Norway', id: '578' },
          { name: 'Romania', id: '642' },
          { name: 'Slovakia', id: '703' },
          { name: 'Slovenia', id: '705' },
          { name: 'Sweden', id: '752' },
          { name: 'Serbia', id: '688' },
        ],
      },
      {
        name: 'Soligent',
        logo: soligentLogo,
        website: 'https://www.soligent.net/',
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
  China: { lat: 35.8617, lon: 104.1954 },
  'Puerto Rico': { lat: 18.2208, lon: -66.5901 },
  Netherlands: { lat: 52.1326, lon: 5.2913 },
  Turkey: { lat: 38.9637, lon: 35.2433 },
  Namibia: { lat: -22.9576, lon: 18.4904 },
  Botswana: { lat: -22.3285, lon: 24.6849 },
  Zimbabwe: { lat: -19.0154, lon: 29.1549 },
  Zambia: { lat: -13.1339, lon: 27.8493 },
  Angola: { lat: -11.2027, lon: 17.8739 },
  Tanzania: { lat: -6.369, lon: 34.8888 },
  Uganda: { lat: 1.3733, lon: 32.2903 },
  Kenya: { lat: -0.0236, lon: 37.9062 },
  Eswatini: { lat: -26.5225, lon: 31.4659 },
  Swaziland: { lat: -26.5225, lon: 31.4659 },
  DRC: { lat: -4.0383, lon: 21.7587 },
  Mozambique: { lat: -18.6657, lon: 35.5296 },
  Mauritius: { lat: -20.3484, lon: 57.5522 },
  Ethiopia: { lat: 9.145, lon: 40.4897 },
  Rwanda: { lat: -1.9403, lon: 29.8739 },
  Nigeria: { lat: 9.082, lon: 8.6753 },
  Ghana: { lat: 7.9465, lon: -1.0232 },
  Belgium: { lat: 50.8503, lon: 4.3517 },
  Poland: { lat: 51.9194, lon: 19.1451 },
  Switzerland: { lat: 46.8182, lon: 8.2275 },
  Austria: { lat: 47.5162, lon: 14.5501 },
  Bulgaria: { lat: 42.7339, lon: 25.4858 },
  Croatia: { lat: 45.1, lon: 15.2 },
  'Czech Republic': { lat: 49.8175, lon: 15.473 },
  Denmark: { lat: 56.2639, lon: 9.5018 },
  Finland: { lat: 61.9241, lon: 25.7482 },
  France: { lat: 46.2276, lon: 2.2137 },
  Hungary: { lat: 47.1625, lon: 19.5033 },
  Italy: { lat: 41.8719, lon: 12.5674 },
  Kosovo: { lat: 42.6026, lon: 20.903 },
  Latvia: { lat: 56.8796, lon: 24.6032 },
  Lithuania: { lat: 55.1694, lon: 23.8813 },
  Luxembourg: { lat: 49.8153, lon: 6.1296 },
  Malta: { lat: 35.9375, lon: 14.3754 },
  Norway: { lat: 60.472, lon: 8.4689 },
  Romania: { lat: 45.9432, lon: 24.9668 },
  Slovakia: { lat: 48.669, lon: 19.699 },
  Slovenia: { lat: 46.1512, lon: 14.9955 },
  Sweden: { lat: 60.1282, lon: 18.6435 },
  Serbia: { lat: 44.0165, lon: 21.0059 },
} as const
