import { LinearProgress, CircularProgress, Box, Typography } from '@mui/material'

/**
 * Material-UI Progress Component Wrapper
 * 
 * Wrapper around Material-UI LinearProgress and CircularProgress components.
 * Supports both linear and circular progress indicators.
 * 
 * @param {string} type - Progress type (linear, circular)
 * @param {string} variant - Progress variant (determinate, indeterminate, buffer, query)
 * @param {number} value - Progress value (0-100)
 * @param {number} valueBuffer - Buffer value for buffer variant (0-100)
 * @param {string} color - Progress color (primary, secondary, error, warning, info, success, inherit)
 * @param {string} size - Size (small, medium, large) or custom number for circular
 * @param {number} thickness - Thickness for circular progress (1-10)
 * @param {boolean} showLabel - Show percentage label
 * @param {string} label - Custom label text
 * @param {string} className - Additional CSS classes
 */

function Progress({
  type = 'linear',
  variant = 'determinate',
  value = 0,
  valueBuffer = 10,
  color = 'primary',
  size = 'medium',
  thickness = 3.6,
  showLabel = false,
  label,
  className = '',
  ...props
}) {
  // Get size for circular progress
  const getCircularSize = () => {
    if (typeof size === 'number') return size
    
    const sizeMap = {
      small: 30,
      medium: 40,
      large: 60,
    }
    return sizeMap[size] || 40
  }

  // Render circular progress
  if (type === 'circular') {
    const circularProgress = (
      <CircularProgress
        variant={variant}
        value={value}
        color={color}
        size={getCircularSize()}
        thickness={thickness}
        className={className}
        style={{background: 'none'}}
        {...props}
      />
    )

    // Only wrap in Box if showing label
    if (!showLabel || variant !== 'determinate') {
      return circularProgress
    }

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {circularProgress}
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {label || `${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
    )
  }

  // Render linear progress
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant={variant}
        value={value}
        valueBuffer={valueBuffer}
        color={color}
        className={className}
        sx={{
          height: size === 'small' ? 4 : size === 'large' ? 10 : 6,
          borderRadius: 1,
        }}
        {...props}
      />
      {showLabel && variant === 'determinate' && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {label || `${Math.round(value)}%`}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default Progress
