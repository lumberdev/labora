import React, { useState, useEffect } from 'react'
import { useTransition, animated, config } from '@react-spring/web'

type Props = {
  anchors: string[]
  children: React.ReactNode
}

const MobileNav = ({ anchors, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [isOpen])

  const transition = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { ...config.gentle, duration: 200 },
    onDestroyed: () => {
      // Cleanup after animation completes
      if (!isOpen) {
        document.body.classList.remove('overflow-hidden')
      }
    },
  })

  const linkTransitions = useTransition(isOpen ? anchors : [], {
    trail: 40,
    from: { opacity: 0, transform: 'translateY(40px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: config.gentle,
  })

  return (
    <div className="relative z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="relative z-50 p-2">
        {children}
      </button>

      {transition(
        (style, show) =>
          show && (
            <animated.div style={style} className="fixed inset-0 bg-black/95">
              <div className="flex h-full flex-col items-center justify-center">
                {linkTransitions((linkStyle, anchor) => (
                  <animated.a
                    key={anchor}
                    href={`#${anchor}`}
                    onClick={() => setIsOpen(false)}
                    style={linkStyle}
                    className="hover:text-gray-300 mb-6 text-2xl capitalize text-white"
                  >
                    {anchor}
                  </animated.a>
                ))}
              </div>
            </animated.div>
          ),
      )}
    </div>
  )
}

export default MobileNav
