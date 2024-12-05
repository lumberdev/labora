import { useEffect, useState, useCallback, useRef } from 'react'
import { Globe } from './globe/Globe'
import { locations, type Company } from '@/lib/data'
import { cn } from '@/lib/utils'

const LocationSelector = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company>(
    locations[0].companies[0],
  )
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0)
  const [currentCountryIndex, setCurrentCountryIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Flatten companies array for easier iteration
  const allCompanies = locations.flatMap((location) => location.companies)

  const moveToNextCompany = useCallback(() => {
    if (isTransitioning) return // Don't move if we're still transitioning

    setCurrentCompanyIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % allCompanies.length
      setSelectedCompany(allCompanies[nextIndex])
      setCurrentCountryIndex(0) // Reset country index for new company
      return nextIndex
    })
  }, [allCompanies, isTransitioning])

  useEffect(() => {
    setIsTransitioning(true)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set minimum delay of 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false)
    }, 5000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentCompanyIndex])

  // Handle animation complete
  const handleAnimationComplete = useCallback(() => {
    if (!isTransitioning) {
      moveToNextCompany()
    }
  }, [moveToNextCompany, isTransitioning])

  // Handle animation step
  const handleAnimationStep = useCallback((index: number) => {
    setCurrentCountryIndex(index)
  }, [])

  return (
    <div className="grid lg:min-h-[610px] lg:grid-cols-[min-content_1fr]">
      <div className="order-2 h-full w-full overflow-auto p-6 md:order-1">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{selectedCompany.name}</h3>
            <ul className="space-y-2 pl-4">
              {selectedCompany.countries.map((country, index) => (
                <li
                  key={country.id}
                  className={cn(
                    'transition-colors duration-300',
                    index === currentCountryIndex &&
                      'font-bold text-tan-light',
                  )}
                >
                  {country.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Globe
        selectedLocations={selectedCompany.countries}
        autoRotate={true}
        onAnimationComplete={handleAnimationComplete}
        onAnimationStep={handleAnimationStep}
      />
    </div>
  )
}

export default LocationSelector
