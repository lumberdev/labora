'use client'
import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Sphere from './Sphere'
import { Dots } from './Dots'
import type { Location } from '@/types'

type Props = {
  radius?: number
  dotsOffset?: number
  selectedLocation: Location | null
}

export function Globe({ radius = 8, dotsOffset = 0, selectedLocation }: Props) {
  const markerRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (selectedLocation && markerRef.current) {
      const { lat, lon } = selectedLocation
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)

      const x = -(radius + 0.1) * Math.sin(phi) * Math.cos(theta)
      const y = (radius + 0.1) * Math.cos(phi)
      const z = (radius + 0.1) * Math.sin(phi) * Math.sin(theta)

      markerRef.current.position.set(x, y, z)
      markerRef.current.visible = true
    } else if (markerRef.current) {
      markerRef.current.visible = false
    }
  }, [selectedLocation, radius])

  return (
    <Canvas camera={{ position: [1, 4, 15], near: 1, far: 50 }}>
      <ambientLight />
      <Sphere radius={radius} />
      <Suspense fallback={null}>
        <Dots radius={radius + dotsOffset / 10} />
        {/* <Points /> */}
      </Suspense>
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
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
