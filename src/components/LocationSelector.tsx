import { useState } from 'react'
import { Globe } from './globe/Globe'
import { locations, type CountryKey } from '@/lib/data'

const LocationSelector = () => {
  const [selectedLocation, setSelectedLocation] = useState<CountryKey | null>(
    null,
  )

  return (
    <div className="grid lg:min-h-[610px] lg:grid-cols-2">
      <div className="order-2 h-full w-full overflow-auto p-6 md:order-1">
        <div className="space-y-6">
          {locations.map((location) => (
            <div key={location.label} className="space-y-4">
              <h3 className="text-lg font-semibold">{location.label}</h3>
              {location.companies.map((company) => (
                <div key={company.name} className="space-y-2 pl-4">
                  <h4 className="text-md font-medium">{company.name}</h4>
                  <div className="space-y-2 pl-4">
                    {company.countries.map((country) => (
                      <label
                        key={country}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="radio"
                          name="location"
                          value={country}
                          checked={selectedLocation === country}
                          onChange={(e) =>
                            setSelectedLocation(e.target.value as CountryKey)
                          }
                          className="form-radio"
                        />
                        <span>{country}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Globe selectedLocation={selectedLocation} />
    </div>
  )
}

export default LocationSelector
