import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import Button from '../components/Button'
import { useToast } from '../components/ToastContainer'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import {
  Clock, Plus, Play, Pause, Trash2, Edit2, Calendar,
  CheckCircle, XCircle, AlertCircle, Copy, RefreshCw
} from 'lucide-react'
import '../styles/ScheduledScraping.css'

function ScheduledScraping({ darkMode, toggleDarkMode }) {
  const toast = useToast()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    schedule_type: 'interval', // interval, daily, weekly, monthly, cron
    interval_minutes: 60,
    time_of_day: '09:00',
    day_of_week: 1, // Monday
    day_of_month: 1,
    cron_expression: '0 9 * * *',
    enabled: true,
    max_pages: 100,
    max_depth: 3,
    use_authentication: false,
    webhook_url: ''
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      // Simulated API call - replace with actual API
      const mockSchedules = JSON.parse(localStorage.getItem('scheduled_scrapes') || '[]')
      setSchedules(mockSchedules)
    } catch (error) {
      toast.error('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const schedule = {
      id: editingSchedule?.id || Date.now(),
      ...formData,
      created_at: editingSchedule?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_run: editingSchedule?.last_run || null,
      next_run: calculateNextRun(formData),
      run_count: editingSchedule?.run_count || 0,
      status: 'active'
    }

    const updatedSchedules = editingSchedule
      ? schedules.map(s => s.id === editingSchedule.id ? schedule : s)
      : [...schedules, schedule]

    setSchedules(updatedSchedules)
    localStorage.setItem('scheduled_scrapes', JSON.stringify(updatedSchedules))
    
    toast.success(editingSchedule ? 'Schedule updated' : 'Schedule created')
    closeModal()
  }

  const calculateNextRun = (data) => {
    const now = new Date()
    let nextRun = new Date()

    switch (data.schedule_type) {
      case 'interval':
        nextRun.setMinutes(now.getMinutes() + parseInt(data.interval_minutes))
        break
      case 'daily':
        const [hours, minutes] = data.time_of_day.split(':')
        nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1)
        }
        break
      case 'weekly':
        const targetDay = parseInt(data.day_of_week)
        const currentDay = now.getDay()
        let daysUntilTarget = targetDay - currentDay
        if (daysUntilTarget <= 0) daysUntilTarget += 7
        nextRun.setDate(now.getDate() + daysUntilTarget)
        const [wHours, wMinutes] = data.time_of_day.split(':')
        nextRun.setHours(parseInt(wHours), parseInt(wMinutes), 0, 0)
        break
      case 'monthly':
        nextRun.setDate(parseInt(data.day_of_month))
        const [mHours, mMinutes] = data.time_of_day.split(':')
        nextRun.setHours(parseInt(mHours), parseInt(mMinutes), 0, 0)
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
        break
      case 'cron':
        // Simplified cron calculation - in production use a cron parser library
        nextRun.setHours(now.getHours() + 1)
        break
    }

    return nextRun.toISOString()
  }

  const handleToggleEnabled = (id) => {
    const updatedSchedules = schedules.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled, status: !s.enabled ? 'active' : 'paused' } : s
    )
    setSchedules(updatedSchedules)
    localStorage.setItem('scheduled_scrapes', JSON.stringify(updatedSchedules))
    toast.success('Schedule updated')
  }

  const handleDelete = (id) => {
    if (!confirm('Delete this schedule?')) return
    
    const updatedSchedules = schedules.filter(s => s.id !== id)
    setSchedules(updatedSchedules)
    localStorage.setItem('scheduled_scrapes', JSON.stringify(updatedSchedules))
    toast.success('Schedule deleted')
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      name: schedule.name,
      url: schedule.url,
      schedule_type: schedule.schedule_type,
      interval_minutes: schedule.interval_minutes,
      time_of_day: schedule.time_of_day,
      day_of_week: schedule.day_of_week,
      day_of_month: schedule.day_of_month,
      cron_expression: schedule.cron_expression,
      enabled: schedule.enabled,
      max_pages: schedule.max_pages,
      max_depth: schedule.max_depth,
      use_authentication: schedule.use_authentication,
      webhook_url: schedule.webhook_url || ''
    })
    setShowModal(true)
  }

  const handleDuplicate = (schedule) => {
    setEditingSchedule(null)
    setFormData({
      ...schedule,
      name: `${schedule.name} (Copy)`
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSchedule(null)
    setFormData({
      name: '',
      url: '',
      schedule_type: 'interval',
      interval_minutes: 60,
      time_of_day: '09:00',
      day_of_week: 1,
      day_of_month: 1,
      cron_expression: '0 9 * * *',
      enabled: true,
      max_pages: 100,
      max_depth: 3,
      use_authentication: false,
      webhook_url: ''
    })
  }

  const formatNextRun = (dateString) => {
    if (!dateString) return 'Not scheduled'
    const date = new Date(dateString)
    const now = new Date()
    const diff = date - now
    
    if (diff < 0) return 'Overdue'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `in ${days} day${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    } else {
      return `in ${minutes}m`
    }
  }

  const getScheduleDescription = (schedule) => {
    switch (schedule.schedule_type) {
      case 'interval':
        return `Every ${schedule.interval_minutes} minutes`
      case 'daily':
        return `Daily at ${schedule.time_of_day}`
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return `Weekly on ${days[schedule.day_of_week]} at ${schedule.time_of_day}`
      case 'monthly':
        return `Monthly on day ${schedule.day_of_month} at ${schedule.time_of_day}`
      case 'cron':
        return `Cron: ${schedule.cron_expression}`
      default:
        return 'Unknown schedule'
    }
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="scheduled-scraping-page">
        <main className="scheduled-main">
          <Breadcrumb 
            items={[
              { label: 'Scraping', path: '/' },
              { label: 'Scheduled Jobs', icon: Clock }
            ]}
          />

          <div className="scheduled-header">
            <div>
              <h1><Clock size={32} /> Scheduled Scraping</h1>
              <p className="scheduled-description">
                Automate your scraping tasks with flexible scheduling options
              </p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowModal(true)}
              size="large"
            >
              New Schedule
            </Button>
          </div>

          {loading && <LoadingState type="fetching-sessions" size="large" />}

          {!loading && schedules.length === 0 && (
            <EmptyState
              type="no-data"
              title="No Scheduled Jobs"
              description="Create your first scheduled scraping job to automate data collection"
              primaryAction={{
                label: 'Create Schedule',
                icon: Plus,
                onClick: () => setShowModal(true)
              }}
            />
          )}

          {!loading && schedules.length > 0 && (
            <div className="schedules-grid">
              {schedules.map(schedule => (
                <div key={schedule.id} className={`schedule-card ${!schedule.enabled ? 'disabled' : ''}`}>
                  <div className="schedule-header">
                    <div className="schedule-title-section">
                      <h3>{schedule.name}</h3>
                      <span className={`schedule-status ${schedule.status}`}>
                        {schedule.enabled ? (
                          <><CheckCircle size={14} /> Active</>
                        ) : (
                          <><Pause size={14} /> Paused</>
                        )}
                      </span>
                    </div>
                    <div className="schedule-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleToggleEnabled(schedule.id)}
                        title={schedule.enabled ? 'Pause' : 'Resume'}
                      >
                        {schedule.enabled ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(schedule)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleDuplicate(schedule)}
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(schedule.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="schedule-url">
                    <a href={schedule.url} target="_blank" rel="noopener noreferrer">
                      {schedule.url}
                    </a>
                  </div>

                  <div className="schedule-details">
                    <div className="schedule-detail">
                      <Clock size={16} />
                      <span>{getScheduleDescription(schedule)}</span>
                    </div>
                    <div className="schedule-detail">
                      <Calendar size={16} />
                      <span>Next run: {formatNextRun(schedule.next_run)}</span>
                    </div>
                    <div className="schedule-detail">
                      <RefreshCw size={16} />
                      <span>Runs: {schedule.run_count}</span>
                    </div>
                  </div>

                  {schedule.webhook_url && (
                    <div className="schedule-webhook">
                      <AlertCircle size={14} />
                      <span>Webhook configured</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSchedule ? 'Edit Schedule' : 'New Schedule'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="schedule-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Schedule Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Daily News Scrape"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="url">Target URL *</label>
                  <input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Schedule Configuration</h3>
                
                <div className="form-group">
                  <label htmlFor="schedule_type">Schedule Type *</label>
                  <select
                    id="schedule_type"
                    value={formData.schedule_type}
                    onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                  >
                    <option value="interval">Interval (Every X minutes)</option>
                    <option value="daily">Daily (Specific time)</option>
                    <option value="weekly">Weekly (Specific day & time)</option>
                    <option value="monthly">Monthly (Specific date & time)</option>
                    <option value="cron">Cron Expression (Advanced)</option>
                  </select>
                </div>

                {formData.schedule_type === 'interval' && (
                  <div className="form-group">
                    <label htmlFor="interval_minutes">Interval (minutes) *</label>
                    <input
                      id="interval_minutes"
                      type="number"
                      min="5"
                      max="10080"
                      value={formData.interval_minutes}
                      onChange={(e) => setFormData({ ...formData, interval_minutes: e.target.value })}
                      required
                    />
                    <small>Minimum: 5 minutes, Maximum: 1 week (10080 minutes)</small>
                  </div>
                )}

                {(formData.schedule_type === 'daily' || formData.schedule_type === 'weekly' || formData.schedule_type === 'monthly') && (
                  <div className="form-group">
                    <label htmlFor="time_of_day">Time of Day *</label>
                    <input
                      id="time_of_day"
                      type="time"
                      value={formData.time_of_day}
                      onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                      required
                    />
                  </div>
                )}

                {formData.schedule_type === 'weekly' && (
                  <div className="form-group">
                    <label htmlFor="day_of_week">Day of Week *</label>
                    <select
                      id="day_of_week"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                )}

                {formData.schedule_type === 'monthly' && (
                  <div className="form-group">
                    <label htmlFor="day_of_month">Day of Month *</label>
                    <input
                      id="day_of_month"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.day_of_month}
                      onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                      required
                    />
                  </div>
                )}

                {formData.schedule_type === 'cron' && (
                  <div className="form-group">
                    <label htmlFor="cron_expression">Cron Expression *</label>
                    <input
                      id="cron_expression"
                      type="text"
                      value={formData.cron_expression}
                      onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                      placeholder="0 9 * * *"
                      required
                    />
                    <small>Format: minute hour day month weekday (e.g., "0 9 * * *" = 9 AM daily)</small>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Scraping Options</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="max_pages">Max Pages</label>
                    <input
                      id="max_pages"
                      type="number"
                      min="1"
                      value={formData.max_pages}
                      onChange={(e) => setFormData({ ...formData, max_pages: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="max_depth">Max Depth</label>
                    <input
                      id="max_depth"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.max_depth}
                      onChange={(e) => setFormData({ ...formData, max_depth: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.use_authentication}
                      onChange={(e) => setFormData({ ...formData, use_authentication: e.target.checked })}
                    />
                    <span>Use Authentication (from config)</span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Notifications (Optional)</h3>
                
                <div className="form-group">
                  <label htmlFor="webhook_url">Webhook URL</label>
                  <input
                    id="webhook_url"
                    type="url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    placeholder="https://your-webhook.com/endpoint"
                  />
                  <small>Receive POST notification when scraping completes</small>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="ghost" onClick={closeModal} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default ScheduledScraping
