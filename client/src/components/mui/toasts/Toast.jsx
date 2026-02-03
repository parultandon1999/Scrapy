import { Snackbar, Alert, IconButton } from '@mui/material'
import { X } from 'lucide-react'

/**
 * Material-UI Toast Component
 * 
 * Wrapper around Material-UI Snackbar and Alert components.
 * Displays notification messages with different severity levels.
 * 
 * @param {string} id - Unique toast ID
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {string} message - Toast message
 * @param {number} duration - Auto-hide duration in milliseconds
 * @param {string} variant - Alert variant (filled, outlined, standard)
 * @param {function} onClose - Close handler
 */

function Toast({ id, type = 'info', message, duration = 4000, variant = 'filled', onClose }) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    onClose(id)
  }

  return (
    <Snackbar
      open={true}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        variant={variant}
        sx={{ width: '100%' }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <X size={16} />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default Toast
