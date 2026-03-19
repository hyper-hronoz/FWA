import type { Chan } from "@shared/Profile"

export interface SwipeScreenProps {
  chan: Chan
  onLike: (profileId: number) => void
  onSkip: (profileId: number) => void
}
