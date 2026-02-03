import * as MuiIcons from '@mui/icons-material'

/**
 * Material-UI Icon Component Wrapper
 * 
 * Centralized wrapper for all Material-UI icons.
 * Provides consistent sizing, colors, and styling across the app.
 * 
 * @param {string} name - Icon name from Material-UI (e.g., 'Home', 'Settings', 'Delete')
 * @param {string} size - Icon size (small: 20px, medium: 24px, large: 32px, or custom number)
 * @param {string} color - Icon color (inherit, primary, secondary, action, disabled, error, or custom hex/rgb)
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler
 * @param {object} style - Additional inline styles
 */

function Icon({
  name,
  size = 'medium',
  color = 'inherit',
  className = '',
  onClick,
  style = {},
  ...props
}) {
  const IconComponent = MuiIcons[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Material-UI icons`)
    return null
  }

  // Map size to fontSize
  const getFontSize = () => {
    if (typeof size === 'number') return size
    
    const sizeMap = {
      small: 20,
      medium: 24,
      large: 32,
    }
    return sizeMap[size] || 24
  }

  return (
    <IconComponent
      sx={{
        fontSize: getFontSize(),
        color: color,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={className}
      onClick={onClick}
      {...props}
    />
  )
}

export default Icon
