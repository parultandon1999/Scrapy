import { useRipple } from '../hooks/useScrollAnimation'
import '../styles/AnimatedButton.css'

/**
 * AnimatedButton - Button with ripple effect and micro-interactions
 */
function AnimatedButton({ 
  children, 
  variant = 'default',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props 
}) {
  const { ripples, addRipple } = useRipple()

  const handleClick = (e) => {
    if (!disabled && !loading) {
      addRipple(e)
      if (onClick) {
        onClick(e)
      }
    }
  }

  return (
    <button
      className={`animated-btn animated-btn-${variant} animated-btn-${size} ${loading ? 'loading' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      
      {icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      
      <span className="btn-content">{children}</span>
      
      {icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
    </button>
  )
}

export default AnimatedButton
