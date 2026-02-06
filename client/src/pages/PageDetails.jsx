import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import Button from '../components/mui/buttons/Button'
import Icon from '../components/mui/icons/Icon'
import * as api from '../services/api'
import { ScrapingProgressSkeleton } from '../components/mui/skeletons/SkeletonLoader'

function PageDetails({ darkMode, toggleDarkMode }) {
  const { pageId } = useParams()
  const navigate = useNavigate()
  
  const [page, setPage] = useState(null)
  const [detailedViewData, setDetailedViewData] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [htmlStructureSearch, setHtmlStructureSearch] = useState('')
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pageId) {
      fetchPageDetails()
    }
  }, [pageId])

  const fetchPageDetails = async () => {
    setLoading(true)
    try {
      const data = await api.getPageDetails(pageId)
      setDetailedViewData(data)
      setPage({
        id: data.id,
        url: data.url,
        title: data.title,
        depth: data.depth,
        scraped_at: new Date(data.timestamp * 1000).toLocaleString()
      })
    } catch (err) {
      console.error('Failed to fetch page details:', err)
    } finally {
      setLoading(false)
    }
  }

  const openImageViewer = (img) => {
    setCurrentImage(img)
    setImageViewerOpen(true)
  }

  const closeImageViewer = () => {
    setImageViewerOpen(false)
    setCurrentImage(null)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && imageViewerOpen) closeImageViewer()
    }
    if (imageViewerOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [imageViewerOpen])

  // Tabs Configuration
  const tabs = [
    { icon: 'Description', label: 'Overview' },
    { icon: 'Visibility', label: 'Screenshot' },
    { icon: 'Tag', label: 'Headers' },
    { icon: 'Link', label: 'Links' },
    { icon: 'Image', label: 'Images' },
    { icon: 'Download', label: 'Files' },
    { icon: 'Layers', label: 'HTML' },
    { icon: 'Description', label: 'Content' },
    { icon: 'Security', label: 'Fingerprint' },
  ]

  // Helper for Chip styles
  const Chip = ({ label, icon, color = 'primary', size = 'medium', className = '' }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium border"
    const sizeStyles = size === 'small' ? "px-2 py-0.5 text-xs h-5" : "px-3 py-1 text-sm h-7"
    
    let colorStyles = "bg-gray-100 text-gray-700 border-gray-200"
    if (color === 'primary') colorStyles = "bg-blue-50 text-blue-700 border-blue-100"
    if (color === 'success') colorStyles = "bg-green-50 text-green-700 border-green-100"
    if (color === 'error') colorStyles = "bg-red-50 text-red-700 border-red-100"

    return (
      <span className={`${baseStyles} ${sizeStyles} ${colorStyles} ${className}`}>
        {icon && <span className="mr-1 flex items-center">{icon}</span>}
        {label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-10">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="container mx-auto px-4 xl:px-8 py-6 max-w-[1600px]">
        {/* Header Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Progress', icon: 'Timeline', onClick: () => navigate(-1) },
              { label: 'Page Details' }
            ]}
          />
        </div>

        {loading ? (
          <ScrapingProgressSkeleton />
        ) : page ? (
          <>
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Button variant="icon" iconOnly onClick={() => navigate(-1)} size="small">
                  <Icon name="ArrowBack" size={18} />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-normal text-gray-900 dark:text-white truncate">
                    {page.title || 'Untitled Page'}
                  </h1>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-0.5 w-fit"
                  >
                    {page.url} <Icon name="OpenInNew" size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-6 bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex min-w-max border-b border-gray-100 dark:border-[#333741]">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`
                        flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative
                        ${activeTab === index 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2A2D35]'
                        }
                      `}
                    >
                      <Icon name={tab.icon} size={16} />
                      {tab.label}
                      {activeTab === index && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
              
              {/* Overview Tab */}
              {activeTab === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Metadata */}
                  <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] p-5">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                      METADATA
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Scraped At</span>
                        <span className="text-gray-900 dark:text-gray-200">{page.scraped_at}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Depth Level</span>
                        <span className="text-gray-900 dark:text-gray-200">Level {page.depth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Proxy</span>
                        <span className="text-gray-900 dark:text-gray-200">{detailedViewData.proxy_used || 'Direct'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Authenticated</span>
                        <span className="text-gray-900 dark:text-gray-200">{detailedViewData.authenticated ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] p-5">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                      STATS
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Images', value: detailedViewData.media?.length || 0, icon: 'Image' },
                        { label: 'Int. Links', value: detailedViewData.links?.filter(l => l.link_type === 'internal').length || 0, icon: 'Link' },
                        { label: 'Ext. Links', value: detailedViewData.links?.filter(l => l.link_type === 'external').length || 0, icon: 'OpenInNew' },
                        { label: 'Files', value: detailedViewData.file_assets?.length || 0, icon: 'Download' },
                      ].map((stat, i) => (
                        <div key={i} className="border border-gray-200 dark:border-[#333741] rounded p-3 flex items-center gap-3">
                          <div className="text-blue-600 dark:text-blue-400">
                            <Icon name={stat.icon} size={14} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400">{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  {detailedViewData?.description && detailedViewData.description !== 'No description' && (
                    <div className="col-span-1 md:col-span-2 bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] p-5">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        DESCRIPTION
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {detailedViewData.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Screenshot Tab */}
              {activeTab === 1 && (
                <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] p-4">
                  <img
                    src={api.getScreenshotUrl(page.id)}
                    alt="Page Screenshot"
                    className="w-full h-auto rounded border border-gray-100 dark:border-gray-700 cursor-zoom-in hover:opacity-95 transition-opacity"
                    onClick={() => openImageViewer({
                      src: api.getScreenshotUrl(page.id),
                      alt: `Screenshot of ${page.title}`
                    })}
                  />
                </div>
              )}

              {/* Headers Tab */}
              {activeTab === 2 && (
                <div className="space-y-2">
                  {detailedViewData?.headers?.length > 0 ? (
                    detailedViewData.headers.map((header, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#1A1D24] rounded-lg border border-gray-200 dark:border-[#333741] p-4 flex gap-4 items-start">
                        <Chip label={header.header_type} color="primary" size="small" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 break-words flex-1">
                          {header.header_text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-[#1A1D24] rounded-lg border border-gray-200 dark:border-[#333741] p-12 text-center text-gray-500">
                      No headers found
                    </div>
                  )}
                </div>
              )}

              {/* Links Tab */}
              {activeTab === 3 && (
                <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] overflow-hidden">
                  {detailedViewData?.links?.length > 0 ? (
                    <ul className="max-h-[600px] overflow-y-auto divide-y divide-gray-100 dark:divide-[#333741]">
                      {detailedViewData.links.map((link, idx) => (
                        <li key={idx}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2A2D35] transition-colors group"
                          >
                            <Chip
                              icon={<Icon name={link.link_type === 'internal' ? 'Link' : 'OpenInNew'} size={14} />}
                              label={link.link_type}
                              color={link.link_type === 'internal' ? 'primary' : 'success'}
                              size="small"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {link.url}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      No links found
                    </div>
                  )}
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 4 && (
                <div>
                  {detailedViewData?.media?.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-4 px-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {detailedViewData.media.length} images found
                        </span>
                        <Chip
                          label="Click to enlarge"
                          size="small"
                          icon={<Icon name="ZoomIn" size={14} />}
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {detailedViewData.media.map((img, idx) => {
                          const imageSrc = api.getProxyImageUrl(img.src)
                          return (
                            <div
                              key={idx}
                              className="group relative bg-white dark:bg-[#1A1D24] rounded-lg border border-gray-200 dark:border-[#333741] overflow-hidden aspect-square cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                              onClick={() => openImageViewer({ src: imageSrc, alt: img.alt || 'Image' })}
                            >
                              <img
                                src={imageSrc}
                                alt={img.alt || 'Image'}
                                loading="lazy"
                                className="w-full h-full object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              {/* Error Placeholder */}
                              <div className="hidden absolute inset-0 flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center">
                                <span className="text-2xl mb-2">🖼️</span>
                                <span className="text-xs font-medium">Image unavailable</span>
                              </div>

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <Icon name="ZoomIn" size={32} className="text-white drop-shadow-md" />
                              </div>

                              {/* Alt Text Label */}
                              {img.alt && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white px-2 py-1 text-[10px] truncate backdrop-blur-sm">
                                  {img.alt}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="bg-white dark:bg-[#1A1D24] rounded-lg border border-gray-200 dark:border-[#333741] p-12 text-center">
                      <div className="text-gray-300 dark:text-gray-600 mb-3 flex justify-center">
                        <Icon name="Image" size={48} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
                        No images found
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-600">
                        This page doesn't contain any images
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 5 && (
                <div className="space-y-3">
                  {detailedViewData?.file_assets?.length > 0 ? (
                    detailedViewData.file_assets.map((file, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#1A1D24] rounded-lg border border-gray-200 dark:border-[#333741] p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                          <Icon name="InsertDriveFile" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.file_name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                              {file.file_extension}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {api.formatBytes(file.file_size_bytes)}
                            </span>
                          </div>
                        </div>
                        <Chip
                          icon={<Icon name={file.download_status === 'success' ? 'CheckCircle' : 'Cancel'} size={12} />}
                          label={file.download_status === 'success' ? 'Saved' : 'Failed'}
                          color={file.download_status === 'success' ? 'success' : 'error'}
                          size="small"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-[#1A1D24] rounded-lg border border-gray-200 dark:border-[#333741] p-12 text-center text-gray-500">
                      No files found
                    </div>
                  )}
                </div>
              )}

              {/* HTML Structure Tab */}
              {activeTab === 6 && (
                <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] flex flex-col h-[700px]">
                  <div className="p-3 border-b border-gray-100 dark:border-[#333741]">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Icon name="Search" size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter by tag, selector, or content..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={htmlStructureSearch}
                        onChange={(e) => setHtmlStructureSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="space-y-3">
                      {detailedViewData?.html_structure?.length > 0 ? (
                        detailedViewData.html_structure
                          .filter(elem => {
                            if (!htmlStructureSearch) return true
                            const search = htmlStructureSearch.toLowerCase()
                            return (
                              elem.tag_name?.toLowerCase().includes(search) ||
                              elem.selector?.toLowerCase().includes(search) ||
                              elem.text_content?.toLowerCase().includes(search)
                            )
                          })
                          .map((elem, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-[#333741] rounded p-3 bg-gray-50 dark:bg-[#1F2229]">
                              <div className="flex items-center gap-2 mb-2">
                                <Chip label={elem.tag_name} color="primary" size="small" />
                                <code className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate flex-1">
                                  {elem.selector}
                                </code>
                              </div>
                              {elem.text_content && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                                  {elem.text_content}
                                </p>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No HTML structure data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 7 && (
                <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {detailedViewData?.full_text || 'No content available'}
                  </pre>
                </div>
              )}

              {/* Fingerprint Tab */}
              {activeTab === 8 && (
                <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] p-6">
                  {detailedViewData?.fingerprint ? (
                    <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto custom-scrollbar">
                      {JSON.stringify(JSON.parse(detailedViewData.fingerprint), null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center text-gray-500">
                      No fingerprint data available
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-sm border border-gray-200 dark:border-[#333741] p-12 text-center">
            <h2 className="text-lg font-medium text-gray-500">Page not found</h2>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && currentImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeImageViewer}
        >
          {/* Close Button */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-[210]"
          >
            <Icon name="Close" size={24} />
          </button>
          
          {/* Image */}
          <div 
            className="relative w-full h-full p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Clicking image area shouldn't close
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PageDetails