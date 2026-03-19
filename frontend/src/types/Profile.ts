import type { Chan } from "@shared/Profile"

export interface ChanCardProps {
  chan: Chan
  onLike: (profileId: number) => void
  onSkip: (profileId: number) => void
}

