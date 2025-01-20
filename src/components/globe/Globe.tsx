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

export const CAMERA_DISTANCE = 15
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

  const [_, api] = useSpring<SpringValues>(() => ({
    cameraPosition: [1, CAMERA_Y_OFFSET, CAMERA_DISTANCE],
    target: [0, 0, 0],
    onChange: ({ value }: { value: SpringValues }) => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(...value.cameraPosition)
        controlsRef.current.target.set(...value.target)
        controlsRef.current.update()
      }
    },
  }))

  // Reset current location index when selected locations change
  useEffect(() => {
    setCurrentLocationIndex(0)
  }, [selectedLocations])

  // Handle auto-rotation
  useEffect(() => {
    if (!autoRotate || !selectedLocations?.length) return

    const ROTATION_DELAY = 6000 // 6 seconds between rotations

    const rotateToNextLocation = () => {
      if (isAnimatingRef.current) {
        // If still animating, check again in 100ms
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
    }
  }, [autoRotate, selectedLocations, currentLocationIndex])

  // Camera animation effect
  useEffect(() => {
    if (!selectedLocations?.length || !controlsRef.current) return

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
  }, [selectedLocations, currentLocationIndex, radius, api])

  return (
    <div className="relative order-1 min-h-[400px]">
      <div className="absolute inset-0 z-40" />
      <Canvas
        className="relative z-10"
        camera={{
          position: [1, CAMERA_Y_OFFSET, CAMERA_DISTANCE], // Set initial camera position with fixed distance
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
          enableRotate={false}
          enabled={false}
        />
      </Canvas>
    </div>
  )
}
