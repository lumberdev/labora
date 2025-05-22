import { useState } from 'react'
import { Globe } from './globe/Globe'
import { locations, type Company, type CountryKey } from '@/lib/data'
import { cn } from '@/lib/utils'
import GlobeMagnifier from '@/assets/icons/globe-magnifier.svg?react'

const LocationSelector = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCountries, setShowCountries] = useState(false)

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
    setShowCountries(false)
  }

  const handleResetView = () => {
    setSelectedCompany(null)
    setShowCountries(false)
  }

  return (
    <div className="lg:min-h-500px grid lg:grid-cols-[min-content_minmax(500px,1fr)] xl:min-h-[800px] xl:grid-cols-[min-content_minmax(800px,1fr)]">
      <div className="order-2 h-full w-full overflow-auto px-4 md:px-0 lg:order-1">
        <div className="space-y-6">
          <div className="w-[calc(100vw-2rem)] space-y-[30px] lg:w-[500px]">
            {locations.map((location) => (
              <div key={location.label}>
                <div className="mb-[10px] border-b border-grey pb-[10px]">
                  <h2 className="text-xl uppercase text-tan">
                    {location.label}
                  </h2>
                </div>
                <div className="grid">
                  {location.companies.map((company) => (
                    <div
                      key={company.name}
                      className={cn(
                        'grid grid-cols-[70px_1fr] gap-[30px]',
                        company === selectedCompany
                          ? 'text-tan'
                          : 'hover:text-tan-light',
                      )}
                    >
                      <button
                        onClick={() => handleCompanySelect(company)}
                        className="flex h-[70px] w-[70px] shrink-0 items-center justify-center px-[10px]"
                      >
                        <img
                          src={company.logo}
                          alt={company.name + ' logo'}
                          className="max-w-full"
                        />
                      </button>
                      <button
                        onClick={() => handleCompanySelect(company)}
                        className={cn(
                          'flex flex-col',
                          !selectedCompany || selectedCompany !== company
                            ? 'justify-center'
                            : '',
                        )}
                      >
                        <span className="text-left text-sm uppercase">
                          {company.name}
                        </span>
                        <div className="grid gap-1 text-left">
                          {company === selectedCompany ? (
                            <>
                              <div className="mt-1 bg-grey-dark text-xs">
                                {company.countries.map(
                                  (country, index, self) => (
                                    <span key={country.name}>
                                      {country.name}
                                      {index !== self.length - 1 ? ' • ' : ''}
                                    </span>
                                  ),
                                )}
                              </div>
                              <a
                                className="w-fit text-xs underline"
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Website
                              </a>
                            </>
                          ) : (
                            <span
                              className="cursor-pointer text-xs"
                              onMouseEnter={() => setShowCountries(true)}
                              onMouseLeave={() => setShowCountries(false)}
                              onClick={() => {
                                setShowCountries(!showCountries)
                              }}
                            >
                              Active in {company.countries.length}{' '}
                              {company.countries.length === 1
                                ? 'country'
                                : 'countries'}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
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
