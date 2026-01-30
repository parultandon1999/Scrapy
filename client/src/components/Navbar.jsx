import { useState } from 'react'
import { Moon, Sun, List, X } from '@phosphor-icons/react'
import '../styles/Navbar.css'

function Navbar({ darkMode, toggleDarkMode, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="header">
      <button 
        className="theme-toggle" 
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button 
        className="mobile-menu-btn" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <List size={24} />}
      </button>
      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <a href="/" className={currentPage === 'home' ? 'active' : ''}>
          Home
        </a>
        <a href="/database" className={currentPage === 'database' ? 'active' : ''}>
          Database
        </a>
        <a href="/history" className={currentPage === 'history' ? 'active' : ''}>
          History
        </a>
        <a href="/config" className={currentPage === 'config' ? 'active' : ''}>
          Config
        </a>
        <a href="/selector-finder" className={currentPage === 'selector-finder' ? 'active' : ''}>
          Selector Finder
        </a>
      </nav>
    </header>
  )
}

export default Navbar