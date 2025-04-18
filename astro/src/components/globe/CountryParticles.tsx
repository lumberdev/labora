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
        areaScale: { value: 1.0 },
      },
      vertexShader: `
        uniform float time;
        uniform float areaScale;
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

          // Calculate alpha based on height and area scale
          float baseAlpha = 0.8;
          vAlpha = (baseAlpha + totalEffect * 1.5) * (0.7 + areaScale * 0.3);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 2.5;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          // Calculate squared distance to avoid sqrt in length()
          float distSq = dot(center, center);

          // Adjust thresholds (0.15, 0.04) to find balance. (Previous was 0.1, 0.04 -> grainy; 0.25, 0.04 -> soft)
          float alpha = smoothstep(0.15, 0.04, distSq) * min(1.0, vAlpha);

          // Add subtle glow - calculate sqrt once if needed for visual effect
          float dist = sqrt(distSq);
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
      const area = calculateApproximateArea(bounds, countryFeature)

      // Scale number of points based on actual country area
      const basePoints = 100
      const maxPoints = 20000
      // More aggressive scaling for small countries
      const areaScale = Math.pow(Math.min(1, Math.max(0.00001, area * 8)), 0.8)
      const numPoints = Math.floor(
        basePoints + (maxPoints - basePoints) * areaScale,
      )

      // Store bounds and area for each sub-polygon if it's a MultiPolygon
      let subPolygonsInfo: {
        bounds: ReturnType<typeof getBounds>
        area: number
      }[] = []
      let totalSubPolygonArea = 0

      if (countryFeature.geometry.type === 'MultiPolygon') {
        subPolygonsInfo = countryFeature.geometry.coordinates.map(
          (polygonRings) => {
            const featurePart = {
              type: 'Feature',
              properties: {},
              id: countryId || undefined,
              geometry: { type: 'Polygon', coordinates: polygonRings },
            } as CountryFeature
            const bounds = getBounds(featurePart)
            const area = calculateApproximateArea(bounds, featurePart) // Calculate area for this sub-polygon
            return { bounds, area }
          },
        )
        totalSubPolygonArea = subPolygonsInfo.reduce(
          (sum, info) => sum + info.area,
          0,
        )
      }

      const positions: number[] = []
      const randoms: number[] = []
      let attempts = 0
      const maxAttempts = numPoints * 20 // Keep reduced max attempts

      while (positions.length < numPoints * 3 && attempts < maxAttempts) {
        let lat: number
        let lon: number

        if (
          countryFeature.geometry.type === 'MultiPolygon' &&
          subPolygonsInfo.length > 0 &&
          totalSubPolygonArea > 0
        ) {
          // Weighted random selection of sub-polygon based on area
          let randomArea = Math.random() * totalSubPolygonArea
          let selectedIndex = -1
          for (let i = 0; i < subPolygonsInfo.length; i++) {
            randomArea -= subPolygonsInfo[i].area
            if (randomArea <= 0) {
              selectedIndex = i
              break
            }
          }
          // Fallback to last polygon if something went wrong with floating point math
          if (selectedIndex === -1) selectedIndex = subPolygonsInfo.length - 1

          const selectedBounds = subPolygonsInfo[selectedIndex].bounds
          lat = randomBetween(selectedBounds.minLat, selectedBounds.maxLat)
          lon = randomBetween(selectedBounds.minLon, selectedBounds.maxLon)
        } else {
          // For simple Polygons, sample within the main bounds
          lat = randomBetween(bounds.minLat, bounds.maxLat)
          lon = randomBetween(bounds.minLon, bounds.maxLon)
        }

        // isPointInPolygon check still required as bounds are rectangular
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
        // Update the area scale uniform
        material.uniforms.areaScale.value = areaScale
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

function calculateApproximateArea(
  bounds: ReturnType<typeof getBounds>,
  feature: CountryFeature,
) {
  // Helper function to calculate area of a polygon on a sphere
  function sphericalPolygonArea(coords: number[][]) {
    let area = 0
    if (coords.length < 3) return area

    // Convert to radians
    const points = coords.map(([lon, lat]) => ({
      lon: lon * (Math.PI / 180),
      lat: lat * (Math.PI / 180),
    }))

    // Add first point to close the polygon
    points.push(points[0])

    // Calculate area using spherical excess formula
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      area += (p2.lon - p1.lon) * (2 + Math.sin(p1.lat) + Math.sin(p2.lat))
    }

    return Math.abs(area / 2)
  }

  // Calculate total area for all polygons
  let totalArea = 0
  if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach((polys) => {
      polys.forEach((ring) => {
        totalArea += sphericalPolygonArea(ring)
      })
    })
  } else {
    feature.geometry.coordinates.forEach((ring) => {
      totalArea += sphericalPolygonArea(ring)
    })
  }

  // Normalize by maximum possible area (half sphere = 2π)
  return totalArea / (2 * Math.PI)
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
