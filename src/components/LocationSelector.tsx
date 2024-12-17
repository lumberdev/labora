import { useEffect, useState, useCallback, useRef } from 'react'
import { Globe } from './globe/Globe'
import { locations, type Company } from '@/lib/data'
import { cn } from '@/lib/utils'
import GlobeMagnifier from '/public/globe-magnifier.svg?react'

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
    <div className="grid lg:min-h-[800px] lg:grid-cols-[min-content_1fr]">
      <div className="order-2 h-full w-full overflow-auto md:order-1">
        <div className="space-y-6">
          <div className="w-[500px] space-y-[30px]">
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
                      onClick={() => setSelectedCompany(company)}
                      className={cn(
                        'grid grid-cols-[70px_max-content] items-center gap-[30px]',
                        company === selectedCompany
                          ? 'text-tan'
                          : 'hover:text-tan-light',
                      )}
                    >
                      <div className="flex h-[70px] w-[70px] items-center justify-center px-[10px]">
                        <img src={company.logo} alt={company.name} />
                      </div>
                      <span className="uppercase">{company.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1 text-grey">
              <GlobeMagnifier />
              <p>Click on a company to explore its locations. </p>
              <button className="bg-transparent m-0 cursor-pointer border-none p-0 underline">
                (Reset View)
              </button>
            </div>
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
