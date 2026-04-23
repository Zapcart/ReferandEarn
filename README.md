# Entertainment Rewards Platform

A premium entertainment rewards platform where users can watch viral videos, share content with friends, and collect coins to unlock rewards.

## 🎯 Product Positioning

**Watch • Share • Collect Coins**

Presented as an "Entertainment Rewards Platform" - not a money-making site. Users watch viral videos, share with friends, collect coins & unlock rewards.

## 🏗️ Architecture

- **Static Site**: Fully deployable on GitHub Pages
- **No Backend**: All functionality runs in the browser
- **Local Storage**: Coins and user data stored locally
- **Mobile-First**: Optimized for mobile devices

## 📁 Project Structure

```
├── index.html          # Main video feed page
├── earn.html           # Coin earning actions
├── withdraw.html       # Reward withdrawal page
├── privacy.html        # Privacy policy
├── terms.html          # Terms of service
├── styles.css          # Premium dark theme styling
├── script.js           # Core functionality
├── videos/             # Video content folder
│   ├── video1.mp4
│   ├── video2.mp4
│   └── ... (up to video100.mp4)
└── README.md           # This file
```

## 🎨 Design System

### Color Palette
- **Background**: `#0E0E10` (deep black)
- **Primary Accent**: `#FFD700` (gold - coins feel)
- **Secondary Accent**: `#1E90FF` (share buttons)
- **Success/CTA**: `#00C853` (withdraw eligible)
- **Text Primary**: `#FFFFFF`
- **Text Muted**: `#A0A0A0`

### Typography
- **Font**: Inter
- **Headings**: Semi-bold
- **Numbers**: Bold

## 🚀 Core Features

### Video System (index.html)
- Full-screen reels-style video feed
- Autoplay, muted, loop functionality
- Scroll/swipe navigation
- Ads between every 3-4 videos
- Dynamic video loading (video1.mp4 - video100.mp4)

### Coin System
- Local storage persistence
- Real-time coin display
- Animated coin increases
- Daily bonus system
- Progress tracking to 1000 coins

### Share System (earn.html)
- WhatsApp sharing (+1 coin)
- Telegram sharing (+1 coin)
- Link copying (+1 coin)
- Daily bonus (+5 coins)
- Anti-spam protection

### Withdrawal System (withdraw.html)
- 1000 coins = ₹500 conversion
- Requirements checklist
- Google Form integration
- Trust elements and guarantees

## 📱 Mobile Optimization

- Thumb-reachable buttons
- 60fps smooth scrolling
- Safe area padding (notch friendly)
- Touch gesture support
- Responsive design

## 🎯 User Flow

1. **index.html**: Users watch videos in an endless scroll
2. **earn.html**: Users perform actions to earn coins
3. **withdraw.html**: Users convert coins to real rewards
4. **Legal Pages**: Privacy policy and terms

## 🔧 Technical Implementation

### Video Management
- Videos named sequentially: `video1.mp4` to `video100.mp4`
- JavaScript auto-loads using loop
- Randomized order on each visit
- Smooth fade transitions
- Preloading for performance

### Coin Storage
```javascript
// localStorage structure
{
  "coins": "250",
  "lastDailyBonus": "2025-01-28T10:30:00.000Z"
}
```

### Share URLs
- WhatsApp: `https://wa.me/?text={encoded_message}`
- Telegram: `https://t.me/share/url?url={url}&text={text}`

## 🚀 Deployment

### GitHub Pages Setup
1. Push all files to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source
4. Site will be live at `https://username.github.io/repository`

### Required Files
- All HTML files in root directory
- `styles.css` and `script.js` in root
- `videos/` folder with video content
- Update Google Form URL in `script.js`

## 📊 Monetization

### Ad Placement
- Between video transitions
- Below share cards
- Withdraw page bottom
- Never overlay videos
- No autoplay sound

## 🔒 Legal Compliance

- Privacy policy with data usage disclosure
- Terms of service with coin system rules
- No guaranteed income claims
- Advertisement disclosure
- Simple, clear language

## 🎯 Performance Optimizations

- Lazy video loading
- Next video preloading
- Compressed MP4 (H.264)
- Optimized animations
- Efficient DOM manipulation

## 🛠️ Customization

### Brand Colors
Update CSS variables in `styles.css`:
```css
:root {
  --primary-gold: #FFD700;
  --secondary-blue: #1E90FF;
  --success-green: #00C853;
}
```

### Coin Conversion Rate
Update in `script.js`:
```javascript
const CONVERSION_RATE = 500; // 1000 coins = ₹500
```

### Video Count
Adjust video loop in `script.js`:
```javascript
for (let i = 1; i <= 100; i++) { // Change 100 to your video count
```

## 📞 Support

For technical issues or customization requests, refer to the code comments and documentation within each file.

---

**Built with ❤️ for premium entertainment rewards experience**
