import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import { useFrame } from '@react-three/fiber'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { CountryFeature } from '@/types/geo'

type Props = {
  radius: number
  countryId: string | null
}

const CountryBorders = ({ radius, countryId }: Props) => {
  const meshRef = useRef<THREE.LineSegments>(null)
  const materialRef = useRef<THREE.LineBasicMaterial>(null)

  // Add color animation
  useFrame(({ clock }) => {
    if (materialRef.current) {
      const hue = (Math.sin(clock.getElapsedTime() * 0.5) + 1) / 2
      materialRef.current.color.setHSL(hue, 1, 0.5)
    }
  })

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/world-110m.json')
        const topology = (await response.json()) as Topology
        const geojson = feature(
          topology,
          topology.objects.countries as GeometryCollection,
        )

        const countryFeature = geojson.features.find(
          (feature) => feature.id === countryId,
        ) as CountryFeature | undefined

        if (!countryFeature) {
          console.warn('Country not found:', countryId)
          return
        }

        const points: THREE.Vector3[] = []

        // Helper function to convert lat/lon to 3D coordinates
        const latLonToVector3 = (lon: number, lat: number) => {
          const phi = (90 - lat) * (Math.PI / 180)
          const theta = (lon + 180) * (Math.PI / 180)

          const x = -radius * Math.sin(phi) * Math.cos(theta)
          const y = radius * Math.cos(phi)
          const z = radius * Math.sin(phi) * Math.sin(theta)

          return new THREE.Vector3(x, y, z)
        }

        // Helper function to process a ring of coordinates
        const processRing = (ring: number[][]) => {
          ring.forEach(([lon, lat]) => {
            points.push(latLonToVector3(lon, lat))
          })
          // Close the loop by connecting back to the first point
          points.push(latLonToVector3(ring[0][0], ring[0][1]))
        }

        if (countryFeature.geometry.type === 'Polygon') {
          countryFeature.geometry.coordinates.forEach(processRing)
        } else if (countryFeature.geometry.type === 'MultiPolygon') {
          countryFeature.geometry.coordinates.forEach((polygon) => {
            polygon.forEach(processRing)
          })
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        if (meshRef.current) {
          meshRef.current.geometry.dispose() // Clean up old geometry
          meshRef.current.geometry = geometry
        }
      } catch (error) {
        console.error('Error loading country borders:', error)
      }
    }

    if (countryId) {
      loadCountries()
    }

    // Cleanup function
    return () => {
      if (meshRef.current?.geometry) {
        meshRef.current.geometry.dispose()
      }
    }
  }, [radius, countryId])

  return (
    <lineSegments ref={meshRef}>
      <bufferGeometry />
      <lineBasicMaterial
        ref={materialRef}
        linewidth={1}
        transparent
        opacity={0.8}
        depthTest={false}
      />
    </lineSegments>
  )
}

export default CountryBorders
