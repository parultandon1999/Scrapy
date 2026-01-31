import { useState } from 'react'
import { Moon, Sun, List, X } from '@phosphor-icons/react'
import '../styles/Navbar.css'

function Navbar({ darkMode, toggleDarkMode, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="header" role="banner">
      <button 
        className="theme-toggle" 
        onClick={toggleDarkMode}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={darkMode}
      >
        {darkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        <span className="sr-only">{darkMode ? "Light mode" : "Dark mode"}</span>
      </button>
      <button 
        className="mobile-menu-btn" 
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
      >
        {isMenuOpen ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
      </button>
      <nav 
        id="main-navigation"
        className={`nav ${isMenuOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <a 
          href="/" 
          className={currentPage === 'home' ? 'active' : ''}
          aria-current={currentPage === 'home' ? 'page' : undefined}
        >
          Home
        </a>
        <a 
          href="/database" 
          className={currentPage === 'database' ? 'active' : ''}
          aria-current={currentPage === 'database' ? 'page' : undefined}
        >
          Database
        </a>
        <a 
          href="/history" 
          className={currentPage === 'history' ? 'active' : ''}
          aria-current={currentPage === 'history' ? 'page' : undefined}
        >
          History
        </a>
        <a 
          href="/config" 
          className={currentPage === 'config' ? 'active' : ''}
          aria-current={currentPage === 'config' ? 'page' : undefined}
        >
          Config
        </a>
        <a 
          href="/selector-finder" 
          className={currentPage === 'selector-finder' ? 'active' : ''}
          aria-current={currentPage === 'selector-finder' ? 'page' : undefined}
        >
          Selector Finder
        </a>
        <a 
          href="/proxy-tester" 
          className={currentPage === 'proxy-tester' ? 'active' : ''}
          aria-current={currentPage === 'proxy-tester' ? 'page' : undefined}
        >
          Proxy Tester
        </a>
      </nav>
    </header>
  )
}

export default Navbar