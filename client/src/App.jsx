import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/global.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ScrapingProgress from './pages/ScrapingProgress'
import Database from './pages/Database'
import History from './pages/History'
import Config from './pages/Config'
import SelectorFinder from './pages/SelectorFinder'
import Docs from './pages/Docs'
import About from './pages/About'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  const toggleDarkMode = () => {
    console.log('Toggle clicked! Current darkMode:', darkMode)
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
      console.log('Switched to DARK mode')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
      console.log('Switched to LIGHT mode')
    }
  }

  return (
    <Router>
      <div className="app">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/progress" element={<ScrapingProgress />} />
          <Route path="/database" element={<Database />} />
          <Route path="/history" element={<History />} />
          <Route path="/config" element={<Config />} />
          <Route path="/selector-finder" element={<SelectorFinder />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
