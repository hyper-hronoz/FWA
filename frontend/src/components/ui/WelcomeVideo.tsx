import { useState, useRef, useEffect } from 'react'
import './WelcomeVideo.css'
import { resolveMediaUrl } from '../../utils/media'

interface WelcomeVideoProps {
  videoSrc: string
}

export const WelcomeVideo = ({ videoSrc }: WelcomeVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const previousTimestampRef = useRef<number | null>(null)
  const [videoError, setVideoError] = useState(false)
  const resolvedVideoSrc = resolveMediaUrl(videoSrc)

  useEffect(() => {
    const cancelAnimation = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      previousTimestampRef.current = null
    }

    const timer = setTimeout(() => {
      if (videoRef.current && !videoError) {
        cancelAnimation()
        videoRef.current.pause()
        videoRef.current.play().catch(error => {
          console.log('Auto-play was prevented:', error)
          setVideoError(true)
        })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [videoError])

  useEffect(() => {
    const video = videoRef.current

    if (!video || videoError) {
      return
    }

    const cancelAnimation = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      previousTimestampRef.current = null
    }

    const stepBackward = (timestamp: number) => {
      if (!video.duration || Number.isNaN(video.duration)) {
        animationFrameRef.current = requestAnimationFrame(stepBackward)
        return
      }

      if (previousTimestampRef.current === null) {
        previousTimestampRef.current = timestamp
      }

      const deltaSeconds = (timestamp - previousTimestampRef.current) / 1000
      previousTimestampRef.current = timestamp
      const nextTime = Math.max(0, video.currentTime - deltaSeconds)

      video.currentTime = nextTime

      if (nextTime <= 0) {
        previousTimestampRef.current = null
        void video.play().catch(error => {
          console.log('Auto-play was prevented:', error)
          setVideoError(true)
        })
        return
      }

      animationFrameRef.current = requestAnimationFrame(stepBackward)
    }

    const handleLoadedMetadata = () => {
      previousTimestampRef.current = null
    }

    const handleEnded = () => {
      if (!video.duration || Number.isNaN(video.duration)) {
        return
      }

      previousTimestampRef.current = null
      video.pause()
      video.currentTime = video.duration
      cancelAnimation()
      animationFrameRef.current = requestAnimationFrame(stepBackward)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    return () => {
      cancelAnimation()
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
    }
  }, [resolvedVideoSrc, videoError])

  useEffect(() => {
    setVideoError(false)
  }, [videoSrc])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="welcome-video-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="welcome-video"
          autoPlay
          muted
          playsInline
          key={resolvedVideoSrc}
          src={resolvedVideoSrc}
          onError={(e) => {
            console.error('Video error:', e)
            setVideoError(true)
          }}
        >
          Your browser does not support the video tag.
        </video>
        
        <div className="shadow-overlay" />
        <div className="vignette-overlay" />
        <div className="edge-shadows">
          <div className="shadow-left" />
          <div className="shadow-right" />
        </div>
        <div className="dream-fog-left" />
        <div className="dream-fog-overlay" />
        <div className="dream-fog-left-glow" />
        <div className="dream-fog-glow" />
        
        {videoError && (
          <div className="video-fallback">
            <div className="fallback-content">
              <span className="fallback-emoji">✨</span>
              <span className="fallback-text">Добро пожаловать в мир аниме</span>
              <span className="fallback-emoji">✨</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
