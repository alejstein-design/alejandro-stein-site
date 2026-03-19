'use client'

import { useEffect, type RefObject } from 'react'

interface Props {
  artworkImages: string[]
  lang: string
  portraitRef: RefObject<HTMLDivElement | null>
}

export default function KaleidoscopeEasterEgg({ artworkImages, lang, portraitRef }: Props) {
  useEffect(() => {
    if (artworkImages.length === 0) return
    // Desktop only — no easter egg on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    const clicks: number[] = []
    let active = false
    let shatterRafId = 0
    let kaleidoRafId = 0
    let kaleidoStarted = false
    let shatterEl: HTMLCanvasElement | null = null
    let kaleidoEl: HTMLCanvasElement | null = null
    let escEl: HTMLDivElement | null = null

    function cleanup() {
      active = false
      cancelAnimationFrame(shatterRafId)
      cancelAnimationFrame(kaleidoRafId)
      shatterEl?.remove()
      kaleidoEl?.remove()
      escEl?.remove()
      shatterEl = null
      kaleidoEl = null
      escEl = null
      kaleidoStarted = false
      const img = portraitRef.current?.querySelector('img') as HTMLImageElement | null
      if (img) img.style.visibility = ''
      window.removeEventListener('resize', onResize)
    }

    function onResize() {
      const dpr = window.devicePixelRatio || 1
      for (const c of [shatterEl, kaleidoEl]) {
        if (!c) continue
        c.width = window.innerWidth * dpr
        c.height = window.innerHeight * dpr
        c.style.width = window.innerWidth + 'px'
        c.style.height = window.innerHeight + 'px'
      }
    }

    function onKeyDown() {
      if (active) cleanup()
    }

    function trigger() {
      if (active) return
      const wrapper = portraitRef.current
      if (!wrapper) return
      const imgEl = wrapper.querySelector('img') as HTMLImageElement | null
      if (!imgEl) return

      active = true
      const dpr = window.devicePixelRatio || 1
      const rect = imgEl.getBoundingClientRect()

      // ── Capture portrait pixels ──────────────────────────────────────────
      const pcW = imgEl.naturalWidth || Math.round(rect.width)
      const pcH = imgEl.naturalHeight || Math.round(rect.height)
      const portraitCanvas = document.createElement('canvas')
      portraitCanvas.width = pcW
      portraitCanvas.height = pcH
      const pCtx = portraitCanvas.getContext('2d')!
      try {
        pCtx.drawImage(imgEl, 0, 0, pcW, pcH)
      } catch {
        active = false
        return
      }
      imgEl.style.visibility = 'hidden'

      // ── Shatter canvas ───────────────────────────────────────────────────
      shatterEl = document.createElement('canvas')
      shatterEl.width = window.innerWidth * dpr
      shatterEl.height = window.innerHeight * dpr
      Object.assign(shatterEl.style, {
        position: 'fixed', inset: '0', zIndex: '9998',
        pointerEvents: 'none',
        width: window.innerWidth + 'px', height: window.innerHeight + 'px',
      })
      document.body.appendChild(shatterEl)
      const sCtx = shatterEl.getContext('2d')!

      // ── Kaleidoscope canvas ──────────────────────────────────────────────
      kaleidoEl = document.createElement('canvas')
      kaleidoEl.width = window.innerWidth * dpr
      kaleidoEl.height = window.innerHeight * dpr
      Object.assign(kaleidoEl.style, {
        position: 'fixed', inset: '0', zIndex: '9999',
        background: '#0a0a0a', cursor: 'pointer', opacity: '0',
        width: window.innerWidth + 'px', height: window.innerHeight + 'px',
      })
      document.body.appendChild(kaleidoEl)
      const kCtx = kaleidoEl.getContext('2d')!
      // Exit on any keypress only — no click-to-exit

      // ── ESC hint ─────────────────────────────────────────────────────────
      escEl = document.createElement('div')
      Object.assign(escEl.style, {
        position: 'fixed', top: '24px', left: '24px', zIndex: '10000',
        fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '500',
        color: '#FFFFFF', background: 'rgba(0,0,0,0.7)', padding: '6px 14px',
        pointerEvents: 'none', opacity: '0', transition: 'opacity 600ms ease',
      })
      escEl.textContent = lang === 'es'
        ? 'Presiona cualquier tecla para volver al mundo real'
        : 'Press any key to return to the real world'
      document.body.appendChild(escEl)
      setTimeout(() => { if (escEl) escEl.style.opacity = '1' }, 1200)

      // ── Build shards ─────────────────────────────────────────────────────
      const COLS = 8, ROWS = 10
      const dW = rect.width / COLS
      const dH = rect.height / ROWS
      const sW = pcW / COLS
      const sH = pcH / ROWS
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      const shards = Array.from({ length: COLS * ROWS }, (_, idx) => {
        const col = idx % COLS
        const row = Math.floor(idx / COLS)
        const x = rect.left + col * dW
        const y = rect.top + row * dH
        const scx = x + dW / 2
        const scy = y + dH / 2
        const dx = scx - cx
        const dy = scy - cy
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const speed = 2 + Math.random() * 4
        return {
          sx: col * sW, sy: row * sH, sw: sW, sh: sH,
          x, y, w: dW, h: dH,
          vx: (dx / dist) * speed + (Math.random() - 0.5) * 2,
          vy: (dy / dist) * speed + (Math.random() - 0.5) * 2,
          rotation: (Math.random() - 0.5) * 0.4,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          opacity: 1,
          scale: 1,
        }
      })

      // ── Load random artwork ───────────────────────────────────────────────
      const artUrl = artworkImages[Math.floor(Math.random() * artworkImages.length)]
      const artImg = new Image()
      artImg.crossOrigin = 'anonymous'
      artImg.src = artUrl + '?w=512&auto=format'
      let artLoaded = false
      artImg.onload = () => {
        artLoaded = true
        // Start kaleidoscope immediately if shatter is already past 400ms
        if (!kaleidoStarted && active && kaleidoEl) {
          kaleidoStarted = true
          kaleidoRafId = requestAnimationFrame(drawKaleido)
        }
      }

      // ── Kaleidoscope draw loop ────────────────────────────────────────────
      function drawKaleido(ts: number) {
        if (!active || !artLoaded || !kaleidoEl) return
        const W = window.innerWidth
        const H = window.innerHeight
        const segments = 6
        const segAngle = (Math.PI * 2) / segments
        const kcx = W / 2
        const kcy = H / 2
        const radius = Math.max(W, H) * 0.7

        kCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
        kCtx.fillStyle = '#0a0a0a'
        kCtx.fillRect(0, 0, W, H)

        for (let i = 0; i < segments; i++) {
          kCtx.save()
          kCtx.translate(kcx, kcy)
          kCtx.rotate(segAngle * i + ts * 0.0003)

          kCtx.beginPath()
          kCtx.moveTo(0, 0)
          kCtx.lineTo(radius, 0)
          kCtx.arc(0, 0, radius, 0, segAngle)
          kCtx.closePath()
          kCtx.clip()

          if (i % 2 === 0) {
            kCtx.scale(1, -1)
            kCtx.rotate(-segAngle)
          }

          const imgScale = (radius / artImg.width) * 1.5
          const offX = Math.sin(ts * 0.0005 + i) * 30
          const offY = Math.cos(ts * 0.0004 + i) * 30
          kCtx.drawImage(
            artImg, offX, offY, artImg.width, artImg.height,
            -artImg.width * imgScale * 0.3, -artImg.height * imgScale * 0.3,
            artImg.width * imgScale, artImg.height * imgScale
          )
          kCtx.restore()
        }

        kaleidoRafId = requestAnimationFrame(drawKaleido)
      }

      // ── Shatter animation loop ────────────────────────────────────────────
      const startTime = performance.now()

      function animateShards(ts: number) {
        if (!active || !shatterEl) return
        const elapsed = ts - startTime
        const W = window.innerWidth
        const H = window.innerHeight

        sCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
        sCtx.clearRect(0, 0, W, H)

        let anyVisible = false
        for (const s of shards) {
          s.x += s.vx
          s.y += s.vy
          s.vy += 0.04
          s.rotation += s.rotSpeed
          s.opacity = Math.max(0, 1 - elapsed / 1200)
          s.scale = 1 + elapsed * 0.0008
          if (s.opacity <= 0) continue
          anyVisible = true

          sCtx.save()
          sCtx.globalAlpha = s.opacity
          sCtx.translate(s.x + s.w / 2, s.y + s.h / 2)
          sCtx.rotate(s.rotation)
          sCtx.scale(s.scale, s.scale)
          sCtx.drawImage(portraitCanvas, s.sx, s.sy, s.sw, s.sh, -s.w / 2, -s.h / 2, s.w, s.h)
          sCtx.restore()
        }

        // Fade kaleidoscope in starting at 400ms
        if (elapsed >= 400 && kaleidoEl) {
          kaleidoEl.style.opacity = String(Math.min(1, (elapsed - 400) / 800))
          if (!kaleidoStarted && artLoaded) {
            kaleidoStarted = true
            kaleidoRafId = requestAnimationFrame(drawKaleido)
          }
        }

        if (anyVisible || elapsed < 1400) {
          shatterRafId = requestAnimationFrame(animateShards)
        } else {
          shatterEl.remove()
          shatterEl = null
        }
      }

      shatterRafId = requestAnimationFrame(animateShards)
      window.addEventListener('resize', onResize)
    }

    // ── Click tracker ─────────────────────────────────────────────────────
    function onPortraitClick() {
      if (active) return
      const now = Date.now()
      clicks.push(now)
      const cutoff = now - 2000
      let i = 0
      while (i < clicks.length && clicks[i] < cutoff) i++
      if (i > 0) clicks.splice(0, i)
      if (clicks.length >= 5) {
        clicks.length = 0
        trigger()
      }
    }

    const wrapper = portraitRef.current
    if (!wrapper) return
    wrapper.addEventListener('click', onPortraitClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      wrapper.removeEventListener('click', onPortraitClick)
      document.removeEventListener('keydown', onKeyDown)
      cleanup()
    }
  }, [artworkImages, lang, portraitRef])

  return null
}
