import '../../styles/mui/Card.css'

function Card({
  children,
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) {
  const cardClass = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hoverable && 'card-hoverable',
    clickable && 'card-clickable',
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cardClass}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
