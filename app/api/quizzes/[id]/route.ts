import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase"
import type { ValentineQuiz, QuizQuestion } from "@/lib/valentine-types"

function rowToQuiz(row: {
  id: string
  partner_name: string
  sender_name: string
  final_message: string | null
  final_image_url: string | null
  questions: unknown
}): ValentineQuiz {
  const questions = Array.isArray(row.questions)
    ? (row.questions as QuizQuestion[])
    : []
  return {
    partnerName: row.partner_name,
    senderName: row.sender_name,
    finalMessage: row.final_message ?? undefined,
    finalImageUrl: row.final_image_url ?? undefined,
    questions,
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Missing quiz id" }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, partner_name, sender_name, final_message, final_image_url, questions")
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Quiz not found or link expired" },
        { status: 404 }
      )
    }

    return NextResponse.json(rowToQuiz(data))
  } catch (e) {
    console.error("GET /api/quizzes/[id] error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
