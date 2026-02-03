import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
  Avatar,
  Alert,
  Divider,
  Collapse,
} from '@mui/material'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'
import Input from './mui/inputs/Input'

function AdvancedOptionsModal({ isOpen, onClose, onSave, initialOptions }) {
  const [fieldErrors, setFieldErrors] = useState({})
  const [options, setOptions] = useState(initialOptions || {
    max_pages: '',
    max_depth: '',
    concurrent_limit: '',
    headless: true,
    download_file_assets: true,
    max_file_size_mb: '',
    login_url: '',
    username: '',
    password: '',
    username_selector: '',
    password_selector: '',
    submit_selector: '',
    success_indicator: '',
    manual_login_mode: false
  })

  const handleChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
    
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: '' }))
    }
    
    if (['max_pages', 'max_depth', 'concurrent_limit', 'max_file_size_mb'].includes(key)) {
      if (value) {
        const numValue = parseFloat(value)
        if (!Number.isInteger(numValue)) {
          setFieldErrors(prev => ({ ...prev, [key]: 'Must be a whole number' }))
        } else if (numValue < 1) {
          setFieldErrors(prev => ({ ...prev, [key]: 'Must be at least 1' }))
        }
      }
    }
  }

  const handleSave = () => {
    if (Object.values(fieldErrors).some(error => error)) return
    
    if (options.max_pages && parseInt(options.max_pages) < 1) {
      setFieldErrors(prev => ({ ...prev, max_pages: 'Max pages must be at least 1' }))
      return
    }
    if (options.max_depth && parseInt(options.max_depth) < 1) {
      setFieldErrors(prev => ({ ...prev, max_depth: 'Max depth must be at least 1' }))
      return
    }
    if (options.concurrent_limit && parseInt(options.concurrent_limit) < 1) {
      setFieldErrors(prev => ({ ...prev, concurrent_limit: 'Concurrent limit must be at least 1' }))
      return
    }
    if (options.max_file_size_mb && parseInt(options.max_file_size_mb) < 1) {
      setFieldErrors(prev => ({ ...prev, max_file_size_mb: 'Max file size must be at least 1 MB' }))
      return
    }
    if (options.login_url && options.login_url.trim()) {
      try {
        new URL(options.login_url)
      } catch {
        setFieldErrors(prev => ({ ...prev, login_url: 'Invalid login URL format' }))
        return
      }
    }
    
    setFieldErrors({})
    onSave(options)
    onClose()
  }

  const handleReset = () => {
    setOptions({
      max_pages: '',
      max_depth: '',
      concurrent_limit: '',
      headless: true,
      download_file_assets: true,
      max_file_size_mb: '',
      login_url: '',
      username: '',
      password: '',
      username_selector: '',
      password_selector: '',
      submit_selector: '',
      success_indicator: '',
      manual_login_mode: false
    })
    setFieldErrors({})
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '70vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ textAlign: 'center', py: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mx: 'auto', mb: 1 }}>
          <Icon name="Settings" size={20} />
        </Avatar>
        <Typography variant="h6" fontSize="1.1rem">Advanced Options</Typography>
      </DialogTitle>

      {/* Body */}
      <DialogContent dividers sx={{ py: 2.5, px: 3 }}>
        {/* Scraper Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
            <Icon name="Tune" size={16} /> Scraper Settings
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Input
                type="number"
                label="Max Pages"
                placeholder="Default"
                value={options.max_pages}
                onChange={(e) => handleChange('max_pages', e.target.value)}
                error={!!fieldErrors.max_pages}
                helperText={fieldErrors.max_pages || ''}
                size="small"
                fullWidth
                min={1}
                step={1}
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="number"
                label="Max Depth"
                placeholder="Default"
                value={options.max_depth}
                onChange={(e) => handleChange('max_depth', e.target.value)}
                error={!!fieldErrors.max_depth}
                helperText={fieldErrors.max_depth || ''}
                size="small"
                fullWidth
                min={1}
                step={1}
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="number"
                label="Concurrent Workers"
                placeholder="Default"
                value={options.concurrent_limit}
                onChange={(e) => handleChange('concurrent_limit', e.target.value)}
                error={!!fieldErrors.concurrent_limit}
                helperText={fieldErrors.concurrent_limit || ''}
                size="small"
                fullWidth
                min={1}
                step={1}
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="number"
                label="Max File Size (MB)"
                placeholder="Default"
                value={options.max_file_size_mb}
                onChange={(e) => handleChange('max_file_size_mb', e.target.value)}
                error={!!fieldErrors.max_file_size_mb}
                helperText={fieldErrors.max_file_size_mb || ''}
                size="small"
                fullWidth
                min={1}
                step={1}
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="switch"
                label="Headless Mode"
                value={options.headless}
                onChange={(e) => handleChange('headless', e.target.checked)}
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="switch"
                label="Download Assets"
                value={options.download_file_assets}
                onChange={(e) => handleChange('download_file_assets', e.target.checked)}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Authentication Settings */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
            <Icon name="Lock" size={16} /> Authentication (Optional)
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Input
                type="switch"
                label="Manual Login Mode"
                value={options.manual_login_mode}
                onChange={(e) => handleChange('manual_login_mode', e.target.checked)}
              />
            </Grid>

            <Grid item xs={12}>
              <Collapse in={options.manual_login_mode}>
                <Alert 
                  severity="info" 
                  icon={<Icon name="Info" size={16} />}
                  sx={{ py: 0.75, mb: 2 }}
                >
                  <Typography variant="caption" display="block" fontWeight="600" sx={{ mb: 0.25 }}>
                    Manual Login Enabled
                  </Typography>
                  <Typography variant="caption" fontSize="0.7rem" lineHeight={1.4}>
                    Browser window opens for manual login. Perfect for CAPTCHA sites. Session saved after 60s.
                  </Typography>
                </Alert>
              </Collapse>
            </Grid>

            <Grid item xs={12}>
              <Input
                type="url"
                label="Login URL"
                placeholder="https://example.com/login"
                value={options.login_url}
                onChange={(e) => handleChange('login_url', e.target.value)}
                error={!!fieldErrors.login_url}
                helperText={fieldErrors.login_url || ''}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="text"
                label="Username"
                placeholder="Username"
                value={options.username}
                onChange={(e) => handleChange('username', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="password"
                label="Password"
                placeholder="Password"
                value={options.password}
                onChange={(e) => handleChange('password', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="text"
                label="Username Selector"
                placeholder="input[name='username']"
                value={options.username_selector}
                onChange={(e) => handleChange('username_selector', e.target.value)}
                disabled={options.manual_login_mode}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="text"
                label="Password Selector"
                placeholder="input[name='password']"
                value={options.password_selector}
                onChange={(e) => handleChange('password_selector', e.target.value)}
                disabled={options.manual_login_mode}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="text"
                label="Submit Selector"
                placeholder="button[type='submit']"
                value={options.submit_selector}
                onChange={(e) => handleChange('submit_selector', e.target.value)}
                disabled={options.manual_login_mode}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Input
                type="text"
                label="Success Indicator"
                placeholder=".user-profile"
                value={options.success_indicator}
                onChange={(e) => handleChange('success_indicator', e.target.value)}
                disabled={options.manual_login_mode}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button 
          variant="ghost" 
          size="small"
          onClick={handleReset}
        >
          <Icon name="RestartAlt" size="small" /> Reset
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outline"
            size="small"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            size="small"
            onClick={handleSave}
          >
            <Icon name="Save" size="small" /> Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default AdvancedOptionsModal
