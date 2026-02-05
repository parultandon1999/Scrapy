import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
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
  Divider,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Avatar,
} from '@mui/material'
import * as api from '../services/api'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'
import { useToast } from './mui/toasts/useToast'
import { HistorySessionsSkeleton } from './mui/skeletons/SkeletonLoader'

// Skeleton Component for Loading States - REMOVED, NOW USING MUI SKELETON FROM SkeletonLoader.jsx

function HistoryModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  
  // State
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterDomain, setFilterDomain] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedSessions, setSelectedSessions] = useState([])
  const [filterTag, setFilterTag] = useState('all')
  
  // Modals State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [editingTag, setEditingTag] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [exportingSession, setExportingSession] = useState(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // LocalStorage Data
  const [sessionTags, setSessionTags] = useState({})
  const [sessionNotes, setSessionNotes] = useState({})

  // Effects
  useEffect(() => {
    const savedTags = localStorage.getItem('sessionTags')
    const savedNotes = localStorage.getItem('sessionNotes')
    const savedViewMode = localStorage.getItem('historyViewMode')
    if (savedTags) setSessionTags(JSON.parse(savedTags))
    if (savedNotes) setSessionNotes(JSON.parse(savedNotes))
    // Set list view by default on mobile, otherwise use saved preference
    if (window.innerWidth < 600) {
      setViewMode('list')
    } else if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sessionTags', JSON.stringify(sessionTags))
  }, [sessionTags])

  useEffect(() => {
    localStorage.setItem('sessionNotes', JSON.stringify(sessionNotes))
  }, [sessionNotes])

  useEffect(() => {
    localStorage.setItem('historyViewMode', viewMode)
  }, [viewMode])

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen])

  // API Actions
  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getScrapingSessions()
      setSessions(data.sessions || [])
    } catch {
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedSessions.length === 0) return
    
    if (!confirm(`Delete ${selectedSessions.length} selected session(s)? This action cannot be undone.`)) {
      return
    }

    try {
      setBulkActionLoading(true)
      let totalDeleted = 0
      
      for (const domain of selectedSessions) {
        const result = await api.deleteSession(domain)
        totalDeleted += result.deleted_pages
        
        const newTags = { ...sessionTags }
        const newNotes = { ...sessionNotes }
        delete newTags[domain]
        delete newNotes[domain]
        setSessionTags(newTags)
        setSessionNotes(newNotes)
      }
      
      toast.success(`Deleted ${selectedSessions.length} session(s) (${totalDeleted} pages)`)
      setSelectedSessions([])
      fetchSessions()
    } catch {
      toast.error('Failed to delete some sessions')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkExport = async () => {
    if (selectedSessions.length === 0) return
    
    try {
      setBulkActionLoading(true)
      const exportData = []
      
      for (const domain of selectedSessions) {
        const details = await api.getSessionDetails(domain)
        exportData.push({
          domain,
          tag: sessionTags[domain] || null,
          note: sessionNotes[domain] || null,
          overview: details.overview,
          depth_distribution: details.depth_distribution,
          file_stats: details.file_stats,
          recent_pages: details.recent_pages
        })
      }
      
      const blob = new Blob([JSON.stringify({ sessions: exportData, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bulk_sessions_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Exported ${selectedSessions.length} session(s)`)
    } catch {
      toast.error('Failed to export sessions')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const toggleSessionSelection = (domain) => {
    setSelectedSessions(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    )
  }

  const toggleSelectAll = () => {
    const filtered = getSortedSessions()
    if (selectedSessions.length === filtered.length) {
      setSelectedSessions([])
    } else {
      setSelectedSessions(filtered.map(s => s.domain))
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
    onClose()
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
    let filtered = sessions.filter(s => {
      const matchesDomain = !filterDomain || s.domain.toLowerCase().includes(filterDomain.toLowerCase())
      const matchesTag = filterTag === 'all' || 
                        (filterTag === 'tagged' && sessionTags[s.domain]) ||
                        (filterTag === 'untagged' && !sessionTags[s.domain]) ||
                        (sessionTags[s.domain] === filterTag)
      return matchesDomain && matchesTag
    })
    
    switch (sortBy) {
      case 'recent': return filtered.sort((a, b) => b.end_time - a.end_time)
      case 'oldest': return filtered.sort((a, b) => a.start_time - b.start_time)
      case 'pages': return filtered.sort((a, b) => b.total_pages - a.total_pages)
      case 'size': return filtered.sort((a, b) => (b.total_size || 0) - (a.total_size || 0))
      case 'duration': return filtered.sort((a, b) => (b.end_time - b.start_time) - (a.end_time - a.start_time))
      default: return filtered
    }
  }

  const getUniqueTagsList = () => {
    const tags = new Set(Object.values(sessionTags).filter(Boolean))
    return Array.from(tags)
  }

  return (
    <>
      {/* Main History Modal */}
      <Dialog 
        open={isOpen} 
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        BackdropProps={{ sx: { backgroundColor: 'transparent'} }}
        fullScreen={window.innerWidth < 600}
        slotProps={{
          paper: {
            sx: {
              height: { xs: '100vh', sm: '90vh' },
              maxHeight: { xs: '100vh', sm: '90vh' },
              m: { xs: 0, sm: 2 },
              border: '1px solid rgba(0, 0, 0, 0.32)'
            }
          }
        }}
      >
        {/* HEADER */}
        <DialogTitle sx={{ pb: 1, px: { xs: 2, sm: 3 } }}>
          {/* Title Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={500} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Scraping History
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Bulk Action Icons - Only show when sessions are selected */}
              {selectedSessions.length > 0 && (
                <>
                  <Tooltip title={`Delete ${selectedSessions.length} selected`}>
                    <IconButton 
                      onClick={handleBulkDelete} 
                      size="small" 
                      disabled={bulkActionLoading}
                      color="error"
                    >
                      <Icon name="Delete" size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Export ${selectedSessions.length} selected`}>
                    <IconButton 
                      onClick={handleBulkExport} 
                      size="small" 
                      disabled={bulkActionLoading}
                    >
                      <Icon name="Download" size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={selectedSessions.length === getSortedSessions().length ? 'Deselect all' : 'Select all'}>
                    <IconButton 
                      onClick={toggleSelectAll} 
                      size="small"
                    >
                      <Icon name={selectedSessions.length === getSortedSessions().length ? 'CheckBoxOutlineBlank' : 'CheckBox'} size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Clear selection">
                    <IconButton 
                      onClick={() => setSelectedSessions([])} 
                      size="small"
                    >
                      <Icon name="ClearAll" size={18} />
                    </IconButton>
                  </Tooltip>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
                </>
              )}
              
              <Tooltip title="Refresh">
                <IconButton onClick={fetchSessions} size="small" disabled={loading}>
                  <Icon name="Refresh" size={18} />
                </IconButton>
              </Tooltip>
              <IconButton onClick={onClose} size="small">
                <Icon name="Close" size={18} />
              </IconButton>
            </Stack>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          )}
        </DialogTitle>

        <Divider />

        {/* Search Bar, Filters, and View Toggle - Below Divider */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, bgcolor: 'background.default' }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            {/* Search and Filters Row */}
            <Stack direction="row" spacing={1.5} sx={{ flex: 1, flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <TextField
                size="small"
                placeholder="Search domains..."
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                sx={{ flex: { xs: 'none', sm: 1 }, width: { xs: 200, sm: 'auto' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon name="Search" size={16} />
                    </InputAdornment>
                  ),
                  endAdornment: filterDomain && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setFilterDomain('')}>
                        <Icon name="Close" size={14} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {/* Tag Filter */}
              <Select 
                size="small"
                value={filterTag} 
                onChange={(e) => setFilterTag(e.target.value)}
                sx={{ minWidth: { xs: 90, sm: 120 } }}
              >
                <MenuItem value="all">All Tags</MenuItem>
                <MenuItem value="tagged">Tagged</MenuItem>
                <MenuItem value="untagged">Untagged</MenuItem>
                {getUniqueTagsList().length > 0 && <Divider />}
                {getUniqueTagsList().map(tag => (
                  <MenuItem key={tag} value={tag}>
                    <Chip label={tag} size="small" />
                  </MenuItem>
                ))}
              </Select>

              {/* Sort Filter */}
              <Select 
                size="small"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: { xs: 90, sm: 140 } }}
              >
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="pages">Most Pages</MenuItem>
                <MenuItem value="size">Largest</MenuItem>
                <MenuItem value="duration">Longest</MenuItem>
              </Select>
            </Stack>

            {/* Right Side: View Toggle - Hidden on mobile */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <ToggleButton value="grid">
                <Tooltip title="Grid View">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon name="GridView" size={16} />
                  </Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list">
                <Tooltip title="List View">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon name="ViewList" size={16} />
                  </Box>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* CONTENT AREA - Only the session cards */}
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Content Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
            {/* Loading Skeletons */}
            {loading && <HistorySessionsSkeleton count={6} viewMode={viewMode} />}

            {/* Sessions Grid View */}
            {!loading && viewMode === 'grid' && getSortedSessions().length > 0 && (
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {getSortedSessions().map((session, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <SessionCardGrid
                      session={session}
                      sessionTags={sessionTags}
                      sessionNotes={sessionNotes}
                      selectedSessions={selectedSessions}
                      onToggleSelect={toggleSessionSelection}
                      onViewProgress={handleViewProgress}
                      onAddTag={handleAddTag}
                      onAddNote={handleAddNote}
                      onExport={handleExportSession}
                      onDelete={handleDeleteSession}
                      exportingSession={exportingSession}
                      getDomain={getDomain}
                      formatDuration={formatDuration}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Sessions List View */}
            {!loading && viewMode === 'list' && getSortedSessions().length > 0 && (
              <Stack spacing={{ xs: 1, sm: 1 }}>
                {getSortedSessions().map((session, idx) => (
                  <SessionCardList
                    key={idx}
                    session={session}
                    sessionTags={sessionTags}
                    sessionNotes={sessionNotes}
                    selectedSessions={selectedSessions}
                    onToggleSelect={toggleSessionSelection}
                    onViewProgress={handleViewProgress}
                    onAddTag={handleAddTag}
                    onAddNote={handleAddNote}
                    onExport={handleExportSession}
                    onDelete={handleDeleteSession}
                    exportingSession={exportingSession}
                    getDomain={getDomain}
                    formatDuration={formatDuration}
                  />
                ))}
              </Stack>
            )}

            {/* Empty State */}
            {!loading && getSortedSessions().length === 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 4, sm: 8 }, 
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider'
                }}
              >
                <Icon name="Language" size={48} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  No sessions found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {filterDomain || filterTag !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start a new scraping job to see history here'}
                </Typography>
                {(filterDomain || filterTag !== 'all') && (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      setFilterDomain('')
                      setFilterTag('all')
                    }}
                    sx={{ mt: 2 }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Paper>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deleteConfirmModal} 
        onClose={() => setDeleteConfirmModal(null)}
        maxWidth="xs"
        fullWidth
        BackdropProps={{ sx: { backgroundColor: 'transparent'} }}
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
    </>
  )
}

export default HistoryModal

// Grid View Card Component
const SessionCardGrid = ({ 
  session, sessionTags, sessionNotes, selectedSessions,
  onToggleSelect, onViewProgress, onAddTag, onAddNote, 
  onExport, onDelete, exportingSession, getDomain, formatDuration 
}) => {
  const isSelected = selectedSessions.includes(session.domain)
  
  return (
    <Paper 
      elevation={0}
      variant="outlined"
      sx={{ 
        height: '100%',
        transition: 'all 0.1s ease-in-out',
        position: 'relative',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': { 
          boxShadow: 2,
          borderColor: 'primary.main'
        }
      }}
    >
      {/* Selection Checkbox */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 1
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          size="small"
          onClick={() => onToggleSelect(session.domain)}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Icon 
            name={isSelected ? 'CheckBox' : 'CheckBoxOutlineBlank'} 
            size={20}
            color={isSelected ? 'primary' : 'action'}
          />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, pt: 5, cursor: 'pointer' }} onClick={() => onViewProgress(session.domain)}>
        {/* Domain Header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
            <Tooltip title={session.domain}>
              <Typography variant="subtitle2" fontWeight={500} noWrap sx={{ flex: 1 }}>
                {getDomain(session.domain)}
              </Typography>
            </Tooltip>
            {sessionTags[session.domain] && (
              <Chip 
                label={sessionTags[session.domain]} 
                size="small" 
                color="primary"
                sx={{ height: 20, fontSize: '0.65rem', flexShrink: 0 }}
              />
            )}
          </Box>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          >
            {new Date(session.end_time * 1000).toLocaleDateString()} • {formatDuration(session.end_time - session.start_time)}
          </Typography>
        </Box>

        {/* Note Preview */}
        {sessionNotes[session.domain] && (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1, 
              mb: 2, 
              bgcolor: 'action.hover', 
              borderLeft: 2, 
              borderColor: 'primary.main' 
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontStyle="italic"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            >
              {sessionNotes[session.domain]}
            </Typography>
          </Paper>
        )}

        {/* Stats Grid */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Icon name="Description" size={14} color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {session.total_pages.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Icon name="Download" size={14} color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {session.total_files.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Icon name="Layers" size={14} color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Depth {session.max_depth}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Icon name="Storage" size={14} color="action" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {api.formatBytes(session.total_size)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        {/* Actions */}
        <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Tooltip title="Add Tag">
            <IconButton 
              size="small" 
              onClick={() => onAddTag(session.domain)}
            >
              <Icon name="Label" size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Note">
            <IconButton 
              size="small" 
              onClick={() => onAddNote(session.domain)}
            >
              <Icon name="Note" size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton 
              size="small" 
              onClick={(e) => onExport(session.domain, e)}
              disabled={exportingSession === session.domain}
            >
              <Icon name="Download" size={16} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              color="error"
              onClick={(e) => onDelete(session.domain, e)}
            >
              <Icon name="Delete" size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  )
}

// List View Card Component
const SessionCardList = ({ 
  session, sessionTags, sessionNotes, selectedSessions,
  onToggleSelect, onViewProgress, onAddTag, onAddNote, 
  onExport, onDelete, exportingSession, getDomain, formatDuration 
}) => {
  const isSelected = selectedSessions.includes(session.domain)
  
  return (
    <Paper 
      elevation={0}
      variant="outlined"
      sx={{ 
        transition: 'all 0.1s ease-in-out',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': { 
          boxShadow: 1,
          borderColor: 'primary.main'
        }
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" flexWrap={{ xs: 'wrap', sm: 'nowrap' }}>
          {/* Selection Checkbox */}
          <IconButton
            size="small"
            onClick={() => onToggleSelect(session.domain)}
            sx={{ flexShrink: 0 }}
          >
            <Icon 
              name={isSelected ? 'CheckBox' : 'CheckBoxOutlineBlank'} 
              size={20}
              color={isSelected ? 'primary' : 'action'}
            />
          </IconButton>

          {/* Domain Icon */}
          <Avatar 
            sx={{ 
              width: { xs: 40, sm: 48 }, 
              height: { xs: 40, sm: 48 }, 
              bgcolor: 'primary.main',
              cursor: 'pointer',
              flexShrink: 0
            }}
            onClick={() => onViewProgress(session.domain)}
          >
            <Icon name="Language" size={{ xs: 20, sm: 24 }} />
          </Avatar>

          {/* Main Content */}
          <Box 
            sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            onClick={() => onViewProgress(session.domain)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Tooltip title={session.domain}>
                <Typography variant="subtitle2" fontWeight={500} noWrap sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                  {getDomain(session.domain)}
                </Typography>
              </Tooltip>
              {sessionTags[session.domain] && (
                <Chip 
                  label={sessionTags[session.domain]} 
                  size="small" 
                  color="primary"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {new Date(session.end_time * 1000).toLocaleDateString()} • {formatDuration(session.end_time - session.start_time)}
            </Typography>
          </Box>

          {/* Stats Chips */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}>
            <Chip 
              icon={<Icon name="Description" size={12} />}
              label={session.total_pages.toLocaleString()}
              size="small"
              variant="outlined"
            />
            <Chip 
              icon={<Icon name="Download" size={12} />}
              label={session.total_files.toLocaleString()}
              size="small"
              variant="outlined"
            />
            <Chip 
              icon={<Icon name="Storage" size={12} />}
              label={api.formatBytes(session.total_size)}
              size="small"
              variant="outlined"
            />
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, flexWrap: 'wrap' }}>
            <Tooltip title="Add Tag">
              <IconButton 
                size="small" 
                onClick={() => onAddTag(session.domain)}
              >
                <Icon name="Label" size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Note">
              <IconButton 
                size="small" 
                onClick={() => onAddNote(session.domain)}
              >
                <Icon name="Note" size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton 
                size="small" 
                onClick={(e) => onExport(session.domain, e)}
                disabled={exportingSession === session.domain}
              >
                <Icon name="Download" size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => onDelete(session.domain, e)}
              >
                <Icon name="Delete" size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
}
