import type { Chan } from "@shared/Profile"

export interface ChanCardProps {
  chan: Chan
  onLike?: (chan: Chan) => void
  onSkip?: (chan: Chan) => void
}

