"use client"

import { useState } from "react"
import { ImagePlus, X, Check, Trash2, Lightbulb, MessageCircleHeart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadImageToStorage, getExtFromFile } from "@/lib/upload-utils"
import type { QuizQuestion } from "@/lib/valentine-types"

interface QuestionEditorProps {
  question: QuizQuestion
  index: number
  quizId: string
  onUpdate: (question: QuizQuestion) => void
  onDelete: () => void
  canDelete: boolean
}

export function QuestionEditor({
  question,
  index,
  quizId,
  onUpdate,
  onDelete,
  canDelete,
}: QuestionEditorProps) {
  const [dragOver, setDragOver] = useState(false)
  const [showHint, setShowHint] = useState(!!question.hint)
  const [showLoveNote, setShowLoveNote] = useState(!!question.loveNote)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const doUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return
    setUploadError(null)
    setUploading(true)
    try {
      const ext = getExtFromFile(file)
      const path = `${quizId}/question-${question.id}.${ext}`
      const url = await uploadImageToStorage(path, file)
      onUpdate({ ...question, imageUrl: url })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) doUpload(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) doUpload(file)
  }

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options]
    newOptions[optionIndex] = value
    onUpdate({ ...question, options: newOptions })
  }

  const addOption = () => {
    if (question.options.length < 4) {
      onUpdate({ ...question, options: [...question.options, ""] })
    }
  }

  const removeOption = (optionIndex: number) => {
    if (question.options.length <= 2) return
    const newOptions = question.options.filter((_, i) => i !== optionIndex)
    let newCorrectIndex = question.correctIndex
    if (optionIndex === question.correctIndex) {
      newCorrectIndex = 0
    } else if (optionIndex < question.correctIndex) {
      newCorrectIndex = question.correctIndex - 1
    }
    onUpdate({ ...question, options: newOptions, correctIndex: newCorrectIndex })
  }

  return (
    <div className="animate-fade-in-up rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {index + 1}
          </span>
          <h3 className="font-serif text-base font-semibold text-card-foreground">
            Question {index + 1}
          </h3>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="p-6">
        {/* Image Upload */}
        <div className="mb-5">
          {question.imageUrl ? (
            <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-xl bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.imageUrl}
                alt={`Question ${index + 1} image`}
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => onUpdate({ ...question, imageUrl: undefined })}
                className="absolute right-2 top-2 rounded-full bg-foreground/60 p-1.5 text-background transition-colors hover:bg-foreground/80"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } ${uploading ? "pointer-events-none opacity-70" : ""}`}
            >
              {uploading ? (
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Drop a photo or click to upload"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground/60">
                A memory photo adds magic to the question (max 7MB)
              </span>
              {uploadError && (
                <span className="mt-2 text-xs text-destructive">{uploadError}</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Question Text */}
        <div className="mb-5">
          <Label htmlFor={`q-${question.id}`} className="mb-2 block text-sm font-medium text-card-foreground">
            Your Question
          </Label>
          <Input
            id={`q-${question.id}`}
            value={question.question}
            onChange={(e) => onUpdate({ ...question, question: e.target.value })}
            placeholder="e.g. Where did we have our first date?"
            className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Options */}
        <div className="mb-5">
          <Label className="mb-2 block text-sm font-medium text-card-foreground">
            Answer Choices
          </Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Click the heart to mark the correct answer
          </p>
          <div className="flex flex-col gap-3">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdate({ ...question, correctIndex: optionIndex })
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
                    question.correctIndex === optionIndex
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-primary/20"
                  }`}
                  aria-label={`Mark option ${optionIndex + 1} as correct`}
                >
                  {question.correctIndex === optionIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                </button>
                <Input
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
                {question.options.length > 2 && (
                  <button
                    onClick={() => removeOption(optionIndex)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove option ${optionIndex + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {question.options.length < 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={addOption}
              className="mt-2 text-sm text-primary hover:text-primary/80"
            >
              + Add another option
            </Button>
          )}
        </div>

        {/* Optional add-ons toggle area */}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Add a hint
            </button>
          )}
          {!showLoveNote && (
            <button
              onClick={() => setShowLoveNote(true)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <MessageCircleHeart className="h-3.5 w-3.5" />
              Add a love note
            </button>
          )}
        </div>

        {/* Hint field */}
        {showHint && (
          <div className="mt-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                <Lightbulb className="h-4 w-4 text-accent" />
                Hint
              </Label>
              <button
                onClick={() => {
                  setShowHint(false)
                  onUpdate({ ...question, hint: undefined })
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
            <Input
              value={question.hint || ""}
              onChange={(e) => onUpdate({ ...question, hint: e.target.value })}
              placeholder="e.g. Think about that rainy evening..."
              className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground/70">
              {"Your partner can reveal this if they're stuck"}
            </p>
          </div>
        )}

        {/* Love Note field */}
        {showLoveNote && (
          <div className="mt-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                <MessageCircleHeart className="h-4 w-4 text-primary" />
                Love Note
              </Label>
              <button
                onClick={() => {
                  setShowLoveNote(false)
                  onUpdate({ ...question, loveNote: undefined })
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
            <Textarea
              value={question.loveNote || ""}
              onChange={(e) => onUpdate({ ...question, loveNote: e.target.value })}
              placeholder="Write a little love note that appears after this question..."
              rows={3}
              className="resize-none rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground/70">
              This appears as a beautiful interlude after they answer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
