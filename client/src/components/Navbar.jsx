import { Moon, Sun } from '@phosphor-icons/react'
import '../styles/Navbar.css'

function Navbar({ darkMode, toggleDarkMode, currentPage }) {
  return (
    <header className="header">
      <button 
        className="theme-toggle" 
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <nav className="nav">
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
