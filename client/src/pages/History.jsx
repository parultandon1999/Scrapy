import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Alert,
  Chip,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material'
import Navbar from '../components/Navbar'
import Button from '../components/mui/buttons/Button'
import Icon from '../components/mui/icons/Icon'
import * as api from '../services/api'
import { useToast } from '../components/mui/toasts/useToast'
import { HistorySessionsSkeleton } from '../components/mui/skeletons/SkeletonLoader'

function History({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const toast = useToast()
  
  // State
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterDomain, setFilterDomain] = useState('')
  
  // Modals State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [editingTag, setEditingTag] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [exportingSession, setExportingSession] = useState(null)
  
  // LocalStorage Data
  const [sessionTags, setSessionTags] = useState({})
  const [sessionNotes, setSessionNotes] = useState({})

  // Effects
  useEffect(() => {
    const savedTags = localStorage.getItem('sessionTags')
    const savedNotes = localStorage.getItem('sessionNotes')
    if (savedTags) setSessionTags(JSON.parse(savedTags))
    if (savedNotes) setSessionNotes(JSON.parse(savedNotes))
  }, [])

  useEffect(() => {
    localStorage.setItem('sessionTags', JSON.stringify(sessionTags))
  }, [sessionTags])

  useEffect(() => {
    localStorage.setItem('sessionNotes', JSON.stringify(sessionNotes))
  }, [sessionNotes])

  useEffect(() => {
    fetchSessions()
  }, [])

  // API Actions
  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await api.getScrapingSessions()
      setSessions(data.sessions || [])
    } catch {
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  // Deletion Logic
  const handleDeleteSession = async (domain, e) => {
    e.stopPropagation()
    setDeleteConfirmModal(domain)
    setDeleteConfirmInput('')
  }

  const confirmDelete = async () => {
    const domain = deleteConfirmModal
    const domainName = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    if (deleteConfirmInput !== domainName) {
      toast.error('Domain name does not match. Please type the exact domain name.')
      return
    }

    try {
      setLoading(true)
      const result = await api.deleteSession(domain)
      toast.success(`Deleted ${result.deleted_pages} pages`)
      
      const newTags = { ...sessionTags }
      const newNotes = { ...sessionNotes }
      delete newTags[domain]
      delete newNotes[domain]
      setSessionTags(newTags)
      setSessionNotes(newNotes)
      
      fetchSessions()
      setDeleteConfirmModal(null)
    } catch {
      setError('Failed to delete session')
    } finally {
      setLoading(false)
    }
  }

  // Tags & Notes Logic
  const handleAddTag = (domain) => {
    setEditingTag(domain)
    setTagInput(sessionTags[domain] || '')
  }

  const saveTag = (domain) => {
    if (tagInput.trim()) {
      setSessionTags(prev => ({ ...prev, [domain]: tagInput.trim() }))
    } else {
      const newTags = { ...sessionTags }
      delete newTags[domain]
      setSessionTags(newTags)
    }
    setEditingTag(null)
    setTagInput('')
  }

  const handleAddNote = (domain) => {
    setEditingNote(domain)
    setNoteInput(sessionNotes[domain] || '')
  }

  const saveNote = (domain) => {
    if (noteInput.trim()) {
      setSessionNotes(prev => ({ ...prev, [domain]: noteInput.trim() }))
    } else {
      const newNotes = { ...sessionNotes }
      delete newNotes[domain]
      setSessionNotes(newNotes)
    }
    setEditingNote(null)
    setNoteInput('')
  }

  const handleExportSession = async (domain, e) => {
    e.stopPropagation()
    setExportingSession(domain)
    try {
      const details = await api.getSessionDetails(domain)
      const exportData = {
        domain,
        tag: sessionTags[domain] || null,
        note: sessionNotes[domain] || null,
        exported_at: new Date().toISOString(),
        overview: details.overview,
        depth_distribution: details.depth_distribution,
        file_stats: details.file_stats,
        recent_pages: details.recent_pages
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session_${getDomain(domain)}_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Session exported successfully!')
    } catch {
      toast.error('Failed to export session')
    } finally {
      setExportingSession(null)
    }
  }

  // Helpers
  const handleViewProgress = (domain) => {
    const sessionId = btoa(domain).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
    navigate(`/progress/${sessionId}`, { state: { viewHistoryUrl: domain } })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0s'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const getDomain = (url) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const getSortedSessions = () => {
    let filtered = sessions.filter(s => 
      !filterDomain || s.domain.toLowerCase().includes(filterDomain.toLowerCase())
    )
    switch (sortBy) {
      case 'recent': return filtered.sort((a, b) => b.end_time - a.end_time)
      case 'oldest': return filtered.sort((a, b) => a.start_time - b.start_time)
      case 'pages': return filtered.sort((a, b) => b.total_pages - a.total_pages)
      case 'size': return filtered.sort((a, b) => (b.total_size || 0) - (a.total_size || 0))
      default: return filtered
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="history" />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight={300}
            sx={{ mb: 1 }}
          >
            Scraping History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your past scraping sessions
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mb: 3 }}
        >
          <TextField
            size="small"
            placeholder="Search domains..."
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon name="Search" size={18} />
                </InputAdornment>
              ),
              endAdornment: filterDomain && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilterDomain('')}>
                    <Icon name="Close" size={16} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Select 
            size="small"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="pages">Most Pages</MenuItem>
            <MenuItem value="size">Largest Size</MenuItem>
          </Select>
        </Stack>

        {/* Skeletons */}
        {loading && <HistorySessionsSkeleton />}

        {/* Sessions Grid */}
        {!loading && getSortedSessions().length > 0 ? (
          <Grid container spacing={2}>
            {getSortedSessions().map((session, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper 
                  elevation={0}
                  variant="outlined"
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': { 
                      boxShadow: 2,
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => handleViewProgress(session.domain)}
                >
                  <Box sx={{ p: 2 }}>
                    {/* Domain Header */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={500} noWrap sx={{ flex: 1, mr: 1 }}>
                          {getDomain(session.domain)}
                        </Typography>
                        {sessionTags[session.domain] && (
                          <Chip 
                            label={sessionTags[session.domain]} 
                            size="small" 
                            color="primary"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {new Date(session.end_time * 1000).toLocaleDateString()} • {formatDuration(session.end_time - session.start_time)}
                      </Typography>
                    </Box>

                    {/* Note */}
                    {sessionNotes[session.domain] && (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1, 
                          mb: 2, 
                          bgcolor: 'grey.50', 
                          borderLeft: 2, 
                          borderColor: 'grey.400' 
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          {sessionNotes[session.domain]}
                        </Typography>
                      </Paper>
                    )}

                    {/* Stats */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          <Icon name="Description" size={12} sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {session.total_pages} pages
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          <Icon name="Download" size={12} sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {session.total_files} files
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          <Icon name="Layers" size={12} sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Depth {session.max_depth}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          <Icon name="Storage" size={12} sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {api.formatBytes(session.total_size)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Actions */}
                    <Stack direction="row" spacing={0.5}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); handleAddTag(session.domain); }}
                        title="Add tag"
                      >
                        <Icon name="Label" size={16} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); handleAddNote(session.domain); }}
                        title="Add note"
                      >
                        <Icon name="Note" size={16} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleExportSession(session.domain, e)}
                        disabled={exportingSession === session.domain}
                        title="Export"
                      >
                        <Icon name="Download" size={16} />
                      </IconButton>
                      <Box sx={{ flex: 1 }} />
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => handleDeleteSession(session.domain, e)}
                        title="Delete"
                      >
                        <Icon name="Delete" size={16} />
                      </IconButton>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : !loading && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <Icon name="Language" size={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No sessions found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {filterDomain ? 'Try adjusting your search filter' : 'Start a new scraping job to see history here'}
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deleteConfirmModal} 
        onClose={() => setDeleteConfirmModal(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon name="Warning" color="error" />
            Delete Session
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will permanently delete all scraped data for this session. This action cannot be undone.
          </Typography>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            Type the domain name to confirm:
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {deleteConfirmModal?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            placeholder="Enter domain name"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setDeleteConfirmModal(null)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={deleteConfirmInput !== deleteConfirmModal?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog 
        open={!!editingTag} 
        onClose={() => setEditingTag(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Tag</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g., Production, Testing, Archive"
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setEditingTag(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => saveTag(editingTag)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <Dialog 
        open={!!editingNote} 
        onClose={() => setEditingNote(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add notes about this scraping session..."
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setEditingNote(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => saveNote(editingNote)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default History
