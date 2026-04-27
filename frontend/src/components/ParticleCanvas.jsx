import { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    let W = window.innerWidth
    let H = window.innerHeight

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * W
        this.y = Math.random() * H
        this.size = Math.random() * 2 + 0.5
        this.speed = Math.random() * 0.4 + 0.1
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = -this.speed
        this.opacity = Math.random() * 0.6 + 0.1
        this.color = Math.random() > 0.5
          ? `rgba(139,92,246,${this.opacity})`
          : `rgba(59,130,246,${this.opacity})`
        this.life = 0
        this.maxLife = Math.random() * 200 + 100
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        this.life++
        if (this.life > this.maxLife || this.y < 0) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Stars (static)
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.8 + 0.1,
      d: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }))

    // Floating particles
    particles = Array.from({ length: 80 }, () => new Particle())

    // Connection lines
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    let t = 0
    const animate = () => {
      ctx.clearRect(0, 0, W, H)

      // Draw stars with twinkle
      stars.forEach(s => {
        const a = s.a * (0.5 + 0.5 * Math.sin(t * s.d + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fill()
      })

      // Draw connections
      drawConnections()

      // Draw floating particles
      particles.forEach(p => { p.update(); p.draw() })

      // Big ambient orbs
      const g1 = ctx.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, 350)
      g1.addColorStop(0, 'rgba(139,92,246,0.06)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, W, H)

      const g2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 0, W * 0.8, H * 0.7, 300)
      g2.addColorStop(0, 'rgba(59,130,246,0.05)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, W, H)

      t++
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} id="particle-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}
