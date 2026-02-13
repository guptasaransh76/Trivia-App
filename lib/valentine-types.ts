export interface QuizQuestion {
  id: string
  question: string
  imageUrl?: string
  options: string[]
  correctIndex: number
  hint?: string
  loveNote?: string
}

export interface ValentineQuiz {
  partnerName: string
  senderName: string
  questions: QuizQuestion[]
  finalMessage?: string
  finalImageUrl?: string
}

export type AppScreen =
  | "landing"
  | "setup"
  | "preview"
  | "quiz"
  | "quiz-result"
  | "final-reveal"

export type SetupStep = "names" | "questions" | "final-message" | "preview"
