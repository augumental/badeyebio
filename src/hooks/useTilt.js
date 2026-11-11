import { useEffect } from 'react'

/**
 * Eases CSS vars --rx --ry --tx --ty --gx --gy --hover on `ref` toward the pointer.
 * The element's CSS decides how to use them. strength scales rotation/translation.
 */
export default function useTilt(ref, { strength = 1, idle = true } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const s = { rx: 0, ry: 0, tx: 0, ty: 0, gx: 50, gy: 50, h: 0 }
    const t = { rx: 0, ry: 0, tx: 0, ty: 0, gx: 50, gy: 50, h: 0 }
    let raf = 0

    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e
      const r = el.getBoundingClientRect()
      const nx = Math.max(-1, Math.min(1, (p.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)))
      const ny = Math.max(-1, Math.min(1, (p.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)))
      const inside = p.clientX > r.left && p.clientX < r.right && p.clientY > r.top && p.clientY < r.bottom
      const k = (inside ? 16 : 9) * strength
      t.ry = nx * k
      t.rx = -ny * k
      t.tx = nx * 12 * strength
      t.ty = ny * 12 * strength
      t.gx = ((p.clientX - r.left) / r.width) * 100
      t.gy = ((p.clientY - r.top) / r.height) * 100
      t.h = inside ? 1 : 0
    }
    const onLeave = () => {
      t.rx = t.ry = t.tx = t.ty = t.h = 0
    }
    const loop = (now) => {
      const ix = idle ? Math.sin(now / 1900) * 1.5 * strength : 0
      const iy = idle ? Math.cos(now / 2400) * 1.5 * strength : 0
      const e = 0.08
      s.rx += (t.rx + iy - s.rx) * e
      s.ry += (t.ry + ix - s.ry) * e
      s.tx += (t.tx - s.tx) * e
      s.ty += (t.ty - s.ty) * e
      s.gx += (t.gx - s.gx) * e
      s.gy += (t.gy - s.gy) * e
      s.h += (t.h - s.h) * e
      el.style.setProperty('--rx', `${s.rx.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${s.ry.toFixed(2)}deg`)
      el.style.setProperty('--tx', `${s.tx.toFixed(2)}px`)
      el.style.setProperty('--ty', `${s.ty.toFixed(2)}px`)
      el.style.setProperty('--gx', `${s.gx.toFixed(1)}%`)
      el.style.setProperty('--gy', `${s.gy.toFixed(1)}%`)
      el.style.setProperty('--hover', s.h.toFixed(3))
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [ref, strength, idle])
}
