import { useState } from 'react'
import { Globe } from './globe/Globe'
import { locations, type Company } from '@/lib/data'

const LocationSelector = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company>(
    locations[0].companies[0],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const company = locations.find((l) => e.target.name.includes(l.label))
    setSelectedCompany(
      company?.companies.find((c) => c.name === e.target.value)!,
    )
  }
  return (
    <div className="grid lg:min-h-[610px] lg:grid-cols-2">
      <div className="order-2 h-full w-full overflow-auto p-6 md:order-1">
        <div className="space-y-6">
          {locations.map((location) => (
            <div key={location.label} className="space-y-4">
              <h3 className="text-lg font-semibold">{location.label}</h3>
              {location.companies.map((company) => (
                <div key={company.name} className="space-y-2 pl-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`${location.label}-${company.name}`}
                      value={company.name}
                      checked={selectedCompany.name === company.name}
                      onChange={handleChange}
                      className="form-radio"
                    />
                    <h4 className="text-md font-medium">{company.name}</h4>
                  </label>
                  <ul className="space-y-2 pl-4">
                    {company.countries.map((country) => (
                      <li key={country.id}>{country.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Globe selectedLocations={selectedCompany.countries} />
    </div>
  )
}

export default LocationSelector
