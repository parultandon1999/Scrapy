import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/design-tokens.css'
import './styles/global.css'
import './styles/accessibility.css'
import './styles/mobile.css'
import './styles/micro-interactions.css'
import './index.css'
import Home from './pages/Home'
import ScrapingProgress from './pages/ScrapingProgress'
import Database from './pages/Database'
import History from './pages/History'
import Config from './pages/Config'
import SelectorFinder from './pages/SelectorFinder'
import ProxyTester from './pages/ProxyTester'
import ButtonDemo from './pages/ButtonDemo'
import ToastDemo from './pages/ToastDemo'
import BreadcrumbDemo from './pages/BreadcrumbDemo'
import ThemeCustomizer from './pages/ThemeCustomizer'
import Preferences from './pages/Preferences'
import DesignSystemDemo from './pages/DesignSystemDemo'
import MicroInteractionsDemo from './pages/MicroInteractionsDemo'
import EmptyStatesDemo from './pages/EmptyStatesDemo'
import LoadingStatesDemo from './pages/LoadingStatesDemo'
import SecuritySettings from './pages/SecuritySettings'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ScheduledScraping from './pages/ScheduledScraping'
import ActiveScrapingBanner from './components/ActiveScrapingBanner'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import SessionTimeoutWarning from './components/SessionTimeoutWarning'
import DataPrivacyWarning from './components/DataPrivacyWarning'
import { ToastProvider } from './components/ToastContainer'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { PreferencesProvider } from './contexts/PreferencesContext'
import { SecurityProvider } from './contexts/SecurityContext'

function AppContent() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <SecurityProvider>
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            <OfflineBanner />
            <SessionTimeoutWarning />
            <DataPrivacyWarning />
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
            <Route path="/button-demo" element={<ButtonDemo darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/toast-demo" element={<ToastDemo darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/breadcrumb-demo" element={<BreadcrumbDemo darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/theme-customizer" element={<ThemeCustomizer darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/preferences" element={<Preferences darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/design-system" element={<DesignSystemDemo darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/micro-interactions" element={<MicroInteractionsDemo darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/empty-states" element={<EmptyStatesDemo darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/loading-states" element={<LoadingStatesDemo darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/security" element={<SecuritySettings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/terms" element={<TermsOfService darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/scheduled-scraping" element={<ScheduledScraping darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
          </SecurityProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AppContent />
      </PreferencesProvider>
    </ThemeProvider>
  )
}

export default App
