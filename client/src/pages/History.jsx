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
  Card,
  CardContent,
  Stack,
  Alert,
  Chip,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Select,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material'
import Navbar from '../components/Navbar'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import Button from '../components/mui/buttons/Button'
import Icon from '../components/mui/icons/Icon'
import * as api from '../services/api'
import { useToast } from '../components/mui/toasts/useToast'
import { 
  HistorySessionsSkeleton,
  HistoryStatisticsSkeleton,
  HistoryTimelineSkeleton,
  HistorySessionDetailsSkeleton,
} from '../components/mui/skeletons/SkeletonLoader'

function History({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const toast = useToast()
  
  // State
  const [activeView, setActiveView] = useState('sessions')
  const [sessions, setSessions] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionDetails, setSessionDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterDomain, setFilterDomain] = useState('')
  const [selectedForComparison, setSelectedForComparison] = useState([])
  const [comparisonData, setComparisonData] = useState(null)
  const [timelineData, setTimelineData] = useState(null)
  
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
    if (activeView === 'sessions') fetchSessions()
    else if (activeView === 'statistics') fetchStatistics()
    else if (activeView === 'timeline') fetchTimeline()
  }, [activeView])

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

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const data = await api.getHistoryStatistics()
      setStatistics(data)
    } catch {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const data = await api.getScrapingTimeline()
      setTimelineData(data)
    } catch {
      setError('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessionDetails = async (domain) => {
    try {
      setLoading(true)
      const data = await api.getSessionDetails(domain)
      setSessionDetails(data)
      setSelectedSession(domain)
      setActiveView('session-details')
    } catch {
      setError('Failed to load session details')
    } finally {
      setLoading(false)
    }
  }

  // Comparison Logic
  const toggleSessionForComparison = (domain) => {
    setSelectedForComparison(prev => {
      if (prev.includes(domain)) return prev.filter(d => d !== domain)
      if (prev.length < 2) return [...prev, domain]
      toast.warning('You can only compare 2 sessions at a time')
      return prev
    })
  }

  const handleCompare = async () => {
    if (selectedForComparison.length !== 2) {
      toast.warning('Please select exactly 2 sessions to compare')
      return
    }
    try {
      setLoading(true)
      const [session1, session2] = await Promise.all([
        api.getSessionDetails(selectedForComparison[0]),
        api.getSessionDetails(selectedForComparison[1])
      ])
      setComparisonData({ session1, session2 })
      setActiveView('comparison')
    } catch {
      setError('Failed to load comparison data')
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
      if (selectedSession === domain) {
        setSelectedSession(null)
        setSessionDetails(null)
        setActiveView('sessions')
      }
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

      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <Paper 
          elevation={0}
          sx={{ 
            width: { xs: '100%', md: 256 },
            borderRight: 1,
            borderColor: 'divider',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ px: 1.5, mb: 2, display: 'block', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Menu
            </Typography>
            <List disablePadding>
              <ListItemButton
                selected={activeView === 'sessions'}
                onClick={() => setActiveView('sessions')}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon name="Language" size="small" />
                </ListItemIcon>
                <ListItemText primary="Sessions" />
                <Chip label={sessions.length} size="small" />
              </ListItemButton>
              <ListItemButton
                selected={activeView === 'timeline'}
                onClick={() => setActiveView('timeline')}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon name="CalendarToday" size="small" />
                </ListItemIcon>
                <ListItemText primary="Timeline" />
              </ListItemButton>
              <ListItemButton
                selected={activeView === 'statistics'}
                onClick={() => setActiveView('statistics')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon name="BarChart" size="small" />
                </ListItemIcon>
                <ListItemText primary="Statistics" />
              </ListItemButton>
            </List>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            bgcolor: 'background.default'
          }}
        >
          {/* Breadcrumb Header */}
          <Paper 
            elevation={0}
            sx={{ 
              position: 'sticky',
              top: 0,
              zIndex: 10,
              borderBottom: 1,
              borderColor: 'divider',
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Breadcrumb 
              items={[
                { label: 'History', icon: 'AccessTime', path: '/history' },
                { label: activeView === 'sessions' ? 'Sessions' :
                        activeView === 'timeline' ? 'Timeline' :
                        activeView === 'statistics' ? 'Statistics' :
                        activeView === 'session-details' ? `Session: ${selectedSession ? getDomain(selectedSession) : 'Details'}` :
                        activeView === 'comparison' ? 'Compare' : 'View'
                }
              ]}
            />
            
            {error && (
              <Alert 
                severity="error" 
                onClose={() => setError(null)}
                sx={{ py: 0 }}
              >
                {error}
              </Alert>
            )}
          </Paper>

          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Skeletons */}
            {loading && activeView === 'sessions' && <HistorySessionsSkeleton />}
            {loading && activeView === 'statistics' && <HistoryStatisticsSkeleton />}
            {loading && activeView === 'timeline' && <HistoryTimelineSkeleton />}
            {(loading && (activeView === 'session-details' || activeView === 'comparison')) && <HistorySessionDetailsSkeleton />}

            {/* SESSIONS VIEW */}
            {activeView === 'sessions' && !loading && (
              <Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
                  <Typography variant="h5" fontWeight="light">
                    Sessions <Typography component="span" variant="body1" color="text.secondary">({sessions.length})</Typography>
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                      size="small"
                      placeholder="Filter domains..."
                      value={filterDomain}
                      onChange={(e) => setFilterDomain(e.target.value)}
                      sx={{ width: { xs: '100%', sm: 256 } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon name="Search" size={14} />
                          </InputAdornment>
                        )
                      }}
                    />
                    <Select 
                      size="small"
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="recent">Most Recent</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="pages">Most Pages</MenuItem>
                      <MenuItem value="size">Largest Size</MenuItem>
                    </Select>
                  </Stack>
                </Box>

                {selectedForComparison.length > 0 && (
                  <Alert 
                    severity="info" 
                    sx={{ mb: 3 }}
                    action={
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={handleCompare}
                          disabled={selectedForComparison.length !== 2}
                        >
                          Compare
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => setSelectedForComparison([])}
                        >
                          Clear
                        </Button>
                      </Stack>
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon name="CheckCircle" size="small" />
                      {selectedForComparison.length} selected for comparison
                    </Box>
                  </Alert>
                )}

                {getSortedSessions().length > 0 ? (
                  <Grid container spacing={2}>
                    {getSortedSessions().map((session, idx) => (
                      <Grid item xs={12} md={6} lg={4} key={idx}>
                        <Card 
                          variant="outlined"
                          sx={{ 
                            height: '100%',
                            transition: 'all 0.2s',
                            '&:hover': { boxShadow: 2 },
                            ...(selectedForComparison.includes(session.domain) && {
                              borderColor: 'primary.main',
                              bgcolor: 'primary.50'
                            })
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                                <Checkbox
                                  checked={selectedForComparison.includes(session.domain)}
                                  onChange={() => toggleSessionForComparison(session.domain)}
                                  size="small"
                                />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="medium" noWrap>
                                    {getDomain(session.domain)}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    component="a"
                                    href={session.domain}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ 
                                      color: 'primary.main',
                                      textDecoration: 'none',
                                      '&:hover': { textDecoration: 'underline' },
                                      display: 'block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {session.domain}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              {sessionTags[session.domain] && (
                                <Chip 
                                  label={sessionTags[session.domain]} 
                                  size="small" 
                                  color="primary"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              )}
                            </Box>

                            {sessionNotes[session.domain] && (
                              <Paper variant="outlined" sx={{ p: 1, mb: 2, bgcolor: 'grey.50', borderLeft: 2, borderColor: 'grey.400' }}>
                                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                  {sessionNotes[session.domain]}
                                </Typography>
                              </Paper>
                            )}

                            <Grid container spacing={1} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon name="Description" size={14} />
                                  <Typography variant="caption">
                                    <Typography component="span" variant="caption" fontWeight="bold">{session.total_pages}</Typography> pages
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon name="Layers" size={14} />
                                  <Typography variant="caption">
                                    Depth <Typography component="span" variant="caption" fontWeight="bold">{session.max_depth}</Typography>
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon name="Download" size={14} />
                                  <Typography variant="caption">
                                    <Typography component="span" variant="caption" fontWeight="bold">{session.total_files}</Typography> files
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon name="Storage" size={14} />
                                  <Typography variant="caption">{api.formatBytes(session.total_size)}</Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                              {new Date(session.end_time * 1000).toLocaleDateString()} • {formatDuration(session.end_time - session.start_time)}
                            </Typography>

                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Button 
                                  variant="outline" 
                                  size="small" 
                                  fullWidth
                                  onClick={() => handleAddTag(session.domain)}
                                >
                                  <Icon name="Label" size="small" /> Tag
                                </Button>
                              </Grid>
                              <Grid item xs={6}>
                                <Button 
                                  variant="outline" 
                                  size="small" 
                                  fullWidth
                                  onClick={() => handleAddNote(session.domain)}
                                >
                                  <Icon name="Note" size="small" /> Note
                                </Button>
                              </Grid>
                              <Grid item xs={6}>
                                <Button 
                                  variant="success" 
                                  size="small" 
                                  fullWidth
                                  onClick={(e) => handleExportSession(session.domain, e)}
                                  disabled={exportingSession === session.domain}
                                >
                                  <Icon name="Download" size="small" /> Export
                                </Button>
                              </Grid>
                              <Grid item xs={6}>
                                <Button 
                                  variant="outline" 
                                  size="small" 
                                  fullWidth
                                  onClick={() => fetchSessionDetails(session.domain)}
                                >
                                  <Icon name="BarChart" size="small" /> Details
                                </Button>
                              </Grid>
                              <Grid item xs={6}>
                                <Button 
                                  variant="primary" 
                                  size="small" 
                                  fullWidth
                                  onClick={() => handleViewProgress(session.domain)}
                                >
                                  <Icon name="Visibility" size="small" /> View
                                </Button>
                              </Grid>
                              <Grid item xs={6}>
                                <Button 
                                  variant="danger" 
                                  size="small" 
                                  fullWidth
                                  onClick={(e) => handleDeleteSession(session.domain, e)}
                                >
                                  <Icon name="Delete" size="small" /> Delete
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 8, textAlign: 'center' }}>
                    <Icon name="Language" size={48} />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>No sessions found</Typography>
                    <Typography variant="body2" color="text.secondary">Start a new scraping job to see history here.</Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* STATISTICS VIEW */}
            {activeView === 'statistics' && statistics && !loading && (
              <Box>
                <Typography variant="h5" fontWeight="light" sx={{ mb: 3 }}>Overall Statistics</Typography>
                
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {[
                    { icon: 'Language', label: 'Total Sessions', value: statistics.total_sessions },
                    { icon: 'Description', label: 'Total Pages', value: statistics.total_pages },
                    { icon: 'Download', label: 'Total Files', value: statistics.total_files },
                    { icon: 'Storage', label: 'Total Size', value: `${statistics.total_size_mb.toFixed(1)} MB` },
                  ].map((stat, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <Paper variant="outlined" sx={{ p: 2.5, transition: 'all 0.2s', '&:hover': { boxShadow: 1 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <Icon name={stat.icon} size={16} />
                          </Avatar>
                        </Box>
                        <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="bold" letterSpacing={0.5}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                          {stat.value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={3}>
                  {statistics.most_active_day && (
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon name="CalendarToday" size={18} color="primary" /> Most Active Day
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                          <Typography variant="h4" fontWeight="light">{statistics.most_active_day.date}</Typography>
                          <Chip label={`${statistics.most_active_day.count} pages`} color="primary" size="small" />
                        </Box>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon name="AccessTime" size={18} color="primary" /> Avg. Session Duration
                      </Typography>
                      <Typography variant="h4" fontWeight="light">
                        {formatDuration(statistics.avg_session_duration_seconds)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TIMELINE VIEW */}
            {activeView === 'timeline' && timelineData && !loading && (
              <Box>
                <Typography variant="h5" fontWeight="light" sx={{ mb: 3 }}>Activity Timeline</Typography>
                
                {timelineData.timeline && timelineData.timeline.length > 0 ? (
                  <Stack spacing={4}>
                    {/* Bar Chart */}
                    <Paper variant="outlined" sx={{ p: 3, height: 300, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                      {timelineData.timeline.map((item, idx) => {
                        const maxPages = Math.max(...timelineData.timeline.map(t => t.pages_scraped))
                        const height = Math.max((item.pages_scraped / maxPages) * 100, 5)
                        
                        return (
                          <Box 
                            key={idx} 
                            sx={{ 
                              flex: 1, 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              gap: 1, 
                              height: '100%', 
                              justifyContent: 'flex-end',
                              position: 'relative',
                              '&:hover .bar': { bgcolor: 'primary.main', transform: 'scaleY(1.05)' },
                              '&:hover .tooltip': { opacity: 1 }
                            }}
                          >
                            <Box
                              className="bar"
                              sx={{
                                width: '100%',
                                maxWidth: 40,
                                bgcolor: 'primary.light',
                                borderRadius: '4px 4px 0 0',
                                height: `${height}%`,
                                transition: 'all 0.3s',
                                transformOrigin: 'bottom'
                              }}
                            />
                            <Box
                              className="tooltip"
                              sx={{
                                position: 'absolute',
                                top: -40,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bgcolor: 'grey.900',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.625rem',
                                whiteSpace: 'nowrap',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                pointerEvents: 'none'
                              }}
                            >
                              {item.pages_scraped} pages
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem', transform: { xs: 'none', sm: 'rotate(-45deg)' }, transformOrigin: 'top left', mt: 1 }}>
                              {item.date}
                            </Typography>
                          </Box>
                        )
                      })}
                    </Paper>

                    {/* Timeline Cards */}
                    <Grid container spacing={2}>
                      {timelineData.timeline.map((item, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Card variant="outlined" sx={{ transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'grey.100', color: 'text.secondary', width: 32, height: 32 }}>
                                  <Icon name="CalendarToday" size={16} />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">{item.date}</Typography>
                                  <Typography variant="caption" color="text.secondary">Activity Report</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight="bold">{item.pages_scraped}</Typography>
                                <Typography variant="caption" color="text.secondary" textTransform="uppercase">Pages</Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                ) : (
                  <Paper sx={{ p: 8, textAlign: 'center' }}>
                    <Typography color="text.secondary">No timeline data available.</Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* SESSION DETAILS VIEW */}
            {activeView === 'session-details' && sessionDetails && !loading && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Button variant="icon" iconOnly onClick={() => setActiveView('sessions')}>
                    <Icon name="ArrowBack" size="small" />
                  </Button>
                  <Box>
                    <Typography variant="h5" fontWeight="light" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon name="Language" size={20} color="primary" />
                      {getDomain(sessionDetails.domain)}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon name="BarChart" size={16} /> Overview
                      </Typography>
                      <Stack spacing={2}>
                        {[
                          ['Total Pages', sessionDetails.overview.total_pages],
                          ['Max Depth', `Depth ${sessionDetails.overview.max_depth}`],
                          ['Avg Depth', sessionDetails.overview.avg_depth?.toFixed(1)],
                          ['Duration', formatDuration(sessionDetails.overview.end_time - sessionDetails.overview.start_time)],
                          ['Started', new Date(sessionDetails.overview.start_time * 1000).toLocaleString()],
                        ].map(([label, value], i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: i < 4 ? 1 : 0, borderColor: 'divider', borderStyle: 'dashed' }}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="body2" fontWeight="medium">{value}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon name="Layers" size={16} /> Depth Distribution
                      </Typography>
                      <Stack spacing={2}>
                        {sessionDetails.depth_distribution.map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" fontFamily="monospace" sx={{ width: 32 }}>D{item.depth}</Typography>
                            <Box sx={{ flex: 1, height: 8, bgcolor: 'grey.100', borderRadius: 1, overflow: 'hidden' }}>
                              <Box 
                                sx={{ 
                                  height: '100%', 
                                  bgcolor: 'primary.main', 
                                  borderRadius: 1,
                                  width: `${(item.count / Math.max(...sessionDetails.depth_distribution.map(d => d.count))) * 100}%`
                                }}
                              />
                            </Box>
                            <Typography variant="caption" fontWeight="medium" sx={{ width: 32, textAlign: 'right' }}>{item.count}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                {sessionDetails.file_stats.length > 0 && (
                  <Paper variant="outlined">
                    <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon name="Download" size={16} /> File Statistics
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Count</TableCell>
                            <TableCell>Total Size</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sessionDetails.file_stats.map((file, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell>
                                <Chip label={file.file_extension} color="primary" size="small" />
                              </TableCell>
                              <TableCell>{file.count}</TableCell>
                              <TableCell>{api.formatBytes(file.total_size)}</TableCell>
                              <TableCell>
                                {file.download_status === 'success' ? (
                                  <Chip icon={<Icon name="CheckCircle" size={12} />} label="Success" color="success" size="small" />
                                ) : (
                                  <Chip icon={<Icon name="Cancel" size={12} />} label="Failed" color="error" size="small" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Box>
            )}

            {/* COMPARISON VIEW */}
            {activeView === 'comparison' && comparisonData && !loading && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Button variant="icon" iconOnly onClick={() => setActiveView('sessions')}>
                    <Icon name="ArrowBack" size="small" />
                  </Button>
                  <Typography variant="h5" fontWeight="light">Compare Sessions</Typography>
                </Box>

                <Grid container spacing={4} alignItems="start">
                  {[comparisonData.session1, comparisonData.session2].map((session, i) => (
                    <Grid item xs={12} lg={5} key={i}>
                      <Stack spacing={2}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="medium" noWrap>{getDomain(session.domain)}</Typography>
                        </Paper>
                        
                        <Grid container spacing={1.5}>
                          {[
                            { label: 'Pages', value: session.overview.total_pages },
                            { label: 'Depth', value: session.overview.max_depth },
                            { label: 'Files', value: session.file_stats.reduce((acc, f) => acc + f.count, 0) },
                            { label: 'Time', value: formatDuration(session.overview.end_time - session.overview.start_time) },
                          ].map((stat, j) => (
                            <Grid item xs={6} key={j}>
                              <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="caption" color="text.secondary" textTransform="uppercase">{stat.label}</Typography>
                                <Typography variant="h6" fontWeight="bold">{stat.value}</Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Stack>
                    </Grid>
                  ))}

                  <Grid item xs={12} lg={2} sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'center', pt: 10 }}>
                    <Avatar sx={{ bgcolor: 'grey.200', width: 40, height: 40, fontWeight: 'bold', color: 'text.secondary' }}>
                      VS
                    </Avatar>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      {/* Delete Modal */}
      <Dialog open={!!deleteConfirmModal} onClose={() => setDeleteConfirmModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'error.light', width: 48, height: 48, mx: 'auto', mb: 2 }}>
            <Icon name="Error" size={24} />
          </Avatar>
          <Typography variant="h6">Delete Session Data?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            This will permanently delete all pages and files for<br/>
            <Typography component="span" fontFamily="monospace" bgcolor="grey.100" px={0.5} py={0.25} borderRadius={0.5}>
              {deleteConfirmModal}
            </Typography>
          </Typography>
          <TextField
            fullWidth
            label="Type domain to confirm"
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            placeholder="example.com"
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outline" onClick={() => setDeleteConfirmModal(null)} fullWidth>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={deleteConfirmInput !== deleteConfirmModal?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            fullWidth
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tag Modal */}
      <Dialog open={!!editingTag} onClose={() => setEditingTag(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Tag</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveTag(editingTag)}
            placeholder="e.g. Production"
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setEditingTag(null)}>Cancel</Button>
          <Button variant="primary" onClick={() => saveTag(editingTag)}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Note Modal */}
      <Dialog open={!!editingNote} onClose={() => setEditingNote(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add session notes..."
            autoFocus
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" textAlign="right" display="block" sx={{ mt: 0.5 }}>
            {noteInput.length}/500
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
          <Button variant="primary" onClick={() => saveNote(editingNote)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default History
