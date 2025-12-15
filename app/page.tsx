"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import JungleLetter from "@/components/jungle-letter"
import SignatureCanvas, { type SignatureCanvasHandle } from "@/components/signature-canvas"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)
  const sigRef = useRef<SignatureCanvasHandle>(null)

  const handleReveal = () => {
    setLoading(true)
    setProgress(0)
    // Animate progress 0-100% over 1 second
    const start = Date.now()
    const duration = 1000
    const animate = () => {
      const elapsed = Date.now() - start
      const p = Math.min((elapsed / duration) * 100, 100)
      setProgress(p)
      if (p < 100) {
        requestAnimationFrame(animate)
      } else {
        setLoading(false)
        setRevealed(true)
      }
    }
    requestAnimationFrame(animate)
  }

  const handleDownload = useCallback(async () => {
    const node = captureRef.current
    if (!node) return
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
      })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = "infinity-invitation.png"
      a.click()
    } catch (err) {
      console.error("[v0] export failed", err)
      alert("Could not save image. Please try again.")
    }
  }, [])

  const handleClear = () => sigRef.current?.clear()

  return (
    <main
      ref={captureRef}
      style={
        {
          "--background": "#0b0b0b",
          "--foreground": "#f5e6c8",
          "--primary": "#b68b2a",
          "--secondary": "#0f3d2e",
          "--accent": "#2f7a53",
          "--parchment": "#efe3c4",
          backgroundImage: "url('/images/inv-bg.webp')",
        } as React.CSSProperties
      }
      className="min-h-dvh overflow-x-hidden text-[color:var(--foreground)] bg-fixed bg-cover bg-center bg-no-repeat"
    >
      <header className="sticky top-0 z-10 flex flex-col items-center gap-2 py-4 px-4">
        <Image
          src="/images/SVPCET.webp"
          alt="SVPCET"
          width={1400}
          height={200}
          className="h-auto w-full max-w-5xl object-contain drop-shadow"
          priority
        />
        <Image
          src="/images/dept-cse.webp"
          alt="Department of Computer Science and Engineering"
          width={1800}
          height={120}
          className="h-auto w-full max-w-6xl object-contain drop-shadow"
          priority
        />
      </header>

      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="flex flex-col items-center gap-6">
            <Image
              src="/images/if-logo.webp"
              alt="INFINITY 2K25"
              width={400}
              height={300}
              className="h-auto w-64 md:w-80 object-contain animate-pulse"
              priority
            />
            <div className="w-64 md:w-80 h-3 bg-[color:var(--secondary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[color:var(--primary)] rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-[color:var(--foreground)]/80">Loading invitation... {Math.floor(progress)}%</p>
          </div>
        </div>
      )}

      <div id="capture-content" className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-16">
        {!revealed && (
          <div className="flex items-center justify-center">
            <JungleLetter onReveal={handleReveal} />
          </div>
        )}

        {revealed && (
          <>
            <section
              className={cn(
                "relative rounded-2xl border border-[color:var(--primary)]/40 bg-[color:var(--secondary)]/75 p-6 md:p-10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 overflow-hidden",
              )}
              aria-label="Invitation details"
            >
              <div className="relative z-10">
                <h2 className="text-balance text-center text-xl md:text-2xl font-semibold text-[color:var(--primary)]">
                  Department of Computer Science and Engineering
                </h2>

                <p className="mt-6 text-center text-base md:text-lg">cordially invites you to</p>

                <div className="mt-4 flex justify-center">
                  <Image
                    src="/images/if-logo.webp"
                    alt="INFINITY 2K25"
                    width={1000}
                    height={300}
                    className="h-auto w-full max-w-2xl object-contain"
                    priority
                  />
                </div>

                <h3 className="mt-4 text-pretty text-center text-xl md:text-2xl font-bold text-[color:var(--foreground)]">
                  A Technical Extravaganza
                </h3>

                <p className="mt-4 text-pretty text-center leading-relaxed">
                  A celebration of innovation, intellect, and ingenuity — where technology meets creativity.
                </p>
                <p className="mt-2 text-pretty text-center leading-relaxed">
                  Join us for a day filled with competitions, exhibitions, and ideas that push the boundaries of
                  possibility.
                </p>

                <div className="mt-6 grid gap-2 text-center">
                  <p>
                    <span className="font-semibold text-[color:var(--primary)]">Date:</span> 10th Oct 2025
                  </p>
                  <p>
                    <span className="font-semibold text-[color:var(--primary)]">Venue:</span> CSE department block B,
                    first floor
                  </p>
                </div>

                <p className="mt-6 text-pretty text-center leading-relaxed">
                  We look forward to your gracious presence and active participation in making INFINITY a grand success.
                </p>
              </div>
            </section>

            <section className="mt-10">
              <h4 className="mb-3 text-center text-lg font-semibold text-[color:var(--primary)]">Faculty Signatures</h4>
              <SignatureCanvas
                ref={sigRef}
                className="h-64 w-full rounded-md bg-[color:var(--secondary)]/30"
                strokeColor="#ffffff"
                strokeWidth={2}
              />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-[color:var(--primary)] text-[color:var(--background)] hover:opacity-90 transition"
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClear}
                  className="bg-[color:var(--accent)] text-[oklch(0.98_0_0)] transition"
                >
                  Clear signatures
                </Button>
              </div>
            </section>

            <footer className="mt-10 text-center text-xs">
              Crafted for INFINITY — where technology meets creativity.
              <p className="mt-2 text-center text-sm">Made with love by Swadhin Upadhyay 🤍</p>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}
