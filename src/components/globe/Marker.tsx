import Pin from '@/assets/pin.svg?react'
import CountryDot from '@/assets/country-dot.svg?react'

type Props = {
  country: string
  logo: string
  blob: string
}

const Marker = ({ country, logo, blob }: Props) => {
  return (
    <div className="relative grid h-[100px] w-[250px] grid-cols-5">
      <div className="col-span-2 flex items-center justify-center rounded-l bg-white px-6">
        <img src={logo} alt={country} />
      </div>
      <div className="col-span-3 flex flex-col gap-[10px] rounded-r bg-tan p-[10px] text-[9px] text-black">
        <p>{blob}</p>
        <div className="flex items-center gap-1">
          <Pin />
          <p>{country}</p>
        </div>
      </div>
      <div className="absolute left-1/2 top-full -translate-x-1/2">
        <CountryDot />
      </div>
    </div>
  )
}

export default Marker
