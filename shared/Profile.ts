export interface User {
  id: string
  email: string 
  username: string
  age: number
  avatar?: string
  createdAt?: string
  is_admin: boolean
}

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

