'use client'
import React, { Suspense, useEffect, useRef, useState } from 'react'
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

type Props = {
  radius?: number
  dotsOffset?: number
  selectedLocation: CountryKey | null
}

type SpringValues = {
  cameraPosition: [number, number, number]
  target: [number, number, number]
}

export function Globe({ radius = 8, dotsOffset = 0, selectedLocation }: Props) {
  const markerRef = useRef<THREE.Mesh>(null)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [markerMounted, setMarkerMounted] = useState(false)

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

  // Position the marker whenever it's mounted or the selection changes
  useEffect(() => {
    if (
      !markerRef.current ||
      !selectedLocation ||
      !markerMounted ||
      !controlsRef.current
    )
      return

    // Convert latitude and longitude to 3D coordinates
    const phi = (90 - coordinates[selectedLocation].lat) * (Math.PI / 180)
    const theta = (coordinates[selectedLocation].lon + 180) * (Math.PI / 180)

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
      position,
      position.clone().add(position.clone().normalize()),
      up,
    )

    markerRef.current.quaternion.setFromRotationMatrix(matrix)

    // Calculate camera position to view the selected location
    const cameraDistance = 15
    const newCameraPosition = position
      .clone()
      .normalize()
      .multiplyScalar(cameraDistance)
    newCameraPosition.y += 4

    // Animate to new position
    api.start({
      to: {
        cameraPosition: [
          newCameraPosition.x,
          newCameraPosition.y,
          newCameraPosition.z,
        ],
        target: [position.x * 0.9, position.y * 0.9, position.z * 0.9],
      },
      config: {
        tension: 120,
        friction: 14,
        duration: 1000,
      },
    })
  }, [radius, selectedLocation, markerMounted, api])

  // Reset markerMounted when selection changes
  useEffect(() => {
    setMarkerMounted(false)
  }, [selectedLocation])

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
      {selectedLocation && (
        <Marker
          ref={markerRef}
          country={selectedLocation}
          logo={cefLogo}
          blob={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vitae velit nec leo posuere tincidunt.'
          }
          onAfterMount={() => setMarkerMounted(true)}
        />
      )}
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
