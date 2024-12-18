import * as THREE from 'three'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SpringRef } from '@react-spring/web'
import { config as springConfig } from '@react-spring/three'
import { coordinates } from './data'
import {
  CAMERA_DISTANCE,
  CAMERA_Y_OFFSET,
  type GlobeProps,
  type SpringValues,
} from '@/components/globe/Globe'

export const centerVector = new THREE.Vector3(0, 0, 0)

export const tempObject = new THREE.Object3D()

export const getDistance = (circlePosition: THREE.Vector3) => {
  const distance = new THREE.Vector3()
  distance.subVectors(centerVector, circlePosition).normalize()
  const { x, y, z } = distance
  const cordX = 1 - (0.5 + Math.atan2(z, x) / (2 * Math.PI))
  const cordY = 0.5 + Math.asin(y) / Math.PI
  return new THREE.Vector2(cordX, cordY)
}

export const getAlpha = (distanceVector: THREE.Vector2, imgData: ImageData) => {
  const { width, height } = imgData
  const { x, y } = distanceVector
  const index = 4 * Math.floor(x * width) + Math.floor(y * height) * (4 * width)
  // 4 because r, g, b, a stored against each pixel
  return imgData.data[index + 3]
}

export const getImageData = (imageEl: HTMLImageElement) => {
  const ctx = document.createElement('canvas')
  ctx.width = imageEl.width
  ctx.height = imageEl.height
  const canv = ctx.getContext('2d')
  if (!canv) {
    throw new Error('Failed to create canvas context')
  }
  canv.drawImage(imageEl, 0, 0)

  return canv.getImageData(0, 0, ctx.width, ctx.height)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper functions
export const getCountryCoords = (
  countryId: string,
  radius: number,
  selectedLocations: GlobeProps['selectedLocations'],
) => {
  const location = selectedLocations.find((loc) => loc.id === countryId)
  if (!location) return null

  const phi = (90 - coordinates[location.name].lat) * (Math.PI / 180)
  const theta = (coordinates[location.name].lon + 180) * (Math.PI / 180)

  const x = -(radius + 0.1) * Math.sin(phi) * Math.cos(theta)
  const y = (radius + 0.1) * Math.cos(phi)
  const z = (radius + 0.1) * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

export const getCameraPosition = (
  position: THREE.Vector3,
): [number, number, number] => {
  const pos = position
    .clone()
    .normalize()
    .multiplyScalar(CAMERA_DISTANCE)
    .add(new THREE.Vector3(0, CAMERA_Y_OFFSET, 0))
  return [pos.x, pos.y, pos.z]
}

export const getTarget = (
  position: THREE.Vector3,
): [number, number, number] => {
  return [position.x * 0.5, position.y * 0.5, position.z * 0.5]
}

export const createInterpolationPoints = (
  prevPosition: THREE.Vector3,
  rotationAxis: THREE.Vector3,
  angle: number,
  numPoints: number,
): THREE.Vector3[] => {
  const points: THREE.Vector3[] = []

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1)
    const quaternion = new THREE.Quaternion()
    quaternion.setFromAxisAngle(rotationAxis, angle * t)

    const point = prevPosition.clone()
    point.applyQuaternion(quaternion)

    point
      .normalize()
      .multiplyScalar(CAMERA_DISTANCE)
      .add(new THREE.Vector3(0, CAMERA_Y_OFFSET, 0))

    points.push(point)
  }

  return points
}

export const animateBetweenPoints = async (
  prevPosition: THREE.Vector3,
  currentPosition: THREE.Vector3,
  api: SpringRef<SpringValues>,
  radius: number,
) => {
  const angle = prevPosition.angleTo(currentPosition)
  const rotationAxis = new THREE.Vector3()
    .crossVectors(prevPosition, currentPosition)
    .normalize()

  if (rotationAxis.lengthSq() < 0.001) {
    rotationAxis.set(0, 1, 0)
  }

  const numPoints = 3
  const points = createInterpolationPoints(
    prevPosition,
    rotationAxis,
    angle,
    numPoints,
  )

  for (const point of points) {
    const lookAtPoint = currentPosition
      .clone()
      .normalize()
      .multiplyScalar(radius * 0.5)

    await api.start({
      cameraPosition: [point.x, point.y, point.z],
      target: [lookAtPoint.x, lookAtPoint.y, lookAtPoint.z],
      config: {
        ...springConfig.slow,
        duration: 800,
      },
    })
  }
}

export const animateDirectToPoint = async (
  position: THREE.Vector3,
  api: SpringRef<SpringValues>,
) => {
  const cameraPos = getCameraPosition(position)
  const targetPos = getTarget(position)

  await api.start({
    cameraPosition: cameraPos,
    target: targetPos,
    config: {
      ...springConfig.slow,
      duration: 800,
    },
  })
}
