"use client"

import { useEffect, useState } from "react"
import { useIsFetching } from "@tanstack/react-query"

export function TopProgressBar() {
  const isFetching = useIsFetching()
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let progressInterval: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout

    const shouldShowProgress = isFetching > 0

    if (shouldShowProgress) {
      setIsVisible(true)
      setProgress(0)

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Slowly increase to 90% while fetching
          if (prev < 90) {
            return prev + (90 - prev) * 0.1
          }
          return prev
        })
      }, 200)
    } else {
      // Complete the progress bar
      setProgress(100)
      
      // Hide after animation completes
      timeoutId = setTimeout(() => {
        setIsVisible(false)
        setProgress(0)
      }, 500)
    }

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timeoutId)
    }
  }, [isFetching])

  if (!isVisible && progress === 0) {
    return null
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 z-100 overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0, transition: "opacity 300ms ease-in-out" }}
    >
      <div 
        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600"
        style={{ 
          width: `${progress}%`,
          transition: "width 300ms ease-in-out",
        }}
      />
    </div>
  )
}
