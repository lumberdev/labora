import React, { forwardRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import Pin from '@/assets/pin.svg?react'

type Props = {
  country: string
  logo: string
  blob: string
}

const Marker = forwardRef<THREE.Mesh, Props>(({ country, logo, blob }, ref) => {
  return (
    <mesh ref={ref}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#D6C099" transparent opacity={0.5} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#D6C099" />
      </mesh>

      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 2, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#D6C099" />
      </line>

      <Html position={[0, 2, 0]} center>
        <div className="relative grid h-[100px] w-[250px] grid-cols-5">
          <div className="col-span-2 flex items-center justify-center rounded-l bg-white px-6">
            <img src={logo} alt={country} />
          </div>
          <div className="col-span-3 flex flex-col gap-[10px] rounded-r bg-tan p-[10px] text-[9px] text-black">
            <p>{blob}</p>
            <div className="flex items-center gap-1">
              <Pin />
              <p>{country}</p>
            </div>
          </div>
        </div>
      </Html>
    </mesh>
  )
})

Marker.displayName = 'Marker'

export default Marker
