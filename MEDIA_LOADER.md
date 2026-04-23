# Dynamic Media Loader System

## 🚀 Features Implemented

### Automatic Media Detection
- **Photos**: Loads from `/images/photo1.png` to `/images/photo20.png`
- **Videos**: Loads from `/videos/video1.mp4` to `/videos/video20.mp4`
- **Multiple Formats**: Supports jpg, jpeg, png, gif, webp (photos) and mp4, webm, ogg (videos)
- **Graceful Handling**: Skips missing files automatically without errors

### Premium User Experience
- **Reels-Style Feed**: Vertical swipe/scroll navigation
- **Mixed Media**: Photos and videos seamlessly integrated
- **Autoplay Videos**: Videos play automatically when visible
- **Lazy Loading**: Performance optimized with smart preloading
- **Smooth Transitions**: Professional animations between media items

### Navigation Controls
- **Touch/Swipe**: Mobile-friendly swipe gestures
- **Keyboard**: Arrow keys and spacebar navigation
- **Mouse Wheel**: Scroll wheel support
- **Button Controls**: Previous/Next navigation buttons

### Professional Features
- **Loading States**: Elegant loading spinner during initialization
- **Empty State**: Beautiful fallback UI when no media is found
- **Media Indicators**: Visual indicators for photo vs video content
- **Progress Bars**: Video progress tracking
- **Responsive Design**: Works perfectly on mobile and desktop

## 📁 Folder Structure

```
/
├── index.html
├── styles.css
├── media-loader.js
├── script.js
├── images/
│   ├── photo1.png
│   ├── photo2.jpg
│   ├── photo3.jpeg
│   ├── ...
│   └── photo20.webp
└── videos/
    ├── video1.mp4
    ├── video2.webm
    ├── video3.ogg
    ├── ...
    └── video20.mp4
```

## 🎯 How It Works

### 1. Automatic Detection
The system automatically scans for files in sequential order:
- Checks `photo1.png`, `photo2.png`, ..., `photo20.png`
- Checks `video1.mp4`, `video2.mp4`, ..., `video20.mp4`
- Tries multiple file extensions for each number
- Gracefully skips missing files

### 2. Smart Loading
- **Preloading**: Loads next 3 media items in background
- **Lazy Loading**: Only loads what's needed
- **Error Handling**: Continues even if some files fail to load
- **Performance**: Optimized for fast loading

### 3. User Interaction
- **Swipe Up/Down**: Navigate between media items
- **Click Buttons**: Use navigation buttons
- **Keyboard**: Arrow keys or spacebar
- **Auto-Advance**: Videos automatically advance when finished

## 🔧 Configuration Options

### Customize Media Limits
```javascript
this.maxPhotos = 20;  // Change to your needs
this.maxVideos = 20;  // Change to your needs
```

### Supported File Extensions
```javascript
imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
videoExtensions: ['mp4', 'webm', 'ogg']
```

### Preloading Settings
```javascript
preloadCount: 3,  // Number of items to preload
retryAttempts: 2  // Retry attempts for failed loads
```

## 🎨 Styling

The system includes comprehensive CSS for:
- **Media Items**: Full-screen display with smooth transitions
- **Controls**: Glassmorphic navigation buttons
- **Indicators**: Media type badges (📷 Photo, 🎬 Video)
- **Empty State**: Professional "no media" message
- **Loading**: Elegant spinner animation
- **Progress**: Video progress bars

## 📱 Mobile Optimization

- **Touch Gestures**: Natural swipe navigation
- **Responsive**: Adapts to all screen sizes
- **Performance**: Optimized for mobile devices
- **Safe Areas**: Handles notches and rounded corners

## 🚀 GitHub Pages Compatible

- **No Server Required**: Pure JavaScript implementation
- **Static Files**: Works with static hosting
- **CORS Friendly**: Handles cross-origin issues
- **Error Resilient**: Continues working even with missing files

## 🔍 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Features**: Uses modern JavaScript (ES6+)
- **Fallbacks**: Graceful degradation for older browsers

## 🎯 Usage

1. **Add Media**: Place photos in `/images/` and videos in `/videos/`
2. **Name Files**: Use sequential numbering (photo1, photo2, etc.)
3. **Upload**: Deploy to GitHub Pages or any static host
4. **Enjoy**: The system automatically detects and displays your media

## 🛠️ Advanced Features

### Media Shuffling
- Randomizes media order on each load
- Ensures varied user experience
- Maintains smooth transitions

### Smart Preloading
- Preloads next media items
- Reduces loading delays
- Improves user experience

### Error Recovery
- Handles missing files gracefully
- Continues loading other media
- Shows appropriate empty state

### Performance Monitoring
- Tracks loading progress
- Logs errors for debugging
- Optimizes resource usage

---

**🎉 Your dynamic media loader is now ready!**

Simply add your photos and videos to the respective folders, and the system will automatically create a beautiful, professional media feed.
