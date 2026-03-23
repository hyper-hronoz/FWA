import { API_BASE_URL } from "../config/api"

export const resolveMediaUrl = (value?: string | null) => {
  if (!value) return ""

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`
  }

  return value
}
