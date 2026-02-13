import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase"
import type { ValentineQuiz, QuizQuestion } from "@/lib/valentine-types"

const BUCKET = "quiz-images"
const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2MB

function isBase64DataUrl(url: string | undefined): boolean {
  return typeof url === "string" && url.startsWith("data:")
}

/**
 * Parse data URL and return buffer + extension for storage.
 */
function parseDataUrl(dataUrl: string): { buffer: Buffer; ext: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  const mime = match[1]
  const base64 = match[2]
  const buffer = Buffer.from(base64, "base64")
  if (buffer.length > MAX_IMAGE_BYTES) return null
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  }
  const ext = extMap[mime] || "jpg"
  return { buffer, ext }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValentineQuiz

    if (
      !body.partnerName ||
      !body.senderName ||
      !Array.isArray(body.questions) ||
      body.questions.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid quiz: partnerName, senderName, and at least one question required" },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const quizId = crypto.randomUUID()

    const questionsWithUrls: QuizQuestion[] = await Promise.all(
      body.questions.map(async (q, index) => {
        if (!isBase64DataUrl(q.imageUrl)) {
          return { ...q, imageUrl: q.imageUrl }
        }
        const parsed = parseDataUrl(q.imageUrl!)
        if (!parsed) return { ...q, imageUrl: undefined }
        const path = `${quizId}/q-${index}.${parsed.ext}`
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, parsed.buffer, { contentType: `image/${parsed.ext === "jpg" ? "jpeg" : parsed.ext}` })
        if (error) return { ...q, imageUrl: undefined }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        return { ...q, imageUrl: data.publicUrl }
      })
    )

    let finalImageUrl: string | undefined = body.finalImageUrl
    if (isBase64DataUrl(body.finalImageUrl)) {
      const parsed = parseDataUrl(body.finalImageUrl!)
      if (parsed) {
        const path = `${quizId}/final.${parsed.ext}`
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, parsed.buffer, { contentType: `image/${parsed.ext === "jpg" ? "jpeg" : parsed.ext}` })
        if (!error) {
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
          finalImageUrl = data.publicUrl
        }
      }
    }

    const { error } = await supabase.from("quizzes").insert({
      id: quizId,
      partner_name: body.partnerName,
      sender_name: body.senderName,
      final_message: body.finalMessage ?? null,
      final_image_url: finalImageUrl ?? null,
      questions: questionsWithUrls,
    })

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 })
    }

    return NextResponse.json({ id: quizId })
  } catch (e) {
    console.error("POST /api/quizzes error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
