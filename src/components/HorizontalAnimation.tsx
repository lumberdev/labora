import { animated, useSpring } from '@react-spring/web'
import React from 'react'

type Props = {
  to: number
  from: number
  duration?: number
  precision?: number
  loop?: boolean
  reset?: boolean
  children: React.ReactNode
}

const HorizontalAnimation = ({
  to,
  from,
  duration = 60000,
  precision = 0.0001,
  loop = true,
  reset = true,
  children,
}: Props) => {
  const [styles] = useSpring(
    {
      from: { x: from },
      to: async (next) => {
        await next({ x: to })
        await next({ x: from, immediate: true })
      },
      config: {
        duration,
        precision,
      },
      loop,
      reset,
    },
    [],
  )
  return (
    <animated.div
      className="flex h-full w-max"
      style={{ transform: styles.x.to((x) => `translateX(${x}%)`) }}
    >
      {children}
    </animated.div>
  )
}

export default HorizontalAnimation
