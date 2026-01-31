import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import '../styles/ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Log to error reporting service (if available)
    if (window.errorReporter) {
      window.errorReporter.logError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  copyErrorDetails = () => {
    const errorDetails = `
Error: ${this.state.error?.toString()}

Component Stack:
${this.state.errorInfo?.componentStack}

Browser: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim()

    navigator.clipboard.writeText(errorDetails)
      .then(() => {
        // Create a temporary toast notification
        const toast = document.createElement('div')
        toast.className = 'toast toast-success'
        toast.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 10002;'
        toast.innerHTML = `
          <div class="toast-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="toast-message">Error details copied to clipboard</div>
        `
        document.body.appendChild(toast)
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast)
          }
        }, 3000)
      })
      .catch(() => {
        const toast = document.createElement('div')
        toast.className = 'toast toast-error'
        toast.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 10002;'
        toast.innerHTML = `
          <div class="toast-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="toast-message">Failed to copy error details</div>
        `
        document.body.appendChild(toast)
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast)
          }
        }, 3000)
      })
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <AlertTriangle size={64} />
            </div>

            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry, but something unexpected happened. Don't worry, your data is safe.
            </p>

            {this.state.errorCount > 2 && (
              <div className="error-warning">
                <AlertTriangle size={16} />
                <span>Multiple errors detected. Try reloading the page.</span>
              </div>
            )}

            <div className="error-actions">
              <button className="error-btn primary" onClick={this.handleReset}>
                <RefreshCw size={18} />
                Try Again
              </button>
              <button className="error-btn" onClick={this.handleReload}>
                <RefreshCw size={18} />
                Reload Page
              </button>
              <button className="error-btn" onClick={this.handleGoHome}>
                <Home size={18} />
                Go Home
              </button>
            </div>

            {isDevelopment && this.state.error && (
              <details className="error-details">
                <summary>
                  <Bug size={16} />
                  Error Details (Development Mode)
                </summary>
                <div className="error-details-content">
                  <div className="error-section">
                    <h3>Error Message:</h3>
                    <pre>{this.state.error.toString()}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div className="error-section">
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                  <button className="copy-error-btn" onClick={this.copyErrorDetails}>
                    Copy Error Details
                  </button>
                </div>
              </details>
            )}

            <div className="error-help">
              <h3>What can you do?</h3>
              <ul>
                <li>Click "Try Again" to retry the operation</li>
                <li>Click "Reload Page" to refresh the entire application</li>
                <li>Click "Go Home" to return to the home page</li>
                <li>If the problem persists, try clearing your browser cache</li>
              </ul>
            </div>

            {!isDevelopment && (
              <p className="error-footer">
                If this problem continues, please contact support with details about what you were doing when the error occurred.
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
