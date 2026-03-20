import type { User } from "@shared/Profile"

export interface NavbarProps {
  user: User
  totalProfiles: number
  onLogout: () => void
}
