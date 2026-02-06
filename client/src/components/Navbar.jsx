import { useState, useEffect, useRef } from 'react'
import ActiveScrapingBanner from './ActiveScrapingBanner'
import Icon from './mui/icons/Icon'

function Navbar({ darkMode, toggleDarkMode, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navRef = useRef(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

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
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`
          md:hidden fixed inset-0 z-[101] bg-black/50 transition-opacity duration-200
          ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={closeMenu}
      />

      <header 
        ref={navRef}
        role="banner"
        className={`
          fixed top-0 left-0 right-0 py-0.5 flex justify-center items-center border-b z-[104]
          ${darkMode ? 'bg-black border-[#222]' : 'bg-white border-[#e0e0e0]'}
          max-md:justify-between max-md:px-6
        `}
      >
        <div className="flex items-center gap-12 max-md:gap-0">
          
          {/* Left Section: Theme Toggle & Banner */}
          <div className="flex items-center gap-6 max-md:order-1">
            <button
              onClick={toggleDarkMode}
              className={`
                bg-transparent border-none cursor-pointer p-2 flex items-center justify-center transition-colors duration-200
                ${darkMode ? 'text-[#555]' : 'text-[#aaa]'}
              `}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
            >
              {darkMode ? <Icon name="LightMode" size={16} /> : <Icon name="DarkMode" size={16} />}
              <span className="sr-only">{darkMode ? "Light mode" : "Dark mode"}</span>
            </button>
            <ActiveScrapingBanner />
          </div>

          {/* Navigation Links */}
          <nav
            id="main-navigation"
            role="navigation"
            aria-label="Main navigation"
            className={`
              flex gap-0 items-center
              max-md:fixed max-md:inset-0 max-md:flex-col max-md:justify-center max-md:gap-0 max-md:p-0 max-md:z-[102]
              max-md:transition-all max-md:duration-200
              ${isMenuOpen ? 'max-md:opacity-100 max-md:visible max-md:pointer-events-auto' : 'max-md:opacity-0 max-md:invisible max-md:pointer-events-none'}
              ${darkMode ? 'max-md:bg-black' : 'max-md:bg-white'}
            `}
          >
            {[
              { path: '/', label: 'Home', id: 'home' },
              { path: '/database', label: 'Database', id: 'database' },
              { path: '/config', label: 'Config', id: 'config' },
              { path: '/selector-finder', label: 'Selector', id: 'selector-finder' },
              { path: '/proxy-tester', label: 'Proxy', id: 'proxy-tester' },
            ].map((link, index) => (
              <div key={link.id} className="flex items-center max-md:w-full max-md:justify-center flex-col md:flex-row">
                <a
                  href={link.path}
                  onClick={closeMenu}
                  aria-current={currentPage === link.id ? 'page' : undefined}
                  className={`
                    no-underline py-2 px-5 text-[13px] font-normal tracking-wider uppercase relative transition-colors duration-200 whitespace-nowrap
                    max-md:w-auto max-md:py-6 max-md:px-8 max-md:text-2xl max-md:text-center max-md:font-light max-md:tracking-widest
                    max-md:transition-opacity max-md:delay-[${index * 30}ms]
                    ${currentPage === link.id 
                      ? (darkMode ? 'text-white' : 'text-black') 
                      : (darkMode ? 'text-[#555]' : 'text-[#aaa]')
                    }
                    ${isMenuOpen ? 'max-md:opacity-100' : 'max-md:opacity-0'}
                  `}
                >
                  {link.label}
                  {/* Desktop Underline Indicator */}
                  {currentPage === link.id && (
                    <span 
                      className={`
                        hidden md:block absolute bottom-1 left-5 right-5 h-px
                        ${darkMode ? 'bg-white' : 'bg-black'}
                      `}
                    />
                  )}
                </a>
                
                {/* Desktop Divider */}
                {index < 4 && (
                  <div className={`
                    hidden md:block w-px h-3
                    ${darkMode ? 'bg-[#222]' : 'bg-[#e0e0e0]'}
                  `} />
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`
              hidden max-md:flex items-center justify-center order-3 bg-transparent border-none cursor-pointer p-2 relative z-[105] transition-colors duration-200
              ${darkMode ? 'text-[#555]' : 'text-[#aaa]'}
            `}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
          >
            {isMenuOpen ? (
              <Icon name="Close" size={20} aria-hidden="true" />
            ) : (
              <Icon name="Menu" size={20} aria-hidden="true" />
            )}
          </button>

        </div>
      </header>
    </>
  )
}

export default Navbar