# Carousel with Drag/Swipe Implementation

## What Was Added

### 1. Enhanced Carousel Component
**Location**: `src/components/molecules/Carousel/`

**Features**:
- ✅ Auto-play with configurable interval
- ✅ Navigation arrows (previous/next)
- ✅ Dot indicators for slide position
- ✅ Smooth transitions
- ✅ **Touch/Swipe support for mobile devices**
- ✅ **Mouse drag support for desktop**
- ✅ Responsive design
- ✅ Visual feedback (cursor changes to grab/grabbing)

**Drag/Swipe Functionality**:
- Swipe left/right on touch devices
- Click and drag on desktop
- Minimum 20% swipe distance to change slides
- Smooth snap-back if swipe is too short
- Auto-play pauses during interaction

**Usage**:
```tsx
<Carousel autoPlay interval={4000}>
  {items.map(item => (
    <div key={item.id}>Your content</div>
  ))}
</Carousel>
```

### 2. Enhanced Data
**Location**: `src/data/products.ts`

**Added**:
- 12 new products (total: 24 products)
- 3 new deals (total: 5 deals)
- More variety in categories

### 3. Updated HomePage with Multiple Carousels
**Location**: `src/pages/HomePage.tsx`

**All Sections Now Use Carousels**:

1. **Hot Deals Carousel**
   - Auto-rotates through 5 deals every 4 seconds
   - Full-width slides with overlay text
   - Drag/swipe enabled
   - Shows discount badge, title, and end date

2. **Categories Carousel**
   - Shows 6 categories per slide
   - Manual navigation with drag/swipe
   - Responsive grid layout

3. **All Products Carousel**
   - 3 slides with 8 products each (24 total)
   - Manual navigation with drag/swipe
   - Shows product count and collections badge

4. **New Arrivals Carousel**
   - Multiple slides with 4 products each
   - Filtered to show only "New" badge products
   - Drag/swipe enabled

5. **Flash Sale Carousel**
   - Multiple slides with 4 products each
   - Filtered to show only "Sale" badge products
   - Gradient background with special styling
   - Drag/swipe enabled

## How Drag/Swipe Works

### Touch Devices (Mobile/Tablet)
1. Touch and hold on the carousel
2. Swipe left to go to next slide
3. Swipe right to go to previous slide
4. Release to complete the transition
5. If swipe is less than 20%, it snaps back

### Desktop (Mouse)
1. Click and hold on the carousel (cursor changes to "grabbing")
2. Drag left to go to next slide
3. Drag right to go to previous slide
4. Release to complete the transition
5. If drag is less than 20%, it snaps back

### Additional Controls
- Arrow buttons for precise navigation
- Dot indicators to jump to specific slides
- Auto-play (where enabled) pauses during interaction

## Benefits
- More engaging user experience
- Natural mobile-first interaction
- Visual continuity (no page jumps)
- Touch-friendly on all devices
- Cleaner UI without page number buttons
- Intuitive drag feedback

## Theme Support
All carousels fully support light and dark modes with proper color schemes for arrows, dots, and content.


