import { Card, CardContent, Box, Typography, Avatar } from '@mui/material'

/**
 * Material-UI StatCard Component
 * 
 * Statistics card component using Material-UI Card.
 * Displays a stat with icon, title, value, subtitle, and optional trend.
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main stat value
 * @param {React.Component} icon - Icon component
 * @param {string} trend - Trend direction (up, down)
 * @param {string} trendValue - Trend value text
 * @param {string} subtitle - Subtitle text
 * @param {string} color - Color variant (primary, secondary, success, error, warning, info)
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 */

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  color = 'primary',
  onClick,
  className = '',
  ...props
}) {
  // Map color names to MUI colors
  const getColor = () => {
    switch (color) {
      case 'danger':
        return 'error'
      default:
        return color
    }
  }

  const muiColor = getColor()

  // Trend color
  const getTrendColor = () => {
    if (trend === 'up') return 'success.main'
    if (trend === 'down') return 'error.main'
    return 'text.secondary'
  }

  return (
    <Card
      onClick={onClick}
      className={className}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
      }}
      {...props}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {Icon && (
            <Avatar
              sx={{
                bgcolor: `${muiColor}.main`,
                width: 48,
                height: 48,
              }}
            >
              <Icon size={24} />
            </Avatar>
          )}
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              {title}
            </Typography>
            
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
            >
              {value}
            </Typography>
            
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {(trend || trendValue) && (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              fontWeight: 'medium',
              color: getTrendColor(),
            }}
          >
            {trendValue}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default StatCard
