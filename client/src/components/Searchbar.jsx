import { useState } from 'react'
import {
  Box,
  Paper,
  List,
  ListItemButton,
  Typography,
  IconButton,
  Avatar,
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
  onDeleteRecent,
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

  const handleDeleteUrl = (e, url) => {
    e.stopPropagation()
    if (onDeleteRecent) {
      onDeleteRecent(url)
    }
  }

  const getFaviconUrl = (url) => {
    try {
      const urlObj = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
    } catch {
      return null
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
              maxHeight: 240,
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <List
              disablePadding
              sx={{
                maxHeight: 240,
                overflowY: 'auto',
                // Custom scrollbar styling
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#b2b2b2ff',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#b2b2b2ff',
                  },
                },
                // Firefox support
                scrollbarWidth: 'thin',
                scrollbarColor: '#b2b2b2ff transparent',
              }}
            >
              {recentUrls.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleSelectUrl(item.url)}
                  sx={{
                    py: 0.5,
                    px: 2,
                    borderBottom: index < recentUrls.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                    '&:hover .delete-icon': {
                      opacity: 1,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Avatar
                      src={getFaviconUrl(item.url)}
                      alt="favicon"
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: 'transparent',
                      }}
                    >
                      <Icon name="Language" size={16} />
                    </Avatar>
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
                    <IconButton
                      className="delete-icon"
                      size="medium"
                      onClick={(e) => handleDeleteUrl(e, item.url)}
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <Icon name="Close" size={16} />
                    </IconButton>
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