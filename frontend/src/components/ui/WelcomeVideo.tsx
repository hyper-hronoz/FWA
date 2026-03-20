import { useState, useRef, useEffect } from 'react'
import './WelcomeVideo.css'

interface WelcomeVideoProps {
  videoSrc: string
}

export const WelcomeVideo = ({ videoSrc }: WelcomeVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

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
          key={videoSrc} 
          onError={(e) => {
            console.error('Video error:', e)
            setVideoError(true)
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="shadow-overlay" />
        <div className="vignette-overlay" />
        <div className="edge-shadows">
          <div className="shadow-left" />
          <div className="shadow-right" />
        </div>
        
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
