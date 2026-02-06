import { useState, useEffect, useRef } from 'react'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'

function Tour({ steps, onComplete, onSkip, showWelcome = true }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isActive, setIsActive] = useState(() => {
    if (typeof window === 'undefined') return false
    const tourCompleted = localStorage.getItem('tourCompleted')
    return !tourCompleted && showWelcome
  })
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [spotlightRect, setSpotlightRect] = useState(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (!isActive) return
    if (currentStep < 0 || currentStep >= steps.length) return

    const updatePositions = () => {
      const step = steps[currentStep]
      const element = document.querySelector(step.target)
      
      if (!element) return

      const rect = element.getBoundingClientRect()
      setSpotlightRect(rect)

      const tooltipWidth = 320
      const padding = 16

      let top = rect.bottom + padding
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2)

      if (left < 10) left = 10
      if (top < 10) top = 10
      
      const windowWidth = window.innerWidth
      if (left + tooltipWidth > windowWidth) {
        left = windowWidth - tooltipWidth - 20
      }

      setTooltipPosition({ top, left })
    }

    updatePositions()
    
    window.addEventListener('resize', updatePositions)
    window.addEventListener('scroll', updatePositions)
    
    let resizeObserver
    const element = document.querySelector(steps[currentStep].target)
    if (element) {
      resizeObserver = new ResizeObserver(updatePositions)
      resizeObserver.observe(element)
    }

    return () => {
      window.removeEventListener('resize', updatePositions)
      window.removeEventListener('scroll', updatePositions)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [currentStep, steps, isActive])

  const handleStart = () => {
    setCurrentStep(0)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setIsActive(false)
    localStorage.setItem('tourCompleted', 'true')
    if (onSkip) onSkip()
  }

  const handleFinish = () => {
    setIsActive(false)
    localStorage.setItem('tourCompleted', 'true')
    if (onComplete) onComplete()
  }

  if (!isActive) return null

  // Welcome screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-6 text-center">
          
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <Icon name="AutoAwesome" size={32} />
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Welcome to Web Scraper
          </h2>
          
          <p className="text-sm text-gray-600 mb-6">
            Quick tour of key features. Takes just a minute.
          </p>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <Button variant="outline" onClick={handleSkip} style={{ width: '100%' }}>
                Skip
              </Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={handleStart} style={{ width: '100%' }}>
                <Icon name="AutoAwesome" size={18} />
                Start
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const step = steps[currentStep]
  if (!step || !spotlightRect) return null

  return (
    <>
      {/* Spotlight overlay */}
      <div
        className="fixed z-[9999] rounded pointer-events-none border-2 border-blue-600 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out"
        style={{
          top: spotlightRect.top - 4,
          left: spotlightRect.left - 4,
          width: spotlightRect.width + 8,
          height: spotlightRect.height + 8,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-[320px] p-4 bg-white rounded-lg shadow-xl animate-in fade-in duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {step.title}
          </h3>
          <button 
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1"
          >
            <Icon name="Close" size={16} />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-4">
          {step.content}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <span className="text-xs text-gray-500 mb-1 block">
            {currentStep + 1} of {steps.length}
          </span>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {currentStep > 0 && (
            <Button variant="outline" size="small" onClick={handleBack}>
              <Icon name="ChevronLeft" size={16} />
              Back
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button variant="primary" size="small" onClick={handleNext}>
              Next
              <Icon name="ChevronRight" size={16} />
            </Button>
          ) : (
            <Button variant="success" size="small" onClick={handleFinish}>
              <Icon name="Check" size={16} />
              Finish
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default Tour