import { Link as RouterLink } from 'react-router-dom'
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material'
import { Home } from 'lucide-react'

/**
 * Material-UI Breadcrumb Component Wrapper
 * 
 * Wrapper around Material-UI Breadcrumbs component.
 * Shows navigation path with Home icon and custom items.
 * 
 * @param {array} items - Breadcrumb items [{label, path, icon}]
 * @param {boolean} showHome - Show home link
 * @param {string} separator - Separator character (default: '/')
 * @param {number} maxItems - Max items to display before collapsing
 * @param {string} className - Additional CSS classes
 */

function Breadcrumb({ 
  items = [], 
  showHome = true, 
  separator = '/',
  maxItems,
  className = '' 
}) {
  return (
    <MuiBreadcrumbs 
      separator={separator}
      maxItems={maxItems}
      className={className}
      aria-label="breadcrumb"
    >
      {showHome && (
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          color="inherit"
        >
          <Home size={16} />
          Home
        </Link>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const Icon = item.icon

        if (item.path && !isLast) {
          return (
            <Link
              key={index}
              component={RouterLink}
              to={item.path}
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              color="inherit"
            >
              {Icon && <Icon size={16} />}
              {item.label}
            </Link>
          )
        }

        return (
          <Typography
            key={index}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            color="text.primary"
          >
            {Icon && <Icon size={16} />}
            {item.label}
          </Typography>
        )
      })}
    </MuiBreadcrumbs>
  )
}

export default Breadcrumb
