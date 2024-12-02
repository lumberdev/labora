import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useSpring } from '@react-spring/three'
import Sphere from './Sphere'
import { Dots } from './Dots'
import Marker from './Marker'
import cefLogo from '/cef.png?url'
import { coordinates, type CountryKey } from '@/lib/data'
import CountryHighlight from './CountryHighlight'

type Props = {
  radius?: number
  dotsOffset?: number
  selectedLocations: {
    name: CountryKey
    id: number
  }[]
}

type SpringValues = {
  cameraPosition: [number, number, number]
  target: [number, number, number]
}

export function Globe({
  radius = 8,
  dotsOffset = 0,
  selectedLocations,
}: Props) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [markersState, setMarkersState] = useState<
    Record<CountryKey, boolean> | {}
  >({})

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

  // // Position camera to view all markers when selection changes
  // useEffect(() => {
  //   if (!selectedLocations?.length || !controlsRef.current) return

  //   // Get the last selected location to focus the camera on
  //   const lastLocation = selectedLocations[selectedLocations.length - 1]

  //   // Convert latitude and longitude to 3D coordinates
  //   const phi = (90 - coordinates[lastLocation].lat) * (Math.PI / 180)
  //   const theta = (coordinates[lastLocation].lon + 180) * (Math.PI / 180)

  //   // Calculate position on the sphere's surface
  //   const x = -(radius + 0.1) * Math.sin(phi) * Math.cos(theta)
  //   const y = (radius + 0.1) * Math.cos(phi)
  //   const z = (radius + 0.1) * Math.sin(phi) * Math.sin(theta)

  //   const position = new THREE.Vector3(x, y, z)

  //   // Calculate camera position to view the selected location
  //   const cameraDistance = 15
  //   const newCameraPosition = position
  //     .clone()
  //     .normalize()
  //     .multiplyScalar(cameraDistance)
  //   newCameraPosition.y += 4

  //   // Animate to new position
  //   api.start({
  //     to: {
  //       cameraPosition: [
  //         newCameraPosition.x,
  //         newCameraPosition.y,
  //         newCameraPosition.z,
  //       ],
  //       target: [position.x * 0.9, position.y * 0.9, position.z * 0.9],
  //     },
  //     config: {
  //       tension: 120,
  //       friction: 14,
  //       duration: 1000,
  //     },
  //   })
  // }, [radius, selectedLocations, api])

  // Reset markers state when selection changes
  useEffect(() => {
    setMarkersState({})
  }, [selectedLocations])

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
        <CountryHighlight
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
