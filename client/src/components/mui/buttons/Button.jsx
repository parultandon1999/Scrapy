import { Button as MuiButton, IconButton as MuiIconButton, CircularProgress } from '@mui/material'

/**
 * Material-UI Button Component Wrapper
 * 
 * Simple wrapper around Material-UI buttons using their default styling.
 * Maps custom variant names to Material-UI's built-in variants and colors.
 */

function Button({ 
  children, 
  variant = 'contained',
  size = 'medium',
  icon: Icon,
  iconPosition = 'left',
  iconOnly = false,
  active = false,
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  title,
  ...props 
}) {
  // Map custom variants to MUI variants and colors
  const getMuiProps = () => {
    switch (variant) {
      case 'primary':
        return { variant: 'contained', color: 'primary' }
      
      case 'secondary':
        return { variant: 'contained', color: 'secondary' }
      
      case 'success':
        return { variant: 'contained', color: 'success' }
      
      case 'danger':
        return { variant: 'contained', color: 'error' }
      
      case 'warning':
        return { variant: 'contained', color: 'warning' }
      
      case 'ghost':
        return { variant: 'text', color: 'inherit' }
      
      case 'outline':
        return { variant: 'outlined', color: 'primary' }
      
      case 'link':
        return { variant: 'text', color: 'primary' }
      
      case 'nav':
        return { variant: 'text', color: 'inherit', sx: { justifyContent: 'flex-start' } }
      
      case 'sidebar':
        return { variant: 'outlined', color: 'inherit' }
      
      case 'submit':
        return { variant: 'contained', color: 'primary' }
      
      case 'icon':
        return { variant: 'text', color: 'inherit' }
      
      case 'default':
      default:
        return { variant: 'outlined', color: 'inherit' }
    }
  }

  const muiProps = getMuiProps()
  const iconElement = Icon ? <Icon size={size === 'small' ? 18 : size === 'large' ? 24 : 20} /> : null

  // Icon-only button
  if (iconOnly) {
    return (
      <MuiIconButton
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        size={size}
        color={muiProps.color}
        className={className}
        aria-label={ariaLabel}
        title={title}
        {...props}
      >
        {loading ? <CircularProgress size={20} /> : iconElement}
      </MuiIconButton>
    )
  }

  // Regular button
  return (
    <MuiButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      size={size}
      fullWidth={fullWidth}
      className={`${className} ${active ? 'active' : ''}`}
      aria-label={ariaLabel}
      title={title}
      startIcon={!loading && iconPosition === 'left' ? iconElement : loading ? <CircularProgress size={20} /> : null}
      endIcon={!loading && iconPosition === 'right' ? iconElement : null}
      {...muiProps}
      {...props}
    >
      {children}
    </MuiButton>
  )
}

export default Button
