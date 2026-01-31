import { useScrollAnimation } from '../hooks/useScrollAnimation'

/**
 * AnimatedCard - Card with scroll-triggered animation
 */
function AnimatedCard({ 
  children, 
  animation = 'fade-in-up',
  delay = 0,
  className = '',
  ...props 
}) {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <div
      ref={elementRef}
      className={`${animation} ${isVisible ? 'visible' : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export default AnimatedCard
