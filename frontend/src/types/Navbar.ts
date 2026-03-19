import type { User } from "@shared/Profile"

export interface NavbarProps {
  user: User
  currentIndex: number
  totalProfiles: number
  onLogout: () => void
}
