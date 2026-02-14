import { createSupabaseClient } from "@/lib/supabase"

const BUCKET = "quiz-images"
const MAX_FILE_BYTES = 2 * 1024 * 1024 // 2MB

export function getExtFromFile(file: File): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  }
  return mimeToExt[file.type] || "jpg"
}

/**
 * Upload an image file to Supabase Storage from the client.
 * Returns the public URL on success, or throws on error.
 */
export async function uploadImageToStorage(
  path: string,
  file: File
): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image must be under 2MB")
  }
  const supabase = createSupabaseClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
