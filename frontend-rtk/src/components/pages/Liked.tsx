import React, { useEffect, useState } from "react"
import ChanCard from "../profile/ChanCard"

import { useAppSelector } from "../../redux/hooks"
import {
  useGetFavoritesQuery,
  useSendUnlikeMutation,
} from "../../redux/services/backendApi"

import type { Chan } from "@shared/Profile"

export default function Liked() {
  const user = useAppSelector((s) => s.session.user)
  const { data: likedProfiles = [], isLoading, refetch } = useGetFavoritesQuery(
    undefined,
    { skip: !user }
  )
  const [sendUnlike] = useSendUnlikeMutation()
  const [localProfiles, setLocalProfiles] = useState<Chan[]>([])

  useEffect(() => {
    setLocalProfiles(likedProfiles)
  }, [likedProfiles])

  const handleSkip = async (chan: Chan) => {
    await sendUnlike(chan.id)
    setLocalProfiles((prev) => prev.filter((c) => c.id !== chan.id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft text-lg">
        Загрузка лайкнутых тян...
      </div>
    )
  }

  if (!localProfiles.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-anime-textSoft text-lg gap-4">
        <p>Пока нет лайкнутых тян 😢</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background to-purple-900 p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-anime-text mb-6 text-center">
        Лайкнутые тян
      </h2>

      <div className="mx-auto w-full max-w-[1200px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {localProfiles.map((chan: Chan) => (
          <div key={chan.id} className="w-full max-w-[360px] h-full">
            <ChanCard chan={chan} onSkip={() => void handleSkip(chan)} />
          </div>
        ))}
      </div>
    </div>
  )
}
