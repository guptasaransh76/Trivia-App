"use client"

import { useState, useEffect } from "react"
import { FloatingHearts } from "@/components/floating-hearts"
import { LandingScreen } from "@/components/landing-screen"
import { SetupScreen } from "@/components/setup-screen"
import { PreviewScreen } from "@/components/preview-screen"
import { QuizScreen } from "@/components/quiz-screen"
import { FinalReveal } from "@/components/final-reveal"
import { extractQuizFromUrl } from "@/lib/share-utils"
import type { AppScreen, ValentineQuiz } from "@/lib/valentine-types"

export default function Page() {
  const [screen, setScreen] = useState<AppScreen>("landing")
  const [quiz, setQuiz] = useState<ValentineQuiz | null>(null)
  const [finalScore, setFinalScore] = useState(0)
  const [isFromLink, setIsFromLink] = useState(false)
  const [urlLoadState, setUrlLoadState] = useState<"idle" | "loading" | "ok" | "error">("idle")

  // On mount, check URL for shared quiz: ?id=... (fetch from API) or ?v=... (encoded)
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (id) {
      setUrlLoadState("loading")
      fetch(`/api/quizzes/${encodeURIComponent(id)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found")
          return res.json()
        })
        .then((data: ValentineQuiz) => {
          setQuiz(data)
          setIsFromLink(true)
          setScreen("quiz")
          setUrlLoadState("ok")
        })
        .catch(() => setUrlLoadState("error"))
      return
    }
    const sharedQuiz = extractQuizFromUrl()
    if (sharedQuiz) {
      setQuiz(sharedQuiz)
      setIsFromLink(true)
      setScreen("quiz")
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleSetupComplete = (q: ValentineQuiz) => {
    setQuiz(q)
    setScreen("preview")
  }

  const handleQuizComplete = (score: number) => {
    setFinalScore(score)
    setScreen("final-reveal")
  }

  const handleRestart = () => {
    setScreen("landing")
    setQuiz(null)
    setFinalScore(0)
    setIsFromLink(false)
  }

  if (urlLoadState === "loading") {
    return (
      <main className="relative flex min-h-screen items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading your surprise...</p>
        </div>
      </main>
    )
  }

  if (urlLoadState === "error") {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="font-medium text-card-foreground">This link is invalid or expired.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The quiz may have been removed or the link was copied incorrectly.
          </p>
          <button
            onClick={() => {
              window.history.replaceState({}, "", window.location.pathname)
              setUrlLoadState("idle")
            }}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Create your own Valentine
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <FloatingHearts count={screen === "final-reveal" ? 20 : 10} />

      {screen === "landing" && (
        <LandingScreen onCreateNew={() => setScreen("setup")} />
      )}

      {screen === "setup" && (
        <SetupScreen
          onComplete={handleSetupComplete}
          onBack={() => setScreen("landing")}
        />
      )}

      {screen === "preview" && quiz && (
        <PreviewScreen
          quiz={quiz}
          onStartQuiz={() => setScreen("quiz")}
          onEdit={() => setScreen("setup")}
        />
      )}

      {screen === "quiz" && quiz && (
        <QuizScreen
          partnerName={quiz.partnerName}
          senderName={quiz.senderName}
          questions={quiz.questions}
          onComplete={handleQuizComplete}
        />
      )}

      {screen === "final-reveal" && quiz && (
        <FinalReveal
          partnerName={quiz.partnerName}
          senderName={quiz.senderName}
          score={finalScore}
          totalQuestions={quiz.questions.length}
          finalMessage={quiz.finalMessage}
          finalImageUrl={quiz.finalImageUrl}
          questions={quiz.questions}
          onRestart={handleRestart}
        />
      )}
    </main>
  )
}
