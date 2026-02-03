import { Badge as MuiBadge, Chip } from '@mui/material'

/**
 * Material-UI Badge Component Wrapper
 * 
 * Wrapper around Material-UI Badge and Chip components.
 * Supports both badge overlays (for icons/avatars) and standalone chips (for labels/tags).
 * 
 * @param {React.ReactNode} children - Content to wrap with badge (for overlay mode)
 * @param {string} variant - Badge style variant (standard, dot, chip)
 * @param {string} color - Badge color (default, primary, secondary, error, warning, info, success)
 * @param {string|number} content - Badge content (number or text)
 * @param {string} size - Badge size (small, medium)
 * @param {boolean} invisible - Hide badge
 * @param {number} max - Max count to display (e.g., 99+)
 * @param {boolean} showZero - Show badge when content is 0
 * @param {string} anchorOrigin - Badge position (top-right, top-left, bottom-right, bottom-left)
 * @param {string} chipVariant - Chip variant (filled, outlined) when variant="chip"
 * @param {function} onDelete - Delete handler for chip
 * @param {React.Component} icon - Icon component
 * @param {boolean} clickable - Make chip clickable
 * @param {function} onClick - Click handler
 */

function Badge({
  children,
  variant = 'standard',
  color = 'primary',
  content,
  size = 'medium',
  invisible = false,
  max = 99,
  showZero = false,
  anchorOrigin,
  chipVariant = 'filled',
  onDelete,
  icon: Icon,
  clickable = false,
  onClick,
  className = '',
  ...props
}) {
  // If variant is "chip", render as a Chip (standalone label/tag)
  if (variant === 'chip') {
    return (
      <Chip
        label={content || children}
        color={color}
        size={size}
        variant={chipVariant}
        onDelete={onDelete}
        icon={Icon ? <Icon size={16} /> : undefined}
        clickable={clickable}
        onClick={onClick}
        className={className}
        {...props}
      />
    )
  }

  // Parse anchorOrigin string to object
  const getAnchorOrigin = () => {
    if (!anchorOrigin) return undefined
    
    const [vertical, horizontal] = anchorOrigin.split('-')
    return {
      vertical: vertical === 'top' ? 'top' : 'bottom',
      horizontal: horizontal === 'right' ? 'right' : 'left',
    }
  }

  // Render as Badge overlay (wraps children)
  return (
    <MuiBadge
      badgeContent={content}
      color={color}
      variant={variant}
      invisible={invisible}
      max={max}
      showZero={showZero}
      anchorOrigin={getAnchorOrigin()}
      className={className}
      {...props}
    >
      {children}
    </MuiBadge>
  )
}

export default Badge
