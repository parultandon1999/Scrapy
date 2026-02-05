import { Skeleton, Box, Grid, Paper } from '@mui/material'

// Generic Skeleton Components

export function SkeletonBox({ width = '100%', height = '20px', variant = 'rectangular', className = '', sx = {} }) {
  return (
    <Skeleton 
      variant={variant}
      width={width}
      height={height}
      className={className}
      sx={sx}
      aria-hidden="true"
    />
  )
}

export function SkeletonCircle({ size = '40px', className = '', sx = {} }) {
  return (
    <Skeleton 
      variant="circular"
      width={size}
      height={size}
      className={className}
      sx={sx}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, className = '', gap = '10px', sx = {} }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap, ...sx }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
          height={16}
        />
      ))}
    </Box>
  )
}

export function SkeletonButton({ width = '120px', height = '40px', className = '', sx = {} }) {
  return (
    <Skeleton 
      variant="rounded"
      width={width}
      height={height}
      className={className}
      sx={sx}
    />
  )
}

export function SkeletonInput({ width = '100%', height = '40px', className = '', sx = {} }) {
  return (
    <Skeleton 
      variant="rounded"
      width={width}
      height={height}
      className={className}
      sx={sx}
    />
  )
}

export function SkeletonBadge({ width = '60px', height = '24px', className = '', sx = {} }) {
  return (
    <Skeleton 
      variant="rounded"
      width={width}
      height={height}
      className={className}
      sx={{ borderRadius: '12px', ...sx }}
    />
  )
}

export function SkeletonAvatar({ size = '40px', className = '', sx = {} }) {
  return <SkeletonCircle size={size} className={className} sx={sx} />
}

export function SkeletonIcon({ size = '24px', className = '', sx = {} }) {
  return <SkeletonCircle size={size} className={className} sx={sx} />
}

// Database Skeletons

export function DatabaseTableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <Box role="status" aria-label="Loading table data">
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 1, mb: 1 }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={40} />
        ))}
      </Box>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 1, mb: 1 }}>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="rectangular" height={50} />
          ))}
        </Box>
      ))}
    </Box>
  )
}

export function DatabaseDashboardSkeleton() {
  return (
    <Box role="status" aria-label="Loading dashboard">
      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <SkeletonIcon size="32px" />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="120px" height={16} />
              <Skeleton width="80px" height={32} sx={{ my: 1 }} />
              <Skeleton width="100px" height={14} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Compact Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <SkeletonIcon size="20px" />
            <Box>
              <Skeleton width="60px" height={14} />
              <Skeleton width="40px" height={20} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Widgets */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        {Array.from({ length: 2 }).map((_, widgetIdx) => (
          <Box key={widgetIdx} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton width="150px" height={20} />
              <Skeleton width="80px" height={16} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <SkeletonBadge width="50px" />
                  <Skeleton sx={{ flex: 1 }} height={8} />
                  <Skeleton width="40px" height={16} />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function DatabasePagesSkeleton({ count = 10 }) {
  return (
    <Box role="status" aria-label="Loading pages">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Skeleton width="24px" height="24px" variant="rectangular" />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="70%" height={20} />
            <Skeleton width="90%" height={16} sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <SkeletonBadge width="40px" />
              <Skeleton width="120px" height={14} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <SkeletonButton width="80px" height="32px" />
            <SkeletonButton width="80px" height="32px" />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export function DatabaseFilesSkeleton({ count = 10 }) {
  return (
    <Box role="status" aria-label="Loading files">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <SkeletonIcon size="32px" />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={14} />
          </Box>
          <SkeletonBadge width="70px" />
          <Skeleton width="80px" height={16} />
        </Box>
      ))}
    </Box>
  )
}

export function DatabaseAnalyticsSkeleton() {
  return (
    <Box role="status" aria-label="Loading analytics">
      <Skeleton width="200px" height={28} sx={{ mb: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 2 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Skeleton width="150px" height={20} sx={{ mb: 2 }} />
            <Skeleton width="100%" height={300} variant="rounded" />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// History Skeletons

export function HistorySessionCardGridSkeleton() {
  return (
    <Paper 
      elevation={0}
      variant="outlined"
      sx={{ height: '100%', position: 'relative' }}
    >
      {/* Selection checkbox skeleton */}
      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
        <Skeleton variant="rounded" width={32} height={32} />
      </Box>
      
      <Box sx={{ p: 2, pt: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Skeleton width="70%" height={20} />
            <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 50 }} />
          </Box>
          <Skeleton width="50%" height={14} />
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={6} key={i}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Skeleton variant="circular" width={14} height={14} />
                <Skeleton width="60%" height={14} />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Skeleton width="100%" height={1} sx={{ my: 1.5 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" width={32} height={32} />
          ))}
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="rounded" width={32} height={32} />
        </Box>
      </Box>
    </Paper>
  )
}

export function HistorySessionCardListSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* Checkbox */}
        <Skeleton variant="rounded" width={20} height={20} />
        
        {/* Avatar */}
        <Skeleton variant="circular" width={48} height={48} />
        
        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Skeleton width="60%" height={20} />
            <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 50 }} />
          </Box>
          <Skeleton width="40%" height={14} />
        </Box>
        
        {/* Stats Chips - Hidden on mobile */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 50 }} />
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 50 }} />
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 50 }} />
        </Box>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} variant="rounded" width={32} height={32} />
          ))}
        </Box>
      </Box>
    </Paper>
  )
}

export function HistorySessionsSkeleton({ count = 6, viewMode = 'grid' }) {
  return (
    <Box role="status" aria-label="Loading sessions">
      {viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {Array.from({ length: count }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <HistorySessionCardGridSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: count }).map((_, idx) => (
            <HistorySessionCardListSkeleton key={idx} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export function HistoryCardSkeleton({ count = 1 }) {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: count }).map((_, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <HistorySessionCardGridSkeleton />
        </Grid>
      ))}
    </Grid>
  )
}

export function HistoryStatisticsSkeleton() {
  return (
    <Box role="status" aria-label="Loading statistics">
      <Skeleton width="250px" height={32} sx={{ mb: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <SkeletonIcon size="20px" />
            <Box>
              <Skeleton width="80px" height={14} />
              <Skeleton width="60px" height={24} />
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Skeleton width="180px" height={20} sx={{ mb: 2 }} />
        {Array.from({ length: 2 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Skeleton width="100px" height={16} />
            <Skeleton width="120px" height={16} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function HistoryTimelineSkeleton() {
  return (
    <Box role="status" aria-label="Loading timeline">
      <Skeleton width="200px" height={28} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Box key={i}>
            <Skeleton width="120px" height={16} sx={{ mb: 1 }} />
            <Skeleton width="100%" height={40} variant="rounded" />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function HistorySessionDetailsSkeleton() {
  return (
    <Box role="status" aria-label="Loading session details">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton width="250px" height={32} />
        <SkeletonButton width="100px" height="36px" />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Skeleton width="150px" height={20} sx={{ mb: 2 }} />
            {Array.from({ length: 4 }).map((_, j) => (
              <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Skeleton width="120px" height={16} />
                <Skeleton width="100px" height={16} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Config Skeletons

export function ConfigSectionSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          <Skeleton width="200px" height={28} sx={{ mb: 2 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Skeleton width="150px" height={18} />
                <SkeletonIcon size="20px" />
              </Box>
              <SkeletonInput />
            </Box>
          ))}
        </Box>
      ))}
    </>
  )
}

export function ConfigPageSkeleton() {
  return (
    <Box role="status" aria-label="Loading configuration">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton width="180px" height={32} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <SkeletonButton width="120px" height="40px" />
          <SkeletonButton width="100px" height="40px" />
        </Box>
      </Box>
      <ConfigSectionSkeleton count={4} />
    </Box>
  )
}

// Scraping Progress Skeletons

export function ScrapingProgressSkeleton() {
  const logWidths = ['85%', '92%', '78%', '88%', '95%', '82%']
  
  return (
    <Box role="status" aria-label="Loading scraping progress">
      <Skeleton width="100%" height={8} variant="rounded" sx={{ mb: 3, borderRadius: '12px' }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Skeleton width="60px" height={36} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton width="80px" height={16} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {logWidths.map((width, i) => (
          <Skeleton key={i} height={24} width={width} />
        ))}
      </Box>
    </Box>
  )
}

export function ScrapingStatusSkeleton() {
  return (
    <Box role="status" aria-label="Loading status">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton width="200px" height={28} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <SkeletonButton width="100px" height="40px" />
          <SkeletonButton width="100px" height="40px" />
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
            <SkeletonIcon size="24px" sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton width="100px" height={32} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton width="80px" height={14} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Skeleton width="80%" height={18} sx={{ mb: 0.5 }} />
            <Skeleton width="60%" height={14} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Selector Finder Skeletons

export function SelectorResultsSkeleton({ count = 5 }) {
  return (
    <Box role="status" aria-label="Loading selector results">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Skeleton width="70%" height={20} />
            <SkeletonBadge width="80px" height="24px" />
          </Box>
          <Skeleton width="100%" height={40} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton width="120px" height={16} />
            <Skeleton width="100px" height={16} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <SkeletonButton width="100px" height="36px" />
            <SkeletonButton width="100px" height="36px" />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export function SelectorAnalysisSkeleton() {
  return (
    <Box role="status" aria-label="Analyzing page">
      <Skeleton width="200px" height={24} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i}>
            <Skeleton width="150px" height={20} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 3 }).map((_, j) => (
                <Box key={j}>
                  <Skeleton width="120px" height={16} sx={{ mb: 0.5 }} />
                  <Skeleton width="100%" height={36} />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Proxy Tester Skeletons

export function ProxyResultsSkeleton({ count = 10 }) {
  return (
    <Box role="status" aria-label="Loading proxy results">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <SkeletonIcon size="32px" sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton width="100px" height={32} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton width="80px" height={16} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Skeleton width="150px" height={20} />
            <Skeleton width="100px" height={20} />
            <SkeletonBadge width="80px" height="28px" />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function ProxyListSkeleton({ count = 5 }) {
  return (
    <Box role="status" aria-label="Loading proxies">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1 }}>
          <Skeleton width="200px" height={18} />
          <SkeletonButton width="80px" height="32px" />
        </Box>
      ))}
    </Box>
  )
}

// Preferences Skeletons

export function PreferencesSkeleton() {
  return (
    <Box role="status" aria-label="Loading preferences">
      <Skeleton width="180px" height={32} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i}>
            <Skeleton width="150px" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 4 }).map((_, j) => (
                <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box>
                    <Skeleton width="140px" height={18} sx={{ mb: 0.5 }} />
                    <Skeleton width="200px" height={14} />
                  </Box>
                  <Skeleton width="50px" height={24} variant="rounded" sx={{ borderRadius: '12px' }} />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Search Results Skeletons

export function SearchResultsSkeleton({ count = 10 }) {
  return (
    <Box role="status" aria-label="Searching">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ p: 2, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Skeleton width="80%" height={20} sx={{ mb: 1 }} />
          <Skeleton width="100%" height={16} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <SkeletonBadge width="60px" />
            <Skeleton width="120px" height={14} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// Form Skeletons

export function FormSkeleton({ fields = 4 }) {
  return (
    <Box role="status" aria-label="Loading form">
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Skeleton width="120px" height={18} sx={{ mb: 1 }} />
          <SkeletonInput />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
        <SkeletonButton width="100px" height="40px" />
        <SkeletonButton width="100px" height="40px" />
      </Box>
    </Box>
  )
}

// Inline Button Skeleton

export function InlineButtonSkeleton() {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <SkeletonCircle size="16px" />
      <Skeleton width="80px" height={16} />
    </Box>
  )
}
