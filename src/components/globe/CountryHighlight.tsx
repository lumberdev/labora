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

const CountryHighlight = ({ radius, countryId }: Props) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshPhongMaterial>(null)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const hue = (Math.sin(clock.getElapsedTime() * 0.5) + 1) / 2
      materialRef.current.color.setHSL(hue, 1, 0.5)
      materialRef.current.emissive.setHSL(hue, 1, 0.3)
    }
  })

  useEffect(() => {
    const loadCountry = async () => {
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

        if (!countryFeature || !meshRef.current) {
          console.warn('Country not found:', countryId)
          return
        }

        const vertices: number[] = []
        const indices: number[] = []
        let vertexIndex = 0

        const addVertex = (lon: number, lat: number) => {
          const phi = (90 - lat) * (Math.PI / 180)
          const theta = (lon + 180) * (Math.PI / 180)

          // Slightly increase radius to prevent z-fighting
          const r = radius * 1.001
          const x = -r * Math.sin(phi) * Math.cos(theta)
          const y = r * Math.cos(phi)
          const z = r * Math.sin(phi) * Math.sin(theta)

          vertices.push(x, y, z)
          return vertexIndex++
        }

        const processPolygon = (coordinates: number[][]) => {
          const ringIndices: number[] = []
          coordinates.forEach(([lon, lat]) => {
            ringIndices.push(addVertex(lon, lat))
          })

          // Create triangles
          for (let i = 1; i < ringIndices.length - 1; i++) {
            indices.push(ringIndices[0], ringIndices[i], ringIndices[i + 1])
          }
        }

        if (countryFeature.geometry.type === 'Polygon') {
          countryFeature.geometry.coordinates.forEach(processPolygon)
        } else if (countryFeature.geometry.type === 'MultiPolygon') {
          countryFeature.geometry.coordinates.forEach((polygons) => {
            polygons.forEach(processPolygon)
          })
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(vertices, 3),
        )
        geometry.setIndex(indices)

        if (meshRef.current) {
          meshRef.current.geometry.dispose()
          meshRef.current.geometry = geometry
        }
      } catch (error) {
        console.error('Error loading country:', error)
      }
    }

    if (countryId) {
      loadCountry()
    }

    return () => {
      if (meshRef.current?.geometry) {
        meshRef.current.geometry.dispose()
      }
    }
  }, [radius, countryId])

  return (
    <mesh ref={meshRef}>
      <meshPhongMaterial
        ref={materialRef}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        depthTest={false}
        shininess={0}
        emissiveIntensity={0.5}
        specular={new THREE.Color(0x000000)}
      />
    </mesh>
  )
}

export default CountryHighlight
