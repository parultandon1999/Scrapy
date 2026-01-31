import { useEffect, useRef, useState } from 'react'

/**
 * Hook for scroll-triggered animations
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.triggerOnce - Only trigger animation once
 * @returns {Object} - Ref and visibility state
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options

  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return { elementRef, isVisible }
}

/**
 * Hook for stagger animations on list items
 * @param {number} itemCount - Number of items to animate
 * @param {number} delay - Delay between each item (ms)
 * @returns {Array} - Array of visibility states
 */
export function useStaggerAnimation(itemCount, delay = 50) {
  const [visibleItems, setVisibleItems] = useState([])

  useEffect(() => {
    const timeouts = []
    
    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => [...prev, i])
      }, i * delay)
      
      timeouts.push(timeout)
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [itemCount, delay])

  return visibleItems
}

/**
 * Hook for hover state with delay
 * @param {number} delay - Delay before showing hover state (ms)
 * @returns {Object} - Hover state and handlers
 */
export function useHoverDelay(delay = 200) {
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  }
}

/**
 * Hook for ripple effect on click
 * @returns {Object} - Ripple state and handler
 */
export function useRipple() {
  const [ripples, setRipples] = useState([])

  const addRipple = (event) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    }

    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)
  }

  return { ripples, addRipple }
}

/**
 * Hook for parallax scroll effect
 * @param {number} speed - Parallax speed multiplier
 * @returns {Object} - Ref and transform style
 */
export function useParallax(speed = 0.5) {
  const elementRef = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const scrolled = window.pageYOffset
        const rate = scrolled * speed
        setOffset(rate)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return {
    elementRef,
    style: {
      transform: `translateY(${offset}px)`
    }
  }
}

/**
 * Hook for counting animation
 * @param {number} end - End value
 * @param {number} duration - Animation duration (ms)
 * @param {number} start - Start value
 * @returns {number} - Current count value
 */
export function useCountUp(end, duration = 1000, start = 0) {
  const [count, setCount] = useState(start)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isAnimating) return

    setIsAnimating(true)
    const startTime = Date.now()
    const range = end - start

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeOutQuad = progress * (2 - progress) // Easing function
      const current = start + range * easeOutQuad

      setCount(Math.floor(current))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, start])

  return count
}

/**
 * Hook for typewriter effect
 * @param {string} text - Text to type
 * @param {number} speed - Typing speed (ms per character)
 * @returns {string} - Current typed text
 */
export function useTypewriter(text, speed = 50) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return displayText
}

/**
 * Hook for fade in/out transitions
 * @param {boolean} show - Whether to show element
 * @param {number} duration - Transition duration (ms)
 * @returns {Object} - Visibility state and style
 */
export function useFadeTransition(show, duration = 300) {
  const [shouldRender, setShouldRender] = useState(show)
  const [opacity, setOpacity] = useState(show ? 1 : 0)

  useEffect(() => {
    if (show) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        setOpacity(1)
      })
    } else {
      setOpacity(0)
      const timeout = setTimeout(() => {
        setShouldRender(false)
      }, duration)
      return () => clearTimeout(timeout)
    }
  }, [show, duration])

  return {
    shouldRender,
    style: {
      opacity,
      transition: `opacity ${duration}ms ease-in-out`
    }
  }
}
