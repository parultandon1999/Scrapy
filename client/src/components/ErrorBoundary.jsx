import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material'
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
        // Show success feedback
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
        <Dialog 
          open={true}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon name="Error" color="error" />
              Something Went Wrong
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              We're sorry, but something unexpected happened. Don't worry, your data is safe.
            </Typography>

            {this.state.errorCount > 2 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Multiple errors detected. Try reloading the page.
                </Typography>
              </Alert>
            )}

            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
              What can you do?
            </Typography>

            <List dense>
              <ListItem>
                <ListItemText>
                  <Typography variant="body2">
                    Click 'Try Again' to retry the operation
                  </Typography>
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  <Typography variant="body2">
                    Click 'Reload Page' to refresh the entire application
                  </Typography>
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  <Typography variant="body2">
                    Click 'Go Home' to return to the home page
                  </Typography>
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  <Typography variant="body2">
                    If the problem persists, try clearing your browser cache
                  </Typography>
                </ListItemText>
              </ListItem>
            </List>

            {isDevelopment && this.state.error && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={this.toggleDetails}
                  fullWidth
                >
                  <Icon name={this.state.showDetails ? "ExpandLess" : "ExpandMore"} size="small" />
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details (Dev Mode)
                </Button>

                <Collapse in={this.state.showDetails}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                      Error Message:
                    </Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'background.paper', 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        color: 'error.main',
                        overflow: 'auto',
                        maxHeight: 150,
                        mb: 2
                      }}
                    >
                      {this.state.error.toString()}
                    </Box>

                    {this.state.errorInfo && (
                      <>
                        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                          Component Stack:
                        </Typography>
                        <Box 
                          component="pre" 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.paper', 
                            border: '1px solid', 
                            borderColor: 'divider',
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            overflow: 'auto',
                            maxHeight: 200,
                            mb: 2
                          }}
                        >
                          {this.state.errorInfo.componentStack}
                        </Box>
                      </>
                    )}

                    <Button 
                      variant="primary" 
                      size="small"
                      onClick={this.copyErrorDetails}
                      fullWidth
                    >
                      <Icon name="ContentCopy" size="small" />
                      Copy Error Details
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            )}

            {!isDevelopment && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                If this problem continues, please contact support with details about what you were doing when the error occurred.
              </Typography>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button variant="outline" onClick={this.handleGoHome}>
              <Icon name="Home" size="small" /> Home
            </Button>
            <Button variant="outline" onClick={this.handleReload}>
              <Icon name="Refresh" size="small" /> Reload
            </Button>
            <Button variant="primary" onClick={this.handleReset}>
              <Icon name="Refresh" size="small" /> Try Again
            </Button>
          </DialogActions>
        </Dialog>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary