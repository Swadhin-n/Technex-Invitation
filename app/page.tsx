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
  const [showLanding, setShowLanding] = useState(true)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)
  const sigRef = useRef<SignatureCanvasHandle>(null)

  const handleLaunch = () => {
    setShowLanding(false)
  }

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

  if (showLanding) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        {/* Video Background for Desktop */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 hidden md:block"
        >
          <source src="/TNX_bg.webm" type="video/webm" />
        </video>

        {/* Video Background for Mobile */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 md:hidden"
        >
          <source src="/TXN_bg_mobile.webm" type="video/webm" />
        </video>

        {/* Floating Images with Parallax Effect - Desktop Only */}
        <div className="hidden md:block absolute inset-0 z-[5] pointer-events-none">
          {/* 1.webp - Bottom Left (Close) */}
          <div className="absolute bottom-8 left-8 animate-float-slow">
            <Image
              src="/1.webp"
              alt=""
              width={350}
              height={350}
              className="drop-shadow-2xl opacity-90 w-[350px] h-auto"
              priority
            />
          </div>

          {/* 2.webp - Top Right (Far) */}
          <div className="absolute top-20 right-16 animate-float-medium opacity-70">
            <Image
              src="/2.webp"
              alt=""
              width={220}
              height={220}
              className="drop-shadow-xl w-[220px] h-auto"
              priority
            />
          </div>

          {/* 3.webp - Middle Left (Medium) */}
          <div className="absolute top-1/3 left-20 animate-float-fast opacity-80">
            <Image
              src="/3.webp"
              alt=""
              width={280}
              height={280}
              className="drop-shadow-xl w-[280px] h-auto"
              priority
            />
          </div>

          {/* 4.webp - Bottom Right (Close) */}
          <div className="absolute bottom-16 right-12 animate-float-slow">
            <Image
              src="/4.webp"
              alt=""
              width={320}
              height={320}
              className="drop-shadow-2xl opacity-90 w-[320px] h-auto"
              priority
            />
          </div>

          {/* 5.webp - Top Left (Far) */}
          <div className="absolute top-12 left-1/4 animate-float-medium opacity-60">
            <Image
              src="/5.webp"
              alt=""
              width={200}
              height={200}
              className="drop-shadow-lg w-[200px] h-auto"
              priority
            />
          </div>

          {/* 6.webp - Middle Right (Medium) */}
          <div className="absolute top-1/2 right-24 animate-float-fast opacity-85">
            <Image
              src="/6.webp"
              alt=""
              width={260}
              height={260}
              className="drop-shadow-xl w-[260px] h-auto"
              priority
            />
          </div>

          {/* 7.webp - Top Center (Far) */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 animate-float-slow opacity-65">
            <Image
              src="/7.webp"
              alt=""
              width={210}
              height={210}
              className="drop-shadow-lg w-[210px] h-auto"
              priority
            />
          </div>
        </div>

        {/* Launch Button - Centered */}
        <div className="relative z-20 flex min-h-screen items-center justify-center pointer-events-auto">
          <button 
            onClick={handleLaunch}
            className="group relative px-20 py-6 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white font-black text-2xl rounded-2xl hover:from-emerald-400 hover:via-teal-500 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:shadow-[0_0_60px_rgba(16,185,129,0.8)] border-2 border-emerald-400/50 uppercase tracking-wider"
          >
            <span className="relative z-10">Launch</span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
          </button>
        </div>

        <style jsx>{`
          @keyframes float-slow {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes float-medium {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }

          @keyframes float-fast {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-25px);
            }
          }

          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }

          .animate-float-medium {
            animation: float-medium 5s ease-in-out infinite;
          }

          .animate-float-fast {
            animation: float-fast 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    )
  }

  return (
    <main
      ref={captureRef}
      style={
        {
          "--background": "#0b0b0b",
          "--foreground": "#e8e8e8",
          "--primary": "#e0aa3e",
          "--secondary": "#23144792",
          "--accent": "#281e58ff",
          "--parchment": "#efe3c4",
          backgroundImage: "url('/images/invitebg_landscape.webp')",
        } as React.CSSProperties
      }
      className="min-h-dvh overflow-x-hidden text-[color:var(--foreground)] bg-fixed bg-cover bg-center bg-no-repeat"
    >
      <header className="sticky top-0 z-10 flex flex-col items-center gap-2 py-4 px-4">
       
      </header>

      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="flex flex-col items-center gap-6">
            <Image
              src="/images/Technex_26_name.webp"
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
                 <Image
          src="/images/SVPCET.webp"
          alt="SVPCET"
          width={1400}
          height={300}
          className="h-auto w-full max-w-6xl object-contain drop-shadow"
          priority
        />

                <p className="text-center text-base md:text-lg">cordially invites you to</p>

                <div className="mt-9 flex justify-center">
                  <Image
                    src="/images/Technex_26_name.webp"
                    alt="INFINITY 2K25"
                    width={1000}
                    height={300}
                    className="h-auto w-full max-w-2xl object-contain"
                    priority
                  />
                </div>

                <h3 className="mt-12 text-pretty text-center text-xl md:text-2xl font-bold text-[color:var(--foreground)]">
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
                    <span className="font-semibold text-[color:var(--primary)]">Date:</span> 18th December 2025
                  </p>
                  <p>
                    <span className="font-semibold text-[color:var(--primary)]">Venue:</span> Block B, Second Floor
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
