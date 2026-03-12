import React from 'react'
import { useAuth } from './hooks/useAuth'

export const DevNavigation = () => {
  const { debugNavigate } = useAuth()

  // Основные страницы сайта
  const pages = [
    { label: 'Swipe', path: '/swipe' },
    { label: 'Login', path: '/auth/login' },
    { label: 'Register', path: '/auth/register' },
    { label: 'Profile', path: '/profile' },
    { label: 'Messages', path: '/messages' },
    { label: 'Matches', path: '/matches' },
  ]

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-purple-900 bg-opacity-90 text-white rounded-lg shadow-lg z-50">
      <h3 className="mb-2 font-bold text-center">Dev Navigation</h3>
      <div className="flex flex-col gap-2">
        {pages.map((page) => (
          <button
            key={page.path}
            onClick={() => debugNavigate(page.path)}
            className="w-full bg-gradient-to-r from-anime-primary to-anime-secondary py-2 rounded-md text-white font-bold hover:opacity-90 transition"
          >
            {page.label}
          </button>
        ))}
      </div>
    </div>
  )
}
