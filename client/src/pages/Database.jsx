import { useState, useEffect } from 'react'
import { getStats, getPages, getFileAssets, searchContent, searchFiles } from '../services/api'
import '../styles/Database.css'

function Database() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [pages, setPages] = useState([])
  const [files, setFiles] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('content')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats()
    } else if (activeTab === 'pages') {
      fetchPages()
    } else if (activeTab === 'files') {
      fetchFiles()
    }
  }, [activeTab])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getStats()
      setStats(data)
    } catch (err) {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchPages = async () => {
    try {
      setLoading(true)
      const data = await getPages(50, 0)
      setPages(data.pages)
    } catch (err) {
      setError('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const data = await getFileAssets(50)
      setFiles(data.files)
    } catch (err) {
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setError(null)
      const data = searchType === 'content' 
        ? await searchContent(searchQuery, 50)
        : await searchFiles(searchQuery, 50)
      setSearchResults(data)
      setActiveTab('search')
    } catch (err) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Database Query</h1>
        <p className="page-description">Browse and search scraped data</p>
      </div>

      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          className="search-type-select"
        >
          <option value="content">Search Content</option>
          <option value="files">Search Files</option>
        </select>
        <input
          type="text"
          placeholder={`Search ${searchType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          Search
        </button>
      </form>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={`tab ${activeTab === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveTab('pages')}
        >
          Pages
        </button>
        <button 
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        {searchResults && (
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Results
          </button>
        )}
      </div>

      {error && (
        <div className="message error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="tab-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Pages</h3>
                  <p className="stat-number">{stats.total_pages || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Links</h3>
                  <p className="stat-number">{stats.total_links || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Internal Links</h3>
                  <p className="stat-number">{stats.internal_links || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>External Links</h3>
                  <p className="stat-number">{stats.external_links || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Media</h3>
                  <p className="stat-number">{stats.total_media || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Headers</h3>
                  <p className="stat-number">{stats.total_headers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>File Assets</h3>
                  <p className="stat-number">{stats.total_file_assets || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Successful Downloads</h3>
                  <p className="stat-number">{stats.successful_downloads || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Failed Downloads</h3>
                  <p className="stat-number">{stats.failed_downloads || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Download Size</h3>
                  <p className="stat-number">{(stats.total_download_size_mb || 0).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {/* Pages Tab */}
            {activeTab === 'pages' && (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>URL</th>
                      <th>Title</th>
                      <th>Depth</th>
                      <th>Scraped At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id}>
                        <td>{page.id}</td>
                        <td className="url-cell">
                          <a href={page.url} target="_blank" rel="noopener noreferrer">
                            {page.url}
                          </a>
                        </td>
                        <td>{page.title || 'No title'}</td>
                        <td>{page.depth}</td>
                        <td>{page.scraped_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pages.length === 0 && (
                  <p className="no-data">No pages found. Start scraping to see data.</p>
                )}
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Extension</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Source Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file, idx) => (
                      <tr key={idx}>
                        <td>{file.file_name}</td>
                        <td><span className="badge">{file.file_extension}</span></td>
                        <td>{formatBytes(file.file_size_bytes)}</td>
                        <td>
                          <span className={`status-badge ${file.download_status}`}>
                            {file.download_status}
                          </span>
                        </td>
                        <td className="url-cell">
                          <a href={file.page_url} target="_blank" rel="noopener noreferrer">
                            {file.page_url}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {files.length === 0 && (
                  <p className="no-data">No files found. Enable file downloads in config.</p>
                )}
              </div>
            )}

            {/* Search Results Tab */}
            {activeTab === 'search' && searchResults && (
              <div className="search-results">
                <h3>Search Results for "{searchResults.keyword}" ({searchResults.total} found)</h3>
                {searchResults.results.length > 0 ? (
                  <div className="results-list">
                    {searchResults.results.map((result, idx) => (
                      <div className="result-item" key={idx}>
                        {result.title && <h4>{result.title}</h4>}
                        {result.file_name && <h4>{result.file_name}</h4>}
                        {result.url && (
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            {result.url}
                          </a>
                        )}
                        {result.page_url && (
                          <a href={result.page_url} target="_blank" rel="noopener noreferrer">
                            {result.page_url}
                          </a>
                        )}
                        {result.preview && <p className="preview">{result.preview}...</p>}
                        {result.file_extension && (
                          <span className="badge">{result.file_extension}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No results found.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Database
