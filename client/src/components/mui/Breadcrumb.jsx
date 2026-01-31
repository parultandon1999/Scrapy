import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import '../../styles/mui/Breadcrumb.css'

function Breadcrumb({ items, compact = false, showHome = true, className = '' }) {
  const breadcrumbClass = [
    'breadcrumb',
    compact && 'breadcrumb-compact',
    className
  ].filter(Boolean).join(' ')

  return (
    <nav className={breadcrumbClass} aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link to="/" className="breadcrumb-item">
            <Home size={16} className="breadcrumb-icon" />
            <span>Home</span>
          </Link>
          {items.length > 0 && (
            <span className="breadcrumb-separator">
              <ChevronRight size={16} />
            </span>
          )}
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const Icon = item.icon

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.path && !isLast ? (
              <Link to={item.path} className="breadcrumb-item">
                {Icon && <Icon size={16} className="breadcrumb-icon" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
                {Icon && <Icon size={16} className="breadcrumb-icon" />}
                <span>{item.label}</span>
              </span>
            )}
            
            {!isLast && (
              <span className="breadcrumb-separator">
                <ChevronRight size={16} />
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
