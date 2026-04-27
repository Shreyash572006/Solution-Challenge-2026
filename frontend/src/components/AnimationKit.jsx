import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

// ── Scroll reveal wrapper ──────────────────────────────────────────────────
export function RevealOnScroll({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: {
      opacity: 1, y: 0, x: 0,
      transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

// ── Neon glow button with ripple ───────────────────────────────────────────
export function NeonButton({ children, onClick, variant = 'primary', className = '', type = 'button' }) {
  const colors = {
    primary: 'from-violet-600 to-blue-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]',
    secondary: 'from-transparent to-transparent border border-violet-500/50 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    danger: 'from-red-600 to-pink-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]',
  }
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative bg-gradient-to-r ${colors[variant]} px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden ${className}`}
    >
      <motion.span
        className="absolute inset-0 rounded-xl"
        whileTap={{ background: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)'] }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  )
}

// ── Glass card with hover lift ─────────────────────────────────────────────
export function GlassCard({ children, className = '', glowColor = 'rgba(139,92,246,0.3)' }) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: `0 20px 60px ${glowColor}`, borderColor: glowColor }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ── Animated AI Orb ────────────────────────────────────────────────────────
export function AIOrb({ size = 200 }) {
  const r = size / 2

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Pulse rings */}
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: -(i * 18),
            border: `1px solid rgba(139,92,246,${0.25 / i})`,
          }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 0.2, 0.7] }}
          transition={{ duration: 2 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}

      {/* Core */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 38% 32%, rgba(139,92,246,0.95) 0%, rgba(59,130,246,0.65) 50%, rgba(6,182,212,0.3) 100%)',
          boxShadow: '0 0 60px rgba(139,92,246,0.55), 0 0 120px rgba(59,130,246,0.2)',
        }}
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center icon */}
      <motion.div
        className="relative z-10 text-4xl"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >✨</motion.div>

      {/* Orbiting nodes */}
      {[
        { color: '#8B5CF6', angle: 0, delay: 0 },
        { color: '#3B82F6', angle: 120, delay: 0 },
        { color: '#10B981', angle: 240, delay: 0 },
      ].map(({ color, angle }, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full z-20"
          style={{ width: 10, height: 10, background: color, boxShadow: `0 0 10px ${color}`, top: '50%', left: '50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'linear', delay: (angle / 360) * -(5 + i) }}
          transformTemplate={({ rotate: r }) => {
            const rad = ((parseInt(r) || 0) + angle) * Math.PI / 180
            const d = size * 0.5
            return `translate(calc(${Math.cos(rad) * d}px - 5px), calc(${Math.sin(rad) * d}px - 5px))`
          }}
        />
      ))}
    </div>
  )
}

// ── Animated count-up number ───────────────────────────────────────────────
export function AnimatedNumber({ end, prefix = '', suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = (end - start) / (duration * 60)
    const iv = setInterval(() => {
      start = Math.min(start + step, end)
      setVal(Math.round(start))
      if (start >= end) clearInterval(iv)
    }, 1000 / 60)
    return () => clearInterval(iv)
  }, [inView, end, duration])

  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}

// ── Step connector line ────────────────────────────────────────────────────
export function StepConnector({ active }) {
  return (
    <div className="flex-1 h-px bg-white/10 mx-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-blue-500"
        initial={{ width: '0%' }}
        animate={{ width: active ? '100%' : '0%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}
