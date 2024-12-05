import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
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

const CountryParticles = ({ radius, countryId }: Props) => {
  const pointsRef = useRef<THREE.Points>(null)

  // Create a shader material for the particles
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#D6C099') },
      },
      vertexShader: `
        uniform float time;
        attribute float random;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Create a wave pattern that moves across the country
          float wave = sin(pos.x * 2.0 + pos.z * 2.0 + time * 1.5) * 0.5 + 0.5;
          
          // Add some noise based on position for variety
          float noise = sin(random * 6.28 + time) * 0.5 + 0.5;
          
          // Combine effects with reduced amplitude
          float totalEffect = wave * 0.015 + noise * 0.01;
          
          // Apply displacement
          pos = pos * (1.0 + totalEffect);
          
          // Calculate alpha based on height
          vAlpha = 0.4 + totalEffect * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 2.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Create softer particles with a glow effect
          float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;
          
          // Add subtle glow
          vec3 finalColor = color + color * (1.0 - dist) * 0.5;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.time.value = clock.getElapsedTime()
    }
  })

  useEffect(() => {
    const loadCountryPoints = async () => {
      const response = await fetch('/world-110m.json')
      const topology = (await response.json()) as Topology
      const geojson = feature(
        topology,
        topology.objects.countries as GeometryCollection,
      )

      const countryFeature = geojson.features.find(
        (feature) => feature.id === countryId,
      ) as CountryFeature | undefined

      if (!countryFeature) return

      const bounds = getBounds(countryFeature)
      const area = calculateApproximateArea(bounds)

      // Scale number of points based on area
      // Base of 1000 points for smallest countries
      // Up to 8000 for largest countries
      const basePoints = 1000
      const maxPoints = 8000
      const areaScale = Math.min(1, Math.max(0.1, area * 10)) // Normalize area to 0.1-1 range
      const numPoints = Math.floor(
        basePoints + (maxPoints - basePoints) * areaScale,
      )

      const positions: number[] = []
      const randoms: number[] = []
      let attempts = 0
      const maxAttempts = numPoints * 10

      while (positions.length < numPoints * 3 && attempts < maxAttempts) {
        const lat = randomBetween(bounds.minLat, bounds.maxLat)
        const lon = randomBetween(bounds.minLon, bounds.maxLon)

        if (isPointInPolygon(lon, lat, countryFeature)) {
          const phi = (90 - lat) * (Math.PI / 180)
          const theta = (lon + 180) * (Math.PI / 180)

          const x = -(radius + 0.05) * Math.sin(phi) * Math.cos(theta)
          const y = (radius + 0.05) * Math.cos(phi)
          const z = (radius + 0.05) * Math.sin(phi) * Math.sin(theta)

          positions.push(x, y, z)
          randoms.push(Math.random())
        }
        attempts++
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
      )
      geometry.setAttribute(
        'random',
        new THREE.Float32BufferAttribute(randoms, 1),
      )

      if (pointsRef.current) {
        pointsRef.current.geometry.dispose()
        pointsRef.current.geometry = geometry
      }
    }

    if (countryId) {
      loadCountryPoints()
    }
    const pointsGeometry = pointsRef.current?.geometry
    return () => {
      if (pointsGeometry) {
        pointsGeometry.dispose()
      }
    }
  }, [radius, countryId])

  return <points ref={pointsRef} material={material} />
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

function calculateApproximateArea(bounds: ReturnType<typeof getBounds>) {
  // Convert to radians
  const latRange = (bounds.maxLat - bounds.minLat) * (Math.PI / 180)
  const lonRange = (bounds.maxLon - bounds.minLon) * (Math.PI / 180)

  // Approximate area calculation (simplified spherical geometry)
  const area = Math.abs(
    latRange * lonRange * Math.cos((bounds.minLat * Math.PI) / 180),
  )
  return area
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

export default CountryParticles
