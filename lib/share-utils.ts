import type { ValentineQuiz } from "./valentine-types"

/**
 * Encode a quiz into a URL-safe base64 string.
 * We strip out imageUrl/finalImageUrl before encoding to keep URL size manageable.
 * Images are large base64 data and would exceed URL limits.
 */
export function encodeQuiz(quiz: ValentineQuiz): string {
  const stripped: ValentineQuiz = {
    ...quiz,
    finalImageUrl: undefined,
    questions: quiz.questions.map((q) => ({
      ...q,
      imageUrl: undefined, // strip images for URL size
    })),
  }
  const json = JSON.stringify(stripped)
  // Use TextEncoder for reliable UTF-8 encoding
  const bytes = new TextEncoder().encode(json)
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("")
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Decode a URL-safe base64 string back into a quiz object.
 */
export function decodeQuiz(encoded: string): ValentineQuiz | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    while (base64.length % 4 !== 0) {
      base64 += "="
    }
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)

    // Basic validation
    if (
      typeof parsed.partnerName !== "string" ||
      typeof parsed.senderName !== "string" ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      return null
    }

    return parsed as ValentineQuiz
  } catch {
    return null
  }
}

/**
 * Generate a shareable URL with the quiz data encoded in the hash.
 */
export function generateShareUrl(quiz: ValentineQuiz): string {
  const encoded = encodeQuiz(quiz)
  const base = typeof window !== "undefined" ? window.location.origin : ""
  return `${base}/?v=${encoded}`
}

/**
 * Generate a shareable URL by quiz id (after saving to backend).
 * Photos are loaded from storage when the partner opens the link.
 */
export function generateShareUrlById(quizId: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : ""
  return `${base}/?id=${encodeURIComponent(quizId)}`
}

/**
 * Check the current URL for quiz data and extract it.
 */
export function extractQuizFromUrl(): ValentineQuiz | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const data = params.get("v")
  if (!data) return null
  return decodeQuiz(data)
}
