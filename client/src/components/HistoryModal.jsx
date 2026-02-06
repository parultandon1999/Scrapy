import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'
import Button from './mui/buttons/Button'
import Icon from './mui/icons/Icon'
import { useToast } from './mui/toasts/useToast'
import { HistorySessionsSkeleton } from './mui/skeletons/SkeletonLoader'

function HistoryModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  
  // State
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [filterDomain, setFilterDomain] = useState('')
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

  if (!isOpen) return null

  return (
    // Main Modal Backdrop
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative bg-white w-full h-full sm:h-[90vh] sm:max-w-7xl sm:rounded-lg sm:border sm:border-gray-300 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
              Scraping History
            </h2>
            
            <div className="flex items-center gap-1">
              {/* Bulk Action Icons */}
              {selectedSessions.length > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      title={`Delete ${selectedSessions.length} selected`}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Icon name="Delete" size={18} />
                    </button>
                    <button 
                      onClick={handleBulkExport}
                      disabled={bulkActionLoading}
                      title={`Export ${selectedSessions.length} selected`}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Icon name="Download" size={18} />
                    </button>
                    <button 
                      onClick={toggleSelectAll}
                      title={selectedSessions.length === getSortedSessions().length ? 'Deselect all' : 'Select all'}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Icon name={selectedSessions.length === getSortedSessions().length ? 'CheckBoxOutlineBlank' : 'CheckBox'} size={18} />
                    </button>
                    <button 
                      onClick={() => setSelectedSessions([])}
                      title="Clear selection"
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Icon name="ClearAll" size={18} />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  </div>
                </>
              )}
              
              <button 
                onClick={fetchSessions} 
                disabled={loading}
                title="Refresh"
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="Refresh" size={18} />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="Close" size={18} />
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-2 bg-red-50 text-red-700 px-4 py-3 rounded text-sm flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)}><Icon name="Close" size={16} /></button>
            </div>
          )}
        </div>

        {/* Search Bar, Filters, and View Toggle */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            
            {/* Search and Filters Row */}
            <div className="flex flex-1 flex-wrap gap-2">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none">
                  <Icon name="Search" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                {filterDomain && (
                  <button 
                    onClick={() => setFilterDomain('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="Close" size={14} />
                  </button>
                )}
              </div>
              
              {/* Tag Filter */}
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="py-2 pl-3 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white min-w-[120px]"
              >
                <option value="all">All Tags</option>
                <option value="tagged">Tagged</option>
                <option value="untagged">Untagged</option>
                {getUniqueTagsList().length > 0 && <option disabled>──────────</option>}
                {getUniqueTagsList().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 pl-3 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white min-w-[140px]"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="pages">Most Pages</option>
                <option value="size">Largest</option>
                <option value="duration">Longest</option>
              </select>
            </div>

            {/* Right Side: View Toggle (Hidden on mobile) */}
            <div className="hidden sm:flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                title="Grid View"
              >
                <Icon name="GridView" size={16} />
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                title="List View"
              >
                <Icon name="ViewList" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white custom-scrollbar">
          {/* Loading Skeletons */}
          {loading && <HistorySessionsSkeleton count={6} viewMode={viewMode} />}

          {/* Sessions Grid View */}
          {!loading && viewMode === 'grid' && getSortedSessions().length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {getSortedSessions().map((session, idx) => (
                <SessionCardGrid
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
            </div>
          )}

          {/* Sessions List View */}
          {!loading && viewMode === 'list' && getSortedSessions().length > 0 && (
            <div className="flex flex-col gap-2">
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
            </div>
          )}

          {/* Empty State */}
          {!loading && getSortedSessions().length === 0 && (
            <div className="p-8 sm:p-16 text-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-gray-300 mb-4 flex justify-center">
                <Icon name="Language" size={48} />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-1">
                No sessions found
              </h3>
              <p className="text-sm text-gray-400">
                {filterDomain || filterTag !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start a new scraping job to see history here'}
              </p>
              {(filterDomain || filterTag !== 'all') && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      setFilterDomain('')
                      setFilterTag('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="text-red-500"><Icon name="Warning" /></div>
              <h3 className="font-medium text-gray-900">Delete Session</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete all scraped data for this session. This action cannot be undone.
              </p>
              <p className="text-sm font-bold text-gray-900 mb-1">
                Type the domain name to confirm:
              </p>
              <span className="block text-xs text-gray-500 mb-2 font-mono bg-gray-50 p-1 rounded">
                {deleteConfirmModal?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="Enter domain name"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
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
            </div>
          </div>
        </div>
      )}

      {/* Tag Dialog */}
      {editingTag && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Add Tag</h3>
            </div>
            <div className="p-6">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g., Production, Testing"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTag(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => saveTag(editingTag)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Note Dialog */}
      {editingNote && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Add Note</h3>
            </div>
            <div className="p-6">
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add notes about this scraping session..."
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => saveNote(editingNote)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
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
    <div 
      className={`
        relative h-full bg-white rounded-lg transition-all duration-200 border
        ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-400 hover:shadow-md'}
      `}
    >
      {/* Selection Checkbox */}
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleSelect(session.domain)}
          className={`p-1 rounded-full transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500 hover:bg-white'}`}
        >
          <Icon 
            name={isSelected ? 'CheckBox' : 'CheckBoxOutlineBlank'} 
            size={20}
          />
        </button>
      </div>

      <div className="p-4 pt-10 cursor-pointer h-full flex flex-col" onClick={() => onViewProgress(session.domain)}>
        {/* Domain Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate" title={session.domain}>
              {getDomain(session.domain)}
            </h4>
            {sessionTags[session.domain] && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium uppercase tracking-wide">
                {sessionTags[session.domain]}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 block">
            {new Date(session.end_time * 1000).toLocaleDateString()} • {formatDuration(session.end_time - session.start_time)}
          </span>
        </div>

        {/* Note Preview */}
        {sessionNotes[session.domain] && (
          <div className="p-2 mb-3 bg-gray-50 border-l-2 border-blue-400 rounded-r text-xs text-gray-600 italic line-clamp-2">
            {sessionNotes[session.domain]}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
          <div className="flex items-center gap-1.5 text-gray-500" title="Total Pages">
            <Icon name="Description" size={14} />
            <span className="text-xs">{session.total_pages.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500" title="Total Files">
            <Icon name="Download" size={14} />
            <span className="text-xs">{session.total_files.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500" title="Max Depth">
            <Icon name="Layers" size={14} />
            <span className="text-xs">Depth {session.max_depth}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500" title="Total Size">
            <Icon name="Storage" size={14} />
            <span className="text-xs">{api.formatBytes(session.total_size)}</span>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        {/* Actions */}
        <div 
          className="flex items-center gap-1 text-gray-400" 
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Add Tag"
            onClick={() => onAddTag(session.domain)}
          >
            <Icon name="Label" size={16} />
          </button>
          <button 
            className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Add Note"
            onClick={() => onAddNote(session.domain)}
          >
            <Icon name="Note" size={16} />
          </button>
          <button 
            className={`p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${exportingSession === session.domain ? 'opacity-50 cursor-wait' : ''}`}
            title="Export"
            onClick={(e) => onExport(session.domain, e)}
            disabled={exportingSession === session.domain}
          >
            <Icon name="Download" size={16} />
          </button>
          
          <div className="flex-1"></div>
          
          <button 
            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
            onClick={(e) => onDelete(session.domain, e)}
          >
            <Icon name="Delete" size={16} />
          </button>
        </div>
      </div>
    </div>
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
    <div 
      className={`
        group relative bg-white rounded-lg transition-all duration-200 border
        ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'}
      `}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          
          {/* Checkbox */}
          <button
            onClick={() => onToggleSelect(session.domain)}
            className={`shrink-0 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <Icon 
              name={isSelected ? 'CheckBox' : 'CheckBoxOutlineBlank'} 
              size={20}
            />
          </button>

          {/* Icon */}
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 cursor-pointer"
            onClick={() => onViewProgress(session.domain)}
          >
            <Icon name="Language" size={20} />
          </div>

          {/* Main Info */}
          <div 
            className="flex-1 min-w-0 cursor-pointer mr-2"
            onClick={() => onViewProgress(session.domain)}
          >
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate" title={session.domain}>
                {getDomain(session.domain)}
              </h4>
              {sessionTags[session.domain] && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium uppercase tracking-wide">
                  {sessionTags[session.domain]}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>{new Date(session.end_time * 1000).toLocaleDateString()}</span>
              <span>•</span>
              <span>{formatDuration(session.end_time - session.start_time)}</span>
            </div>
          </div>

          {/* Stats (Desktop only) */}
          <div className="hidden md:flex items-center gap-3 shrink-0 mr-4">
            <span className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-600 flex items-center gap-1">
              <Icon name="Description" size={12} /> {session.total_pages.toLocaleString()}
            </span>
            <span className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-600 flex items-center gap-1">
              <Icon name="Download" size={12} /> {session.total_files.toLocaleString()}
            </span>
            <span className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-600 flex items-center gap-1">
              <Icon name="Storage" size={12} /> {api.formatBytes(session.total_size)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto sm:ml-0">
            <button 
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Add Tag"
              onClick={() => onAddTag(session.domain)}
            >
              <Icon name="Label" size={18} />
            </button>
            <button 
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Add Note"
              onClick={() => onAddNote(session.domain)}
            >
              <Icon name="Note" size={18} />
            </button>
            <button 
              className={`p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${exportingSession === session.domain ? 'opacity-50 cursor-wait' : ''}`}
              title="Export"
              onClick={(e) => onExport(session.domain, e)}
              disabled={exportingSession === session.domain}
            >
              <Icon name="Download" size={18} />
            </button>
            <button 
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
              onClick={(e) => onDelete(session.domain, e)}
            >
              <Icon name="Delete" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}