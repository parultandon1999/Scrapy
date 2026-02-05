import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import Home from './pages/Home'
import ScrapingProgress from './pages/ScrapingProgress'
import PageDetails from './pages/PageDetails'
import Database from './pages/database/Database'
import Config from './pages/Config'
import SelectorFinder from './pages/selector-finder/SelectorFinder'
import ProxyTester from './pages/ProxyTester'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import DataPrivacyWarning from './components/DataPrivacyWarning'
import { ToastProvider } from './components/mui/toasts/ToastContainer'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode')
      return true
    }
    return false
  })

  // Create Material-UI theme based on dark mode
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ToastProvider>
          <Router>
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            <OfflineBanner />
            <DataPrivacyWarning />
            <Routes>
              <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/progress" element={<ScrapingProgress darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/progress/:sessionId" element={<ScrapingProgress darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/page-details/:pageId" element={<PageDetails darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/database" element={<Database darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/config" element={<Config darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/selector-finder" element={<SelectorFinder darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/proxy-tester" element={<ProxyTester darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="/terms" element={<TermsOfService darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            </Routes>
          </Router>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
