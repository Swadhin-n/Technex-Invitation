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
  { className, strokeColor = "#ffffff", strokeWidth = 2 },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  const resize = () => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const rect = wrapper.getBoundingClientRect()
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth * dpr
    ctx.fillStyle = "rgba(0,0,0,0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    resize()
    const onResize = () => resize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
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

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(false)
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
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
