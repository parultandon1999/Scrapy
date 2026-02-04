import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import SelectorSidebar from './SfSidebar'
import SelectorViews from './SfViews'
import * as api from '../../services/api'

function SelectorFinder({ darkMode, toggleDarkMode }) {
  const [activeSection, setActiveSection] = useState('analyze')
  const [loginUrl, setLoginUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  
  const [testLoading, setTestLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [testData, setTestData] = useState({
    username: '',
    password: '',
    usernameSelector: '',
    passwordSelector: '',
    submitSelector: '',
    successIndicator: ''
  })

  const [findUrl, setFindUrl] = useState('')
  const [searchQueries, setSearchQueries] = useState([''])
  const [imageUrls, setImageUrls] = useState([''])
  const [searchType, setSearchType] = useState('partial')
  const [findLoading, setFindLoading] = useState(false)
  const [findResults, setFindResults] = useState(null)

  // Test Selector state
  const [testSelectorUrl, setTestSelectorUrl] = useState('')
  const [testSelectorInput, setTestSelectorInput] = useState('')
  const [testSelectorLoading, setTestSelectorLoading] = useState(false)
  const [testSelectorResults, setTestSelectorResults] = useState(null)

  // Robust Selector Generator state
  const [generateUrl, setGenerateUrl] = useState('')
  const [generateDescription, setGenerateDescription] = useState('')
  const [generateLoading, setGenerateLoading] = useState(false)
  const [generateResults, setGenerateResults] = useState(null)

  // Selector Library state
  const [selectorLibrary, setSelectorLibrary] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectorToSave, setSelectorToSave] = useState('')
  const [selectorName, setSelectorName] = useState('')
  const [selectorDescription, setSelectorDescription] = useState('')

  // Test History state
  const [testHistory, setTestHistory] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem('selectorLibrary')
    if (savedLibrary) {
      setSelectorLibrary(JSON.parse(savedLibrary))
    }

    const savedHistory = localStorage.getItem('testHistory')
    if (savedHistory) {
      setTestHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save library to localStorage whenever it changes
  useEffect(() => {
    if (selectorLibrary.length > 0) {
      localStorage.setItem('selectorLibrary', JSON.stringify(selectorLibrary))
    }
  }, [selectorLibrary])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (testHistory.length > 0) {
      localStorage.setItem('testHistory', JSON.stringify(testHistory))
    }
  }, [testHistory])

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults(null)

    try {
      const data = await api.analyzeLoginPage(loginUrl)
      setResults(data)
      
      if (data.suggested_config) {
        setTestData(prev => ({
          ...prev,
          usernameSelector: data.suggested_config.username_selector || '',
          passwordSelector: data.suggested_config.password_selector || '',
          submitSelector: data.suggested_config.submit_selector || ''
        }))
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze login page')
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setTestLoading(true)
    setTestResults(null)

    try {
      const data = await api.testLoginSelectors({
        loginUrl: loginUrl,
        ...testData
      })
      setTestResults(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to test login')
    } finally {
      setTestLoading(false)
    }
  }

  const handleFindElement = async (e) => {
    e.preventDefault()
    setError(null)
    setFindLoading(true)
    setFindResults(null)

    try {
      const validQueries = searchQueries.filter(q => q.trim() !== '')
      const validImageUrls = imageUrls.filter(url => url.trim() !== '')
      
      if (validQueries.length === 0 && validImageUrls.length === 0) {
        setError('Please enter at least one search query or image URL')
        setFindLoading(false)
        return
      }

      const data = await api.findElementByContent({
        url: findUrl,
        searchQueries: validQueries,
        imageUrls: validImageUrls,
        searchType: searchType
      })
      setFindResults(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to find elements')
    } finally {
      setFindLoading(false)
    }
  }

  const handleTestSelector = async (e) => {
    e.preventDefault()
    setError(null)
    setTestSelectorLoading(true)
    setTestSelectorResults(null)

    try {
      const data = await api.testSelector(testSelectorUrl, testSelectorInput)
      setTestSelectorResults(data)
      
      // Save to test history
      const historyEntry = {
        id: Date.now(),
        selector: testSelectorInput,
        url: testSelectorUrl,
        timestamp: new Date().toISOString(),
        success: data.success,
        matchCount: data.matched_count,
        strength: data.strength
      }
      setTestHistory(prev => [historyEntry, ...prev].slice(0, 50)) // Keep last 50
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to test selector')
    } finally {
      setTestSelectorLoading(false)
    }
  }

  const handleGenerateRobustSelector = async (e) => {
    e.preventDefault()
    setError(null)
    setGenerateLoading(true)
    setGenerateResults(null)

    try {
      const data = await api.generateRobustSelector(generateUrl, generateDescription)
      setGenerateResults(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate selectors')
    } finally {
      setGenerateLoading(false)
    }
  }

  // Selector Library functions
  const openSaveModal = (selector) => {
    setSelectorToSave(selector)
    setSelectorName('')
    setSelectorDescription('')
    setShowSaveModal(true)
  }

  const handleSaveToLibrary = () => {
    if (!selectorToSave || !selectorName) return

    const newSelector = {
      id: Date.now(),
      name: selectorName,
      selector: selectorToSave,
      description: selectorDescription,
      createdAt: new Date().toISOString(),
      usageCount: 0
    }

    setSelectorLibrary(prev => [newSelector, ...prev])
    setShowSaveModal(false)
    setSelectorToSave('')
    setSelectorName('')
    setSelectorDescription('')
  }

  const handleDeleteFromLibrary = (id) => {
    if (confirm('Delete this selector from your library?')) {
      setSelectorLibrary(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleUseFromLibrary = (selector) => {
    setTestSelectorInput(selector.selector)
    setActiveSection('selector-test')
    
    // Increment usage count
    setSelectorLibrary(prev => prev.map(s => 
      s.id === selector.id ? { ...s, usageCount: s.usageCount + 1 } : s
    ))
  }

  const clearTestHistory = () => {
    if (confirm('Clear all test history?')) {
      setTestHistory([])
      localStorage.removeItem('testHistory')
    }
  }

  const addSearchQuery = () => {
    setSearchQueries([...searchQueries, ''])
  }

  const removeSearchQuery = (index) => {
    if (searchQueries.length > 1) {
      setSearchQueries(searchQueries.filter((_, i) => i !== index))
    }
  }

  const updateSearchQuery = (index, value) => {
    const updated = [...searchQueries]
    updated[index] = value
    setSearchQueries(updated)
  }

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index))
    }
  }

  const updateImageUrl = (index, value) => {
    const updated = [...imageUrls]
    updated[index] = value
    setImageUrls(updated)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleUseSuggestedSelector = (field, selector) => {
    setTestData(prev => ({
      ...prev,
      [field]: selector
    }))
    setActiveSection('test')
  }

  const handleUseForSelectorTest = (selector) => {
    setTestSelectorInput(selector)
    setTestSelectorUrl(loginUrl || findUrl || testSelectorUrl)
    setActiveSection('selector-test')
  }

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="selector-finder" />
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
        <SelectorSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          loginUrl={loginUrl}
          setLoginUrl={setLoginUrl}
          loading={loading}
          handleAnalyze={handleAnalyze}
          libraryCount={selectorLibrary.length}
          historyCount={testHistory.length}
          hasResults={!!results}
        />

        <SelectorViews
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          loading={loading}
          error={error}
          setError={setError}
          results={results}
          testLoading={testLoading}
          testResults={testResults}
          testData={testData}
          setTestData={setTestData}
          handleTestLogin={handleTestLogin}
          testSelectorUrl={testSelectorUrl}
          setTestSelectorUrl={setTestSelectorUrl}
          testSelectorInput={testSelectorInput}
          setTestSelectorInput={setTestSelectorInput}
          testSelectorLoading={testSelectorLoading}
          testSelectorResults={testSelectorResults}
          handleTestSelector={handleTestSelector}
          generateUrl={generateUrl}
          setGenerateUrl={setGenerateUrl}
          generateDescription={generateDescription}
          setGenerateDescription={setGenerateDescription}
          generateLoading={generateLoading}
          generateResults={generateResults}
          handleGenerateRobustSelector={handleGenerateRobustSelector}
          findUrl={findUrl}
          setFindUrl={setFindUrl}
          searchQueries={searchQueries}
          imageUrls={imageUrls}
          searchType={searchType}
          setSearchType={setSearchType}
          findLoading={findLoading}
          findResults={findResults}
          handleFindElement={handleFindElement}
          addSearchQuery={addSearchQuery}
          removeSearchQuery={removeSearchQuery}
          updateSearchQuery={updateSearchQuery}
          addImageUrl={addImageUrl}
          removeImageUrl={removeImageUrl}
          updateImageUrl={updateImageUrl}
          selectorLibrary={selectorLibrary}
          handleUseFromLibrary={handleUseFromLibrary}
          handleDeleteFromLibrary={handleDeleteFromLibrary}
          testHistory={testHistory}
          clearTestHistory={clearTestHistory}
          showSaveModal={showSaveModal}
          setShowSaveModal={setShowSaveModal}
          selectorToSave={selectorToSave}
          selectorName={selectorName}
          setSelectorName={setSelectorName}
          selectorDescription={selectorDescription}
          setSelectorDescription={setSelectorDescription}
          handleSaveToLibrary={handleSaveToLibrary}
          copyToClipboard={copyToClipboard}
          handleUseSuggestedSelector={handleUseSuggestedSelector}
          handleUseForSelectorTest={handleUseForSelectorTest}
          openSaveModal={openSaveModal}
        />
      </div>
    </>
  )
}

export default SelectorFinder
