import { useState, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'
import '../styles/Tour.css'

function Tour({ steps, onComplete, onSkip, showWelcome = true }) {
  const [currentStep, setCurrentStep] = useState(-1) // -1 for welcome screen
  const [isActive, setIsActive] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [spotlightRect, setSpotlightRect] = useState(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    // Check if user has completed tour
    const tourCompleted = localStorage.getItem('tourCompleted')
    if (!tourCompleted && showWelcome) {
      setIsActive(true)
    }
  }, [showWelcome])

  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      updatePositions()
      window.addEventListener('resize', updatePositions)
      window.addEventListener('scroll', updatePositions)
      
      return () => {
        window.removeEventListener('resize', updatePositions)
        window.removeEventListener('scroll', updatePositions)
      }
    }
  }, [currentStep, steps])

  const updatePositions = () => {
    if (currentStep < 0 || currentStep >= steps.length) return

    const step = steps[currentStep]
    const element = document.querySelector(step.target)
    
    if (!element) return

    const rect = element.getBoundingClientRect()
    setSpotlightRect(rect)

    // Calculate tooltip position
    const tooltipWidth = 400
    const tooltipHeight = 200
    const padding = 20

    let top = 0
    let left = 0
    let position = step.placement || 'bottom'

    switch (position) {
      case 'bottom':
        top = rect.bottom + padding
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
        break
      case 'top':
        top = rect.top - tooltipHeight - padding
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
        break
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
        left = rect.left - tooltipWidth - padding
        break
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2)
        left = rect.right + padding
        break
      default:
        top = rect.bottom + padding
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
    }

    // Keep tooltip in viewport
    if (left < 10) left = 10
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10
    }
    if (top < 10) top = 10
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = window.innerHeight - tooltipHeight - 10
    }

    setTooltipPosition({ top, left, position })
  }

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
      <>
        <div className="tour-overlay" onClick={handleSkip} />
        <div className="tour-welcome-modal">
          <div className="tour-welcome-icon">
            <Sparkles size={40} color="#fff" />
          </div>
          <h2 className="tour-welcome-title">Welcome to Web Scraper!</h2>
          <p className="tour-welcome-description">
            Let us show you around and help you get started with the key features. 
            This quick tour will only take a minute.
          </p>
          <div className="tour-welcome-actions">
            <button className="tour-welcome-btn tour-welcome-btn-skip" onClick={handleSkip}>
              Skip Tour
            </button>
            <button className="tour-welcome-btn tour-welcome-btn-start" onClick={handleStart}>
              <Sparkles size={20} />
              Start Tour
            </button>
          </div>
        </div>
      </>
    )
  }

  const step = steps[currentStep]
  if (!step) return null

  return (
    <>
      <div className="tour-overlay" />
      
      {spotlightRect && (
        <div 
          className="tour-spotlight"
          style={{
            top: spotlightRect.top - 4,
            left: spotlightRect.left - 4,
            width: spotlightRect.width + 8,
            height: spotlightRect.height + 8
          }}
        />
      )}

      <div 
        ref={tooltipRef}
        className={`tour-tooltip position-${tooltipPosition.position || 'bottom'}`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <div className="tour-tooltip-header">
          <h3 className="tour-tooltip-title">
            {step.icon && <span>{step.icon}</span>}
            {step.title}
          </h3>
          <button className="tour-tooltip-close" onClick={handleSkip}>
            <X size={20} />
          </button>
        </div>

        <div className="tour-tooltip-content">
          {step.content}
        </div>

        <div className="tour-tooltip-footer">
          <div className="tour-progress">
            <span>{currentStep + 1} of {steps.length}</span>
            <div className="tour-progress-dots">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`tour-progress-dot ${index === currentStep ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="tour-actions">
            {currentStep > 0 && (
              <button className="tour-btn tour-btn-back" onClick={handleBack}>
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button className="tour-btn tour-btn-next" onClick={handleNext}>
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button className="tour-btn tour-btn-finish" onClick={handleFinish}>
                <Check size={16} />
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Tour
