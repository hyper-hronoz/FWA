import type { Chan } from "@shared/Profile"

/**
 * GET /girls/liked возвращает сразу массив девушек.
 * Другие эндпоинты часто отдают { data: Chan[] }.
 */
export function normalizeGirlListPayload(body: unknown): Chan[] {
  if (Array.isArray(body)) return body as Chan[]
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray((body as { data: unknown }).data)
  ) {
    return (body as { data: Chan[] }).data
  }
  return []
}
