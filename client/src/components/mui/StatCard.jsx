import Card from './Card'
import '../../styles/mui/StatCard.css'

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  variant = 'default',
  color = 'primary',
  onClick,
  className = '',
  ...props
}) {
  return (
    <Card
      variant={variant}
      padding="medium"
      clickable={!!onClick}
      onClick={onClick}
      className={`stat-card stat-card-${color} ${className}`}
      {...props}
    >
      <div className="stat-card-header">
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={24} />
          </div>
        )}
        <div className="stat-card-content">
          <div className="stat-card-title">{title}</div>
          <div className="stat-card-value">{value}</div>
          {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
        </div>
      </div>
      
      {(trend || trendValue) && (
        <div className={`stat-card-trend ${trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : ''}`}>
          {trendValue}
        </div>
      )}
    </Card>
  )
}

export default StatCard
