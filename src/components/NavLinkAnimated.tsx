/* eslint-disable react-hooks/immutability */
'use no memo'
'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTES = [
  ['#E63946', '#2563EB', '#F59E0B', '#10B981'],
  ['#8B5CF6', '#EC4899', '#06B6D4', '#F97316'],
  ['#E63946', '#8B5CF6', '#10B981', '#F59E0B'],
  ['#2563EB', '#EC4899', '#F97316', '#06B6D4'],
] as const

const TEXT_SHADOW = [
  '-1px -1px 0 rgba(255,255,255,0.9)',
  ' 1px -1px 0 rgba(255,255,255,0.9)',
  '-1px  1px 0 rgba(255,255,255,0.9)',
  ' 1px  1px 0 rgba(255,255,255,0.9)',
  ' 0px -2px 4px rgba(255,255,255,0.8)',
  ' 0px  2px 4px rgba(255,255,255,0.8)',
  '-2px  0px 4px rgba(255,255,255,0.8)',
  ' 2px  0px 4px rgba(255,255,255,0.8)',
].join(',')

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tile {
  x: number; y: number
  px: number; py: number   // position offset for scatter
  w: number; h: number
  color: string
  delay: number            // seconds before fade-in starts
  opacity: number
  vx: number; vy: number   // scatter velocity
}

export interface NavLinkAnimatedProps {
  href: string
  label: string
  isActive?: boolean
  onClick?: () => void
  className?: string
  tileSize?: number        // canvas px (default 22 → ~11px visual; 28 for mobile)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NavLinkAnimated({
  href,
  label,
  isActive,
  onClick,
  className = '',
  tileSize = 22,
}: NavLinkAnimatedProps) {
  const linkRef    = useRef<HTMLAnchorElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  // All mutable animation state in a single ref object — not tracked by compiler
  const animRef = useRef({
    tiles:     [] as Tile[],
    phase:     'idle' as 'idle' | 'fill' | 'scatter',
    startTime: null as number | null,
    rafId:     null as number | null,
  })

  // Holds the stable loop callback so we avoid useCallback self-reference
  const loopCbRef = useRef<FrameRequestCallback | null>(null)

  const [showHalo, setShowHalo] = useState(false)
  const router = useRouter()

  const GAP  = 4
  const STEP = tileSize + GAP

  // ── Draw all tiles ─────────────────────────────────────────────────────────
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const t of animRef.current.tiles) {
      if (t.opacity < 0.01) continue
      ctx.globalAlpha = t.opacity
      ctx.fillStyle   = t.color
      ctx.fillRect(t.x + t.px, t.y + t.py, t.w, t.h)
    }
    ctx.globalAlpha = 1
  }, [])

  // ── Animation loop ─────────────────────────────────────────────────────────
  const runLoop = useCallback<FrameRequestCallback>((now: number) => {
    const anim = animRef.current

    if (anim.phase === 'fill') {
      if (anim.startTime === null) anim.startTime = now
      const elapsed = (now - anim.startTime) / 1000
      for (const t of anim.tiles) {
        if (elapsed >= t.delay) {
          t.opacity = Math.min(1, (elapsed - t.delay) / 0.2)
        }
      }
      drawFrame()
      anim.rafId = requestAnimationFrame(loopCbRef.current!)

    } else if (anim.phase === 'scatter') {
      for (const t of anim.tiles) {
        t.px      += t.vx
        t.py      += t.vy
        t.opacity *= 0.92
      }
      drawFrame()
      if (!anim.tiles.every((t) => t.opacity < 0.03)) {
        anim.rafId = requestAnimationFrame(loopCbRef.current!)
      } else {
        anim.phase = 'idle'
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }
  }, [drawFrame])

  // Keep loopCbRef current so self-reference works without TDZ issue
  useEffect(() => { loopCbRef.current = runLoop }, [runLoop])

  // ── Build tile grid ────────────────────────────────────────────────────────
  const buildTiles = useCallback((): Tile[] => {
    const link   = linkRef.current
    const canvas = canvasRef.current
    if (!link || !canvas) return []

    const lw = link.offsetWidth  + 16   // canvas extends 8px left/right
    const lh = link.offsetHeight + 8    // canvas extends 4px top/bottom
    canvas.style.width  = lw + 'px'
    canvas.style.height = lh + 'px'
    canvas.width  = lw * 2              // 2× for retina
    canvas.height = lh * 2

    const cw = canvas.width, ch = canvas.height
    const cx = cw / 2,       cy = ch / 2

    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]
    const maxGc   = Math.ceil(cw / STEP) + 1
    const maxGr   = Math.ceil(ch / STEP) + 1
    const tiles: Tile[] = []

    for (let gr = -maxGr; gr <= maxGr; gr++) {
      for (let gc = -maxGc; gc <= maxGc; gc++) {
        const tx = cx + gc * STEP - tileSize / 2
        const ty = cy + gr * STEP - tileSize / 2
        if (tx + tileSize < 0 || tx > cw || ty + tileSize < 0 || ty > ch) continue

        const dist  = Math.sqrt(gc * gc + gr * gr)
        // (|gc|+|gr|) creates 4-way mirror chevron/diamond pattern from center
        const color = palette[(Math.abs(gc) + Math.abs(gr)) % palette.length]
        const speed = 5 + Math.random() * 5
        const nx    = dist > 0 ? gc / dist : 0
        const ny    = dist > 0 ? gr / dist : 0

        tiles.push({
          x: tx, y: ty, px: 0, py: 0,
          w: tileSize, h: tileSize,
          color,
          delay:   dist * 0.06,
          opacity: 0,
          vx: nx * speed,
          vy: ny * speed,
        })
      }
    }
    return tiles
  }, [tileSize, STEP])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const cancelAnim = useCallback(() => {
    const anim = animRef.current
    if (anim.rafId !== null) {
      cancelAnimationFrame(anim.rafId)
      anim.rafId = null
    }
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    cancelAnim()
    const anim    = animRef.current
    anim.tiles    = buildTiles()
    anim.phase    = 'fill'
    anim.startTime = null
    setShowHalo(true)
    anim.rafId = requestAnimationFrame(loopCbRef.current!)
  }, [cancelAnim, buildTiles])

  const handleMouseLeave = useCallback(() => {
    cancelAnim()
    const anim     = animRef.current
    anim.phase     = 'idle'
    anim.tiles     = []
    anim.startTime = null
    setShowHalo(false)
    clearCanvas()
  }, [cancelAnim, clearCanvas])

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const anim = animRef.current
    if (anim.tiles.length === 0) anim.tiles = buildTiles()
    cancelAnim()
    anim.phase = 'scatter'
    anim.rafId = requestAnimationFrame(loopCbRef.current!)

    const dest = href
    setTimeout(() => {
      onClick?.()
      router.push(dest)
    }, 900)
  }, [href, onClick, buildTiles, cancelAnim, router])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => cancelAnim(), [cancelAnim])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <a
      ref={linkRef}
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group inline-flex items-center ${className}`}
      style={{
        color: showHalo
          ? '#1A1A1A'
          : isActive
          ? 'var(--color-foreground)'
          : 'var(--color-muted)',
        isolation: 'isolate',
      }}
    >
      {/* Tile canvas — absolutely positioned behind text */}
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none"
        style={{ inset: '-4px -8px', zIndex: 0, borderRadius: '4px' }}
      />

      {/* Label — above canvas */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          transition: 'text-shadow 0.3s ease',
          textShadow: showHalo ? TEXT_SHADOW : 'none',
        }}
      >
        {label}
      </span>

      {/* Active / hover underline */}
      <span
        className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-200 ${
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
        style={{ zIndex: 2 }}
      />
    </a>
  )
}
