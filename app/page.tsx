"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import JungleLetter from "@/components/jungle-letter";
import SignatureCanvas, {
  type SignatureCanvasHandle,
} from "@/components/signature-canvas";
import FingerprintScanner from "@/components/fingerprint-scanner";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

export default function Page() {
  const [showLanding, setShowLanding] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [shipArriving, setShipArriving] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<SignatureCanvasHandle>(null);
  const shipRef = useRef<HTMLDivElement>(null);

  const handleLaunch = () => {
    if (launching) return;
    setLaunching(true);
    const node = shipRef.current;
    const onEnd = () => {
      setShowLanding(false);
      // Start ship arrival as soon as letter page loads
      window.setTimeout(() => setShipArriving(true), 500);
      node?.removeEventListener("animationend", onEnd);
    };
    node?.addEventListener("animationend", onEnd);
    // Fallback in case the animationend does not fire
    window.setTimeout(() => {
      node?.removeEventListener("animationend", onEnd);
      setShowLanding(false);
      window.setTimeout(() => setShipArriving(true), 500);
    }, 5500);
  };

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"]'
    );
    if (existingScript) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  const handleReveal = () => {
    setLoading(true);
    setProgress(0);
    // Animate progress 0-100% over 1 second
    const start = Date.now();
    const duration = 1000;
    const animate = () => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);
      if (p < 100) {
        requestAnimationFrame(animate);
      } else {
        setLoading(false);
        setRevealed(true);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleDownload = useCallback(async () => {
    const node = captureRef.current;
    if (!node) return;
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "technexinvitation.png";
      a.click();
    } catch (err) {
      console.error("[v0] export failed", err);
      alert("Could not save image. Please try again.");
    }
  }, []);

  const handleClear = () => sigRef.current?.clear();

  if (showLanding) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 hidden md:block"
        >
          <source src="/TNX_bg.webm" type="video/webm" />
        </video>

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 md:hidden"
        >
          <source src="/TXN_bg_mobile.webm" type="video/webm" />
        </video>

        {/* Floating Elements - Desktop & Tablet */}
        <div className="hidden md:block absolute inset-0 z-[5] pointer-events-none">
          {/* 1.webp - Moved up for iPad visibility */}
          <div className="absolute bottom-10 md:bottom-16 lg:bottom-10 left-6 animate-float-slow">
            <Image
              src="/1.webp"
              alt=""
              width={420}
              height={420}
              className="drop-shadow-2xl w-[160px] md:w-[200px] lg:w-[420px] h-auto"
              priority
            />
          </div>

          {/* 2.webp - Moved down and right for iPad */}
          <div className="absolute top-12 md:top-32 lg:top-12 right-20 md:right-1 lg:right-20 animate-float-medium">
            <Image
              src="/2.webp"
              alt=""
              width={220}
              height={220}
              className="drop-shadow-xl w-[140px] md:w-[160px] lg:w-[220px] h-auto"
              priority
            />
          </div>

          <div className="absolute top-1/3 left-6 animate-float-fast">
            <Image
              src="/3.webp"
              alt=""
              width={280}
              height={280}
              className="drop-shadow-xl w-[180px] md:w-[220px] lg:w-[280px] h-auto"
              priority
            />
          </div>

          {/* 5.webp - Increased size for iPad */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-float-medium">
            <Image
              src="/5.webp"
              alt=""
              width={450}
              height={450}
              className="drop-shadow-lg w-[240px] md:w-[300px] lg:w-[450px] h-auto"
              priority
            />
          </div>

          {/* 6.webp - Moved up for iPad */}
          <div className="absolute bottom-8 md:bottom-40 lg:bottom-8 right-8 md:right-3 lg:right-8 animate-float-fast">
            <Image
              src="/6.webp"
              alt=""
              width={340}
              height={340}
              className="drop-shadow-xl w-[180px] md:w-[220px] lg:w-[340px] h-auto"
              priority
            />
          </div>

          {/* 7.webp - Moved down for iPad */}
          <div className="absolute top-8 md:top-[20%] lg:top-8 left-6 md:left-3 lg:left-6 animate-float-slow">
            <Image
              src="/7.webp"
              alt=""
              width={180}
              height={180}
              className="drop-shadow-lg w-[120px] md:w-[140px] lg:w-[180px] h-auto"
              priority
            />
          </div>
        </div>

        {/* Floating Elements - Mobile Only */}
        <div className="md:hidden absolute inset-0 z-[5] pointer-events-none">
          <div className="absolute top-16 left-4 animate-float-slow">
            <Image
              src="/5.webp"
              alt=""
              width={200}
              height={200}
              className="drop-shadow-lg w-[200px] h-auto"
              priority
            />
          </div>

          <div className="absolute top-20 right-4 animate-float-medium">
            <Image
              src="/2.webp"
              alt=""
              width={140}
              height={140}
              className="drop-shadow-xl w-[140px] h-auto"
              priority
            />
          </div>

          <div className="absolute top-1/3 left-3 animate-float-fast">
            <Image
              src="/7.webp"
              alt=""
              width={120}
              height={120}
              className="drop-shadow-lg w-[120px] h-auto"
              priority
            />
          </div>

          <div className="absolute bottom-32 right-3 animate-float-slow">
            <Image
              src="/6.webp"
              alt=""
              width={180}
              height={180}
              className="drop-shadow-xl w-[180px] h-auto"
              priority
            />
          </div>

          <div className="absolute bottom-24 left-4 animate-float-medium">
            <Image
              src="/1.webp"
              alt=""
              width={160}
              height={160}
              className="drop-shadow-2xl w-[160px] h-auto"
              priority
            />
          </div>
        </div>

        {/* Platform with Spaceship - Bottom */}
        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 w-full flex justify-center pointer-events-none px-2 sm:px-4">
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg flex items-end justify-center">
            <Image
              src="/4.webp"
              alt="Launch platform"
              width={480}
              height={480}
              className="h-auto w-full drop-shadow-[0_30px_45px_rgba(0,0,0,0.55)] animate-float-slow"
              priority
            />
            <div className="absolute left-[40%] bottom-[25%] -translate-x-1/2 w-40 sm:w-56 md:w-60 h-auto">
              <div
                ref={shipRef}
                className={cn(
                  "ship-anim-wrapper",
                  launching && "ship-launch-animation"
                )}
                style={{ width: "100%" }}
              >
                <model-viewer
                  src="/spaceship.glb"
                  autoplay
                  exposure="1.1"
                  shadow-intensity="0.7"
                  loading="lazy"
                  camera-orbit="270deg 60deg 110%"
                  interaction-prompt="none"
                  interaction-prompt-threshold="0"
                  className="w-full h-auto"
                  style={{
                    filter: "saturate(1.1)",
                    minHeight: "320px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="relative z-20 flex min-h-screen items-center justify-center pointer-events-auto px-4 sm:px-6 text-center">
          <button
            onClick={handleLaunch}
            className={cn(
              "group relative px-10 sm:px-14 md:px-16 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white font-bold text-lg sm:text-xl md:text-2xl rounded-xl transition-all duration-300 transform shadow-[0_8px_32px_rgba(99,102,241,0.4)] border-2 border-indigo-400/40 uppercase tracking-wide",
              "hover:from-indigo-500 hover:via-purple-500 hover:to-violet-600 hover:shadow-[0_12px_48px_rgba(99,102,241,0.6)] hover:scale-105 hover:-translate-y-1",
              launching && "scale-95 opacity-0 pointer-events-none"
            )}
          >
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🚀</span>
              <span>Launch</span>
            </span>
          </button>
        </div>

        <style jsx>{`
          @keyframes float-slow {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes float-medium {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }

          @keyframes float-fast {
            0%,
            100% {
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

          .ship-anim-wrapper {
            width: 100%;
            will-change: transform;
          }

          @keyframes ship-launch-animation {
            0% {
              transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
              opacity: 1;
            }
            20% {
              transform: translate3d(0, -80px, 0) scale(1.05) rotate(-5deg);
              opacity: 1;
            }
            35% {
              transform: translate3d(0, -80px, 0) scale(1.05) rotate(-5deg);
              opacity: 1;
            }
            100% {
              transform: translate3d(80vw, -130vh, 0) scale(0.8) rotate(18deg);
              opacity: 1;
            }
          }

          .ship-launch-animation {
            animation: ship-launch-animation 7s
              cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
        `}</style>
      </div>
    );
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
      className="min-h-dvh w-full overflow-x-hidden text-[color:var(--foreground)] bg-fixed bg-cover bg-center bg-no-repeat animate-in fade-in"
    >
      {/* Background Platform - Bottom Right */}
      <div className="fixed bottom-0 right-0 z-0 pointer-events-none">
        <div className="relative w-72 sm:w-96 md:w-[500px] h-auto">
          <Image
            src="/4.webp"
            alt="Platform background"
            width={500}
            height={500}
            className="h-auto w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.4)] opacity-85"
            priority
          />
          {/* Spaceship arriving on envelope page only */}
          {!revealed && shipArriving && (
            <div className="absolute right-[36%] sm:right-[38%] md:right-[40%] lg:right-[41%] bottom-[30%] sm:bottom-[34%] md:bottom-[38%] lg:bottom-[40%] w-36 sm:w-44 md:w-52 lg:w-60 xl:w-64 h-auto ship-arrival-animation">
              <model-viewer
                src="/spaceship.glb"
                autoplay
                exposure="1.1"
                shadow-intensity="0.7"
                loading="lazy"
                camera-orbit="270deg 60deg 110%"
                interaction-prompt="none"
                interaction-prompt-threshold="0"
                className="w-full h-auto"
                style={{
                  filter: "saturate(1.1)",
                  minHeight: "220px",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Elements on Envelope Page */}
      {!revealed && (
        <>
          {/* Desktop floating elements */}
          <div className="hidden md:block fixed inset-0 z-[5] pointer-events-none">
            <div className="absolute top-16 md:top-[45%] lg:top-16 right-16 md:right-8 lg:right-16 animate-float-medium">
              <Image
                src="/2.webp"
                alt=""
                width={200}
                height={200}
                className="drop-shadow-xl w-[160px] md:w-[180px] lg:w-[200px] h-auto"
                priority
              />
            </div>

            <div className="absolute top-1/3 left-1/4 md:left-[8%] lg:left-1/4 animate-float-fast">
              <Image
                src="/3.webp"
                alt=""
                width={220}
                height={220}
                className="drop-shadow-xl w-[180px] md:w-[200px] lg:w-[220px] h-auto"
                priority
              />
            </div>

            <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-float-medium">
              <Image
                src="/5.webp"
                alt=""
                width={320}
                height={320}
                className="drop-shadow-lg w-[320px] h-auto"
                priority
              />
            </div>

            <div className="absolute bottom-32 left-16 animate-float-fast">
              <Image
                src="/7.webp"
                alt=""
                width={160}
                height={160}
                className="drop-shadow-lg w-[160px] h-auto"
                priority
              />
            </div>
          </div>

          {/* Mobile & Tablet floating elements - optimized for iPad */}
          <div className="md:hidden fixed inset-0 z-[5] pointer-events-none">
            <div className="absolute top-16 sm:top-20 left-3 sm:left-6 animate-float-slow">
              <Image
                src="/5.webp"
                alt=""
                width={180}
                height={180}
                className="drop-shadow-lg w-[140px] sm:w-[160px] h-auto"
                priority
              />
            </div>

            <div className="absolute top-20 sm:top-24 right-3 sm:right-6 animate-float-medium">
              <Image
                src="/2.webp"
                alt=""
                width={150}
                height={150}
                className="drop-shadow-xl w-[110px] sm:w-[130px] h-auto"
                priority
              />
            </div>

            <div className="absolute top-1/3 left-2 sm:left-4 animate-float-fast">
              <Image
                src="/7.webp"
                alt=""
                width={130}
                height={130}
                className="drop-shadow-lg w-[90px] sm:w-[110px] h-auto"
                priority
              />
            </div>

            <div className="absolute bottom-[28%] sm:bottom-[30%] right-4 sm:right-6 animate-float-slow">
              <Image
                src="/6.webp"
                alt=""
                width={170}
                height={170}
                className="drop-shadow-xl w-[130px] sm:w-[150px] h-auto"
                priority
              />
            </div>
          </div>
        </>
      )}

      {/* Content Container - Centered */}
      <div className="relative z-10 min-h-dvh w-full flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        {loading && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <Image
                src="/images/Technex_26_name.webp"
                alt="TECHNEX 2K25"
                width={400}
                height={300}
                className="h-auto w-48  sm:w-64 md:w-80 object-contain animate-pulse"
                priority
              />
              <div className="w-56 sm:w-64 md:w-80 h-3 bg-[color:var(--secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--primary)] rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-[color:var(--foreground)]/80">
                Loading invitation... {Math.floor(progress)}%
              </p>
            </div>
          </div>
        )}

        {!revealed && (
          <>
            {/* Desktop & Laptop: show envelope */}
            <div className="hidden xl:block w-full max-w-2xl">
              <JungleLetter onReveal={handleReveal} />
            </div>

            {/* Mobile & Tablet (including iPads): show fingerprint scanner */}
            <div className="xl:hidden w-full max-w-md px-6">
              {!biometricVerified ? (
                <div className="space-y-6 rounded-2xl border border-[color:var(--primary)]/40 bg-[color:var(--secondary)]/75 backdrop-blur-sm p-6 sm:p-8">
                  <FingerprintScanner
                    onVerified={() => setBiometricVerified(true)}
                    className="mx-auto"
                  />
                </div>
              ) : (
                <div className="text-center space-y-6 animate-in fade-in rounded-2xl border border-[color:var(--primary)]/40 bg-[color:var(--secondary)]/75 backdrop-blur-sm p-6 sm:p-8">
                  <div className="space-y-4">
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "#8affff", letterSpacing: "2px" }}
                    >
                      WELCOME, EXPLORER
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: "#d6d9ff", lineHeight: "1.6" }}
                    >
                      Your identity has been successfully verified.
                      <br/>
                      You are now authorized to enter the{" "}
                      <strong>Neo‑Celestia Network</strong>.
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "#aeb6ff", marginTop: "12px" }}
                    >
                      May your journey be guided by innovation, curiosity, and
                      cosmic excellence.
                    </p>
                  </div>
                  <Button
                    onClick={handleReveal}
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
                  >
                    Proceed to Invitation
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {revealed && (
          <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
            <section
              className={cn(
                "relative rounded-2xl border border-[color:var(--primary)]/40 bg-[color:var(--secondary)]/75 p-4 sm:p-6 md:p-10 backdrop-blur-sm animate-in fade-in overflow-hidden"
              )}
              aria-label="Invitation details"
            >
              <div className="relative z-10 space-y-4 sm:space-y-6">
                <Image
                  src="/images/SVPCET.webp"
                  alt="SVPCET"
                  width={1500}
                  height={300}
                  className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto object-contain drop-shadow"
                  priority
                />

                <p className="text-center text-sm sm:text-base md:text-lg">
                  Cordially invites you to
                </p>

                <div className="flex justify-center">
                  <Image
                    src="/images/Technex_26_name.webp"
                    alt="TECHNEX 2K25"
                    width={3000}
                    height={700}
                    className="h-auto w-full max-w-xs sm:max-w-sm md:max-w-md object-contain"
                    priority
                  />
                </div>

                <h3 className="text-center text-base sm:text-lg md:text-2xl font-bold text-[color:var(--foreground)]">
                  A National-Level Technical Fest
                </h3>

                <p className="text-center text-xs sm:text-sm md:text-base leading-relaxed">
                  A distinguished event celebrating innovation, technological
                  excellence, and intellectual leadership empowering technical
                  minds and bringing together academia, industry, and young
                  innovators
                </p>
                <p className="text-center text-xs sm:text-sm md:text-base leading-relaxed">
                  We are honored to invite you to grace TECHNEX 2025–26, a
                  two-day technical event featuring expert sessions, workshops,
                  competitions, and exhibitions that foster collaboration,
                  creativity, and emerging technologies.
                </p>

                <div className="grid gap-1 sm:gap-2 text-center text-xs sm:text-sm md:text-base">
                  <p>
                    <span className="font-semibold text-[color:var(--primary)]">
                      Date :
                    </span>{" "}
                    18th & 19th December 2025
                  </p>
                  <p>
                    <span className="font-semibold text-[color:var(--primary)]">
                      Venue :
                    </span>{" "}
                    St. Vincent Pallotti College of Engineering and Technology,
                    Gavsi Manapur, Nagpur
                  </p>
                </div>

                <p className="text-center text-xs sm:text-sm md:text-base leading-relaxed">
                  Your presence will greatly enrich TECHNEX 2025–26.
                <br></br>
                  We look forward to welcoming you.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[color:var(--primary)]/40 bg-[color:var(--secondary)]/75 p-4 sm:p-6 md:p-10 backdrop-blur-sm">
              <h4 className="mb-3 sm:mb-4 text-center text-sm sm:text-base md:text-lg font-semibold text-[color:var(--primary)]">
                Sign Your Presence
              </h4>
              {/* Mobile & iPad (tablets): show signature canvas */}
              <div className="block xl:hidden">
                <SignatureCanvas
                  ref={sigRef}
                  className="h-48 sm:h-56 md:h-64 w-full rounded-md bg-[color:var(--secondary)]/30"
                  strokeColor="#ffffff"
                  strokeWidth={2}
                />
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <Button
                    onClick={handleDownload}
                    className="bg-[color:var(--primary)] text-[color:var(--background)] hover:opacity-90 transition text-xs sm:text-sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleClear}
                    className="bg-[color:var(--accent)] text-[oklch(0.98_0_0)] transition text-xs sm:text-sm"
                  >
                    Clear signatures
                  </Button>
                </div>
              </div>
              {/* Desktop: keep signature canvas */}
              <div className="hidden xl:block">
                <SignatureCanvas
                  ref={sigRef}
                  className="h-48 sm:h-56 md:h-64 w-full rounded-md bg-[color:var(--secondary)]/30"
                  strokeColor="#ffffff"
                  strokeWidth={2}
                />
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <Button
                    onClick={handleDownload}
                    className="bg-[color:var(--primary)] text-[color:var(--background)] hover:opacity-90 transition text-xs sm:text-sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleClear}
                    className="bg-[color:var(--accent)] text-[oklch(0.98_0_0)] transition text-xs sm:text-sm"
                  >
                    Clear signatures
                  </Button>
                </div>
              </div>
            </section>

            <footer className="text-center text-xs sm:text-sm">
              Crafted for TECHNEX 2K25 — Let the Cosmos align!
            </footer>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes ship-arrival-animation {
          0% {
            transform: translate3d(-140vw, -100vh, 0) scale(0.6) rotate(-30deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .ship-arrival-animation {
          animation: ship-arrival-animation 5s cubic-bezier(0.22, 0.61, 0.36, 1)
            forwards;
          will-change: transform;
        }
      `}</style>
    </main>
  );
}
