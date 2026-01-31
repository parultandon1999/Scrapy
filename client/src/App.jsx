import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/global.css'
import './index.css'
import Home from './pages/Home'
import ScrapingProgress from './pages/ScrapingProgress'
import Database from './pages/Database'
import History from './pages/History'
import Config from './pages/Config'
import SelectorFinder from './pages/SelectorFinder'
import ProxyTester from './pages/ProxyTester'
import ActiveScrapingBanner from './components/ActiveScrapingBanner'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <Router>
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
        </Routes>
    </Router>
  )
}

export default App
