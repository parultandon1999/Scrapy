import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import ActiveScrapingBanner from './ActiveScrapingBanner'
import Icon from './mui/icons/Icon'

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.$darkMode ? '#000000' : '#ffffff'};
  padding: 0.1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${props => props.$darkMode ? '#222222' : '#e0e0e0'};
  
  @media (max-width: 768px) {
    justify-content: space-between;
    padding: 0.1rem 1.5rem;
    z-index: 104;
  }
`

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 3rem;

  @media (max-width: 768px) {
    gap: 0;
  }
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    order: 1;
  }
`

const ThemeToggle = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$darkMode ? '#555555' : '#aaaaaa'};
  transition: color 0.2s ease;
  
  @media (max-width: 768px) {
    order: 1;
  }
`

const MobileMenuBtn = styled.button`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: ${props => props.$darkMode ? '#555555' : '#aaaaaa'};
  transition: color 0.2s ease;
  position: relative;
  z-index: 105;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    order: 3;
  }
`

const Nav = styled.nav`
  display: flex;
  gap: 0;
  align-items: center;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$darkMode ? '#000000' : '#ffffff'};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0;
    padding: 0;
    opacity: ${props => props.$isOpen ? '1' : '0'};
    visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
    pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
    transition: opacity 0.2s ease, visibility 0.2s ease;
    z-index: 102;
  }
`

const NavLink = styled.a`
  text-decoration: none;
  color: ${props => props.$darkMode ? '#555555' : '#aaaaaa'};
  padding: 0.5rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 400;
  transition: color 0.2s ease;
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  position: relative;

  ${props => props.$active && `
    color: ${props.$darkMode ? '#ffffff' : '#000000'};
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0.25rem;
      left: 1.25rem;
      right: 1.25rem;
      height: 1px;
      background: ${props.$darkMode ? '#ffffff' : '#000000'};
    }
  `}

  @media (max-width: 768px) {
    width: auto;
    padding: 1.5rem 2rem;
    font-size: 1.5rem;
    text-align: center;
    font-weight: 300;
    letter-spacing: 0.1em;
    cursor: pointer;
    z-index: 103;
    position: relative;
    opacity: ${props => props.$isOpen ? '1' : '0'};
    transition: opacity 0.3s ease, color 0.2s ease;
    transition-delay: ${props => props.$index ? `${props.$index * 0.03}s` : '0s'};
    
    &::after {
      display: none;
    }
    
    ${props => props.$active && `
      color: ${props.$darkMode ? '#ffffff' : '#000000'};
      font-weight: 400;
    `}
  }
`

const Divider = styled.div`
  width: 1px;
  height: 12px;
  background: ${props => props.$darkMode ? '#222222' : '#e0e0e0'};
  
  @media (max-width: 768px) {
    display: none;
  }
`

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$darkMode ? '#000000' : '#ffffff'};
    z-index: 101;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`

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
      <Overlay $isOpen={isMenuOpen} $darkMode={darkMode} onClick={closeMenu} />
      <Header role="banner" ref={navRef} $darkMode={darkMode}>
        <NavContainer>
          <LeftSection>
            <ThemeToggle
              onClick={toggleDarkMode}
              $darkMode={darkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
            >
              {darkMode ? <Icon name="LightMode" size={16} /> : <Icon name="DarkMode" size={16} />}
              <SrOnly>{darkMode ? "Light mode" : "Dark mode"}</SrOnly>
            </ThemeToggle>
            <ActiveScrapingBanner />
          </LeftSection>

          <Nav
            id="main-navigation"
            $isOpen={isMenuOpen}
            $darkMode={darkMode}
            role="navigation"
            aria-label="Main navigation"
          >
            <NavLink
              href="/"
              $darkMode={darkMode}
              $active={currentPage === 'home'}
              $isOpen={isMenuOpen}
              $index={0}
              aria-current={currentPage === 'home' ? 'page' : undefined}
              onClick={closeMenu}
            >
              Home
            </NavLink>
            <Divider $darkMode={darkMode} />
            <NavLink
              href="/database"
              $darkMode={darkMode}
              $active={currentPage === 'database'}
              $isOpen={isMenuOpen}
              $index={1}
              aria-current={currentPage === 'database' ? 'page' : undefined}
              onClick={closeMenu}
            >
              Database
            </NavLink>
            <Divider $darkMode={darkMode} />
            <NavLink
              href="/config"
              $darkMode={darkMode}
              $active={currentPage === 'config'}
              $isOpen={isMenuOpen}
              $index={2}
              aria-current={currentPage === 'config' ? 'page' : undefined}
              onClick={closeMenu}
            >
              Config
            </NavLink>
            <Divider $darkMode={darkMode} />
            <NavLink
              href="/selector-finder"
              $darkMode={darkMode}
              $active={currentPage === 'selector-finder'}
              $isOpen={isMenuOpen}
              $index={3}
              aria-current={currentPage === 'selector-finder' ? 'page' : undefined}
              onClick={closeMenu}
            >
              Selector
            </NavLink>
            <Divider $darkMode={darkMode} />
            <NavLink
              href="/proxy-tester"
              $darkMode={darkMode}
              $active={currentPage === 'proxy-tester'}
              $isOpen={isMenuOpen}
              $index={4}
              aria-current={currentPage === 'proxy-tester' ? 'page' : undefined}
              onClick={closeMenu}
            >
              Proxy
            </NavLink>
            <Divider $darkMode={darkMode} />
          </Nav>

          <MobileMenuBtn
            onClick={toggleMenu}
            $darkMode={darkMode}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
          >
            {isMenuOpen ? (
              <Icon name="Close" size={20} aria-hidden="true" />
            ) : (
              <Icon name="Menu" size={20} aria-hidden="true" />
            )}
          </MobileMenuBtn>
        </NavContainer>
      </Header>
    </>
  )
}

export default Navbar
