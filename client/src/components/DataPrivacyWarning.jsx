import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'

function DataPrivacyWarning() {
  // Calculate initial visibility state
  const getInitialVisibility = () => {
    // Check if running in a browser environment
    if (typeof window === 'undefined') return false

    const dismissed = localStorage.getItem('privacy_warning_dismissed')
    const dismissedDate = localStorage.getItem('privacy_warning_dismissed_date')
    
    if (!dismissed) {
      return true
    } else if (dismissedDate) {
      // Show again after 30 days
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24)
      return daysSinceDismissed > 30
    }
    return false
  }

  const [isOpen, setIsOpen] = useState(() => getInitialVisibility())

  const handleDismiss = () => {
    setIsOpen(false)
    localStorage.setItem('privacy_warning_dismissed', 'true')
    localStorage.setItem('privacy_warning_dismissed_date', Date.now().toString())
  }

  const handleLearnMore = () => {
    window.location.href = '/privacy-policy'
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon name="Warning" color="warning" />
          Data Storage & Privacy Notice
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Important Security Information
          </Typography>
        </Alert>

        <Typography variant="body2" sx={{ mb: 2 }}>
          This application stores scraped data locally on your device. 
          <strong style={{ color: 'var(--warning-color)' }}> Data is not encrypted at rest</strong> and may be accessible to others with access to your device.
        </Typography>

        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          Security Considerations:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon name="Lock" size={18} color="warning" />
            </ListItemIcon>
            <ListItemText 
              primary="Data stored unencrypted in browser and local database"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon name="Visibility" size={18} color="warning" />
            </ListItemIcon>
            <ListItemText 
              primary="Scraped content visible to anyone with device access"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon name="Warning" size={18} color="warning" />
            </ListItemIcon>
            <ListItemText 
              primary="Do not scrape passwords, credit cards, or personal data"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button variant="outline" onClick={handleLearnMore}>
          Learn More
        </Button>
        <Button variant="primary" onClick={handleDismiss}>
          <Icon name="Check" size="small" /> I Understand
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DataPrivacyWarning