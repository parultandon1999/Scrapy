import '../styles/Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-copyright">© 2026 Web Scraper - Use Responsibly</p>
        <nav className="footer-links" aria-label="Legal links">
          <a href="/privacy-policy">Privacy Policy</a>
          <span className="footer-separator">•</span>
          <a href="/terms">Terms of Service</a>
          <span className="footer-separator">•</span>
          <a href="/security">Security</a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer

