"use client"

import { useState, useCallback } from "react"
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  ImagePlus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QuestionEditor } from "@/components/question-editor"
import { uploadImageToStorage, getExtFromFile } from "@/lib/upload-utils"
import type { QuizQuestion, ValentineQuiz, SetupStep } from "@/lib/valentine-types"

interface SetupScreenProps {
  onComplete: (quiz: ValentineQuiz) => void
  onBack: () => void
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function createEmptyQuestion(id?: string): QuizQuestion {
  return {
    id: id ?? generateId(),
    question: "",
    options: ["", ""],
    correctIndex: 0,
  }
}

/** Stable ID for initial question - avoids hydration mismatch (Math.random differs on server vs client) */
const INITIAL_QUESTION_ID = "q0"

const STEPS: { key: SetupStep; label: string; number: number }[] = [
  { key: "names", label: "About You Two", number: 1 },
  { key: "questions", label: "Questions", number: 2 },
  { key: "final-message", label: "Final Message", number: 3 },
]

export function SetupScreen({ onComplete, onBack }: SetupScreenProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>("names")
  const [partnerName, setPartnerName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    createEmptyQuestion(INITIAL_QUESTION_ID),
  ])
  const [finalMessage, setFinalMessage] = useState("")
  const [finalImageUrl, setFinalImageUrl] = useState<string | undefined>()
  const [errors, setErrors] = useState<string[]>([])
  const [finalImageUploading, setFinalImageUploading] = useState(false)
  const [finalImageError, setFinalImageError] = useState<string | null>(null)
  const [draftId] = useState(() => crypto.randomUUID())

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep)

  const addQuestion = () => {
    if (questions.length < 10) {
      setQuestions([...questions, createEmptyQuestion()])
    }
  }

  const updateQuestion = (index: number, updated: QuizQuestion) => {
    const newQuestions = [...questions]
    newQuestions[index] = updated
    setQuestions(newQuestions)
  }

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleFinalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith("image/")) return
    setFinalImageError(null)
    setFinalImageUploading(true)
    try {
      const ext = getExtFromFile(file)
      const path = `${draftId}/final.${ext}`
      const url = await uploadImageToStorage(path, file)
      setFinalImageUrl(url)
    } catch (err) {
      setFinalImageError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setFinalImageUploading(false)
    }
    e.target.value = ""
  }

  const validateStep = useCallback((): boolean => {
    const newErrors: string[] = []

    if (currentStep === "names") {
      if (!partnerName.trim()) newErrors.push("Please add your partner's name")
      if (!senderName.trim()) newErrors.push("Please add your name")
    }

    if (currentStep === "questions") {
      questions.forEach((q, i) => {
        if (!q.question.trim()) {
          newErrors.push(`Question ${i + 1} needs a question`)
        }
        const emptyOptions = q.options.filter((o) => !o.trim())
        if (emptyOptions.length > 0) {
          newErrors.push(`Question ${i + 1} has empty options`)
        }
      })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }, [currentStep, partnerName, senderName, questions])

  const goNext = () => {
    if (!validateStep()) return
    setErrors([])
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key)
    }
  }

  const goPrev = () => {
    setErrors([])
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key)
    } else {
      onBack()
    }
  }

  const handleSubmit = () => {
    if (!validateStep()) return
    onComplete({
      id: draftId,
      partnerName: partnerName.trim(),
      senderName: senderName.trim(),
      questions,
      finalMessage: finalMessage.trim() || undefined,
      finalImageUrl,
    })
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-lg">
        {/* Back Button */}
        <button
          onClick={goPrev}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStepIndex === 0 ? "Back" : STEPS[currentStepIndex - 1].label}
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-4">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-1 items-center">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    i <= currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary">
                Step {currentStepIndex + 1} of {STEPS.length}
              </p>
              <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                {STEPS[currentStepIndex].label}
              </h1>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-5 w-5 text-primary" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Step 1: Names */}
        {currentStep === "names" && (
          <div className="animate-fade-in-up">
            <p className="mb-6 text-muted-foreground leading-relaxed">
              {"Let's start with the basics. Who is this love letter for?"}
            </p>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-5">
                <div>
                  <Label htmlFor="partner-name" className="mb-2 block text-sm font-medium text-card-foreground">
                    {"Your partner's name"}
                  </Label>
                  <Input
                    id="partner-name"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Their name..."
                    className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="sender-name" className="mb-2 block text-sm font-medium text-card-foreground">
                    Your name
                  </Label>
                  <Input
                    id="sender-name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name..."
                    className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {currentStep === "questions" && (
          <div className="animate-fade-in-up">
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Create questions that only {partnerName || "your partner"} would know the answers to.
              Each one is a step in your scavenger hunt.
            </p>

            <div className="flex flex-col gap-6">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  quizId={draftId}
                  onUpdate={(updated) => updateQuestion(index, updated)}
                  onDelete={() => deleteQuestion(index)}
                  canDelete={questions.length > 1}
                />
              ))}
            </div>

            {questions.length < 10 && (
              <button
                onClick={addQuestion}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Plus className="h-5 w-5" />
                Add another question
                <span className="text-xs text-muted-foreground/60">
                  ({questions.length}/10)
                </span>
              </button>
            )}
          </div>
        )}

        {/* Step 3: Final Message */}
        {currentStep === "final-message" && (
          <div className="animate-fade-in-up">
            <p className="mb-6 text-muted-foreground leading-relaxed">
              {"This is the message"} {partnerName || "your partner"} {"will see right before the big question. Make it personal and from the heart."}
            </p>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                {/* Final photo */}
                <div>
                  <Label className="mb-2 block text-sm font-medium text-card-foreground">
                    A special photo for the reveal (optional)
                  </Label>
                  {finalImageUrl ? (
                    <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-xl bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={finalImageUrl}
                        alt="Final reveal photo"
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => setFinalImageUrl(undefined)}
                        className="absolute right-2 top-2 rounded-full bg-foreground/60 p-1.5 text-background transition-colors hover:bg-foreground/80"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 transition-colors hover:border-primary/50 ${finalImageUploading ? "pointer-events-none opacity-70" : ""}`}>
                      {finalImageUploading ? (
                        <span className="mb-2 text-sm text-muted-foreground">Uploading...</span>
                      ) : (
                        <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        Upload a photo of you two (max 7MB)
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground/60">
                        This appears on the big question screen
                      </span>
                      {finalImageError && (
                        <span className="mt-2 text-xs text-destructive">{finalImageError}</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFinalImageUpload}
                        className="sr-only"
                        disabled={finalImageUploading}
                      />
                    </label>
                  )}
                </div>

                {/* Custom message */}
                <div>
                  <Label className="mb-2 block text-sm font-medium text-card-foreground">
                    Your personal message (optional)
                  </Label>
                  <Textarea
                    value={finalMessage}
                    onChange={(e) => setFinalMessage(e.target.value)}
                    placeholder="Every moment with you feels like magic. I'm so grateful to have you in my life..."
                    rows={4}
                    className="resize-none rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground/70">
                    {"Leave empty and we'll use a sweet default message"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-6 rounded-xl bg-destructive/10 p-4">
            <ul className="flex flex-col gap-1 text-sm text-destructive">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3 pb-8">
          <Button
            onClick={goPrev}
            variant="outline"
            size="lg"
            className="rounded-full border-border text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {currentStep === "final-message" ? (
            <Button
              onClick={handleSubmit}
              size="lg"
              className="group flex-1 rounded-full bg-primary py-6 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Preview & Share
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button
              onClick={goNext}
              size="lg"
              className="group flex-1 rounded-full bg-primary py-6 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
