import { useState, useRef, useEffect } from 'react'

interface SwipeHandlers {
  onLike?: () => void
  onSkip?: () => void
}

export const useSwipe = ({ onLike, onSkip }: SwipeHandlers) => {
  const [startX, setStartX] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const threshold = 100 // минимальное расстояние для свайпа

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!startX || !isDragging) return
    
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    setOffset(diff)
    
    // Визуальный эффект при свайпе
    if (elementRef.current) {
      const opacity = Math.min(Math.abs(diff) / threshold, 1)
      const rotate = diff * 0.1
      elementRef.current.style.transform = `translateX(${diff}px) rotate(${rotate}deg)`
      
      // Показываем индикатор лайка/скипа
      if (diff > 0) {
        elementRef.current.style.boxShadow = `0 0 20px rgba(255, 77, 109, ${opacity})`
      } else {
        elementRef.current.style.boxShadow = `0 0 20px rgba(74, 74, 74, ${opacity})`
      }
    }
  }

  const handleTouchEnd = () => {
    if (!startX || !isDragging) return
    
    const diff = offset
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onLike) {
        onLike()
      } else if (diff < 0 && onSkip) {
        onSkip()
      }
    }
    
    // Сброс позиции
    setStartX(null)
    setOffset(0)
    setIsDragging(false)
    
    if (elementRef.current) {
      elementRef.current.style.transform = ''
      elementRef.current.style.boxShadow = ''
    }
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startX, isDragging, offset])

  return { elementRef, isDragging }
}
