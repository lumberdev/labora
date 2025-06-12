import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useSpring } from '@react-spring/three'
import Sphere from './Sphere'
import { Dots } from './Dots'
import { type CountryKey } from '@/lib/data'
import CountryParticles from './CountryParticles'
import {
  getCountryCoords,
  animateBetweenPoints,
  animateDirectToPoint,
} from '@/lib/utils'

export type GlobeProps = {
  radius?: number
  dotsOffset?: number
  selectedLocations: {
    name: CountryKey
    id: string
  }[]
  autoRotate?: boolean
}

export type SpringValues = {
  cameraPosition: [number, number, number]
  target: [number, number, number]
}

export const CAMERA_DISTANCE = 20
export const CAMERA_Y_OFFSET = 4

export function Globe({
  radius = 10,
  dotsOffset = 0,
  selectedLocations,
  autoRotate = false,
}: GlobeProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const isAnimatingRef = useRef(false)
  const autoRotateTimeoutRef = useRef<NodeJS.Timeout>()
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout>()
  const [isMobile, setIsMobile] = useState(false)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const prevLocationsRef = useRef<string>('')

  const [_, api] = useSpring<SpringValues>(() => ({
    cameraPosition: [1, CAMERA_Y_OFFSET, CAMERA_DISTANCE],
    target: [0, 0, 0],
    onChange: ({ value }: { value: SpringValues }) => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(...value.cameraPosition)
        // Always set target to center for consistent rotation behavior
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
    },
  }))

  // Detect mobile devices
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }

    // Check initially
    checkIsMobile()

    // Update on window resize
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Reset user interaction when selected locations change (company selection)
  useEffect(() => {
    if (!selectedLocations) return

    // Compare current locations to previous locations
    const currentLocationsKey = selectedLocations.map((loc) => loc.id).join(',')

    // If locations changed, reset interaction state and restart animations
    if (currentLocationsKey !== prevLocationsRef.current) {
      setIsUserInteracting(false)
      setCurrentLocationIndex(0)
      prevLocationsRef.current = currentLocationsKey
    }
  }, [selectedLocations])

  // Handle auto-rotation
  useEffect(() => {
    if (!autoRotate || !selectedLocations?.length || isUserInteracting) return

    const ROTATION_DELAY = 8000 // 8 seconds between rotations

    const rotateToNextLocation = () => {
      if (isAnimatingRef.current || isUserInteracting) {
        // If still animating or user is interacting, check again in 100ms
        autoRotateTimeoutRef.current = setTimeout(rotateToNextLocation, 100)
        return
      }

      // Only schedule next rotation after current animation is complete
      if (currentLocationIndex === selectedLocations.length - 1) {
        setCurrentLocationIndex(0)
      } else {
        setCurrentLocationIndex((prev) => (prev + 1) % selectedLocations.length)
      }
    }

    // Clear any existing timeout
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current)
    }

    // Schedule next rotation
    autoRotateTimeoutRef.current = setTimeout(
      rotateToNextLocation,
      // First rotation happens immediately, subsequent ones after delay
      currentLocationIndex === 0 ? 0 : ROTATION_DELAY,
    )

    return () => {
      if (autoRotateTimeoutRef.current) {
        clearTimeout(autoRotateTimeoutRef.current)
      }
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current)
      }
    }
  }, [autoRotate, selectedLocations, currentLocationIndex, isUserInteracting])

  // Camera animation effect
  useEffect(() => {
    if (!selectedLocations?.length || !controlsRef.current || isUserInteracting)
      return

    const animate = async () => {
      const currentLocation = selectedLocations[currentLocationIndex]

      if (!currentLocation) return
      const currentPosition = getCountryCoords(
        currentLocation.id,
        radius,
        selectedLocations,
      )
      if (!currentPosition) return

      isAnimatingRef.current = true

      try {
        const prevIndex =
          (currentLocationIndex - 1 + selectedLocations.length) %
          selectedLocations.length
        const prevLocation = selectedLocations[prevIndex]
        const prevPosition = prevLocation
          ? getCountryCoords(prevLocation.id, radius, selectedLocations)
          : null

        if (prevPosition) {
          await animateBetweenPoints(prevPosition, currentPosition, api, radius)
        } else {
          await animateDirectToPoint(currentPosition, api)
        }
      } finally {
        isAnimatingRef.current = false
      }
    }

    animate()
  }, [selectedLocations, currentLocationIndex, radius, api, isUserInteracting])

  // Reset controls target to center when user finishes interaction
  useEffect(() => {
    if (!isUserInteracting && controlsRef.current) {
      // Reset target to center when user stops interacting
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [isUserInteracting])

  // Effect to handle re-enabling animations after user interaction on mobile
  useEffect(() => {
    // Only apply for mobile when user was interacting but has stopped
    if (!isMobile || isUserInteracting) {
      // Clear any existing timeout when user is interacting
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current)
        userInteractionTimeoutRef.current = undefined
      }
      return
    }

    // When user stops interacting on mobile, set a 5-second timer
    if (isMobile && !isUserInteracting) {
      // Clear any existing timeout
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current)
      }
      
      // Set timeout to restart animations after 5 seconds
      userInteractionTimeoutRef.current = setTimeout(() => {
        // Restart animations by moving to the next location
        setCurrentLocationIndex((prev) => (prev + 1) % (selectedLocations?.length || 1))
      }, 5000) // 5 seconds
    }

    return () => {
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current)
      }
    }
  }, [isMobile, isUserInteracting, selectedLocations])

  return (
    <div className="relative order-1 min-h-[400px]">
      {!isMobile && <div className="absolute inset-0 z-40" />}
      <Canvas
        className="relative z-10"
        camera={{
          position: [1, CAMERA_Y_OFFSET, CAMERA_DISTANCE],
          near: 1,
          far: 50,
        }}
      >
        <ambientLight />
        <Sphere radius={radius} />
        <Suspense fallback={null}>
          <Dots radius={radius + dotsOffset / 10} />
        </Suspense>
        {selectedLocations?.map((location) => (
          <CountryParticles
            key={location.id}
            radius={radius}
            countryId={location.id.toString()}
          />
        ))}
        <OrbitControls
          ref={controlsRef}
          minDistance={CAMERA_DISTANCE}
          maxDistance={CAMERA_DISTANCE}
          minPolarAngle={Math.PI * 0.35}
          maxPolarAngle={Math.PI * 0.55}
          enableZoom={false}
          enablePan={false}
          enableRotate={isMobile}
          enabled={isMobile}
          rotateSpeed={0.6}
          dampingFactor={0.2}
          target={[0, 0, 0]} // Always set target to center
          touches={{
            ONE: 0, // TOUCH.ROTATE
          }}
          onStart={() => {
            setIsUserInteracting(true)
            // When user starts interacting, force target to center
            if (controlsRef.current) {
              controlsRef.current.target.set(0, 0, 0)
              controlsRef.current.update()
            }
            
            // Clear any existing timeout when user starts interacting
            if (userInteractionTimeoutRef.current) {
              clearTimeout(userInteractionTimeoutRef.current)
              userInteractionTimeoutRef.current = undefined
            }
          }}
          onEnd={() => {
            setIsUserInteracting(false)
            // Reset target to center on end
            if (controlsRef.current) {
              controlsRef.current.target.set(0, 0, 0)
              controlsRef.current.update()
            }
            
            // On mobile, set a timeout to restart animations after 5 seconds of inactivity
            if (isMobile) {
              if (userInteractionTimeoutRef.current) {
                clearTimeout(userInteractionTimeoutRef.current)
              }
              
              userInteractionTimeoutRef.current = setTimeout(() => {
                // Restart animations by moving to the next location
                setCurrentLocationIndex((prev) => (prev + 1) % (selectedLocations?.length || 1))
              }, 5000) // 5 seconds
            }
          }}
        />
      </Canvas>
    </div>
  )
}
