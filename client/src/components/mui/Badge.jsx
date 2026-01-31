import '../../styles/mui/Badge.css'

function Badge({
  children,
  variant = 'default',
  size = 'medium',
  icon: Icon,
  dot = false,
  className = '',
  ...props
}) {
  const badgeClass = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    dot && 'badge-dot',
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={badgeClass} {...props}>
      {dot && <span className="badge-dot-indicator" />}
      {Icon && <Icon size={size === 'small' ? 12 : size === 'large' ? 16 : 14} />}
      {children}
    </span>
  )
}

export default Badge
