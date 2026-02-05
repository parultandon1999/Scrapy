import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material'
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb
            items={[
              { label: 'Progress', icon: 'Timeline', onClick: () => navigate(-1) },
              { label: 'Page Details' }
            ]}
          />
        </Box>

        {loading ? (
          <ScrapingProgressSkeleton />
        ) : page ? (
          <>
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Button variant="icon" iconOnly onClick={() => navigate(-1)} size="small">
                  <Icon name="ArrowBack" size={18} />
                </Button>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h5" fontWeight={400} noWrap>
                    {page.title || 'Untitled Page'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="primary"
                    component="a"
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {page.url} <Icon name="OpenInNew" size={12} />
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 48, '& .MuiTab-root': { minHeight: 48, py: 1.5 } }}
              >
                <Tab icon={<Icon name="Description" size={16} />} label="Overview" iconPosition="start" />
                <Tab icon={<Icon name="Visibility" size={16} />} label="Screenshot" iconPosition="start" />
                <Tab icon={<Icon name="Tag" size={16} />} label="Headers" iconPosition="start" />
                <Tab icon={<Icon name="Link" size={16} />} label="Links" iconPosition="start" />
                <Tab icon={<Icon name="Image" size={16} />} label="Images" iconPosition="start" />
                <Tab icon={<Icon name="Download" size={16} />} label="Files" iconPosition="start" />
                <Tab icon={<Icon name="Layers" size={16} />} label="HTML" iconPosition="start" />
                <Tab icon={<Icon name="Description" size={16} />} label="Content" iconPosition="start" />
                <Tab icon={<Icon name="Security" size={16} />} label="Fingerprint" iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box>
              {/* Overview Tab */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                        METADATA
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Scraped At</Typography>
                          <Typography variant="caption">{page.scraped_at}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Depth Level</Typography>
                          <Typography variant="caption">Level {page.depth}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Proxy</Typography>
                          <Typography variant="caption">{detailedViewData.proxy_used || 'Direct'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Authenticated</Typography>
                          <Typography variant="caption">{detailedViewData.authenticated ? 'Yes' : 'No'}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                        STATS
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        {[
                          { label: 'Images', value: detailedViewData.media?.length || 0, icon: 'Image' },
                          { label: 'Int. Links', value: detailedViewData.links?.filter(l => l.link_type === 'internal').length || 0, icon: 'Link' },
                          { label: 'Ext. Links', value: detailedViewData.links?.filter(l => l.link_type === 'external').length || 0, icon: 'OpenInNew' },
                          { label: 'Files', value: detailedViewData.file_assets?.length || 0, icon: 'Download' },
                        ].map((stat, i) => (
                          <Grid item xs={6} key={i}>
                            <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icon name={stat.icon} size={14} color="primary" />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">{stat.value}</Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{stat.label}</Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>

                  {detailedViewData?.description && detailedViewData.description !== 'No description' && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                          DESCRIPTION
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
                          {detailedViewData.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}

              {/* Screenshot Tab */}
              {activeTab === 1 && (
                <Paper sx={{ p: 2 }}>
                  <Box
                    component="img"
                    src={api.getScreenshotUrl(page.id)}
                    alt="Page Screenshot"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      cursor: 'zoom-in',
                      '&:hover': { opacity: 0.95 }
                    }}
                    onClick={() => openImageViewer({
                      src: api.getScreenshotUrl(page.id),
                      alt: `Screenshot of ${page.title}`
                    })}
                  />
                </Paper>
              )}

              {/* Headers Tab */}
              {activeTab === 2 && (
                <Stack spacing={1}>
                  {detailedViewData?.headers?.length > 0 ? (
                    detailedViewData.headers.map((header, idx) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <Chip label={header.header_type} color="primary" size="small" />
                        <Typography variant="body2">{header.header_text}</Typography>
                      </Paper>
                    ))
                  ) : (
                    <Paper sx={{ p: 8, textAlign: 'center' }}>
                      <Typography color="text.secondary">No headers found</Typography>
                    </Paper>
                  )}
                </Stack>
              )}

              {/* Links Tab */}
              {activeTab === 3 && (
                <Paper>
                  {detailedViewData?.links?.length > 0 ? (
                    <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                      {detailedViewData.links.map((link, idx) => (
                        <ListItem
                          key={idx}
                          component="a"
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <ListItemIcon>
                            <Chip
                              icon={<Icon name={link.link_type === 'internal' ? 'Link' : 'OpenInNew'} size={14} />}
                              label={link.link_type}
                              color={link.link_type === 'internal' ? 'primary' : 'success'}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={link.url}
                            primaryTypographyProps={{
                              variant: 'body2',
                              noWrap: true,
                              sx: { '&:hover': { color: 'primary.main' } }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                      <Typography color="text.secondary">No links found</Typography>
                    </Box>
                  )}
                </Paper>
              )}

              {/* Images Tab */}
              {activeTab === 4 && (
                <Box>
                  {detailedViewData?.media?.length > 0 ? (
                    <>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {detailedViewData.media.length} images found
                        </Typography>
                        <Chip
                          label="Click to enlarge"
                          size="small"
                          icon={<Icon name="ZoomIn" size={14} />}
                        />
                      </Box>
                      <Grid container spacing={2}>
                        {detailedViewData.media.map((img, idx) => {
                          const imageSrc = api.getProxyImageUrl(img.src)
                          return (
                            <Grid item xs={6} sm={4} md={3} key={idx}>
                              <Paper
                                elevation={2}
                                sx={{
                                  position: 'relative',
                                  paddingTop: '100%',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-4px)',
                                    '& img': { transform: 'scale(1.1)' },
                                    '& .image-overlay': { opacity: 1 }
                                  }
                                }}
                                onClick={() => openImageViewer({ src: imageSrc, alt: img.alt || 'Image' })}
                              >
                                <Box
                                  component="img"
                                  src={imageSrc}
                                  alt={img.alt || 'Image'}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    const parent = e.target.parentElement
                                    if (parent && !parent.querySelector('.error-placeholder')) {
                                      const errorDiv = document.createElement('div')
                                      errorDiv.className = 'error-placeholder'
                                      errorDiv.style.cssText = `
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
                                        color: #999;
                                        font-size: 12px;
                                        text-align: center;
                                        padding: 16px;
                                        flex-direction: column;
                                        gap: 8px;
                                      `
                                      errorDiv.innerHTML = `
                                        <div style="font-size: 32px;">🖼️</div>
                                        <div style="font-weight: 500;">Image unavailable</div>
                                      `
                                      parent.appendChild(errorDiv)
                                    }
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease',
                                    bgcolor: 'grey.200'
                                  }}
                                />

                                <Box
                                  className="image-overlay"
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    pointerEvents: 'none'
                                  }}
                                >
                                  <Icon name="ZoomIn" size={32} sx={{ color: 'white' }} />
                                </Box>

                                {img.alt && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      bgcolor: 'rgba(0,0,0,0.75)',
                                      color: 'white',
                                      px: 1,
                                      py: 0.5,
                                      fontSize: '0.65rem',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      backdropFilter: 'blur(4px)'
                                    }}
                                  >
                                    {img.alt}
                                  </Box>
                                )}
                              </Paper>
                            </Grid>
                          )
                        })}
                      </Grid>
                    </>
                  ) : (
                    <Paper sx={{ p: 8, textAlign: 'center' }}>
                      <Icon name="Image" size={48} sx={{ color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No images found
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        This page doesn't contain any images
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {/* Files Tab */}
              {activeTab === 5 && (
                <Stack spacing={2}>
                  {detailedViewData?.file_assets?.length > 0 ? (
                    detailedViewData.file_assets.map((file, idx) => (
                      <Card key={idx} variant="outlined">
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Icon name="InsertDriveFile" size={20} />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>{file.file_name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip label={file.file_extension} size="small" />
                              <Typography variant="caption" color="text.secondary">
                                {api.formatBytes(file.file_size_bytes)}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            icon={<Icon name={file.download_status === 'success' ? 'CheckCircle' : 'Cancel'} size={12} />}
                            label={file.download_status === 'success' ? 'Saved' : 'Failed'}
                            color={file.download_status === 'success' ? 'success' : 'error'}
                            size="small"
                          />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Paper sx={{ p: 8, textAlign: 'center' }}>
                      <Typography color="text.secondary">No files found</Typography>
                    </Paper>
                  )}
                </Stack>
              )}

              {/* HTML Structure Tab */}
              {activeTab === 6 && (
                <Paper>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Filter by tag, selector, or content..."
                      value={htmlStructureSearch}
                      onChange={(e) => setHtmlStructureSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon name="Search" size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                  <Box sx={{ maxHeight: 600, overflow: 'auto', p: 2 }}>
                    <Stack spacing={2}>
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
                            <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip label={elem.tag_name} color="primary" size="small" />
                                <Typography variant="caption" fontFamily="monospace" color="text.secondary" noWrap sx={{ flex: 1 }}>
                                  {elem.selector}
                                </Typography>
                              </Box>
                              {elem.text_content && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {elem.text_content}
                                </Typography>
                              )}
                            </Paper>
                          ))
                      ) : (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                          No HTML structure data available
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              )}

              {/* Content Tab */}
              {activeTab === 7 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {detailedViewData?.full_text || 'No content available'}
                  </Typography>
                </Paper>
              )}

              {/* Fingerprint Tab */}
              {activeTab === 8 && (
                <Paper sx={{ p: 3 }}>
                  {detailedViewData?.fingerprint ? (
                    <Box component="pre" sx={{ overflow: 'auto', fontSize: '0.875rem' }}>
                      {JSON.stringify(JSON.parse(detailedViewData.fingerprint), null, 2)}
                    </Box>
                  ) : (
                    <Typography color="text.secondary" textAlign="center">
                      No fingerprint data available
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Page not found
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Image Viewer Modal */}
      {imageViewerOpen && currentImage && (
        <Dialog
          open={imageViewerOpen}
          onClose={closeImageViewer}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(0,0,0,0.95)',
              boxShadow: 'none',
            }
          }}
        >
          <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <IconButton
              onClick={closeImageViewer}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <Icon name="Close" size={24} />
            </IconButton>
            <Box
              component="img"
              src={currentImage.src}
              alt={currentImage.alt}
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  )
}

export default PageDetails
