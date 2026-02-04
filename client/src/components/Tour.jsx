import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  Paper,
  LinearProgress,
  Fade,
  IconButton,
} from '@mui/material'
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
      const tooltipHeight = 200
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
      <Dialog 
        open={true} 
        onClose={handleSkip}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 3,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="AutoAwesome" size={32} sx={{ color: 'white' }} />
          </Box>
          
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            Welcome to Web Scraper
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Quick tour of key features. Takes just a minute.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outline" onClick={handleSkip} fullWidth>
              Skip
            </Button>
            <Button variant="primary" onClick={handleStart} fullWidth>
              <Icon name="AutoAwesome" size={18} />
              Start
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  const step = steps[currentStep]
  if (!step || !spotlightRect) return null

  return (
    <>
      {/* Spotlight overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: spotlightRect.top - 4,
          left: spotlightRect.left - 4,
          width: spotlightRect.width + 8,
          height: spotlightRect.height + 8,
          zIndex: 9999,
          borderRadius: 1,
          border: '2px solid',
          borderColor: 'primary.main',
          pointerEvents: 'none',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
          transition: 'all 0.3s ease-out',
        }}
      />

      {/* Tooltip */}
      <Fade in={true}>
        <Paper
          ref={tooltipRef}
          elevation={8}
          sx={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: 320,
            zIndex: 10000,
            p: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {step.title}
            </Typography>
            <IconButton size="small" onClick={handleSkip}>
              <Icon name="Close" size={16} />
            </IconButton>
          </Box>

          {/* Content */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {step.content}
          </Typography>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {currentStep + 1} of {steps.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={((currentStep + 1) / steps.length) * 100}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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
          </Box>
        </Paper>
      </Fade>
    </>
  )
}

export default Tour
