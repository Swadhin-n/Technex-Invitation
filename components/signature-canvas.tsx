"use client"

import type React from "react"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

export type SignatureCanvasHandle = {
  clear: () => void
}

type Props = {
  className?: string
  strokeColor?: string
  strokeWidth?: number
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle, Props>(function SignatureCanvas(
  { className, strokeColor = "#ffffff", strokeWidth = 0.7 },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const strokeColorRef = useRef(strokeColor)
  const strokeWidthRef = useRef(strokeWidth)
  const dprRef = useRef(dpr)
  const resizeRafRef = useRef<number | null>(null)

  useEffect(() => {
    strokeColorRef.current = strokeColor
    strokeWidthRef.current = strokeWidth
  }, [strokeColor, strokeWidth])

  useEffect(() => {
    dprRef.current = dpr
  }, [dpr])

  const applyCtxStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.strokeStyle = strokeColorRef.current
    ctx.lineWidth = strokeWidthRef.current * dprRef.current
    ctx.imageSmoothingEnabled = true
    ;(ctx as any).imageSmoothingQuality = "high"
    ctx.miterLimit = 2
  }

  const resize = () => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    // Use layout sizes (stable on scroll) instead of fractional DOMRect values.
    const cssWidth = wrapper.clientWidth
    const cssHeight = wrapper.clientHeight
    if (cssWidth <= 0 || cssHeight <= 0) return

    const targetWidth = Math.max(1, Math.floor(cssWidth * dprRef.current))
    const targetHeight = Math.max(1, Math.floor(cssHeight * dprRef.current))

    // Mobile browsers (iOS Safari/Chrome) may fire `resize` while scrolling (URL bar).
    // Avoid resetting canvas if the backing buffer size is unchanged.
    if (canvas.width === targetWidth && canvas.height === targetHeight) {
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      applyCtxStyle(ctx)
      return
    }

    // Snapshot current drawing before changing dimensions (changing width/height clears the canvas).
    const snapshot = document.createElement("canvas")
    snapshot.width = canvas.width
    snapshot.height = canvas.height
    const snapCtx = snapshot.getContext("2d")
    snapCtx?.drawImage(canvas, 0, 0)

    canvas.style.width = `${cssWidth}px`
    canvas.style.height = `${cssHeight}px`
    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    applyCtxStyle(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, canvas.width, canvas.height)
  }

  const scheduleResize = () => {
    if (resizeRafRef.current != null) return
    resizeRafRef.current = window.requestAnimationFrame(() => {
      resizeRafRef.current = null
      resize()
    })
  }

  useEffect(() => {
    // Ensure sizing is applied immediately on mount so first stroke isn't pixelated.
    resize()
    scheduleResize()

    const onResize = () => scheduleResize()
    window.addEventListener("resize", onResize)

    const wrapper = wrapperRef.current
    const ro = wrapper ? new ResizeObserver(() => scheduleResize()) : null
    if (wrapper && ro) ro.observe(wrapper)

    return () => {
      window.removeEventListener("resize", onResize)
      if (wrapper && ro) ro.disconnect()
      if (resizeRafRef.current != null) window.cancelAnimationFrame(resizeRafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    clear() {
      const c = canvasRef.current
      if (!c) return
      const ctx = c.getContext("2d")
      if (!ctx) return
      ctx.clearRect(0, 0, c.width, c.height)
      resize()
    },
  }))

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  type Point = { x: number; y: number }
  const pointsRef = useRef<Point[]>([])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    // Make sure backing store matches current wrapper size before first stroke.
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (canvas && wrapper) {
      const cssW = wrapper.clientWidth
      const cssH = wrapper.clientHeight
      const targetW = Math.max(1, Math.floor(cssW * dprRef.current))
      const targetH = Math.max(1, Math.floor(cssH * dprRef.current))
      if (canvas.width !== targetW || canvas.height !== targetH) {
        resize()
      }
    }
    applyCtxStyle(ctx)
    ;(e.target as Element).setPointerCapture(e.pointerId)
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    pointsRef.current = [{ x, y }]
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    applyCtxStyle(ctx)
    const { x, y } = getPos(e)
    const pts = pointsRef.current
    pts.push({ x, y })
    if (pts.length < 3) {
      ctx.lineTo(x, y)
      ctx.stroke()
      return
    }
    const prev = pts[pts.length - 2]
    const midX = (prev.x + x) / 2
    const midY = (prev.y + y) / 2
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
    ctx.stroke()
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(false)
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const pts = pointsRef.current
    if (pts.length === 1) {
      const p = pts[0]
      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(1, (strokeWidthRef.current * dprRef.current) / 2), 0, Math.PI * 2)
      ctx.fillStyle = strokeColorRef.current
      ctx.fill()
    } else if (pts.length >= 2) {
      const last = pts[pts.length - 1]
      ctx.lineTo(last.x, last.y)
      ctx.stroke()
    }
    ctx.closePath()
  }

  return (
    <div ref={wrapperRef} className={className}>
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none rounded-md border border-[color:var(--primary)]/40 bg-[color:var(--secondary)]/40"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  )
})

export default SignatureCanvas
