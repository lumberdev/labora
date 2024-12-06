import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useSpring, config as springConfig } from '@react-spring/three'
import Sphere from './Sphere'
import { Dots } from './Dots'

import { coordinates, type CountryKey } from '@/lib/data'
import CountryParticles from './CountryParticles'

type Props = {
  radius?: number
  dotsOffset?: number
  selectedLocations: {
    name: CountryKey
    id: string
  }[]
  autoRotate?: boolean
  onAnimationComplete?: () => void
  onAnimationStep?: (index: number) => void
}

type SpringValues = {
  cameraPosition: [number, number, number]
  target: [number, number, number]
}

export function Globe({
  radius = 10,
  dotsOffset = 0,
  selectedLocations,
  autoRotate = false,
  onAnimationComplete,
  onAnimationStep,
}: Props) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const animationTimeoutRef = useRef<NodeJS.Timeout>()
  const isAnimatingRef = useRef(false)

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

    const rotateToNextLocation = async () => {
      if (isAnimatingRef.current) {
        // If still animating, try again in 500ms
        animationTimeoutRef.current = setTimeout(rotateToNextLocation, 500)
        return
      }

      if (currentLocationIndex === selectedLocations.length - 1) {
        onAnimationComplete?.()
      } else {
        setCurrentLocationIndex((prev) => {
          const next = (prev + 1) % selectedLocations.length
          onAnimationStep?.(next)
          return next
        })
      }
    }

    // Initial step notification
    onAnimationStep?.(currentLocationIndex)

    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Set new timeout for next location
    animationTimeoutRef.current = setTimeout(rotateToNextLocation, 2500)

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [
    autoRotate,
    selectedLocations,
    currentLocationIndex,
    onAnimationComplete,
    onAnimationStep,
  ])

  // Modify the camera position effect to use currentLocationIndex
  useEffect(() => {
    if (!selectedLocations?.length || !controlsRef.current) return

    const currentLocation = selectedLocations[currentLocationIndex]

    // Function to get 3D coordinates for a country ID
    const getCountryCoords = (countryId: string) => {
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

    const animate = async () => {
      const currentPosition = getCountryCoords(currentLocation.id)
      if (!currentPosition) return

      isAnimatingRef.current = true

      try {
        const prevIndex =
          (currentLocationIndex - 1 + selectedLocations.length) %
          selectedLocations.length
        const prevLocation = selectedLocations[prevIndex]

        if (prevLocation) {
          const prevPosition = getCountryCoords(prevLocation.id)
          if (prevPosition) {
            // Calculate animation points
            const angle = prevPosition.angleTo(currentPosition)
            const rotationAxis = new THREE.Vector3()
              .crossVectors(prevPosition, currentPosition)
              .normalize()

            if (rotationAxis.lengthSq() < 0.001) {
              rotationAxis.set(0, 1, 0)
            }

            // Create interpolation points
            const numPoints = 5
            const points: THREE.Vector3[] = []

            for (let i = 0; i < numPoints; i++) {
              const t = i / (numPoints - 1)
              const quaternion = new THREE.Quaternion()
              quaternion.setFromAxisAngle(rotationAxis, angle * t)

              const point = prevPosition.clone()
              point.applyQuaternion(quaternion)

              const heightOffset = Math.sin(t * Math.PI) * 2
              point
                .normalize()
                .multiplyScalar(15 + heightOffset)
                .add(new THREE.Vector3(0, 4, 0))

              points.push(point)
            }

            // Animate through points
            for (const point of points) {
              const lookAtPoint = currentPosition
                .clone()
                .normalize()
                .multiplyScalar(radius)

              await api.start({
                cameraPosition: [point.x, point.y, point.z],
                target: [lookAtPoint.x, lookAtPoint.y, lookAtPoint.z],
                config: springConfig.slow,
              })
            }
          }
        } else {
          // Direct animation to first location
          const cameraPos = getCameraPosition(currentPosition)
          const targetPos = getTarget(currentPosition)
          await api.start({
            cameraPosition: cameraPos,
            target: targetPos,
            config: springConfig.slow,
          })
        }
      } finally {
        isAnimatingRef.current = false
      }
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
