import { useEffect, useRef } from 'react'

const STAR_DENSITY = 9000 // px^2 per star
const SHOOTING_STAR_MIN_MS = 2600
const SHOOTING_STAR_MAX_MS = 6200

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let stars = []
    let shootingStars = []
    let pointer = { x: 0, y: 0 }
    let rafId = null
    let shootTimeout = null

    function makeStars() {
      const count = Math.round((width * height) / STAR_DENSITY)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.25,
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.0015 + 0.0004,
        twinkleOffset: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.6 + 0.2,
        hue: Math.random() > 0.85 ? 265 : 0,
      }))
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      makeStars()
    }

    function scheduleShootingStar() {
      const delay =
        SHOOTING_STAR_MIN_MS +
        Math.random() * (SHOOTING_STAR_MAX_MS - SHOOTING_STAR_MIN_MS)
      shootTimeout = setTimeout(() => {
        const startX = Math.random() * width * 0.7 + width * 0.15
        const startY = Math.random() * height * 0.3
        const angle = (Math.PI / 4) * (Math.random() * 0.6 + 0.7)
        shootingStars.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * 14,
          vy: Math.sin(angle) * 14,
          life: 1,
        })
        scheduleShootingStar()
      }, delay)
    }

    function onPointerMove(e) {
      pointer.x = (e.clientX / width - 0.5) * 2
      pointer.y = (e.clientY / height - 0.5) * 2
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)

      for (const s of stars) {
        const twinkle = prefersReducedMotion
          ? 0
          : Math.sin(performance.now() * s.twinkleSpeed + s.twinkleOffset) *
            0.35
        const alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle))
        const px = s.x + pointer.x * s.depth * 14
        const py = s.y + pointer.y * s.depth * 14
        ctx.beginPath()
        ctx.fillStyle =
          s.hue === 265
            ? `hsla(265, 90%, 85%, ${alpha})`
            : `rgba(255,255,255,${alpha})`
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      shootingStars = shootingStars.filter((star) => star.life > 0)
      for (const star of shootingStars) {
        const tailX = star.x - star.vx * 6
        const tailY = star.y - star.vy * 6
        const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY)
        grad.addColorStop(0, `rgba(233, 213, 255, ${star.life})`)
        grad.addColorStop(1, 'rgba(233, 213, 255, 0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(star.x, star.y)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()

        star.x += star.vx
        star.y += star.vy
        star.life -= 0.018
      }

      rafId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)
    draw()
    if (!prefersReducedMotion) scheduleShootingStar()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(rafId)
      clearTimeout(shootTimeout)
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />
}
