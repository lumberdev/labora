import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useSpring } from '@react-spring/three'
import Sphere from './Sphere'
import { Dots } from './Dots'

import { coordinates, type CountryKey } from '@/lib/data'
import CountryParticles from './CountryParticles'

type Props = {
  radius?: number
  dotsOffset?: number
  selectedLocations: {
    name: CountryKey
    id: number
  }[]
  autoRotate?: boolean
  onAnimationComplete?: () => void
}

type SpringValues = {
  cameraPosition: [number, number, number]
  target: [number, number, number]
}

export function Globe({
  radius = 8,
  dotsOffset = 0,
  selectedLocations,
  autoRotate = false,
  onAnimationComplete,
}: Props) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const animationTimeoutRef = useRef<NodeJS.Timeout>()

  const [{ cameraPosition }, api] = useSpring<SpringValues>(() => ({
    cameraPosition: [1, 4, 15],
    target: [0, 0, 0],
    onChange: ({ value }: { value: SpringValues }) => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(...value.cameraPosition)
        controlsRef.current.target.set(...value.target)
        controlsRef.current.update()
      }
    },
  }))

  // Modify the auto-rotate effect
  useEffect(() => {
    if (!autoRotate || !selectedLocations?.length) return

    const rotateToNextLocation = () => {
      if (currentLocationIndex === selectedLocations.length - 1) {
        // We've shown all locations, notify parent
        onAnimationComplete?.()
      } else {
        setCurrentLocationIndex((prev) => (prev + 1) % selectedLocations.length)
      }
    }

    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Set new timeout for next location
    animationTimeoutRef.current = setTimeout(rotateToNextLocation, 2000)

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [autoRotate, selectedLocations, currentLocationIndex, onAnimationComplete])

  // Modify the camera position effect to use currentLocationIndex
  useEffect(() => {
    if (!selectedLocations?.length || !controlsRef.current) return

    const currentLocation = selectedLocations[currentLocationIndex]

    // Function to get 3D coordinates for a country ID
    const getCountryCoords = (countryId: number) => {
      const location = selectedLocations.find((loc) => loc.id === countryId)
      if (!location) return null

      const phi = (90 - coordinates[location.name].lat) * (Math.PI / 180)
      const theta = (coordinates[location.name].lon + 180) * (Math.PI / 180)

      const x = -(radius + 0.1) * Math.sin(phi) * Math.cos(theta)
      const y = (radius + 0.1) * Math.cos(phi)
      const z = (radius + 0.1) * Math.sin(phi) * Math.sin(theta)

      return new THREE.Vector3(x, y, z)
    }

    const getCameraPosition = (
      position: THREE.Vector3,
      distance: number = 15,
    ): [number, number, number] => {
      const pos = position
        .clone()
        .normalize()
        .multiplyScalar(distance)
        .add(new THREE.Vector3(0, 4, 0))
      return [pos.x, pos.y, pos.z]
    }

    const getTarget = (position: THREE.Vector3): [number, number, number] => {
      return [position.x * 0.9, position.y * 0.9, position.z * 0.9]
    }

    // Function to animate between two points
    const animateBetweenPoints = async (
      next: (props: SpringValues) => Promise<void>,
      fromPosition: THREE.Vector3,
      toPosition: THREE.Vector3,
      duration: number = 1000,
    ) => {
      // Create midpoint for curved path
      const midPoint = new THREE.Vector3()
        .addVectors(
          new THREE.Vector3(...getCameraPosition(fromPosition, 15)),
          new THREE.Vector3(...getCameraPosition(toPosition, 15)),
        )
        .normalize()
        .multiplyScalar(22.5) // 1.5x normal camera distance
        .add(new THREE.Vector3(0, 4, 0))

      // First half of the animation
      await next({
        cameraPosition: [midPoint.x, midPoint.y, midPoint.z],
        target: [
          (fromPosition.x + toPosition.x) * 0.5,
          (fromPosition.y + toPosition.y) * 0.5,
          (fromPosition.z + toPosition.z) * 0.5,
        ],
      })

      // Second half of the animation
      await next({
        cameraPosition: getCameraPosition(toPosition),
        target: getTarget(toPosition),
      })
    }

    // Create sequence of animations for all countries in the location
    const animate = async () => {
      const currentPosition = getCountryCoords(currentLocation.id)
      if (!currentPosition) return

      api.start({
        to: async (next) => {
          const prevIndex =
            (currentLocationIndex - 1 + selectedLocations.length) %
            selectedLocations.length
          const prevLocation = selectedLocations[prevIndex]

          if (prevLocation) {
            const prevPosition = getCountryCoords(prevLocation.id)
            if (prevPosition) {
              await next({
                cameraPosition: getCameraPosition(currentPosition),
                target: getTarget(currentPosition),
                config: { duration: 1500 }, // Adjust animation duration
              })
            }
          } else {
            await next({
              cameraPosition: getCameraPosition(currentPosition),
              target: getTarget(currentPosition),
              config: { duration: 1500 },
            })
          }
        },
      })
    }

    animate()
  }, [radius, selectedLocations, currentLocationIndex, api])

  return (
    <Canvas
      className="order-1 min-h-[400px]"
      camera={{
        position: cameraPosition.get() as [number, number, number],
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
        minDistance={5}
        maxDistance={20}
        minPolarAngle={Math.PI * 0.35}
        maxPolarAngle={Math.PI * 0.55}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  )
}
