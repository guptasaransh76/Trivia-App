"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Play,
  Pencil,
  Heart,
  Copy,
  Check,
  Share2,
  Link,
  MessageCircleHeart,
  Lightbulb,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ValentineQuiz } from "@/lib/valentine-types"
import { generateShareUrlById } from "@/lib/share-utils"

interface PreviewScreenProps {
  quiz: ValentineQuiz
  onStartQuiz: () => void
  onEdit: () => void
}

export function PreviewScreen({ quiz, onStartQuiz, onEdit }: PreviewScreenProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showShareSection, setShowShareSection] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleGenerateLink = async () => {
    setSaveError(null)
    setSaveLoading(true)
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveError(data.error || "Failed to save quiz")
        return
      }
      const id = data.id as string
      if (id) {
        setShareUrl(generateShareUrlById(id))
        setShowShareSection(true)
      } else {
        setSaveError("Invalid response from server")
      }
    } catch {
      setSaveError("Could not connect. Try again.")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleNativeShare = async () => {
    if (!shareUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${quiz.senderName} has a surprise for ${quiz.partnerName}!`,
          text: `Hey ${quiz.partnerName}, someone special has a surprise waiting for you...`,
          url: shareUrl,
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  const questionsWithHints = quiz.questions.filter((q) => q.hint).length
  const questionsWithNotes = quiz.questions.filter((q) => q.loveNote).length
  const questionsWithImages = quiz.questions.filter((q) => q.imageUrl).length

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onEdit}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit
          </button>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {"Ready to Send"}
          </h1>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {"Here's a preview of what"} {quiz.partnerName} {"will experience. Share it when you're ready!"}
          </p>
        </div>

        {/* Quiz Summary Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-card-foreground">
                A surprise for {quiz.partnerName}
              </h2>
              <p className="text-sm text-muted-foreground">
                From {quiz.senderName} with love
              </p>
            </div>
          </div>

          {/* Stats badges */}
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {quiz.questions.length} question{quiz.questions.length > 1 ? "s" : ""}
            </Badge>
            {questionsWithImages > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {questionsWithImages} photo{questionsWithImages > 1 ? "s" : ""}
              </Badge>
            )}
            {questionsWithHints > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {questionsWithHints} hint{questionsWithHints > 1 ? "s" : ""}
              </Badge>
            )}
            {questionsWithNotes > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <MessageCircleHeart className="h-3 w-3" />
                {questionsWithNotes} love note{questionsWithNotes > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Questions list */}
          <div className="mb-6 flex flex-col gap-3">
            {quiz.questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-3 rounded-xl bg-muted/50 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">
                    {q.question || "Untitled question"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {q.options.length} options
                    </span>
                    <span>&middot;</span>
                    <span>
                      Answer: {q.options[q.correctIndex] || "Not set"}
                    </span>
                    {q.hint && (
                      <>
                        <span>&middot;</span>
                        <span className="flex items-center gap-0.5 text-accent">
                          <Lightbulb className="h-3 w-3" />
                          Hint
                        </span>
                      </>
                    )}
                    {q.loveNote && (
                      <>
                        <span>&middot;</span>
                        <span className="flex items-center gap-0.5 text-primary">
                          <MessageCircleHeart className="h-3 w-3" />
                          Note
                        </span>
                      </>
                    )}
                  </div>
                  {q.imageUrl && (
                    <div className="mt-2 aspect-square w-20 overflow-hidden rounded-lg bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.imageUrl}
                        alt={`Preview for question ${i + 1}`}
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Final message preview */}
          {quiz.finalMessage && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-1 text-xs font-medium text-primary">Final Message</p>
              <p className="text-sm text-card-foreground italic leading-relaxed">
                {'"'}{quiz.finalMessage}{'"'}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {/* Try it yourself */}
            <Button
              onClick={onStartQuiz}
              size="lg"
              className="group w-full rounded-full bg-primary py-6 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
            >
              <Play className="mr-2 h-5 w-5" />
              Preview the Experience
            </Button>

            {/* Generate shareable link */}
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
            {!showShareSection ? (
              <Button
                onClick={handleGenerateLink}
                disabled={saveLoading}
                variant="outline"
                size="lg"
                className="w-full rounded-full border-border text-foreground"
              >
                {saveLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving & generating link...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Generate Shareable Link
                  </>
                )}
              </Button>
            ) : (
              <div className="animate-fade-in-up rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-3 text-sm font-medium text-card-foreground">
                  Share this link with {quiz.partnerName}
                </p>
                <div className="mb-3 flex gap-2">
                  <div className="flex-1 overflow-hidden rounded-lg border border-border bg-background px-3 py-2">
                    <p className="truncate text-xs text-muted-foreground font-mono">
                      {shareUrl}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-lg"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="mb-2 text-xs text-green-700 font-medium animate-fade-in-up">
                    Link copied! Send it to {quiz.partnerName}
                  </p>
                )}
                {typeof navigator !== "undefined" && navigator.share && (
                  <Button
                    onClick={handleNativeShare}
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-lg text-sm text-primary"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share via apps
                  </Button>
                )}
                <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed">
                  This link includes all photos, questions, hints, and love notes.
                  Share it with {quiz.partnerName} when you&apos;re ready!
                </p>
              </div>
            )}

            <Button
              onClick={onEdit}
              variant="ghost"
              className="w-full rounded-full text-muted-foreground"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Go Back & Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
