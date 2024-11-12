import React from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useEffect, useState } from 'react'
import cityscapeMobile from '../assets/cityscape-full-mobile.png?url'
import clouds from '../assets/clouds.png?url'

const CityscapeScroll: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Slower animation for cityscape (moving left)
  const [cityscapeProps, cityscapeApi] = useSpring(() => ({
    from: { x: 0 },
    to: async (next) => {
      while (true) {
        await next({ x: -windowWidth })
        await next({ x: 0, immediate: true })
      }
    },
    config: { duration: 30000 }
  }))

  // Animation for clouds (moving right)
  const [cloudsProps, cloudsApi] = useSpring(() => ({
    from: { x: -windowWidth },
    to: async (next) => {
      while (true) {
        await next({ x: 0 })
        await next({ x: -windowWidth, immediate: true })
      }
    },
    config: { duration: 40000 }
  }))

  // Update animations when window width changes
  useEffect(() => {
    cityscapeApi.start({
      from: { x: 0 },
      to: async (next) => {
        while (true) {
          await next({ x: -windowWidth })
          await next({ x: 0, immediate: true })
        }
      }
    })

    cloudsApi.start({
      from: { x: -windowWidth },
      to: async (next) => {
        while (true) {
          await next({ x: 0 })
          await next({ x: -windowWidth, immediate: true })
        }
      }
    })
  }, [windowWidth, cityscapeApi, cloudsApi])

  return (
    <div className="from-sky-300 to-sky-100 relative h-[300px] w-full overflow-hidden bg-gradient-to-b">
      {/* Clouds Layer */}
      <div className="absolute inset-0">
        <animated.div
          className="flex h-full"
          style={{
            ...cloudsProps,
            width: '200%'
          }}
        >
          <img
            src={clouds}
            alt="Clouds"
            className="h-full w-full object-cover opacity-70"
          />
          <img
            src={clouds}
            alt="Clouds"
            className="h-full w-full object-cover opacity-70"
          />
        </animated.div>
      </div>

      {/* Cityscape Layer */}
      <div className="absolute inset-0 bottom-0">
        <animated.div
          className="flex h-full"
          style={{
            ...cityscapeProps,
            width: '200%'
          }}
        >
          <img
            src={cityscapeMobile}
            alt="Cityscape"
            className="h-full w-full object-cover object-bottom"
          />
          <img
            src={cityscapeMobile}
            alt="Cityscape"
            className="h-full w-full object-cover object-bottom"
          />
        </animated.div>
      </div>
    </div>
  )
}

export default CityscapeScroll
