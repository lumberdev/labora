import { useState } from 'react'
import { Globe } from './globe/Globe'
import { locations, type Company, type CountryKey } from '@/lib/data'
import { cn } from '@/lib/utils'
import GlobeMagnifier from '@/assets/icons/globe-magnifier.svg?react'

const LocationSelector = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Get all unique countries across all companies
  const allCountries = locations
    .flatMap((location) => location.companies)
    .flatMap((company) => company.countries)
    .filter(
      (country, index, self) =>
        index === self.findIndex((c) => c.id === country.id),
    )
    .map((country) => ({
      name: country.name as CountryKey,
      id: country.id,
    }))

  // Get countries for current view (either all countries or selected company's countries)
  const displayedCountries = selectedCompany
    ? selectedCompany.countries
    : allCountries

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
  }

  const handleResetView = () => {
    setSelectedCompany(null)
  }

  return (
    <div className="lg:min-h-500px grid lg:grid-cols-[min-content_minmax(500px,1fr)] xl:min-h-[800px] xl:grid-cols-[min-content_minmax(800px,1fr)]">
      <div className="order-2 h-full w-full overflow-auto px-4 md:px-0 lg:order-1">
        <div className="space-y-6">
          <div className="w-max space-y-[30px] lg:max-w-[500px]">
            {locations.map((location) => (
              <div key={location.label}>
                <div className="mb-[10px] border-b border-grey pb-[10px]">
                  <h2 className="text-xl uppercase text-tan">
                    {location.label}
                  </h2>
                </div>
                <div className="grid">
                  {location.companies.map((company) => (
                    <button
                      key={company.name}
                      onClick={() => handleCompanySelect(company)}
                      className={cn(
                        'flex items-center gap-[30px]',
                        company === selectedCompany
                          ? 'text-tan'
                          : 'hover:text-tan-light',
                      )}
                    >
                      <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-center px-[10px]">
                        <img src={company.logo} alt={company.name} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm uppercase">
                          {company.name}
                        </span>
                        {company === selectedCompany && (
                          <div className="text-left">
                            {company.countries.map((country, index, self) => (
                              <span key={country.name} className="text-xs">
                                {country.name}
                                {index !== self.length - 1 ? ' • ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1 text-xs text-grey">
              <GlobeMagnifier />
              <p>Click on a company to explore its locations. </p>
              <button
                onClick={handleResetView}
                className="bg-transparent m-0 cursor-pointer border-none p-0 underline"
              >
                (Reset View)
              </button>
            </div>
          </div>
        </div>
      </div>
      <Globe selectedLocations={displayedCountries} autoRotate={true} />
    </div>
  )
}

export default LocationSelector
