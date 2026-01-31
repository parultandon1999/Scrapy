import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/design-tokens.css'
import './styles/global.css'
import './styles/accessibility.css'
import './styles/mobile.css'
import './styles/micro-interactions.css'
import './index.css'
import Home from './pages/Home'
import ScrapingProgress from './pages/ScrapingProgress'
import Database from './pages/Database'
import History from './pages/History'
import Config from './pages/Config'
import SelectorFinder from './pages/SelectorFinder'
import ProxyTester from './pages/ProxyTester'
import SecuritySettings from './pages/SecuritySettings'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ActiveScrapingBanner from './components/ActiveScrapingBanner'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import DataPrivacyWarning from './components/DataPrivacyWarning'
import { ToastProvider } from './components/mui/ToastContainer'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode')
      return true
    }
    return false
  })

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <OfflineBanner />
          <DataPrivacyWarning />
          <ActiveScrapingBanner />
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/progress" element={<ScrapingProgress darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/progress/:sessionId" element={<ScrapingProgress darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/database" element={<Database darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/history" element={<History darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/config" element={<Config darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/selector-finder" element={<SelectorFinder darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/proxy-tester" element={<ProxyTester darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/security" element={<SecuritySettings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/terms" element={<TermsOfService darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
