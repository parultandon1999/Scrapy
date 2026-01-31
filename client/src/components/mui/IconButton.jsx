import '../../styles/mui/IconButton.css'

function IconButton({
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'medium',
  disabled = false,
  tooltip,
  className = '',
  ...props
}) {
  const buttonClass = [
    'icon-button',
    `icon-button-${variant}`,
    `icon-button-${size}`,
    className
  ].filter(Boolean).join(' ')

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {Icon && <Icon size={iconSize} />}
    </button>
  )
}

export default IconButton
