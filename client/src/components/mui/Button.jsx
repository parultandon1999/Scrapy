import '../../styles/mui/Button.css'

function Button({ 
  children, 
  variant = 'default', 
  size = 'medium', 
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) {
  const buttonClass = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading',
    disabled && 'btn-disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner"></span>
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={size === 'small' ? 14 : size === 'large' ? 20 : 16} className="btn-icon" />
      )}
      <span className="btn-text">{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={size === 'small' ? 14 : size === 'large' ? 20 : 16} className="btn-icon" />
      )}
    </button>
  )
}

export default Button
