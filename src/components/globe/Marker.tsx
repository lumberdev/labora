import { type CountryKey } from '@/lib/data'
import CountryBorders from './CountryBorders'
import CountryDots from './CountryDots'

type Props = {
  country: {
    name: CountryKey
    id: number
  }
  radius: number
}

const Marker = ({ country, radius }: Props) => {
  if (!country) return null

  return (
    <group>
      <CountryBorders radius={radius} countryId={country.id.toString()} />
      <CountryDots radius={radius} countryId={country.id.toString()} />
    </group>
  )
}

Marker.displayName = 'Marker'

export default Marker
