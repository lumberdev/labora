import React, { useState } from 'react'

type Props = {
  anchors: string[]
  children: React.ReactNode
}

const MobileNav = ({ anchors, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{children}</button>
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        {anchors.map((anchor) => (
          <a key={anchor} href={`#${anchor}`}>
            {anchor}
          </a>
        ))}
      </div>
    </div>
  )
}

export default MobileNav
