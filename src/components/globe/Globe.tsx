'use client'
import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Sphere from './Sphere'
import { Dots } from './Dots'
import type { Location } from '@/types'
import Marker from './Marker'
import cefLogo from '/cef.png?url'

type Props = {
  radius?: number
  dotsOffset?: number
  selectedLocation: Location | null
}

export function Globe({ radius = 8, dotsOffset = 0, selectedLocation }: Props) {
  const markerRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (markerRef.current && selectedLocation) {
      console.log('markerRef.current', markerRef.current)
      // Convert latitude and longitude to 3D coordinates
      const phi = (90 - selectedLocation.lat) * (Math.PI / 180)
      const theta = (selectedLocation.lon + 180) * (Math.PI / 180)

      // Calculate position on the sphere's surface
      const x = -(radius + 0.1) * Math.sin(phi) * Math.cos(theta)
      const y = (radius + 0.1) * Math.cos(phi)
      const z = (radius + 0.1) * Math.sin(phi) * Math.sin(theta)

      markerRef.current.position.set(x, y, z)

      // Calculate rotation to make the marker face outward from the globe's center
      const position = new THREE.Vector3(x, y, z)
      const up = new THREE.Vector3(0, 1, 0)
      const matrix = new THREE.Matrix4()

      matrix.lookAt(
        position, // Look from the marker's position
        position.clone().add(position.clone().normalize()), // Look outward
        up, // Up direction
      )

      markerRef.current.quaternion.setFromRotationMatrix(matrix)
    }
  }, [radius])

  return (
    <Canvas camera={{ position: [1, 4, 15], near: 1, far: 50 }}>
      <ambientLight />
      <Sphere radius={radius} />
      <Suspense fallback={null}>
        <Dots radius={radius + dotsOffset / 10} />
      </Suspense>
      <Marker
        ref={markerRef}
        country="United Kingdom"
        logo={cefLogo}
        blob={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vitae velit nec leo posuere tincidunt.'
        }
      />
      <OrbitControls
        minDistance={5}
        minPolarAngle={Math.PI * 0.35}
        maxPolarAngle={Math.PI * 0.55}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  )
}
