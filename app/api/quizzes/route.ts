import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase"
import type { ValentineQuiz, QuizQuestion } from "@/lib/valentine-types"

function isValidUuid(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function isBase64DataUrl(url: string | undefined): boolean {
  return typeof url === "string" && url.startsWith("data:")
}

/**
 * Strip base64 image URLs to keep payload small. Client uploads images
 * directly to Supabase Storage, so we should not receive base64.
 */
function sanitizeQuestion(q: QuizQuestion): QuizQuestion {
  if (isBase64DataUrl(q.imageUrl)) {
    return { ...q, imageUrl: undefined }
  }
  return q
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValentineQuiz & { id?: string }

    if (
      !body.partnerName ||
      !body.senderName ||
      !Array.isArray(body.questions) ||
      body.questions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid quiz: partnerName, senderName, and at least one question required",
        },
        { status: 400 }
      )
    }

    const quizId =
      body.id && isValidUuid(body.id) ? body.id : crypto.randomUUID()

    const questions: QuizQuestion[] = body.questions.map(sanitizeQuestion)

    let finalImageUrl: string | undefined = body.finalImageUrl
    if (isBase64DataUrl(finalImageUrl)) {
      finalImageUrl = undefined
    }

    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from("quizzes").insert({
      id: quizId,
      partner_name: body.partnerName,
      sender_name: body.senderName,
      final_message: body.finalMessage ?? null,
      final_image_url: finalImageUrl ?? null,
      questions,
    })

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { error: "Failed to save quiz" },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: quizId })
  } catch (e) {
    console.error("POST /api/quizzes error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
