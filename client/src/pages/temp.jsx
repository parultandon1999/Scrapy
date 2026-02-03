import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import {
  Clock, Globe, FileText, HardDrive, Link2, Calendar,
  Layers, Trash2, Eye, BarChart3, Download, ChevronRight,
  AlertCircle, CheckCircle, XCircle, X, Search
} from 'lucide-react'
import * as api from '../services/api'
import { useToast } from '../components/mui/toasts/useToast'
import { 
  HistoryCardSkeleton,
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
    } catch (err) {
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

  // Shared Components
  const NavButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
        ${activeView === id 
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  )

  const StatCard = ({ icon: Icon, label, value, subtext }) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Icon size={20} />
        </div>
        {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      </div>
    </div>
  )

  const ActionButton = ({ onClick, icon: Icon, variant = 'default', title, disabled }) => {
    const variants = {
      default: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 text-gray-500 dark:text-gray-400',
      primary: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-gray-500 dark:text-gray-400',
      success: 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 text-gray-500 dark:text-gray-400',
      danger: 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-500 dark:text-gray-400',
    }
    
    return (
      <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-1.5 rounded-md border border-gray-200 dark:border-gray-800 transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {disabled ? '...' : <Icon size={14} />}
      </button>
    )
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="history" />
      
      {/* Wrapper to apply dark mode class to internal content based on prop */}
      <div className={darkMode ? 'dark' : ''}>
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-white dark:bg-black">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white dark:bg-gray-950 border-b md:border-r border-gray-200 dark:border-gray-800 flex-shrink-0 md:h-[calc(100vh-80px)] md:sticky md:top-[80px] overflow-y-auto">
            <div className="p-4 md:p-6">
              <h2 className="flex items-center gap-2 px-3 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Menu
              </h2>
              <nav className="flex flex-col gap-1">
                <NavButton id="sessions" icon={Globe} label="Sessions" />
                <NavButton id="timeline" icon={Calendar} label="Timeline" />
                <NavButton id="statistics" icon={BarChart3} label="Statistics" />
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50/50 dark:bg-black">
            <Breadcrumb 
              items={[
                { label: 'History', icon: Clock, path: '/history' },
                { label: activeView === 'sessions' ? 'Sessions' :
                        activeView === 'timeline' ? 'Timeline' :
                        activeView === 'statistics' ? 'Statistics' :
                        activeView === 'session-details' ? `Session: ${selectedSession ? getDomain(selectedSession) : 'Details'}` :
                        activeView === 'comparison' ? 'Compare' : 'View'
                }
              ]}
            />

            {error && (
              <div className="mb-6 flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                <p className="text-sm font-medium">{error}</p>
                <button onClick={() => setError(null)} className="hover:bg-red-100 dark:hover:bg-red-900/40 p-1 rounded">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Skeletons */}
            {loading && activeView === 'sessions' && <HistorySessionsSkeleton />}
            {loading && activeView === 'statistics' && <HistoryStatisticsSkeleton />}
            {loading && activeView === 'timeline' && <HistoryTimelineSkeleton />}
            {(loading && (activeView === 'session-details' || activeView === 'comparison')) && <HistorySessionDetailsSkeleton />}

            {/* SESSIONS VIEW */}
            {activeView === 'sessions' && !loading && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h1 className="text-2xl font-light text-gray-900 dark:text-white">
                    Sessions <span className="text-gray-400 font-normal text-lg">({sessions.length})</span>
                  </h1>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        placeholder="Filter domains..."
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-gray-200"
                      />
                    </div>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)} 
                      className="px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 dark:text-gray-200 cursor-pointer"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="pages">Most Pages</option>
                      <option value="size">Largest Size</option>
                    </select>
                  </div>
                </div>

                {selectedForComparison.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                      <CheckCircle size={16} />
                      <span>{selectedForComparison.length} selected for comparison</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCompare}
                        disabled={selectedForComparison.length !== 2}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Compare
                      </button>
                      <button 
                        onClick={() => setSelectedForComparison([])}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {getSortedSessions().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {getSortedSessions().map((session, idx) => (
                      <div 
                        key={idx}
                        className={`group relative bg-white dark:bg-gray-900 border rounded-xl p-5 transition-all hover:shadow-md
                          ${selectedForComparison.includes(session.domain) 
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' 
                            : 'border-gray-200 dark:border-gray-800'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <input
                              type="checkbox"
                              checked={selectedForComparison.includes(session.domain)}
                              onChange={() => toggleSessionForComparison(session.domain)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {getDomain(session.domain)}
                              </h3>
                              <a href={session.domain} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block">
                                {session.domain}
                              </a>
                            </div>
                          </div>
                          
                          {sessionTags[session.domain] && (
                            <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                              {sessionTags[session.domain]}
                            </span>
                          )}
                        </div>

                        {sessionNotes[session.domain] && (
                          <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-xs text-gray-600 dark:text-gray-400 border-l-2 border-gray-400 italic">
                            {sessionNotes[session.domain]}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" />
                            <span><strong className="text-gray-700 dark:text-gray-300">{session.total_pages}</strong> pages</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Layers size={14} className="text-gray-400" />
                            <span>Depth <strong className="text-gray-700 dark:text-gray-300">{session.max_depth}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Download size={14} className="text-gray-400" />
                            <span><strong className="text-gray-700 dark:text-gray-300">{session.total_files}</strong> files</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HardDrive size={14} className="text-gray-400" />
                            <span>{api.formatBytes(session.total_size)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-400">
                            {new Date(session.end_time * 1000).toLocaleDateString()} • {formatDuration(session.end_time - session.start_time)}
                          </span>
                          
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <ActionButton onClick={() => handleAddTag(session.domain)} icon={Layers} title="Tag" />
                            <ActionButton onClick={() => handleAddNote(session.domain)} icon={FileText} title="Note" />
                            <ActionButton onClick={(e) => handleExportSession(session.domain, e)} icon={Download} variant="success" title="Export" disabled={exportingSession === session.domain} />
                            <ActionButton onClick={() => fetchSessionDetails(session.domain)} icon={BarChart3} title="Details" />
                            <ActionButton onClick={() => handleViewProgress(session.domain)} icon={Eye} variant="primary" title="View" />
                            <ActionButton onClick={(e) => handleDeleteSession(session.domain, e)} icon={Trash2} variant="danger" title="Delete" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Globe className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No sessions found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Start a new scraping job to see history here.</p>
                  </div>
                )}
              </div>
            )}

            {/* STATISTICS VIEW */}
            {activeView === 'statistics' && statistics && !loading && (
              <div className="space-y-6">
                <h1 className="text-2xl font-light text-gray-900 dark:text-white">Overall Statistics</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Globe} label="Total Sessions" value={statistics.total_sessions} />
                  <StatCard icon={FileText} label="Total Pages" value={statistics.total_pages} />
                  <StatCard icon={Download} label="Total Files" value={statistics.total_files} />
                  <StatCard icon={HardDrive} label="Total Size" value={`${statistics.total_size_mb.toFixed(1)} MB`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {statistics.most_active_day && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-6">
                        <Calendar size={18} className="text-blue-500" /> Most Active Day
                      </h3>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-light text-gray-900 dark:text-white">{statistics.most_active_day.date}</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                          {statistics.most_active_day.count} pages
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-6">
                      <Clock size={18} className="text-blue-500" /> Avg. Session Duration
                    </h3>
                    <div className="text-3xl font-light text-gray-900 dark:text-white">
                      {formatDuration(statistics.avg_session_duration_seconds)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE VIEW */}
            {activeView === 'timeline' && timelineData && !loading && (
              <div className="space-y-8">
                <h1 className="text-2xl font-light text-gray-900 dark:text-white">Activity Timeline</h1>
                
                {timelineData.timeline && timelineData.timeline.length > 0 ? (
                  <div className="space-y-8">
                    {/* Bar Chart Visualization */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-64 flex items-end gap-2">
                      {timelineData.timeline.map((item, idx) => {
                        const maxPages = Math.max(...timelineData.timeline.map(t => t.pages_scraped))
                        const height = Math.max((item.pages_scraped / maxPages) * 100, 5) // Min 5% height
                        
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <div 
                              className="w-full max-w-[40px] bg-blue-100 dark:bg-blue-900/30 rounded-t-sm relative transition-all duration-300 hover:bg-blue-500 dark:hover:bg-blue-500 group-hover:scale-y-105 origin-bottom"
                              style={{ height: `${height}%` }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                                {item.pages_scraped} pages
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 rotate-0 sm:-rotate-45 sm:origin-top-left truncate w-full text-center sm:text-left mt-2">
                              {item.date}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Timeline List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {timelineData.timeline.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex justify-between items-center hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">
                              <Calendar size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.date}</div>
                              <div className="text-xs text-gray-500">Activity Report</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{item.pages_scraped}</div>
                            <div className="text-[10px] text-gray-400 uppercase">Pages</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">No timeline data available.</div>
                )}
              </div>
            )}

            {/* DETAILS VIEW */}
            {activeView === 'session-details' && sessionDetails && !loading && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setActiveView('sessions')} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors"
                    >
                      <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <h1 className="text-xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Globe size={20} className="text-blue-500" />
                      {getDomain(sessionDetails.domain)}
                    </h1>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Overview Panel */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 size={16} /> Overview
                    </h3>
                    <div className="space-y-3">
                      {[
                        ['Total Pages', sessionDetails.overview.total_pages],
                        ['Max Depth', `Depth ${sessionDetails.overview.max_depth}`],
                        ['Avg Depth', sessionDetails.overview.avg_depth?.toFixed(1)],
                        ['Duration', formatDuration(sessionDetails.overview.end_time - sessionDetails.overview.start_time)],
                        ['Started', new Date(sessionDetails.overview.start_time * 1000).toLocaleString()],
                      ].map(([label, value], i) => (
                        <div key={i} className="flex justify-between text-sm py-1 border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0">
                          <span className="text-gray-500 dark:text-gray-400">{label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Depth Chart Panel */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Layers size={16} /> Depth Distribution
                    </h3>
                    <div className="space-y-3">
                      {sessionDetails.depth_distribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <span className="w-8 font-mono text-gray-500">D{item.depth}</span>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(item.count / Math.max(...sessionDetails.depth_distribution.map(d => d.count))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="w-8 text-right font-medium text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* File Stats Table */}
                {sessionDetails.file_stats.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Download size={16} /> File Statistics
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-950 text-xs uppercase text-gray-500 dark:text-gray-400">
                          <tr>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Count</th>
                            <th className="px-6 py-3 font-medium">Total Size</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {sessionDetails.file_stats.map((file, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <td className="px-6 py-3">
                                <span className="inline-block px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                                  {file.file_extension}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-gray-900 dark:text-gray-200">{file.count}</td>
                              <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{api.formatBytes(file.total_size)}</td>
                              <td className="px-6 py-3">
                                {file.download_status === 'success' ? (
                                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-xs font-medium">
                                    <CheckCircle size={12} /> Success
                                  </span>
                                ) : (
                                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1 text-xs font-medium">
                                    <XCircle size={12} /> Failed
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COMPARISON VIEW */}
            {activeView === 'comparison' && comparisonData && !loading && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setActiveView('sessions')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <h1 className="text-2xl font-light text-gray-900 dark:text-white">Compare Sessions</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
                  {[comparisonData.session1, comparisonData.session2].map((session, i) => (
                    <div key={i} className="space-y-4">
                      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-center">
                        <h2 className="font-semibold text-lg text-gray-900 dark:text-white truncate px-2">{getDomain(session.domain)}</h2>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase">Pages</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{session.overview.total_pages}</div>
                        </div>
                         <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase">Depth</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{session.overview.max_depth}</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase">Files</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {session.file_stats.reduce((acc, f) => acc + f.count, 0)}
                          </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase">Time</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white truncate">
                             {formatDuration(session.overview.end_time - session.overview.start_time)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="hidden lg:flex items-center justify-center h-full pt-20">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500">VS</div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Delete Modal */}
        {deleteConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Session Data?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  This will permanently delete all pages and files for <br/>
                  <span className="font-mono text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{deleteConfirmModal}</span>
                </p>
                
                <div className="mb-6 text-left">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type domain to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="example.com"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirmModal(null)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={deleteConfirmInput !== deleteConfirmModal.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tag Modal */}
        {editingTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Tag</h3>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveTag(editingTag)}
                placeholder="e.g. Production"
                className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingTag(null)} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Cancel</button>
                <button onClick={() => saveTag(editingTag)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Note</h3>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add session notes..."
                rows={4}
                className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                autoFocus
              />
               <div className="text-xs text-right text-gray-400 mb-4">{noteInput.length}/500</div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingNote(null)} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Cancel</button>
                <button onClick={() => saveNote(editingNote)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default History