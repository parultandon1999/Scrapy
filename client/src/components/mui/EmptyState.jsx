import { 
  Database,
  MagnifyingGlass,
  ClockCounterClockwise,
  FileX,
  Folder,
  Globe,
  ListMagnifyingGlass,
  Warning,
  CloudSlash,
  WifiSlash,
  Package,
  Sparkle
} from '@phosphor-icons/react'
import Button from './Button'
import '../../styles/mui/EmptyState.css'

/**
 * EmptyState - Reusable empty state component with illustrations and CTAs
 */
function EmptyState({ 
  type = 'default',
  title,
  description,
  icon: CustomIcon,
  primaryAction,
  secondaryAction,
  illustration = true,
  size = 'medium',
  className = ''
}) {
  // Predefined empty state types
  const emptyStateTypes = {
    'no-data': {
      icon: Database,
      title: 'No Data Yet',
      description: 'Start by adding some data to see it here.',
      illustration: true
    },
    'no-results': {
      icon: MagnifyingGlass,
      title: 'No Results Found',
      description: 'Try adjusting your search or filters to find what you\'re looking for.',
      illustration: true
    },
    'no-history': {
      icon: ClockCounterClockwise,
      title: 'No History Yet',
      description: 'Your activity history will appear here once you start using the app.',
      illustration: true
    },
    'empty-folder': {
      icon: Folder,
      title: 'This Folder is Empty',
      description: 'Add files or create new items to get started.',
      illustration: true
    },
    'no-files': {
      icon: FileX,
      title: 'No Files Found',
      description: 'Upload or create files to see them here.',
      illustration: true
    },
    'no-connection': {
      icon: WifiSlash,
      title: 'No Internet Connection',
      description: 'Please check your connection and try again.',
      illustration: true
    },
    'offline': {
      icon: CloudSlash,
      title: 'You\'re Offline',
      description: 'Some features may be unavailable until you reconnect.',
      illustration: true
    },
    'error': {
      icon: Warning,
      title: 'Something Went Wrong',
      description: 'We encountered an error. Please try again.',
      illustration: true
    },
    'no-scraped-data': {
      icon: Globe,
      title: 'No Scraped Data',
      description: 'Start a new scraping session to collect data from websites.',
      illustration: true
    },
    'no-selectors': {
      icon: ListMagnifyingGlass,
      title: 'No Selectors Found',
      description: 'Analyze a page to find CSS selectors automatically.',
      illustration: true
    },
    'empty-library': {
      icon: Package,
      title: 'Library is Empty',
      description: 'Save selectors to your library for quick access later.',
      illustration: true
    },
    'default': {
      icon: Sparkle,
      title: 'Nothing Here Yet',
      description: 'Get started by taking an action.',
      illustration: true
    }
  }

  const config = emptyStateTypes[type] || emptyStateTypes.default
  const Icon = CustomIcon || config.icon
  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const showIllustration = illustration && config.illustration

  return (
    <div className={`empty-state empty-state-${size} ${className}`}>
      {showIllustration && (
        <div className="empty-state-illustration">
          <div className="illustration-circle">
            <Icon size={size === 'large' ? 64 : size === 'small' ? 32 : 48} weight="duotone" />
          </div>
          <div className="illustration-decoration">
            <div className="decoration-dot decoration-dot-1" />
            <div className="decoration-dot decoration-dot-2" />
            <div className="decoration-dot decoration-dot-3" />
          </div>
        </div>
      )}

      <div className="empty-state-content">
        <h3 className="empty-state-title">{finalTitle}</h3>
        <p className="empty-state-description">{finalDescription}</p>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="empty-state-actions">
          {primaryAction && (
            <Button
              variant="primary"
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
              href={primaryAction.href}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="secondary"
              icon={secondaryAction.icon}
              onClick={secondaryAction.onClick}
              href={secondaryAction.href}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
