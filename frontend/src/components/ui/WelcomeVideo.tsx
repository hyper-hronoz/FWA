import { useState, useRef, useEffect } from 'react'
import './WelcomeVideo.css'
import { resolveMediaUrl } from '../../utils/media'

interface WelcomeVideoProps {
  videoSrc: string
  resolveSrc?: boolean
}

export const WelcomeVideo = ({ videoSrc, resolveSrc = true }: WelcomeVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const resolvedVideoSrc = resolveSrc ? resolveMediaUrl(videoSrc) : videoSrc

  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current && !videoError) {
        videoRef.current.play()
          .then(() => {
            console.log('Video playing successfully')
          })
          .catch(error => {
            console.log("Auto-play was prevented:", error)
            setVideoError(true)
          })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [videoError])

  useEffect(() => {
    setVideoError(false)
  }, [videoSrc])

  return (
    <div className="welcome-video-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="welcome-video"
          autoPlay
          muted
          loop
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
