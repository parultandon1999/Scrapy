import { useState } from 'react'
import {
  Box,
  Paper,
  List,
  ListItemButton,
  Typography,
} from '@mui/material'
import Input from './mui/inputs/Input'
import Icon from './mui/icons/Icon'

function SearchBar({ 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  onSubmit, 
  error, 
  valid, 
  recentUrls = [], 
  onSelectRecent,
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit()
    }
  }

  const handleSelectUrl = (url) => {
    if (onSelectRecent) {
      onSelectRecent(url)
    }
    setIsFocused(false)
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m`
    } else if (diffHours < 24) {
      return `${diffHours}h`
    } else if (diffDays < 7) {
      return `${diffDays}d`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const shouldShowDropdown = isFocused && recentUrls.length > 0 && !value

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ width: '100%', maxWidth: 600, position: 'relative' }}
    >
      <Box sx={{ position: 'relative' }}>
        <Input
          type="url"
          placeholder={placeholder || "Enter URL to scrape..."}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          error={!!error}
          helperText={error || ''}
          fullWidth
          size="medium"
          icon={valid && !error ? () => <Icon name="CheckCircle" size={20} /> : null}
          iconPosition="end"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 50,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s',
              boxShadow: '0 1px 6px rgba(32,33,36,0.08)',
              '& fieldset': {
                border: 'none',
              },
              '&:hover': {
                boxShadow: '0 1px 6px rgba(32,33,36,0.18)',
                borderColor: 'divider',
              },
              '&.Mui-focused': {
                boxShadow: '0 1px 6px rgba(32,33,36,0.28)',
                borderColor: 'divider',
              },
              '&.Mui-error': {
                borderColor: 'error.main',
                boxShadow: '0 1px 6px rgba(234,67,53,0.2)',
              },
            },
            '& .MuiOutlinedInput-input': {
              py: 1.5,
              px: 2.5,
            },
          }}
        />

        {/* Recent URLs Dropdown */}
        {shouldShowDropdown && (
          <Paper
            elevation={2}
            // IMPORTANT: e.preventDefault() prevents the input from blurring 
            // when you click the dropdown, ensuring the click registers 
            // while still allowing instant close on outside clicks.
            onMouseDown={(e) => e.preventDefault()}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: 200,
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <List
              disablePadding
              sx={{
                maxHeight: 200,
                overflowY: 'auto',
              }}
            >
              {recentUrls.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleSelectUrl(item.url)}
                  sx={{
                    py: 1,
                    px: 2,
                    borderBottom: index < recentUrls.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Icon name="Language" size={16} />
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.url}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {formatDate(item.lastScraped)}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default SearchBar