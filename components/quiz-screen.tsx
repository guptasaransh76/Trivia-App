"use client"

import { useState, useCallback } from "react"
import { Heart, X, ArrowRight, Lightbulb, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { QuizQuestion } from "@/lib/valentine-types"

interface QuizScreenProps {
  partnerName: string
  senderName: string
  questions: QuizQuestion[]
  onComplete: (score: number) => void
}

const CORRECT_MESSAGES = [
  "You know your love so well!",
  "That's the one! You two are meant to be.",
  "Perfect answer, you're on fire!",
  "You really pay attention to the little things.",
  "Nailed it! Your love story is strong.",
  "Heart and soul, you just know!",
]

const INCORRECT_MESSAGES = [
  "Almost! Love is about learning too.",
  "Not quite, but your heart is in the right place.",
  "Oops! But hey, now you know.",
  "So close! Every day is a chance to learn more.",
  "That's okay -- there's always more to discover together.",
]

const STREAK_MESSAGES = [
  "", // 0
  "", // 1
  "2 in a row!",
  "3-streak! You really know your love!",
  "4 in a row! Unstoppable!",
  "5-streak! Soulmate-level knowledge!",
  "6+ streak! Legendary lovers!",
]

function getRandomMessage(messages: string[], exclude?: string): string {
  const filtered = messages.filter((m) => m !== exclude)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export function QuizScreen({
  partnerName,
  senderName,
  questions,
  onComplete,
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(-1) // -1 = intro
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showLoveNote, setShowLoveNote] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastCorrectMsg, setLastCorrectMsg] = useState("")
  const [lastIncorrectMsg, setLastIncorrectMsg] = useState("")
  const [feedbackMsg, setFeedbackMsg] = useState("")

  const currentQuestion = currentIndex >= 0 ? questions[currentIndex] : null
  const isCorrect =
    selectedOption !== null &&
    currentQuestion?.correctIndex === selectedOption
  const progress =
    currentIndex >= 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const loveMeterPercent = questions.length > 0 ? (score / questions.length) * 100 : 0

  const handleSelectOption = (index: number) => {
    if (showResult) return
    setSelectedOption(index)
    setShowResult(true)
    setShowHint(false)

    const correct = currentQuestion && index === currentQuestion.correctIndex
    if (correct) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      const msg = getRandomMessage(CORRECT_MESSAGES, lastCorrectMsg)
      setFeedbackMsg(msg)
      setLastCorrectMsg(msg)
    } else {
      setStreak(0)
      const msg = getRandomMessage(INCORRECT_MESSAGES, lastIncorrectMsg)
      setFeedbackMsg(msg)
      setLastIncorrectMsg(msg)
    }
  }

  const handleNext = useCallback(() => {
    // Check if there's a love note to show
    if (currentQuestion?.loveNote && !showLoveNote) {
      setShowLoveNote(true)
      return
    }

    setIsAnimating(true)
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        onComplete(score)
      } else {
        setCurrentIndex((i) => i + 1)
        setSelectedOption(null)
        setShowResult(false)
        setShowLoveNote(false)
        setShowHint(false)
      }
      setIsAnimating(false)
    }, 350)
  }, [currentIndex, questions.length, onComplete, score, currentQuestion, showLoveNote])

  // Intro screen
  if (currentIndex === -1) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="animate-fade-in-up max-w-md">
          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-soft" />
            <Heart className="relative h-12 w-12 text-primary" fill="currentColor" />
          </div>

          <h1 className="mb-3 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
            Hey {partnerName}!
          </h1>
          <p className="mb-2 text-lg text-muted-foreground leading-relaxed">
            {senderName} has crafted a special journey just for you.
          </p>
          <p className="mb-3 text-muted-foreground leading-relaxed">
            Answer these questions to prove how well you know your love
            and unlock a surprise at the end.
          </p>
          <div className="mb-8 flex items-center justify-center gap-6 text-sm text-muted-foreground/70">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-primary" fill="currentColor" />
              {questions.length} question{questions.length > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-accent" />
              Hints available
            </span>
          </div>

          <Button
            onClick={() => setCurrentIndex(0)}
            size="lg"
            className="group rounded-full bg-primary px-8 py-6 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
          >
            {"Let's Begin"}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  // Love note interlude
  if (showLoveNote && currentQuestion.loveNote) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div
          className={`max-w-md transition-all duration-350 ${
            isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="animate-fade-in-up">
            {/* Love note card */}
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-soft" />
              <Heart className="relative h-8 w-8 text-primary" fill="currentColor" />
            </div>

            <p className="mb-2 text-sm font-medium text-primary">
              A note from {senderName}
            </p>

            <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-primary/20 bg-card p-8 shadow-sm">
              <p className="font-serif text-xl leading-relaxed text-card-foreground italic">
                {'"'}{currentQuestion.loveNote}{'"'}
              </p>
            </div>

            {/* Question image if present */}
            {currentQuestion.imageUrl && (
              <div className="mx-auto mb-6 aspect-square w-full max-w-xs overflow-hidden rounded-2xl bg-muted/20 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQuestion.imageUrl}
                  alt="A cherished memory"
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <Button
              onClick={handleNext}
              size="lg"
              className="group rounded-full bg-primary px-8 py-5 text-lg font-medium text-primary-foreground shadow-lg"
            >
              {currentIndex + 1 >= questions.length
                ? "See Your Surprise"
                : "Continue"}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col px-4 py-6">
      {/* Top Bar: Progress + Love Meter */}
      <div className="mx-auto mb-6 w-full max-w-lg">
        {/* Question counter + streak */}
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-3">
            {/* Streak indicator */}
            {streak >= 2 && (
              <span className="flex items-center gap-1 text-accent font-semibold animate-bounce-in">
                <Flame className="h-4 w-4" />
                {STREAK_MESSAGES[Math.min(streak, STREAK_MESSAGES.length - 1)]}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/40 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Love Meter */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Love Meter</span>
          <div className="relative flex-1 h-6 overflow-hidden rounded-full bg-muted/50 border border-border">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700 ease-out"
              style={{ width: `${Math.max(loveMeterPercent, 4)}%` }}
            />
            {/* Heart icons along the meter */}
            <div className="relative flex h-full items-center justify-center gap-1">
              {Array.from({ length: questions.length }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-3.5 w-3.5 transition-all duration-300 ${
                    i < score
                      ? "text-primary-foreground fill-current"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs font-bold text-primary">{score}/{questions.length}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="mx-auto w-full max-w-lg flex-1">
        <div
          className={`transition-all duration-350 ${
            isAnimating ? "scale-95 opacity-0 translate-x-8" : "scale-100 opacity-100 translate-x-0"
          }`}
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {/* Image */}
            {currentQuestion.imageUrl && (
              <div className="mb-5 aspect-square w-full overflow-hidden rounded-xl bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQuestion.imageUrl}
                  alt={`Question ${currentIndex + 1}`}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            {/* Question */}
            <h2 className="mb-6 font-serif text-2xl font-semibold text-card-foreground leading-snug text-balance">
              {currentQuestion.question}
            </h2>

            {/* Hint button */}
            {currentQuestion.hint && !showResult && !showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="mb-4 flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Need a hint?
              </button>
            )}

            {/* Hint revealed */}
            {showHint && currentQuestion.hint && (
              <div className="mb-4 animate-fade-in-up rounded-xl bg-accent/10 border border-accent/20 p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p className="text-sm text-foreground/80 italic">{currentQuestion.hint}</p>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, optionIndex) => {
                let optionStyle =
                  "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                if (showResult) {
                  if (optionIndex === currentQuestion.correctIndex) {
                    optionStyle =
                      "border-green-300 bg-green-50 text-green-800"
                  } else if (
                    optionIndex === selectedOption &&
                    optionIndex !== currentQuestion.correctIndex
                  ) {
                    optionStyle =
                      "border-destructive/30 bg-destructive/5 text-destructive"
                  } else {
                    optionStyle =
                      "border-border bg-muted/50 text-muted-foreground"
                  }
                }

                return (
                  <button
                    key={optionIndex}
                    onClick={() => handleSelectOption(optionIndex)}
                    disabled={showResult}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all disabled:cursor-default ${optionStyle}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      showResult && optionIndex === currentQuestion.correctIndex
                        ? "bg-green-200 text-green-800"
                        : showResult && optionIndex === selectedOption && optionIndex !== currentQuestion.correctIndex
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="font-medium">{option}</span>
                    {showResult && optionIndex === currentQuestion.correctIndex && (
                      <Heart
                        className="ml-auto h-5 w-5 shrink-0 text-green-600"
                        fill="currentColor"
                      />
                    )}
                    {showResult &&
                      optionIndex === selectedOption &&
                      optionIndex !== currentQuestion.correctIndex && (
                        <X className="ml-auto h-5 w-5 shrink-0 text-destructive" />
                      )}
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            {showResult && (
              <div className="mt-5 animate-fade-in-up">
                <div
                  className={`rounded-xl p-4 text-center ${
                    isCorrect
                      ? "bg-green-50 text-green-800"
                      : "bg-primary/5 text-primary"
                  }`}
                >
                  <p className="font-serif text-lg font-semibold">
                    {feedbackMsg}
                  </p>
                  {/* Streak celebration */}
                  {isCorrect && streak >= 2 && (
                    <p className="mt-1 text-sm flex items-center justify-center gap-1 font-medium text-accent">
                      <Flame className="h-4 w-4" />
                      {streak} in a row!
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="group mt-4 w-full rounded-full bg-primary py-5 text-lg font-medium text-primary-foreground shadow-lg"
                >
                  {currentIndex + 1 >= questions.length && !currentQuestion.loveNote
                    ? "See Your Surprise"
                    : currentQuestion.loveNote
                    ? "Read a note from " + senderName
                    : "Next Question"}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
