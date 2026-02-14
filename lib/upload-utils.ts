import heic2any from "heic2any"
import { createSupabaseClient } from "@/lib/supabase"

const BUCKET = "quiz-images"
const MAX_FILE_BYTES = 7 * 1024 * 1024 // 7MB

export function getExtFromFile(file: File): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/heic": "jpg",
    "image/heif": "jpg",
  }
  return mimeToExt[file.type] || "jpg"
}

/**
 * Convert HEIC/HEIF to JPEG in the browser (browsers can't display HEIC natively).
 */
async function ensureStandardFormat(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  if (!isHeic) return file

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  })
  const blob = Array.isArray(converted) ? converted[0] : converted
  const name = file.name.replace(/\.(heic|heif)$/i, ".jpg")
  return new File([blob], name, { type: "image/jpeg" })
}

/**
 * Upload an image file to Supabase Storage from the client.
 * HEIC/HEIF files are converted to JPEG before upload (browsers can't display HEIC).
 * Returns the public URL on success, or throws on error.
 */
export async function uploadImageToStorage(
  path: string,
  file: File
): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image must be under 7MB")
  }
  const standardFile = await ensureStandardFormat(file)
  const supabase = createSupabaseClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, standardFile, {
      contentType: standardFile.type,
      upsert: true,
    })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
