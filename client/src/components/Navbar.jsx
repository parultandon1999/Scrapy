import { Moon, Sun } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

function Navbar({ darkMode, toggleDarkMode }) {
  const location = useLocation()

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
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/database" className={location.pathname === '/database' ? 'active' : ''}>
          Database
        </Link>
        <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>
          History
        </Link>
        <Link to="/config" className={location.pathname === '/config' ? 'active' : ''}>
          Config
        </Link>
        <Link to="/selector-finder" className={location.pathname === '/selector-finder' ? 'active' : ''}>
          Selector Finder
        </Link>
        <Link to="/docs" className={location.pathname === '/docs' ? 'active' : ''}>
          Docs
        </Link>
        <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
          About
        </Link>
      </nav>
    </header>
  )
}

export default Navbar
