import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Button,
  Typography,
  Checkbox,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Collapse,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Divider,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  ButtonGroup,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  FolderOpen as FolderOpenIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  GetApp as GetAppIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Link as LinkIcon,
  Timeline as TimelineIcon,
  NavigateNext as NavigateNextIcon,
  Storage as StorageIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Public as PublicIcon,
  Layers as LayersIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  BrokenImage as BrokenImageIcon,
  Speed as SpeedIcon,
  Fingerprint as FingerprintIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material'
import {
  DatabaseDashboardSkeleton,
  DatabasePagesSkeleton,
  DatabaseFilesSkeleton,
  DatabaseAnalyticsSkeleton,
} from '../../components/mui/skeletons/SkeletonLoader'

/**
 * Internal Helper Component: Page Headers with Expand/Collapse
 */
const PageHeadersCard = ({ headers }) => {
  const [expanded, setExpanded] = useState(false)
  if (!headers?.length) return null

  const displayHeaders = expanded ? headers : headers.slice(0, 5)
  const hasMore = headers.length > 5

  return (
    <Card>
      <CardHeader
        title={`Headers (${headers.length})`}
        action={
          hasMore && (
            <Button size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show Less' : 'Show More'}
            </Button>
          )
        }
      />
      <CardContent>
        <Stack spacing={1}>
          {displayHeaders.map((h, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: 'action.hover',
                p: 1.5,
                borderRadius: 1,
                borderLeft: '3px solid',
                borderLeftColor: 'primary.main',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'block' }}>
                {h.header_type}
              </Typography>
              <Typography variant="caption" sx={{ wordBreak: 'break-word', display: 'block', mt: 0.5 }}>
                {h.header_text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

const DatabaseViews = ({
  activeView,
  setActiveView,
  loading,
  error,
  setError,
  isRefreshing,
  handleRefresh,
  handleSearch,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  stats,
  pages,
  files,
  filesByExtension,
  largestDownloads,
  topLinks,
  searchResults,
  pageDetails,
  analyticsData,
  pagination,
  handlers,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Destructure Data
  const {
    timeline,
    domains,
    depthDistribution,
    fileAnalytics,
    linkAnalysis,
    performanceAnalytics,
    fingerprintAnalytics,
    geolocationAnalytics,
  } = analyticsData || {}

  // Destructure Pagination
  const {
    pageLimit,
    setPageLimit,
    pageOffset,
    setPageOffset,
    totalPages,
  } = pagination || {}

  // Destructure Handlers
  const {
    fetchPageDetails,
    handleBulkDelete,
    handleBulkExport,
    togglePageSelection,
    toggleSelectAll,
    handleDateRangeFilter,
    clearDateRange,
    exportChartData,
    formatBytes,
    selectedPages,
    setSelectedPages,
    dateRange,
    setDateRange,
    linkType,
    setLinkType,
    fileStatus,
    setFileStatus,
    hoveredChartItem,
    setHoveredChartItem,
    chartTypes,
    setChartTypes,
    handleExportData, // Ensure this is available in handlers from parent
  } = handlers || {}

  // Helper for formatting bytes locally if handler not provided or for immediate use
  const localFormatBytes = (bytes) => {
    if (formatBytes) return formatBytes(bytes)
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper to safely set chart types using the handler from Database.jsx
  const handleSetChartType = (key, value) => {
    if (setChartTypes) {
      setChartTypes((prev) => ({ ...prev, [key]: value }))
    }
  }

  // Navigation Items Configuration
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'pages', label: 'Pages', icon: DescriptionIcon },
    { id: 'files', label: 'Files', icon: FolderOpenIcon },
    { id: 'files-by-ext', label: 'By Type', icon: CategoryIcon },
    { id: 'largest-downloads', label: 'Largest', icon: StorageIcon },
    { id: 'top-links', label: 'Top Links', icon: LinkIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChartIcon },
    { id: 'timeline', label: 'Timeline', icon: TimelineIcon },
    { id: 'domains', label: 'Domains', icon: LanguageIcon },
    { id: 'link-analysis', label: 'Link Analysis', icon: BrokenImageIcon },
    { id: 'performance', label: 'Performance', icon: SpeedIcon },
    { id: 'fingerprints', label: 'Fingerprints', icon: FingerprintIcon },
    { id: 'geolocation', label: 'Geolocation', icon: LocationOnIcon },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* --- SIDEBAR IMPLEMENTATION --- */}
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            overflowX: 'auto',
            py: 1,
            px: 0.5,
            gap: 0.5,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {menuItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => setActiveView(item.id)}
              sx={{
                minWidth: 56,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                py: 1,
                px: 1.5,
                cursor: 'pointer',
                borderRadius: 1,
                color: activeView === item.id ? 'primary.main' : 'text.secondary',
                bgcolor: activeView === item.id ? 'primary.50' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: activeView === item.id ? 'primary.100' : 'action.hover',
                },
              }}
            >
              <item.icon sx={{ fontSize: 20 }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: activeView === item.id ? 500 : 400,
                  textAlign: 'center',
                }}
              >
                {item.label.split(' ')[0]}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: 220,
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            top: 64, // Assumes navbar height is 64px
            left: 0,
            bgcolor: 'background.default',
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 900,
            '&::-webkit-scrollbar': {
              width: 4,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'action.disabled',
              borderRadius: 2,
            },
          }}
        >
          {/* Menu Items */}
          <Box sx={{ flex: 1, py: 3, px: 2 }}>
            {menuItems.map((item) => (
              <Box
                key={item.id}
                onClick={() => setActiveView(item.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  mb: 0.5,
                  cursor: 'pointer',
                  borderRadius: 2,
                  color: activeView === item.id ? 'primary.main' : 'text.secondary',
                  bgcolor: activeView === item.id ? 'primary.50' : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: activeView === item.id ? 'primary.100' : 'action.hover',
                    color: activeView === item.id ? 'primary.main' : 'text.primary',
                  },
                }}
              >
                <item.icon sx={{ fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: activeView === item.id ? 600 : 400,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Export Button */}
          <Box sx={{ p: 2 }}>
            <Box
              onClick={handleExportData}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: 1.25,
                px: 2,
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: loading ? 'primary.main' : 'primary.dark',
                  boxShadow: loading ? 'none' : 1,
                },
              }}
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
                Export
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <Box
        component="main"
        id="main-content"
        sx={{
          flex: 1,
          p: { xs: 2, md: 3 },
          ml: { md: '220px' }, // Offset for desktop sidebar
          pb: { xs: 8, md: 3 }, // Padding for mobile bottom nav
          bgcolor: 'background.default',
          overflowY: 'auto',
        }}
        role="main"
      >
        {/* Breadcrumb */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => setActiveView('dashboard')}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <DashboardIcon fontSize="small" />
              Database
            </MuiLink>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {activeView === 'dashboard' ? 'Overview'
                : activeView === 'pages' ? 'Pages'
                : activeView === 'files' ? 'Files'
                : activeView === 'files-by-ext' ? 'Files by Type'
                : activeView === 'largest-downloads' ? 'Largest Downloads'
                : activeView === 'top-links' ? 'Top Links'
                : activeView === 'analytics' ? 'Analytics'
                : activeView === 'timeline' ? 'Timeline'
                : activeView === 'domains' ? 'Domains'
                : activeView === 'link-analysis' ? 'Link Analysis'
                : activeView === 'performance' ? 'Performance'
                : activeView === 'fingerprints' ? 'Fingerprints'
                : activeView === 'geolocation' ? 'Geolocation'
                : activeView === 'search' ? 'Search'
                : activeView === 'page-details' ? 'Page Details'
                : 'View'}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Error Alert */}
        <Collapse in={!!error}>
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Collapse>

        {/* Skeleton Loaders */}
        {loading && activeView === 'dashboard' && <DatabaseDashboardSkeleton />}
        {loading && activeView === 'pages' && <DatabasePagesSkeleton />}
        {loading && activeView === 'files' && <DatabaseFilesSkeleton />}
        {loading && ['files-by-ext', 'largest-downloads', 'top-links', 'timeline', 'domains'].includes(activeView) && <DatabaseFilesSkeleton />}
        {loading && ['analytics', 'link-analysis', 'performance'].includes(activeView) && <DatabaseAnalyticsSkeleton />}

        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && stats && !loading && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Overview</Typography>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { title: 'Total Storage Used', value: `${(stats.total_download_size_mb || 0).toFixed(2)} MB`, subtitle: `${stats.total_file_assets || 0} files`, icon: StorageIcon, color: 'info' },
                { title: 'Avg Scrape Time', value: stats.avg_scrape_time ? `${stats.avg_scrape_time.toFixed(1)}s` : 'N/A', subtitle: 'Per page', icon: TimelineIcon, color: 'warning' },
                { title: 'Success Rate', value: `${stats.total_file_assets > 0 ? ((stats.successful_downloads / stats.total_file_assets) * 100).toFixed(1) : 0}%`, subtitle: `${stats.successful_downloads || 0} of ${stats.total_file_assets || 0}`, icon: CheckCircleIcon, color: 'success' },
                { title: 'Most Scraped Domain', value: stats.most_scraped_domain || 'N/A', subtitle: `${stats.most_scraped_domain_count || 0} pages`, icon: PublicIcon, color: 'primary' },
              ].map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: `${stat.color}.light`, color: `${stat.color}.main` }}>
                          <stat.icon />
                        </Avatar>
                      </Box>
                      <Typography color="textSecondary" variant="caption" sx={{ mb: 1 }}>{stat.title}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{stat.value}</Typography>
                      <Typography variant="caption" color="textSecondary">{stat.subtitle}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Stats Chips */}
            <Card sx={{ mb: 4 }}>
              <CardHeader title="Quick Stats" />
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip icon={<DescriptionIcon />} label={`${stats.total_pages || 0} Pages`} />
                  <Chip icon={<LinkIcon />} label={`${stats.total_links || 0} Links`} />
                  <Chip icon={<TrendingUpIcon />} label={`${stats.internal_links || 0} Internal`} />
                  <Chip icon={<FileDownloadIcon />} label={`${stats.external_links || 0} External`} />
                  <Chip icon={<StorageIcon />} label={`${stats.total_file_assets || 0} Files`} />
                  <Chip icon={<CheckCircleIcon />} label={`${stats.successful_downloads || 0} Downloaded`} />
                  <Chip icon={<CancelIcon />} label={`${stats.failed_downloads || 0} Failed`} />
                  <Chip label={`${(stats.total_download_size_mb || 0).toFixed(1)} MB`} />
                </Box>
              </CardContent>
            </Card>

            {/* Widgets */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={4}>
                <Card>
                  <CardHeader title="Files by Extension" action={<Button size="small" onClick={() => setActiveView('files-by-ext')}>View All</Button>} />
                  <CardContent>
                    <Stack spacing={2}>
                      {(filesByExtension || []).slice(0, 5).map((item, idx) => (
                        <Box key={idx}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Chip label={item.file_extension} size="small" />
                            <Typography variant="caption">{item.count}</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={(item.count / (filesByExtension[0]?.count || 1)) * 100} />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Card>
                  <CardHeader title="Largest Files" action={<Button size="small" onClick={() => setActiveView('largest-downloads')}>View All</Button>} />
                  <CardContent>
                    <Stack spacing={1}>
                      {(largestDownloads || []).slice(0, 5).map((file, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" noWrap>{file.file_name}</Typography>
                          <Chip label={localFormatBytes(file.file_size_bytes)} size="small" />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Card>
                  <CardHeader title="Top Links" action={<Button size="small" onClick={() => setActiveView('top-links')}>View All</Button>} />
                  <CardContent>
                    <Stack spacing={1}>
                      {(topLinks || []).slice(0, 5).map((link, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" noWrap>{link.url.substring(0, 30)}...</Typography>
                          <Chip label={link.frequency} size="small" />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* PAGES VIEW */}
        {activeView === 'pages' && !loading && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Pages ({totalPages})</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh"><IconButton onClick={handleRefresh} disabled={isRefreshing} size="small"><RefreshIcon /></IconButton></Tooltip>
                <Select value={pageLimit} onChange={(e) => setPageLimit(Number(e.target.value))} size="small" sx={{ minWidth: 80 }}>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </Box>
            </Box>

            {/* Date Filter */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField type="date" label="From" InputLabelProps={{ shrink: true }} value={dateRange?.startDate || ''} onChange={(e) => setDateRange?.((prev) => ({ ...prev, startDate: e.target.value }))} size="small" sx={{ flex: 1 }} />
                  <TextField type="date" label="To" InputLabelProps={{ shrink: true }} value={dateRange?.endDate || ''} onChange={(e) => setDateRange?.((prev) => ({ ...prev, endDate: e.target.value }))} size="small" sx={{ flex: 1 }} />
                  <Button variant="contained" onClick={handleDateRangeFilter} startIcon={<SearchIcon />}>Apply</Button>
                  {(dateRange?.startDate || dateRange?.endDate) && <Button variant="outlined" onClick={clearDateRange} startIcon={<CloseIcon />}>Clear</Button>}
                </Stack>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            <Collapse in={selectedPages?.length > 0}>
              <Alert severity="info" action={<Box sx={{ display: 'flex', gap: 1 }}><Button size="small" onClick={handleBulkExport} startIcon={<GetAppIcon />}>Export</Button><Button size="small" color="error" onClick={handleBulkDelete} startIcon={<DeleteIcon />}>Delete</Button><Button size="small" onClick={() => setSelectedPages?.([])}>Clear</Button></Box>} sx={{ mb: 3 }}>
                {selectedPages?.length} page{selectedPages?.length !== 1 ? 's' : ''} selected
              </Alert>
            </Collapse>

            {/* Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell padding="checkbox"><Checkbox checked={selectedPages?.length === pages?.length && pages?.length > 0} onChange={toggleSelectAll} /></TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Depth</TableCell>
                    <TableCell align="right">Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pages?.map((page) => (
                    <TableRow key={page.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell padding="checkbox"><Checkbox checked={selectedPages?.includes(page.id)} onChange={() => togglePageSelection?.(page.id)} /></TableCell>
                      <TableCell><MuiLink href={page.url} target="_blank">{new URL(page.url).hostname}</MuiLink></TableCell>
                      <TableCell><Typography variant="body2" noWrap>{page.title || 'No title'}</Typography></TableCell>
                      <TableCell align="right"><Chip label={`D${page.depth}`} size="small" /></TableCell>
                      <TableCell align="right"><Typography variant="caption">{new Date(page.timestamp * 1000).toLocaleDateString()}</Typography></TableCell>
                      <TableCell align="right"><Button size="small" onClick={() => fetchPageDetails?.(page.id)}>View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Typography variant="body2" color="textSecondary">Showing {pageOffset + 1}-{Math.min(pageOffset + pageLimit, totalPages)} of {totalPages}</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" startIcon={<ChevronLeftIcon />} onClick={() => setPageOffset?.(Math.max(0, pageOffset - pageLimit))} disabled={pageOffset === 0}>Previous</Button>
                <Button variant="outlined" size="small" endIcon={<ChevronRightIcon />} onClick={() => setPageOffset?.(pageOffset + pageLimit)} disabled={pageOffset + pageLimit >= totalPages}>Next</Button>
              </Stack>
            </Box>
          </Box>
        )}

        {/* FILES VIEW */}
        {activeView === 'files' && !loading && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Files</Typography>
              <Select value={fileStatus || 'all'} onChange={(e) => setFileStatus?.(e.target.value)} size="small" sx={{ minWidth: 120 }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>File Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Size</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files?.map((file, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{file.file_name}</TableCell>
                      <TableCell><Chip label={file.file_extension} size="small" /></TableCell>
                      <TableCell align="right">{localFormatBytes(file.file_size_bytes)}</TableCell>
                      <TableCell align="right"><Chip label={file.download_status} size="small" color={file.download_status === 'success' ? 'success' : 'error'} icon={file.download_status === 'success' ? <CheckCircleIcon /> : <CancelIcon />} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* FILES BY EXTENSION VIEW */}
        {activeView === 'files-by-ext' && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Files by Type</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Extension</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total Size</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filesByExtension?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Chip label={item.file_extension} /></TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">{localFormatBytes(item.total_size_bytes || 0)}</TableCell>
                      <TableCell align="right"><Chip label={item.download_status || 'N/A'} size="small" color={item.download_status === 'success' ? 'success' : 'error'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* LARGEST DOWNLOADS VIEW */}
        {activeView === 'largest-downloads' && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Largest Files</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>File</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {largestDownloads?.map((file, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{file.file_name}</TableCell>
                      <TableCell><Chip label={file.file_extension} size="small" /></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>{localFormatBytes(file.file_size_bytes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TOP LINKS VIEW */}
        {activeView === 'top-links' && !loading && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Top Links</Typography>
              <Select value={linkType || 'internal'} onChange={(e) => setLinkType?.(e.target.value)} size="small" sx={{ minWidth: 120 }}>
                <MenuItem value="internal">Internal</MenuItem>
                <MenuItem value="external">External</MenuItem>
              </Select>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>URL</TableCell>
                    <TableCell align="right">Frequency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topLinks?.map((link, idx) => (
                    <TableRow key={idx}>
                      <TableCell><MuiLink href={link.url} target="_blank">{link.url}</MuiLink></TableCell>
                      <TableCell align="right"><Chip label={link.frequency} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* SEARCH VIEW */}
        {activeView === 'search' && !loading && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Search</Typography>
              <Tooltip title="Refresh"><IconButton onClick={handleRefresh} disabled={isRefreshing}><RefreshIcon /></IconButton></Tooltip>
            </Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack component="form" onSubmit={handleSearch} direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ display: 'flex' }}>
                  <Select value={searchType || 'content'} onChange={(e) => setSearchType?.(e.target.value)} size="small" sx={{ minWidth: 120 }}>
                    <MenuItem value="content">Content</MenuItem>
                    <MenuItem value="files">Files</MenuItem>
                  </Select>
                  <TextField fullWidth size="small" placeholder={`Search ${searchType}...`} value={searchQuery || ''} onChange={(e) => setSearchQuery?.(e.target.value)} />
                  <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>Search</Button>
                </Stack>
              </CardContent>
            </Card>
            {searchResults && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchResults.keyword}"</Alert>
                {searchResults.results?.length > 0 ? (
                  <Grid container spacing={2}>
                    {searchResults.results.map((result, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Card sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: 3 } }}>
                          <CardContent>
                            {result.title && <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{result.title}</Typography>}
                            {result.file_name && <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{result.file_name}</Typography>}
                            {result.url && <MuiLink href={result.url} target="_blank" variant="body2" sx={{ display: 'block', mb: 1 }}>{result.url}</MuiLink>}
                            {result.page_url && <MuiLink href={result.page_url} target="_blank" variant="body2" sx={{ display: 'block', mb: 1 }}>{result.page_url}</MuiLink>}
                            {result.preview && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{result.preview}...</Typography>}
                            {result.file_extension && <Chip label={result.file_extension} size="small" sx={{ mt: 1 }} />}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="textSecondary">No results found</Typography></Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* PAGE DETAILS VIEW */}
        {activeView === 'page-details' && pageDetails && !loading && (
          <Box>
            <Button startIcon={<ChevronLeftIcon />} onClick={() => setActiveView?.('pages')} sx={{ mb: 3 }}>Back to Pages</Button>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={pageDetails.title || 'No title'} subheader={pageDetails.url} />
                  <Divider />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <Box><Typography variant="caption" color="textSecondary">Depth</Typography><Chip label={`D${pageDetails.depth}`} sx={{ mt: 1 }} /></Box>
                        <Box><Typography variant="caption" color="textSecondary">Scraped At</Typography><Typography variant="body2" sx={{ mt: 1 }}>{new Date(pageDetails.timestamp * 1000).toLocaleString()}</Typography></Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Enhanced Headers Section */}
              <Grid item xs={12} md={6}>
                <PageHeadersCard headers={pageDetails.headers} />
              </Grid>

              {pageDetails.links?.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title={`Links (${pageDetails.links.length})`} />
                    <CardContent>
                      <Stack direction="row" spacing={2}>
                        <Chip label={`Internal: ${pageDetails.links.filter(l => l.link_type === 'internal').length}`} icon={<TrendingUpIcon />} />
                        <Chip label={`External: ${pageDetails.links.filter(l => l.link_type === 'external').length}`} />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {pageDetails.file_assets?.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title={`Files (${pageDetails.file_assets.length})`} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>File Name</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pageDetails.file_assets.map((f, i) => (
                            <TableRow key={i}>
                              <TableCell>{f.file_name}</TableCell>
                              <TableCell align="right">{localFormatBytes(f.file_size_bytes)}</TableCell>
                              <TableCell align="right"><Chip label={f.download_status} size="small" color={f.download_status === 'success' ? 'success' : 'error'} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* ANALYTICS VIEW */}
        {activeView === 'analytics' && !loading && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Analytics</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh"><IconButton onClick={handleRefresh} disabled={isRefreshing}><RefreshIcon /></IconButton></Tooltip>
                <Button size="small" startIcon={<GetAppIcon />} onClick={() => exportChartData?.({ depthDistribution, fileAnalytics }, 'analytics')}>Export</Button>
              </Box>
            </Box>
            <Grid container spacing={3}>
              {/* Depth Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="Depth Distribution"
                    subheader={`Total: ${depthDistribution?.length || 0}`}
                    action={
                      <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="Bar Chart">
                          <Button
                            onClick={() => handleSetChartType('depth', 'bar')}
                            variant={chartTypes?.depth === 'bar' ? 'contained' : 'outlined'}
                            sx={{ minWidth: 40 }}
                          >
                            <BarChartIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Pie Chart">
                          <Button
                            onClick={() => handleSetChartType('depth', 'pie')}
                            variant={chartTypes?.depth === 'pie' ? 'contained' : 'outlined'}
                            sx={{ minWidth: 40 }}
                          >
                            <PieChartIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Line Chart">
                          <Button
                            onClick={() => handleSetChartType('depth', 'line')}
                            variant={chartTypes?.depth === 'line' ? 'contained' : 'outlined'}
                            sx={{ minWidth: 40 }}
                          >
                            <TrendingUpIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    }
                  />
                  <CardContent>
                    {/* BAR CHART */}
                    {chartTypes?.depth === 'bar' && (
                      <Stack spacing={2}>
                        {depthDistribution?.map((item, idx) => (
                          <Box
                            key={idx}
                            onMouseEnter={() => setHoveredChartItem?.({ type: 'depth', data: item })}
                            onMouseLeave={() => setHoveredChartItem?.(null)}
                            sx={{ position: 'relative' }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Depth {item.depth}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.page_count}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(item.page_count / Math.max(...(depthDistribution?.map(d => d.page_count) || [1]))) * 100}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {((item.page_count / (depthDistribution?.reduce((sum, d) => sum + d.page_count, 0) || 1)) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}

                    {/* PIE CHART */}
                    {chartTypes?.depth === 'pie' && (
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Box sx={{ position: 'relative', width: 180, height: 180 }}>
                          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                            {(() => {
                              const total = depthDistribution?.reduce((sum, d) => sum + d.page_count, 0) || 1
                              let currentAngle = -90
                              const colors = ['#1a73e8', '#4285f4', '#8ab4f8', '#aecbfa', '#d2e3fc', '#e8f0fe']

                              return depthDistribution?.map((item, idx) => {
                                const percentage = (item.page_count / total) * 100
                                const angle = (percentage / 100) * 360
                                const startAngle = currentAngle
                                const endAngle = currentAngle + angle
                                currentAngle = endAngle

                                const startRad = (startAngle * Math.PI) / 180
                                const endRad = (endAngle * Math.PI) / 180
                                const x1 = 100 + 80 * Math.cos(startRad)
                                const y1 = 100 + 80 * Math.sin(startRad)
                                const x2 = 100 + 80 * Math.cos(endRad)
                                const y2 = 100 + 80 * Math.sin(endRad)
                                const largeArc = angle > 180 ? 1 : 0

                                return (
                                  <path
                                    key={idx}
                                    d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={colors[idx % colors.length]}
                                    stroke="white"
                                    strokeWidth="2"
                                    onMouseEnter={() => setHoveredChartItem?.({ type: 'depth', data: item })}
                                    onMouseLeave={() => setHoveredChartItem?.(null)}
                                    style={{ cursor: 'pointer', opacity: hoveredChartItem?.data?.depth === item.depth ? 0.8 : 1 }}
                                  />
                                )
                              })
                            })()}
                          </svg>
                        </Box>
                        <Stack spacing={1} sx={{ flex: 1 }}>
                          {depthDistribution?.map((item, idx) => {
                            const colors = ['#1a73e8', '#4285f4', '#8ab4f8', '#aecbfa', '#d2e3fc', '#e8f0fe']
                            const total = depthDistribution?.reduce((sum, d) => sum + d.page_count, 0) || 1
                            return (
                              <Box
                                key={idx}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: hoveredChartItem?.data?.depth === item.depth ? 'action.hover' : 'transparent',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={() => setHoveredChartItem?.({ type: 'depth', data: item })}
                                onMouseLeave={() => setHoveredChartItem?.(null)}
                              >
                                <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: colors[idx % colors.length] }} />
                                <Typography variant="caption" sx={{ flex: 1 }}>
                                  Depth {item.depth}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {item.page_count} ({((item.page_count / total) * 100).toFixed(1)}%)
                                </Typography>
                              </Box>
                            )
                          })}
                        </Stack>
                      </Box>
                    )}

                    {/* LINE CHART */}
                    {chartTypes?.depth === 'line' && (
                      <Box sx={{ position: 'relative', height: 250 }}>
                        <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%' }}>
                          <defs>
                            <linearGradient id="lineGradientDepth" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          {(() => {
                            const maxValue = Math.max(...(depthDistribution?.map(d => d.page_count) || [1]))
                            const points = depthDistribution
                              ?.map((item, idx) => {
                                const x = (idx / Math.max(depthDistribution.length - 1, 1)) * 360 + 20
                                const y = 180 - (item.page_count / maxValue) * 160
                                return `${x},${y}`
                              })
                              .join(' ')

                            const areaPoints = `20,180 ${points} ${360 + 20},180`

                            return (
                              <>
                                <polyline points={areaPoints} fill="url(#lineGradientDepth)" stroke="none" />
                                <polyline
                                  points={points}
                                  fill="none"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ stroke: '#1a73e8' }}
                                />
                                {depthDistribution?.map((item, idx) => {
                                  const x = (idx / Math.max(depthDistribution.length - 1, 1)) * 360 + 20
                                  const y = 180 - (item.page_count / maxValue) * 160
                                  return (
                                    <circle
                                      key={idx}
                                      cx={x}
                                      cy={y}
                                      r="5"
                                      fill="#1a73e8"
                                      stroke="white"
                                      strokeWidth="2"
                                      onMouseEnter={() => setHoveredChartItem?.({ type: 'depth', data: item })}
                                      onMouseLeave={() => setHoveredChartItem?.(null)}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  )
                                })}
                              </>
                            )
                          })()}
                        </svg>
                        {hoveredChartItem?.type === 'depth' && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bgcolor: 'grey.800',
                              color: 'white',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              zIndex: 50,
                              top: 0,
                              right: 0,
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Depth {hoveredChartItem.data.depth}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              Pages: {hoveredChartItem.data.page_count}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* File Type Analytics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="File Type Analytics"
                    subheader={`Total types: ${fileAnalytics?.length || 0}`}
                    action={
                      <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="Bar Chart">
                          <Button
                            onClick={() => handleSetChartType('fileType', 'bar')}
                            variant={chartTypes?.fileType === 'bar' ? 'contained' : 'outlined'}
                            sx={{ minWidth: 40 }}
                          >
                            <BarChartIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Table View">
                          <Button
                            onClick={() => handleSetChartType('fileType', 'table')}
                            variant={chartTypes?.fileType === 'table' ? 'contained' : 'outlined'}
                            sx={{ minWidth: 40 }}
                          >
                            <LayersIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Export">
                          <Button
                            onClick={() => exportChartData?.(fileAnalytics, 'file_analytics')}
                            sx={{ minWidth: 40 }}
                          >
                            <DownloadIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    }
                  />
                  <CardContent>
                    {chartTypes?.fileType === 'bar' && (
                      <Stack spacing={2}>
                        {fileAnalytics?.slice(0, 10).map((item, idx) => (
                          <Box
                            key={idx}
                            onMouseEnter={() => setHoveredChartItem?.({ type: 'file', data: item })}
                            onMouseLeave={() => setHoveredChartItem?.(null)}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Chip label={item.file_extension || item.file_type} size="small" />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.count || item.total_files}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={((item.count || item.total_files) / Math.max(...fileAnalytics.map(f => f.count || f.total_files), 1)) * 100}
                            />
                          </Box>
                        ))}
                      </Stack>
                    )}

                    {chartTypes?.fileType === 'table' && (
                      <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Type</th>
                              <th style={{ textAlign: 'right', padding: '8px', fontWeight: 600 }}>Total</th>
                              <th style={{ textAlign: 'right', padding: '8px', fontWeight: 600 }}>Success</th>
                              <th style={{ textAlign: 'right', padding: '8px', fontWeight: 600 }}>Failed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fileAnalytics?.slice(0, 10).map((item, idx) => (
                              <tr
                                key={idx}
                                style={{
                                  borderBottom: '1px solid #f0f0f0',
                                  backgroundColor: hoveredChartItem?.data?.file_extension === item.file_extension ? '#f5f5f5' : 'transparent',
                                }}
                                onMouseEnter={() => setHoveredChartItem?.({ type: 'file', data: item })}
                                onMouseLeave={() => setHoveredChartItem?.(null)}
                              >
                                <td style={{ padding: '8px' }}>{item.file_extension}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>{item.total_files}</td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#4caf50', fontWeight: 600 }}>
                                  {item.successful}
                                </td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#f44336', fontWeight: 600 }}>
                                  {item.failed}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TIMELINE VIEW */}
        {activeView === 'timeline' && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Scraping Timeline</Typography>
            <Stack spacing={2}>
              {timeline?.map((item, idx) => (
                <Card key={idx} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon />
                        <Typography sx={{ fontWeight: 600 }}>{item.date}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2"><DescriptionIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />{item.pages_scraped} pages</Typography>
                        <Typography variant="body2"><LayersIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />{item.depths_reached} depths</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* DOMAINS VIEW */}
        {activeView === 'domains' && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Domain Statistics</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Domain</TableCell>
                    <TableCell align="right">Pages</TableCell>
                    <TableCell align="right">Avg Depth</TableCell>
                    <TableCell align="right">First Scraped</TableCell>
                    <TableCell align="right">Last Scraped</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {domains?.map((domain, idx) => (
                    <TableRow key={idx}>
                      <TableCell><MuiLink href={domain.domain} target="_blank">{domain.domain}</MuiLink></TableCell>
                      <TableCell align="right">{domain.page_count}</TableCell>
                      <TableCell align="right">{domain.avg_depth?.toFixed(1)}</TableCell>
                      <TableCell align="right">{new Date(domain.first_scraped * 1000).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{new Date(domain.last_scraped * 1000).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* LINK ANALYSIS VIEW */}
        {activeView === 'link-analysis' && linkAnalysis && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Link Analysis</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title={`Broken Links (${linkAnalysis.broken_links?.length || 0})`} />
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell>URL</TableCell>
                          <TableCell align="right">References</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {linkAnalysis.broken_links?.slice(0, 20).map((link, i) => (
                          <TableRow key={i}>
                            <TableCell><MuiLink href={link.url} target="_blank" variant="body2" sx={{ maxWidth: 200 }}>{link.url}</MuiLink></TableCell>
                            <TableCell align="right">{link.reference_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Most Referenced Pages" />
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell>Page</TableCell>
                          <TableCell align="right">Inbound Links</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {linkAnalysis.most_referenced_pages?.map((page, i) => (
                          <TableRow key={i}>
                            <TableCell><MuiLink href={page.url} target="_blank" variant="body2">{page.title || page.url}</MuiLink></TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>{page.inbound_links}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* PERFORMANCE VIEW */}
        {activeView === 'performance' && performanceAnalytics && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Performance Analytics</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Crawl Timeline" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}><Box><Typography variant="caption" color="textSecondary">Duration</Typography><Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>{(performanceAnalytics.timeline?.duration / 60).toFixed(1)} min</Typography></Box></Grid>
                      <Grid item xs={6} sm={3}><Box><Typography variant="caption" color="textSecondary">Total Pages</Typography><Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>{performanceAnalytics.timeline?.total_pages}</Typography></Box></Grid>
                      <Grid item xs={6} sm={3}><Box><Typography variant="caption" color="textSecondary">Speed</Typography><Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>{performanceAnalytics.timeline?.pages_per_second.toFixed(2)}/s</Typography></Box></Grid>
                      <Grid item xs={6} sm={3}><Box><Typography variant="caption" color="textSecondary">Rate</Typography><Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>{performanceAnalytics.timeline?.pages_per_minute.toFixed(1)}/m</Typography></Box></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pages Per Minute Breakdown */}
              {performanceAnalytics.timeline?.pages_per_minute_breakdown?.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Pages Per Minute Breakdown" />
                    <CardContent>
                      <Stack spacing={2}>
                        {performanceAnalytics.timeline.pages_per_minute_breakdown.map((bucket, idx) => (
                          <Box key={idx}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Minute {bucket.minute}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {bucket.count}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (bucket.count /
                                  Math.max(
                                    ...(performanceAnalytics.timeline.pages_per_minute_breakdown?.map(b => b.count) || [1])
                                  )) *
                                100
                              }
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {performanceAnalytics.proxy_stats?.length > 0 && (
                <Grid item xs={12}><Card><CardHeader title="Proxy Usage" /><CardContent><Stack spacing={2}>{performanceAnalytics.proxy_stats.map((p, i) => (<Box key={i}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2">{p.proxy}</Typography><Typography variant="body2">{p.percentage.toFixed(1)}%</Typography></Box><LinearProgress variant="determinate" value={p.percentage} /></Box>))}</Stack></CardContent></Card></Grid>
              )}
              {performanceAnalytics.depth_stats?.length > 0 && (
                <Grid item xs={12}><Card><CardHeader title="Depth Distribution" /><CardContent><Stack spacing={2}>{performanceAnalytics.depth_stats.map((d, i) => (<Box key={i}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2">Depth {d.depth}</Typography><Typography variant="body2">{d.percentage.toFixed(1)}%</Typography></Box><LinearProgress variant="determinate" value={d.percentage} /></Box>))}</Stack></CardContent></Card></Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* FINGERPRINTS VIEW */}
        {activeView === 'fingerprints' && fingerprintAnalytics && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Fingerprint Analysis</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}><Card sx={{ background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)' }}><CardContent><Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}><Avatar sx={{ width: 120, height: 120, fontSize: 32, color: 'primary.contrastText', bgcolor: 'primary.main' }}>{fingerprintAnalytics.diversity_score}%</Avatar><Box><Typography color="textSecondary" variant="caption">Fingerprint Diversity</Typography><Box sx={{ mt: 2 }}><Typography variant="body2"><strong>Total Pages:</strong> {fingerprintAnalytics.total_pages}</Typography><Typography variant="body2"><strong>Unique Combinations:</strong> {fingerprintAnalytics.unique_combinations}</Typography></Box></Box></Box></CardContent></Card></Grid>

              {/* User Agents */}
              {fingerprintAnalytics.user_agents?.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="User-Agent Distribution" />
                    <CardContent>
                      <Grid container spacing={2}>
                        {fingerprintAnalytics.user_agents.map((ua, idx) => (
                          <Grid item xs={6} sm={4} md={3} key={idx}>
                            <Card variant="outlined" sx={{ textAlign: 'center', p: 2, transition: 'all 0.2s', '&:hover': { boxShadow: 2 } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {ua.name?.substring(0, 20)}...
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {ua.count} pages
                              </Typography>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Locales */}
              {fingerprintAnalytics.locales?.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Locale Distribution" />
                    <CardContent>
                      <Grid container spacing={2}>
                        {fingerprintAnalytics.locales.map((locale, idx) => (
                          <Grid item xs={6} sm={4} md={3} key={idx}>
                            <Card variant="outlined" sx={{ textAlign: 'center', p: 2, transition: 'all 0.2s', '&:hover': { boxShadow: 2 } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {locale.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {locale.count} pages
                              </Typography>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {fingerprintAnalytics.timezones?.length > 0 && (
                <Grid item xs={12}><Card><CardHeader title="Timezone Distribution" /><CardContent><Grid container spacing={2}>{fingerprintAnalytics.timezones.map((tz, i) => (<Grid item xs={6} sm={4} md={3} key={i}><Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{tz.name}</Typography><Typography variant="caption" color="textSecondary">{tz.count} pages</Typography></Card></Grid>))}</Grid></CardContent></Card></Grid>
              )}
              {fingerprintAnalytics.viewports?.length > 0 && (
                <Grid item xs={12}><Card><CardHeader title="Viewport Distribution" /><CardContent><Grid container spacing={2}>{fingerprintAnalytics.viewports.map((vp, i) => (<Grid item xs={6} sm={4} md={3} key={i}><Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{vp.name}</Typography><Typography variant="caption" color="textSecondary">{vp.count} pages</Typography></Card></Grid>))}</Grid></CardContent></Card></Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* GEOLOCATION VIEW */}
        {activeView === 'geolocation' && !loading && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Geographical Distribution</Typography>
            {geolocationAnalytics?.locations?.length > 0 ? (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    {geolocationAnalytics.locations.map((loc, idx) => (
                      <Box key={idx}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{loc.city}, {loc.country}</Typography>
                          <Typography variant="body2">{loc.percentage.toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={loc.percentage} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent sx={{ textAlign: 'center', py: 4 }}><PublicIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} /><Typography variant="h6">No geolocation data</Typography></CardContent></Card>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default DatabaseViews