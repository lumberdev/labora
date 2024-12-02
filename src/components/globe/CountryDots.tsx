import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type {
  CountryFeature,
  PolygonCoordinates,
  MultiPolygonCoordinates,
} from '@/types/geo'

type Props = {
  radius: number
  countryId: string | null
}

const CountryDots = ({ radius, countryId }: Props) => {
  const pointsRef = useRef<THREE.Points>(null)

  useEffect(() => {
    const loadCountryPoints = async () => {
      const response = await fetch('/world-110m.json')
      const topology = (await response.json()) as Topology
      const geojson = feature(
        topology,
        topology.objects.countries as GeometryCollection,
      )

      const positions: number[] = []
      const countryFeature = geojson.features.find(
        (feature) => feature.id === countryId,
      ) as CountryFeature | undefined

      if (countryFeature) {
        const bounds = getBounds(countryFeature)
        const numPoints = 100
        let attempts = 0
        const maxAttempts = 1000

        while (positions.length < numPoints * 3 && attempts < maxAttempts) {
          const lat = randomBetween(bounds.minLat, bounds.maxLat)
          const lon = randomBetween(bounds.minLon, bounds.maxLon)

          if (isPointInPolygon(lon, lat, countryFeature)) {
            const phi = (90 - lat) * (Math.PI / 180)
            const theta = (lon + 180) * (Math.PI / 180)

            const x = -(radius + 0.02) * Math.sin(phi) * Math.cos(theta)
            const y = (radius + 0.02) * Math.cos(phi)
            const z = (radius + 0.02) * Math.sin(phi) * Math.sin(theta)

            positions.push(x, y, z)
          }
          attempts++
        }
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
      )

      if (pointsRef.current) {
        pointsRef.current.geometry = geometry
      }
    }

    if (countryId) {
      loadCountryPoints()
    }
  }, [radius, countryId])

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        color="#D6C099"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  )
}

function getBounds(feature: CountryFeature) {
  let minLat = 90
  let maxLat = -90
  let minLon = 180
  let maxLon = -180

  const coordinates =
    feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates.flat()
      : feature.geometry.coordinates

  ;(coordinates as PolygonCoordinates).forEach((ring) => {
    ring.forEach(([lon, lat]) => {
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLon = Math.min(minLon, lon)
      maxLon = Math.max(maxLon, lon)
    })
  })

  return { minLat, maxLat, minLon, maxLon }
}

function isPointInPolygon(lon: number, lat: number, feature: CountryFeature) {
  const coordinates =
    feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates
      : [feature.geometry.coordinates]

  return (coordinates as MultiPolygonCoordinates).some((polygon) => {
    return polygon.some((ring) => {
      let inside = false
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i]
        const [xj, yj] = ring[j]

        const intersect =
          yi > lat !== yj > lat &&
          lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
        if (intersect) inside = !inside
      }
      return inside
    })
  })
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export default CountryDots
