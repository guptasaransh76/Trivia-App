"use client"

import { useState, useEffect } from "react"
import { Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { QuizQuestion } from "@/lib/valentine-types"

interface FinalRevealProps {
  partnerName: string
  senderName: string
  score: number
  totalQuestions: number
  finalMessage?: string
  finalImageUrl?: string
  questions: QuizQuestion[]
}

interface Sparkle {
  id: number
  left: number
  top: number
  delay: number
  size: number
}

export function FinalReveal({
  partnerName,
  senderName,
  score,
  totalQuestions,
  finalMessage,
  finalImageUrl,
  questions,
}: FinalRevealProps) {
  // 0=score, 1=envelope, 2=revealed question, 3=response, 4=memory wall
  const [stage, setStage] = useState(0)
  const [response, setResponse] = useState<"yes" | "no" | null>(null)
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [burstHearts, setBurstHearts] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      dx: number
      rotate: number
      delay: number
      duration: number
    }>
  >([])
  const [visibleMemories, setVisibleMemories] = useState(0)

  const memories = questions.filter((q) => q.imageUrl || q.loveNote)

  useEffect(() => {
    const generated: Sparkle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 8 + 4,
    }))
    setSparkles(generated)
  }, [])

  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => setStage(1), 2500)
      return () => clearTimeout(timer)
    }
  }, [stage])

  // Animate memory wall items appearing one by one
  useEffect(() => {
    if (stage === 4 && visibleMemories < memories.length) {
      const timer = setTimeout(() => {
        setVisibleMemories((v) => v + 1)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [stage, visibleMemories, memories.length])

  const handleOpenEnvelope = () => {
    setStage(2)
  }

  const handleResponse = (answer: "yes" | "no") => {
    setResponse(answer)
    setStage(3)
    if (answer === "yes") {
      const hearts = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 58 + (Math.random() - 0.5) * 16,
        size: Math.random() * 18 + 14,
        dx: (Math.random() - 0.5) * 40,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.4,
        duration: 2.8 + Math.random() * 1.5,
      }))
      setBurstHearts(hearts)
    }
  }

  const handleShowMemories = () => {
    setStage(4)
    setVisibleMemories(0)
  }

  const renderSparkles = () =>
    sparkles.map((s) => (
      <div
        key={s.id}
        className="pointer-events-none absolute animate-sparkle"
        style={{
          left: `${s.left}%`,
          top: `${s.top}%`,
          animationDelay: `${s.delay}s`,
          color: "hsl(346, 77%, 60%)",
        }}
        aria-hidden="true"
      >
        <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6 4.6L18.4 22 12 17.4 5.6 22 8 14l-6-4.6h7.6z" />
        </svg>
      </div>
    ))

  // Stage 0: Score reveal
  if (stage === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="animate-bounce-in">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-12 w-12 text-primary animate-pulse-soft" fill="currentColor" />
          </div>
          <h2 className="mb-2 font-serif text-3xl font-bold text-foreground">
            {score === totalQuestions
              ? "Perfect Score!"
              : score >= totalQuestions * 0.7
              ? "So close!"
              : score >= totalQuestions * 0.4
              ? "Nice try!"
              : "Every love story starts somewhere!"}
          </h2>
          <p className="text-lg text-muted-foreground">
            You got {score} out of {totalQuestions} right
          </p>

          {/* Love meter recap */}
          <div className="mx-auto mt-6 flex max-w-xs items-center gap-2">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <Heart
                key={i}
                className={`h-5 w-5 transition-all duration-300 ${
                  i < score
                    ? "text-primary fill-current"
                    : "text-muted-foreground/30"
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground animate-pulse">
            Something special is coming...
          </p>
        </div>
      </div>
    )
  }

  // Stage 1: Envelope
  if (stage === 1) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {renderSparkles()}

        <div className="animate-fade-in-up">
          <p className="mb-6 font-serif text-xl text-muted-foreground">
            {senderName} has a special question...
          </p>

          {/* Envelope */}
          <button
            onClick={handleOpenEnvelope}
            className="group relative mx-auto flex h-48 w-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-primary/20 bg-card shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:border-primary/40"
            aria-label="Open the envelope"
          >
            {/* Seal */}
            <div className="absolute -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            {/* Decorative flap */}
            <div className="absolute inset-x-0 top-0 h-16 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-x-0 -top-10 h-20 bg-primary/5" style={{ clipPath: "polygon(0 50%, 50% 100%, 100% 50%, 100% 0, 0 0)" }} />
            </div>

            <div className="relative mt-4 flex flex-col items-center">
              <Heart className="mb-3 h-10 w-10 text-primary transition-transform group-hover:scale-110" fill="currentColor" />
              <span className="font-serif text-lg font-semibold text-primary">
                Tap to open
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                A love note awaits
              </span>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Stage 2: The Big Question
  if (stage === 2) {
    const displayMessage =
      finalMessage ||
      `Every moment with you feels like magic. I'm so grateful to have you in my life.`

    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center">
        {renderSparkles()}

        <div className="animate-bounce-in max-w-md">
          {/* Final image */}
          {finalImageUrl && (
            <div className="mx-auto mb-6 aspect-square w-40 overflow-hidden rounded-2xl border-4 border-primary/20 bg-muted/20 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={finalImageUrl}
                alt="A special memory"
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {!finalImageUrl && (
            <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-soft" />
              <div
                className="absolute inset-2 rounded-full bg-primary/10 animate-pulse-soft"
                style={{ animationDelay: "0.5s" }}
              />
              <Heart className="relative h-14 w-14 text-primary" fill="currentColor" />
            </div>
          )}

          <h1 className="mb-3 font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            <span className="text-balance">{partnerName},</span>
          </h1>
          <h2 className="mb-6 font-serif text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
            <span className="text-balance">Will You Be My Valentine?</span>
          </h2>

          <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-primary/10 bg-card/50 p-6">
            <p className="font-serif text-lg text-foreground/80 italic leading-relaxed">
              {'"'}{displayMessage}{'"'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={() => handleResponse("yes")}
              size="lg"
              className="w-full rounded-full bg-primary px-10 py-6 text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:w-auto"
            >
              <Heart className="mr-2 h-6 w-6" fill="currentColor" />
              Yes!
            </Button>
            <Button
              onClick={() => handleResponse("no")}
              variant="outline"
              size="lg"
              className="w-full rounded-full border-2 border-border px-10 py-6 text-xl font-semibold text-muted-foreground hover:text-foreground sm:w-auto"
            >
              Hmm...
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground/60">
            With all my love, {senderName}
          </p>
        </div>
      </div>
    )
  }

  // Stage 3: Response
  if (stage === 3) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        {/* Expanding ring burst for "Yes" */}
        {response === "yes" && (
          <div
            className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-primary/60 animate-heart-burst-ring"
            aria-hidden="true"
          />
        )}

        {/* Burst hearts for "Yes" */}
        {response === "yes" &&
          burstHearts.map((h) => (
            <div
              key={h.id}
              className="pointer-events-none absolute animate-heart-burst-yes"
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                fontSize: `${h.size}px`,
                animationDelay: `${h.delay}s`,
                animationDuration: `${h.duration}s`,
                color: "hsl(346, 77%, 60%)",
                "--heart-dx": `${h.dx}vw`,
                "--heart-rotate": `${h.rotate}deg`,
              } as React.CSSProperties}
              aria-hidden="true"
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          ))}

        <div className="animate-bounce-in max-w-md relative z-10">
          {response === "yes" ? (
            <>
              <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft" />
                <Heart className="relative h-16 w-16 text-primary" fill="currentColor" />
              </div>
              <h1 className="mb-4 font-serif text-5xl font-bold text-primary md:text-6xl">
                Yay!
              </h1>
              <p className="mb-2 text-xl text-foreground leading-relaxed">
                You just made {senderName} the happiest person alive!
              </p>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
                {"Here's to more beautiful memories together."}
                <br />
                {"Happy Valentine's Day,"} {partnerName}!
              </p>

              {/* Memory wall button */}
              {memories.length > 0 && (
                <Button
                  onClick={handleShowMemories}
                  size="lg"
                  className="group mb-4 w-full rounded-full bg-primary py-5 text-lg font-medium text-primary-foreground shadow-lg sm:w-auto sm:px-8"
                >
                  Walk Down Memory Lane
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">
                Hmm...
              </h1>
              <p className="mb-2 text-lg text-muted-foreground leading-relaxed">
                {"That's okay!"} {senderName} still thinks {"you're"} amazing.
              </p>
              <p className="mb-8 text-muted-foreground leading-relaxed">
                Maybe they can try to win your heart another day?
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // Stage 4: Memory Wall
  return (
    <div className="min-h-screen px-4 py-8">
      {renderSparkles()}

      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center animate-fade-in-up">
          <Heart className="mx-auto mb-3 h-8 w-8 text-primary" fill="currentColor" />
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Memory Lane
          </h1>
          <p className="mt-2 text-muted-foreground">
            A look back at the moments that make your love story
          </p>
        </div>

        {/* Memory cards */}
        <div className="flex flex-col gap-6">
          {memories.map((memory, i) => (
            <div
              key={memory.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500"
              style={{
                opacity: i < visibleMemories ? 1 : 0,
                transform: i < visibleMemories ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.5s ease-out",
              }}
            >
              {/* Memory image */}
              {memory.imageUrl && (
                <div className="aspect-square w-full overflow-hidden bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={memory.imageUrl}
                    alt={`Memory from question ${i + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {/* Love note */}
              <div className="p-5">
                <p className="mb-2 text-xs font-medium text-primary uppercase tracking-wider">
                  Memory {i + 1}
                </p>
                <p className="mb-2 font-serif text-base font-medium text-card-foreground">
                  {memory.question}
                </p>
                {memory.loveNote && (
                  <div className="mt-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <p className="font-serif text-sm text-foreground/80 italic leading-relaxed">
                      {'"'}{memory.loveNote}{'"'}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      -- {senderName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final heart */}
        {visibleMemories >= memories.length && (
          <div className="mt-10 pb-10 text-center animate-bounce-in">
            <Heart className="mx-auto mb-4 h-10 w-10 text-primary" fill="currentColor" />
            <p className="font-serif text-xl font-semibold text-foreground">
              {"Here's to many more memories,"}
            </p>
            <p className="font-serif text-xl font-semibold text-primary">
              {partnerName} & {senderName}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
