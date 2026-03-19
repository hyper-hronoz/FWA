import type { User } from "./Profile"

export interface NavbarProps {
  user: User
  currentIndex: number
  totalProfiles: number
  onLogout: () => void
}
