# Scraping Progress Page - Modern Redesign

## 🎨 New Design Concept

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ Navbar                                          [🌙] [History]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔄 Scraping example.com                    [⏸️] [⏹️] [📊] │ │
│  │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  65%       │ │
│  │ 65 / 100 pages • 2.3 p/s • ETA: 15s                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────┬──────┬──────┬──────┐                                 │
│  │ 📄 65│ 📦 23│ ✅ 65│ 📥 12│  ← Stat Cards                   │
│  │Pages │Queue │Visit │Files │                                 │
│  └──────┴──────┴──────┴──────┘                                 │
│                                                                  │
│  🔍 [Search pages...]                    [Pages] [Files] ←Tabs │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🌐 Homepage                                    [View] [▼]  │ │
│  │ https://example.com                                        │ │
│  │ Depth 0 • 2 min ago • 📷 5 images • 🔗 12 links           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 📄 About Page                                  [View] [▼]  │ │
│  │ https://example.com/about                                  │ │
│  │ Depth 1 • 1 min ago • 📷 3 images • 🔗 8 links            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Load More (35 remaining)]                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Changes

### 1. **Hero Status Card** (Top)
- Large, prominent status display
- Animated progress bar with gradient
- Real-time metrics in one line
- Quick action buttons on the right
- Color-coded status (blue=running, green=complete, red=stopped, orange=paused)

### 2. **Stat Cards Row**
- 4 compact stat cards in a row
- Icons with numbers
- Hover effects with subtle animations
- Responsive grid (2x2 on mobile)

### 3. **Unified Search & Tabs**
- Search bar and view tabs on same line
- Clean, minimal design
- Real-time search with debounce

### 4. **Redesigned Page Cards**
- Cleaner, more compact layout
- Key info visible at a glance
- Expandable for details
- Hover effects
- Better visual hierarchy

### 5. **Mobile-First Responsive**
- Stack layout on mobile
- Touch-friendly buttons
- Optimized spacing

## Color Scheme

### Status Colors
- **Running**: `#2196f3` (Blue)
- **Paused**: `#ff9800` (Orange)
- **Complete**: `#4caf50` (Green)
- **Stopped**: `#f44336` (Red)

### Accent Colors
- **Primary**: `#1976d2`
- **Success**: `#2e7d32`
- **Warning**: `#ed6c02`
- **Error**: `#d32f2f`

## Typography
- **Hero Title**: 1.5rem, weight 500
- **Stats**: 2rem, weight 600
- **Card Title**: 1rem, weight 500
- **Body**: 0.875rem, weight 400
- **Caption**: 0.75rem, weight 400

## Spacing
- **Container padding**: 24px
- **Card gap**: 16px
- **Section gap**: 32px
- **Element gap**: 8px

## Animations
- **Progress bar**: Smooth fill animation
- **Card hover**: Lift effect (translateY: -2px)
- **Button hover**: Scale 1.02
- **Fade in**: New items fade in
- **Skeleton**: Pulse animation while loading

## Implementation Priority

1. ✅ Hero status card with progress
2. ✅ Stat cards row
3. ✅ Search and tabs
4. ✅ Redesigned page cards
5. ✅ File view redesign
6. ✅ Mobile responsive
7. ✅ Animations and transitions
8. ✅ Loading states
9. ✅ Error handling
10. ✅ Export functionality

