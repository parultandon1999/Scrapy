import { useSession } from '../contexts/SecurityContext'
import Button from './Button'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import '../styles/SessionTimeoutWarning.css'

/**
 * SessionTimeoutWarning - Modal warning before session timeout
 */
function SessionTimeoutWarning() {
  const { showTimeoutWarning, formatTimeRemaining, extendSession, logout } = useSession()

  if (!showTimeoutWarning) return null

  return (
    <div className="session-timeout-overlay" role="alertdialog" aria-labelledby="timeout-title" aria-describedby="timeout-description">
      <div className="session-timeout-modal">
        <div className="session-timeout-icon">
          <Clock size={48} className="timeout-clock" />
        </div>
        
        <h2 id="timeout-title">Session Expiring Soon</h2>
        <p id="timeout-description">
          Your session will expire in <strong className="timeout-countdown">{formatTimeRemaining()}</strong> due to inactivity.
        </p>
        <p className="timeout-hint">
          Click "Stay Logged In" to continue your session, or you'll be automatically logged out.
        </p>

        <div className="session-timeout-actions">
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={extendSession}
            size="large"
          >
            Stay Logged In
          </Button>
          <Button
            variant="ghost"
            icon={LogOut}
            onClick={logout}
            size="large"
          >
            Logout Now
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SessionTimeoutWarning
