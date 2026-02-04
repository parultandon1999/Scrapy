function Footer() {
  return (
    <footer 
      className="
        w-full z-[100] box-border
        bg-[#f2f2f2] text-[#70757a] text-center
        /* Layout: Relative on mobile, Fixed on Desktop (md+) to match original media query */
        relative md:fixed bottom-0 left-0 right-0
        /* Padding: Smaller on mobile, larger on desktop */
        p-3 md:py-4 md:px-8
        /* Dark Mode styles */
        dark:bg-[#0a0a0a] dark:text-[#666666] dark:border-t dark:border-[#1a1a1a]
      "
    >
      <div className="flex flex-col items-center gap-1 md:gap-2">
        
        {/* Copyright Text */}
        <p className="m-0 text-sm text-gray-500 dark:text-gray-400">
          © 2026 Web Scraper - Use Responsibly
        </p>

        {/* Navigation Links */}
        <nav 
          className="flex flex-wrap justify-center items-center gap-2 md:gap-3" 
          aria-label="Legal links"
        >
          <a 
            href="/privacy-policy" 
            className="
              text-xs no-underline transition-colors duration-200
              text-gray-500 hover:text-blue-600 hover:underline
              dark:text-gray-400 dark:hover:text-blue-400
            "
          >
            Privacy Policy
          </a>
          
          <span className="text-gray-400 text-xs">•</span>
          
          <a 
            href="/terms" 
            className="
              text-xs no-underline transition-colors duration-200
              text-gray-500 hover:text-blue-600 hover:underline
              dark:text-gray-400 dark:hover:text-blue-400
            "
          >
            Terms of Service
          </a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer