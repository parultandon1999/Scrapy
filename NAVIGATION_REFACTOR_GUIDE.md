# Navigation Refactor Guide

## What Changed

We've refactored the navigation from React Router Links to regular HTML anchor tags (`<a href>`). This makes the app work like a traditional multi-page website where each page includes its own Navbar and Footer.

## Changes Made

### 1. App.jsx
- Removed global Navbar and Footer
- Each route now receives `darkMode` and `toggleDarkMode` props
- Routes still use React Router for SPA functionality

### 2. Navbar.jsx
- Changed from `<Link>` to `<a href>`
- Removed `useLocation` hook
- Added `currentPage` prop to determine active link
- Kept mobile menu functionality

### 3. Home.jsx (COMPLETED)
- Added Navbar and Footer imports
- Wrapped content with Navbar and Footer
- Passes `darkMode` and `toggleDarkMode` to Navbar
- Sets `currentPage="home"` prop

## How to Update Remaining Pages

For each page (Database, History, Config, SelectorFinder, ScrapingProgress), follow this pattern:

### Step 1: Update imports
```jsx
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
```

### Step 2: Add props to component
```jsx
function PageName({ darkMode, toggleDarkMode }) {
  // existing code
}
```

### Step 3: Wrap JSX with Navbar and Footer
```jsx
return (
  <>
    <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="page-name" />
    <div className="existing-wrapper">
      {/* existing content */}
    </div>
    <Footer />
  </>
)
```

## Current Page Values
- Home: `currentPage="home"`
- Database: `currentPage="database"`
- History: `currentPage="history"`
- Config: `currentPage="config"`
- Selector Finder: `currentPage="selector-finder"`
- Progress: `currentPage="home"` (or don't show active state)

## Benefits
- ✅ No more z-index conflicts
- ✅ Each page controls its own layout
- ✅ Cleaner component hierarchy
- ✅ Still maintains SPA functionality with React Router
- ✅ Mobile menu works perfectly

## Note
The app still uses React Router for routing, so navigation is still fast (no full page reloads). We're just using `<a>` tags instead of `<Link>` components for the navigation links.
