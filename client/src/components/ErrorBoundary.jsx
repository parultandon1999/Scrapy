import React from 'react'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    if (window.errorReporter) {
      window.errorReporter.logError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
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
        alert('Error details copied to clipboard')
      })
      .catch(() => {
        alert('Failed to copy error details')
      })
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="text-red-500">
                <Icon name="Error" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Something Went Wrong</h2>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Don't worry, your data is safe.
              </p>

              {this.state.errorCount > 2 && (
                <div className="bg-amber-50 border border-amber-100 rounded-md p-3 mb-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Multiple errors detected. Try reloading the page.
                  </p>
                </div>
              )}

              <p className="text-sm font-bold text-gray-900 mb-2">
                What can you do?
              </p>

              <ul className="space-y-2 mb-4">
                <li className="text-sm text-gray-600 pl-2 border-l-2 border-gray-200">
                  Click 'Try Again' to retry the operation
                </li>
                <li className="text-sm text-gray-600 pl-2 border-l-2 border-gray-200">
                  Click 'Reload Page' to refresh the entire application
                </li>
                <li className="text-sm text-gray-600 pl-2 border-l-2 border-gray-200">
                  Click 'Go Home' to return to the home page
                </li>
                <li className="text-sm text-gray-600 pl-2 border-l-2 border-gray-200">
                  If the problem persists, try clearing your browser cache
                </li>
              </ul>

              {isDevelopment && this.state.error && (
                <div className="mt-4">
                  <div className="w-full mb-2">
                    <Button 
                      variant="outline" 
                      size="small"
                      onClick={this.toggleDetails}
                      style={{ width: '100%' }}
                    >
                      <Icon name={this.state.showDetails ? "ExpandLess" : "ExpandMore"} size="small" />
                      {this.state.showDetails ? 'Hide' : 'Show'} Error Details (Dev Mode)
                    </Button>
                  </div>

                  {this.state.showDetails && (
                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                      <span className="text-xs font-bold block mb-1 text-gray-700">Error Message:</span>
                      <pre className="p-2 bg-white border border-gray-200 rounded text-xs text-red-600 overflow-auto max-h-[150px] mb-3 whitespace-pre-wrap">
                        {this.state.error.toString()}
                      </pre>

                      {this.state.errorInfo && (
                        <>
                          <span className="text-xs font-bold block mb-1 text-gray-700">Component Stack:</span>
                          <pre className="p-2 bg-white border border-gray-200 rounded text-xs text-gray-500 overflow-auto max-h-[200px] mb-3 whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}

                      <div className="w-full">
                         <Button 
                          variant="primary" 
                          size="small"
                          onClick={this.copyErrorDetails}
                          style={{ width: '100%' }}
                        >
                          <Icon name="ContentCopy" size="small" />
                          Copy Error Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isDevelopment && (
                <p className="text-xs text-gray-500 mt-4 italic">
                  If this problem continues, please contact support with details about what you were doing when the error occurred.
                </p>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100 flex-wrap">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Icon name="Home" size="small" /> Home
              </Button>
              <Button variant="outline" onClick={this.handleReload}>
                <Icon name="Refresh" size="small" /> Reload
              </Button>
              <Button variant="primary" onClick={this.handleReset}>
                <Icon name="Refresh" size="small" /> Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary