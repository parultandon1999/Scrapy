import { useState } from 'react'
import { analyzeLoginPage } from '../services/api'
import '../styles/SelectorFinder.css'

function SelectorFinder() {
  const [loginUrl, setLoginUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await analyzeLoginPage(loginUrl)
      setResults(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze login page')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Selector Finder</h1>
        <p className="page-description">Analyze login pages and find CSS selectors automatically</p>
      </div>

      <form className="selector-form" onSubmit={handleAnalyze}>
        <div className="form-group">
          <label>Login Page URL</label>
          <input
            type="url"
            placeholder="https://example.com/login"
            value={loginUrl}
            onChange={(e) => setLoginUrl(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading || !loginUrl}
        >
          {loading ? 'Analyzing...' : 'Analyze Page'}
        </button>
      </form>

      {error && (
        <div className="message error-message">
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="results-container">
          {/* Suggested Configuration */}
          {results.suggested_config && Object.keys(results.suggested_config).length > 0 && (
            <div className="result-section">
              <h3>✓ Suggested Configuration</h3>
              <div className="config-code">
                <pre>
{`AUTH = {
    'login_url': '${results.login_url}',
    'username': 'YOUR_USERNAME',
    'password': 'YOUR_PASSWORD',
    'username_selector': '${results.suggested_config.username_selector || "input[name='username']"}',
    'password_selector': '${results.suggested_config.password_selector || "input[name='password']"}',
    'submit_selector': '${results.suggested_config.submit_selector || "button[type='submit']"}',
    'success_indicator': '.user-profile',  # UPDATE THIS
}`}
                </pre>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(`AUTH = {\n    'login_url': '${results.login_url}',\n    'username': 'YOUR_USERNAME',\n    'password': 'YOUR_PASSWORD',\n    'username_selector': '${results.suggested_config.username_selector}',\n    'password_selector': '${results.suggested_config.password_selector}',\n    'submit_selector': '${results.suggested_config.submit_selector}',\n    'success_indicator': '.user-profile',\n}`)}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Input Fields */}
          {results.inputs && results.inputs.length > 0 && (
            <div className="result-section">
              <h3>Input Fields ({results.inputs.length})</h3>
              <div className="items-grid">
                {results.inputs.map((input, idx) => (
                  <div className="item-card" key={idx}>
                    <div className="item-header">
                      <span className="item-badge">{input.type}</span>
                      {input.likely_field !== 'text' && (
                        <span className="item-badge likely">{input.likely_field}</span>
                      )}
                    </div>
                    {input.name && <p><strong>Name:</strong> {input.name}</p>}
                    {input.id && <p><strong>ID:</strong> {input.id}</p>}
                    {input.placeholder && <p><strong>Placeholder:</strong> {input.placeholder}</p>}
                    {input.suggested_selectors && input.suggested_selectors.length > 0 && (
                      <div className="selectors">
                        <strong>Selectors:</strong>
                        {input.suggested_selectors.map((sel, i) => (
                          <code key={i} onClick={() => copyToClipboard(sel)}>{sel}</code>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          {results.buttons && results.buttons.length > 0 && (
            <div className="result-section">
              <h3>Buttons ({results.buttons.length})</h3>
              <div className="items-grid">
                {results.buttons.map((button, idx) => (
                  <div className="item-card" key={idx}>
                    <div className="item-header">
                      <span className="item-badge">{button.type || 'button'}</span>
                      {button.likely_submit && (
                        <span className="item-badge likely">submit</span>
                      )}
                    </div>
                    {button.text && <p><strong>Text:</strong> {button.text}</p>}
                    {button.id && <p><strong>ID:</strong> {button.id}</p>}
                    {button.suggested_selectors && button.suggested_selectors.length > 0 && (
                      <div className="selectors">
                        <strong>Selectors:</strong>
                        {button.suggested_selectors.map((sel, i) => (
                          <code key={i} onClick={() => copyToClipboard(sel)}>{sel}</code>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forms */}
          {results.forms && results.forms.length > 0 && (
            <div className="result-section">
              <h3>Forms ({results.forms.length})</h3>
              <div className="items-grid">
                {results.forms.map((form, idx) => (
                  <div className="item-card" key={idx}>
                    <p><strong>Form #{form.index}</strong></p>
                    {form.id && <p><strong>ID:</strong> {form.id}</p>}
                    {form.action && <p><strong>Action:</strong> {form.action}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SelectorFinder
