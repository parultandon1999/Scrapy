import { useState, useEffect, useRef } from 'react'
import { Moon, Sun, List, X } from '@phosphor-icons/react'
import '../styles/Navbar.css'

function Navbar({ darkMode, toggleDarkMode, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navRef = useRef(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && isMenuOpen) {
        closeMenu()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent body scroll when menu is open
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <header className="header" role="banner" ref={navRef}>
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
          onClick={closeMenu}
        >
          Home
        </a>
        <a 
          href="/database" 
          className={currentPage === 'database' ? 'active' : ''}
          aria-current={currentPage === 'database' ? 'page' : undefined}
          onClick={closeMenu}
        >
          Database
        </a>
        <a 
          href="/history" 
          className={currentPage === 'history' ? 'active' : ''}
          aria-current={currentPage === 'history' ? 'page' : undefined}
          onClick={closeMenu}
        >
          History
        </a>
        <a 
          href="/config" 
          className={currentPage === 'config' ? 'active' : ''}
          aria-current={currentPage === 'config' ? 'page' : undefined}
          onClick={closeMenu}
        >
          Config
        </a>
        <a 
          href="/selector-finder" 
          className={currentPage === 'selector-finder' ? 'active' : ''}
          aria-current={currentPage === 'selector-finder' ? 'page' : undefined}
          onClick={closeMenu}
        >
          Selector Finder
        </a>
        <a 
          href="/proxy-tester" 
          className={currentPage === 'proxy-tester' ? 'active' : ''}
          aria-current={currentPage === 'proxy-tester' ? 'page' : undefined}
          onClick={closeMenu}
        >
          Proxy Tester
        </a>
        <a 
          href="/security" 
          className={currentPage === 'security' ? 'active' : ''}
          aria-current={currentPage === 'security' ? 'page' : undefined}
          onClick={closeMenu}
        >
          Security
        </a>
      </nav>
    </header>
  )
}

export default Navbar