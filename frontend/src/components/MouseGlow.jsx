import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 })

  const springX = useSpring(pos.x, { stiffness: 150, damping: 25 })
  const springY = useSpring(pos.y, { stiffness: 150, damping: 25 })

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  useEffect(() => { springX.set(pos.x); springY.set(pos.y) }, [pos])

  return (
    <motion.div
      className="pointer-events-none fixed z-10"
      style={{
        left: springX,
        top: springY,
        x: '-50%',
        y: '-50%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)',
        mixBlendMode: 'screen',
      }}
    />
  )
}
