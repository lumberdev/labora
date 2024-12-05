import { useEffect, useState, useCallback } from 'react'
import { Globe } from './globe/Globe'
import { locations, type Company } from '@/lib/data'

const LocationSelector = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company>(
    locations[0].companies[0],
  )
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0)

  // Flatten companies array for easier iteration
  const allCompanies = locations.flatMap((location) => location.companies)

  const moveToNextCompany = useCallback(() => {
    setCurrentCompanyIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % allCompanies.length
      setSelectedCompany(allCompanies[nextIndex])
      return nextIndex
    })
  }, [allCompanies])

  useEffect(() => {
    // Initial minimum delay of 5 seconds
    const minDelay = setTimeout(moveToNextCompany, 5000)

    return () => clearTimeout(minDelay)
  }, [currentCompanyIndex, moveToNextCompany])

  return (
    <div className="grid lg:min-h-[610px] lg:grid-cols-2">
      <div className="order-2 h-full w-full overflow-auto p-6 md:order-1">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{selectedCompany.name}</h3>
            <ul className="space-y-2 pl-4">
              {selectedCompany.countries.map((country) => (
                <li key={country.id}>{country.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Globe
        selectedLocations={selectedCompany.countries}
        autoRotate={true}
        onAnimationComplete={moveToNextCompany}
      />
    </div>
  )
}

export default LocationSelector
