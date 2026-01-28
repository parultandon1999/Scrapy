import { useState, useEffect } from 'react'
import { getConfig, updateConfig } from '../services/api'
import '../styles/Config.css'

function Config() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editMode, setEditMode] = useState({})

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const data = await getConfig()
      setConfig(data)
    } catch (err) {
      setError('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (section, key, value) => {
    try {
      setError(null)
      setSuccess(null)
      await updateConfig(section, key, value)
      setSuccess(`Updated ${section}.${key}`)
      fetchConfig()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update configuration')
    }
  }

  const toggleEdit = (section, key) => {
    const editKey = `${section}.${key}`
    setEditMode(prev => ({
      ...prev,
      [editKey]: !prev[editKey]
    }))
  }

  const renderConfigSection = (sectionName, sectionData) => {
    return (
      <div className="config-section" key={sectionName}>
        <h3>{sectionName.toUpperCase()}</h3>
        <div className="config-items">
          {Object.entries(sectionData).map(([key, value]) => {
            const editKey = `${sectionName}.${key}`
            const isEditing = editMode[editKey]
            
            return (
              <div className="config-item" key={key}>
                <div className="config-label">
                  <span className="config-key">{key}</span>
                  <span className="config-type">{typeof value}</span>
                </div>
                <div className="config-value-container">
                  {isEditing ? (
                    <input
                      type={typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'checkbox' : 'text'}
                      defaultValue={typeof value === 'boolean' ? undefined : value}
                      defaultChecked={typeof value === 'boolean' ? value : undefined}
                      className="config-input"
                      onBlur={(e) => {
                        const newValue = typeof value === 'number' 
                          ? parseInt(e.target.value)
                          : typeof value === 'boolean'
                          ? e.target.checked
                          : e.target.value
                        handleUpdate(sectionName, key, newValue)
                        toggleEdit(sectionName, key)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur()
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="config-value">
                      {typeof value === 'boolean' ? (value ? '✓ true' : '✗ false') : String(value)}
                    </span>
                  )}
                  <button
                    className="config-edit-btn"
                    onClick={() => toggleEdit(sectionName, key)}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Configuration</h1>
        </div>
        <div className="loading">Loading configuration...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Configuration</h1>
        <p className="page-description">Manage scraper settings and preferences</p>
      </div>

      {error && (
        <div className="message error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <p>{success}</p>
        </div>
      )}

      <div className="config-container">
        {config && Object.entries(config).map(([section, data]) => 
          renderConfigSection(section, data)
        )}
      </div>

      <div className="config-note">
        <p><strong>Note:</strong> Changes take effect immediately but may require restarting the scraper for active jobs.</p>
      </div>
    </div>
  )
}

export default Config
