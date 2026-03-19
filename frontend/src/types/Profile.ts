export interface Chan {
  id: number
  username: string
  age: number
  bio: string
  interests: string[]
  avatar: string
  video: string
  favoriteAnime: string
}

export interface ChanCardProps {
  chan: Chan
  onLike: (profileId: number) => void
  onSkip: (profileId: number) => void
}

export interface User {
  id: string
  email: string 
  username: string
  age: number
  avatar?: string
  createdAt?: string
}
