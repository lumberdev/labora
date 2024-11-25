import { animated, useSpring } from '@react-spring/web'
import React, { useState } from 'react'

type Props = {
  to: number
  from: number
  duration?: number
  precision?: number
  children: React.ReactNode
}

const HorizontalAnimation = ({
  to,
  from,
  duration = 120000,
  precision = 0.0001,
  children,
}: Props) => {
  // Create two instances of content for seamless loop
  const [items] = useState([0, 1])

  const [springs] = useSpring(
    () => ({
      from: { x: from },
      to: { x: to },
      config: {
        duration,
        precision,
      },
      loop: true,
      reset: false,
    }),
    [],
  )

  return (
    <div className="relative w-full overflow-hidden">
      <animated.div
        className="flex"
        style={{
          transform: springs.x.to((x) => `translateX(${x}%)`),
        }}
      >
        {/* Duplicate content for seamless loop */}
        {items.map((i) => (
          <div key={i} className="flex h-full w-max">
            {children}
          </div>
        ))}
      </animated.div>
    </div>
  )
}

export default HorizontalAnimation
