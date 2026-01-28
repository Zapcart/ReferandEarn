// Advanced Entertainment Rewards Platform - Production Ready
// Performance optimized, abuse prevention, and comprehensive features

// Global Configuration
const CONFIG = {
    COIN_CONVERSION_RATE: 500, // 1000 coins = ₹500
    MIN_WITHDRAWAL_COINS: 1000,
    DAILY_BONUS_COINS: 5,
    SHARE_REWARD_COINS: 1,
    AD_FREQUENCY: 4, // Show ad every N videos
    MAX_VIDEOS: 100,
    ABUSE_PREVENTION: {
        CLICK_DELAY: 1500, // milliseconds
        DAILY_COIN_LIMIT: 100,
        SESSION_SHARE_LIMIT: 20
    },
    PERFORMANCE: {
        PRELOAD_VIDEOS: 2,
        LAZY_LOAD_THRESHOLD: 200,
        ANIMATION_DURATION: 300
    },
    SEO: {
        PLATFORM_NAME: 'Entertainment Rewards Platform',
        BASE_URL: 'https://yourusername.github.io/repository/',
        GOOGLE_FORM_ID: 'YOUR_FORM_ID'
    }
};

// Utility Functions
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + range * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }

    static formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve();
        }
    }

    static generateShareUrl() {
        const utmParams = new URLSearchParams({
            utm_source: 'share',
            utm_medium: 'social',
            utm_campaign: 'user_referral'
        });
        return `${CONFIG.SEO.BASE_URL}?${utmParams.toString()}`;
    }

    static trackEvent(eventName, properties = {}) {
        // Analytics tracking (placeholder for Google Analytics or similar)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                custom_parameter_1: properties.value || 0,
                custom_parameter_2: properties.type || 'unknown',
                ...properties
            });
        }
        
        // Console logging for development
        console.log(`Event: ${eventName}`, properties);
    }
}

// Advanced Coin System with Abuse Prevention
class CoinSystem {
    constructor() {
        this.storageKey = 'erp_coins';
        this.lastBonusKey = 'erp_last_daily_bonus';
        this.sessionKey = 'erp_session_data';
        this.lastActionTime = 0;
        this.sessionShares = 0;
        
        this.initializeStorage();
        this.updateCoinDisplay();
        this.trackSessionStart();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, '0');
        }
        if (!localStorage.getItem(this.lastBonusKey)) {
            localStorage.setItem(this.lastBonusKey, '0');
        }
        if (!sessionStorage.getItem(this.sessionKey)) {
            sessionStorage.setItem(this.sessionKey, JSON.stringify({
                startTime: Date.now(),
                shares: 0,
                lastAction: 0
            }));
        }
    }

    trackSessionStart() {
        const sessionData = JSON.parse(sessionStorage.getItem(this.sessionKey));
        this.sessionShares = sessionData.shares || 0;
        this.lastActionTime = sessionData.lastAction || 0;
    }

    updateSessionData() {
        const sessionData = {
            startTime: Date.now(),
            shares: this.sessionShares,
            lastAction: this.lastActionTime
        };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }

    getCoins() {
        return parseInt(localStorage.getItem(this.storageKey) || '0');
    }

    async addCoins(amount, source = 'unknown') {
        // Abuse prevention checks
        if (!this.canPerformAction()) {
            this.showToast('Please wait before performing this action', 'error');
            return false;
        }

        if (source === 'share' && this.sessionShares >= CONFIG.ABUSE_PREVENTION.SESSION_SHARE_LIMIT) {
            this.showToast('Daily share limit reached', 'error');
            return false;
        }

        const currentCoins = this.getCoins();
        const newCoins = currentCoins + amount;
        
        // Daily limit check
        if (newCoins > CONFIG.ABUSE_PREVENTION.DAILY_COIN_LIMIT) {
            this.showToast('Daily coin limit reached', 'error');
            return false;
        }

        // Update storage
        localStorage.setItem(this.storageKey, newCoins.toString());
        
        // Update session tracking
        if (source === 'share') {
            this.sessionShares++;
        }
        this.lastActionTime = Date.now();
        this.updateSessionData();

        // Update display with animation
        this.updateCoinDisplay(currentCoins, newCoins);
        
        // Track event
        Utils.trackEvent('coins_earned', {
            value: amount,
            type: source,
            total: newCoins
        });

        return newCoins;
    }

    canPerformAction() {
        const now = Date.now();
        return (now - this.lastActionTime) >= CONFIG.ABUSE_PREVENTION.CLICK_DELAY;
    }

    updateCoinDisplay(oldValue = null, newValue = null) {
        const coinElements = document.querySelectorAll('#coinCount, #balanceAmount, #coinsDisplay');
        const coins = newValue !== null ? newValue : this.getCoins();
        
        coinElements.forEach(element => {
            if (element) {
                if (oldValue !== null && newValue !== null && element.id === 'coinCount') {
                    Utils.animateValue(element, oldValue, newValue, CONFIG.PERFORMANCE.ANIMATION_DURATION);
                } else {
                    element.textContent = Utils.formatNumber(coins);
                }
            }
        });

        // Update progress bar on earn page
        this.updateProgressBar(coins);
        
        // Update withdrawal page
        this.updateWithdrawalPage(coins);
    }

    updateProgressBar(coins) {
        const progressFill = document.getElementById('progressFill');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressFill && progressBar) {
            const progress = Math.min((coins / CONFIG.MIN_WITHDRAWAL_COINS) * 100, 100);
            progressFill.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', Math.round(progress));
        }
    }

    updateWithdrawalPage(coins) {
        const rupeeDisplay = document.getElementById('rupeeDisplay');
        const withdrawBtn = document.getElementById('withdrawBtn');
        const coinsCheck = document.getElementById('coinsCheck');

        if (rupeeDisplay) {
            const rupees = Math.floor((coins / CONFIG.MIN_WITHDRAWAL_COINS) * CONFIG.COIN_CONVERSION_RATE);
            rupeeDisplay.textContent = `₹${Utils.formatNumber(rupees)}`;
        }

        if (withdrawBtn) {
            const isEnabled = coins >= CONFIG.MIN_WITHDRAWAL_COINS;
            withdrawBtn.disabled = !isEnabled;
            
            if (coinsCheck) {
                if (isEnabled) {
                    coinsCheck.style.background = 'var(--success-green)';
                    coinsCheck.parentElement.style.borderColor = 'var(--success-green)';
                } else {
                    coinsCheck.style.background = 'var(--text-muted)';
                    coinsCheck.parentElement.style.borderColor = 'var(--border-light)';
                }
            }
        }
    }

    canClaimDailyBonus() {
        const lastBonus = parseInt(localStorage.getItem(this.lastBonusKey) || '0');
        const today = new Date().toDateString();
        const lastBonusDate = new Date(lastBonus).toDateString();
        return today !== lastBonusDate;
    }

    async claimDailyBonus() {
        if (!this.canClaimDailyBonus()) {
            this.showToast('Daily bonus already claimed today!', 'error');
            return false;
        }

        const newCoins = await this.addCoins(CONFIG.DAILY_BONUS_COINS, 'daily_bonus');
        if (newCoins !== false) {
            localStorage.setItem(this.lastBonusKey, new Date().toISOString());
            this.showToast(`Daily bonus claimed! +${CONFIG.DAILY_BONUS_COINS} coins`, 'success');
            return true;
        }
        return false;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Advanced Video System with Performance Optimization
class VideoSystem {
    constructor() {
        this.currentVideoIndex = 0;
        this.videos = [];
        this.isAdShowing = false;
        this.videoCount = 0;
        this.preloadedVideos = new Set();
        this.isTransitioning = false;
        
        this.initializeVideos();
        this.setupEventListeners();
        this.setupIntersectionObserver();
    }

    initializeVideos() {
        // Generate video list dynamically
        for (let i = 1; i <= CONFIG.MAX_VIDEOS; i++) {
            this.videos.push(`videos/video${i}.mp4`);
        }
        
        // Shuffle videos for random order
        this.videos.sort(() => Math.random() - 0.5);
        
        // Load first video
        this.loadVideo(0);
        
        // Preload next videos
        this.preloadVideos(1, CONFIG.PERFORMANCE.PRELOAD_VIDEOS);
    }

    preloadVideos(startIndex, count) {
        for (let i = 0; i < count && (startIndex + i) < this.videos.length; i++) {
            const index = startIndex + i;
            if (!this.preloadedVideos.has(index)) {
                const video = document.createElement('video');
                video.src = this.videos[index];
                video.preload = 'auto';
                video.style.display = 'none';
                document.body.appendChild(video);
                
                video.addEventListener('canplaythrough', () => {
                    this.preloadedVideos.add(index);
                    document.body.removeChild(video);
                }, { once: true });
            }
        }
    }

    loadVideo(index, direction = 'next') {
        if (this.isTransitioning) return;
        
        const video = document.getElementById('currentVideo');
        if (!video) return;

        // Check if we should show an ad
        this.videoCount++;
        if (this.videoCount > 1 && this.videoCount % CONFIG.AD_FREQUENCY === 0) {
            this.showAd();
            return;
        }

        this.isTransitioning = true;
        
        // Fade out current video
        video.style.opacity = '0';
        
        setTimeout(() => {
            video.src = this.videos[index];
            video.load();
            
            video.addEventListener('canplay', () => {
                video.play().catch(e => {
                    console.log('Autoplay failed, user interaction required');
                });
                
                // Fade in new video
                video.style.opacity = '1';
                this.isTransitioning = false;
                
                // Update current index
                this.currentVideoIndex = index;
                
                // Preload future videos
                this.preloadVideos(index + 1, CONFIG.PERFORMANCE.PRELOAD_VIDEOS);
                
                // Track video view
                Utils.trackEvent('video_view', {
                    video_index: index,
                    direction: direction
                });
            }, { once: true });
        }, 200);
    }

    setupEventListeners() {
        const video = document.getElementById('currentVideo');
        if (!video) return;

        // Touch events for mobile
        let startY = 0;
        let endY = 0;

        video.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        video.addEventListener('touchend', (e) => {
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startY, endY);
        }, { passive: true });

        // Wheel event for desktop (throttled)
        video.addEventListener('wheel', Utils.throttle((e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.nextVideo();
            } else {
                this.previousVideo();
            }
        }, 100));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                this.nextVideo();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.previousVideo();
            }
        });

        // Video error handling
        video.addEventListener('error', (e) => {
            console.error('Video loading error:', e);
            this.nextVideo();
        });

        // Video end event
        video.addEventListener('ended', () => {
            this.nextVideo();
        });
    }

    setupIntersectionObserver() {
        // Lazy load SEO content when it comes into view
        const seoContent = document.querySelector('.seo-content');
        if (seoContent) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(seoContent);
        }
    }

    handleSwipe(startY, endY) {
        const swipeThreshold = 50;
        const diff = startY - endY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextVideo();
            } else {
                this.previousVideo();
            }
        }
    }

    nextVideo() {
        if (this.isAdShowing || this.isTransitioning) return;
        
        const nextIndex = (this.currentVideoIndex + 1) % this.videos.length;
        this.loadVideo(nextIndex, 'next');
    }

    previousVideo() {
        if (this.isAdShowing || this.isTransitioning) return;
        
        const prevIndex = this.currentVideoIndex === 0 
            ? this.videos.length - 1 
            : this.currentVideoIndex - 1;
        this.loadVideo(prevIndex, 'previous');
    }

    showAd() {
        this.isAdShowing = true;
        const adContainer = document.getElementById('adContainer');
        const videoPlayer = document.getElementById('videoPlayer');
        
        if (adContainer && videoPlayer) {
            adContainer.style.display = 'flex';
            videoPlayer.style.display = 'none';
            
            // Track ad impression
            Utils.trackEvent('ad_impression');
            
            // Auto-skip after 5 seconds
            setTimeout(() => {
                if (this.isAdShowing) {
                    this.skipAd();
                }
            }, 5000);
        }
    }

    skipAd() {
        const adContainer = document.getElementById('adContainer');
        const videoPlayer = document.getElementById('videoPlayer');
        
        if (adContainer && videoPlayer) {
            adContainer.style.display = 'none';
            videoPlayer.style.display = 'block';
            this.isAdShowing = false;
            
            // Track ad skip
            Utils.trackEvent('ad_skipped');
        }
    }
}

// Advanced Share System
class ShareSystem {
    constructor(coinSystem) {
        this.coinSystem = coinSystem;
        this.shareUrl = Utils.generateShareUrl();
        this.shareText = `🪙 Watch viral videos and earn coins on ${CONFIG.SEO.PLATFORM_NAME}!`;
    }

    async shareOnWhatsApp() {
        try {
            const url = `https://wa.me/?text=${encodeURIComponent(this.shareText + ' ' + this.shareUrl)}`;
            const newWindow = window.open(url, '_blank', 'width=600,height=400');
            
            // Track share attempt
            Utils.trackEvent('share_attempt', { platform: 'whatsapp' });
            
            // Add coins after delay (to prevent abuse)
            setTimeout(async () => {
                const newCoins = await this.coinSystem.addCoins(CONFIG.SHARE_REWARD_COINS, 'share');
                if (newCoins !== false) {
                    this.coinSystem.showToast('+1 coin added for sharing!', 'success');
                    Utils.trackEvent('share_success', { platform: 'whatsapp' });
                }
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('WhatsApp share failed:', error);
            this.coinSystem.showToast('Share failed, please try again', 'error');
            return false;
        }
    }

    async shareOnTelegram() {
        try {
            const url = `https://t.me/share/url?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent(this.shareText)}`;
            const newWindow = window.open(url, '_blank', 'width=600,height=400');
            
            // Track share attempt
            Utils.trackEvent('share_attempt', { platform: 'telegram' });
            
            // Add coins after delay
            setTimeout(async () => {
                const newCoins = await this.coinSystem.addCoins(CONFIG.SHARE_REWARD_COINS, 'share');
                if (newCoins !== false) {
                    this.coinSystem.showToast('+1 coin added for sharing!', 'success');
                    Utils.trackEvent('share_success', { platform: 'telegram' });
                }
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('Telegram share failed:', error);
            this.coinSystem.showToast('Share failed, please try again', 'error');
            return false;
        }
    }

    async copyLink() {
        try {
            await Utils.copyToClipboard(this.shareUrl);
            
            // Track copy attempt
            Utils.trackEvent('copy_link_attempt');
            
            // Add coins after delay
            setTimeout(async () => {
                const newCoins = await this.coinSystem.addCoins(CONFIG.SHARE_REWARD_COINS, 'share');
                if (newCoins !== false) {
                    this.coinSystem.showToast('Link copied! +1 coin added', 'success');
                    Utils.trackEvent('copy_link_success');
                }
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('Copy link failed:', error);
            this.coinSystem.showToast('Copy failed, please try again', 'error');
            return false;
        }
    }
}

// Withdrawal System
class WithdrawalSystem {
    constructor(coinSystem) {
        this.coinSystem = coinSystem;
    }

    async initiateWithdraw() {
        const coins = this.coinSystem.getCoins();
        
        if (coins < CONFIG.MIN_WITHDRAWAL_COINS) {
            this.coinSystem.showToast(`You need at least ${CONFIG.MIN_WITHDRAWAL_COINS} coins to withdraw!`, 'error');
            return;
        }

        const rupees = Math.floor((coins / CONFIG.MIN_WITHDRAWAL_COINS) * CONFIG.COIN_CONVERSION_RATE);
        
        // Create Google Form URL with pre-filled data
        const formUrl = `https://docs.google.com/forms/d/e/${CONFIG.SEO.GOOGLE_FORM_ID}/viewform`;
        const params = new URLSearchParams({
            'entry.123456789': coins.toString(), // Coin amount field
            'entry.987654321': rupees.toString(), // Rupee amount field
            'entry.555666777': new Date().toISOString(), // Timestamp
            'entry.111222333': window.location.href // Source page
        });

        // Track withdrawal attempt
        Utils.trackEvent('withdrawal_attempt', {
            coins: coins,
            rupees: rupees
        });

        // Open form in new window
        const formWindow = window.open(`${formUrl}?${params.toString()}`, '_blank', 'width=800,height=600');
        
        this.coinSystem.showToast('Redirecting to withdrawal form...', 'info');
        
        // Poll for form completion (simplified approach)
        setTimeout(() => {
            this.coinSystem.showToast('Withdrawal form opened. Complete the form to process your reward.', 'success');
        }, 2000);
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: performance.now(),
            videoLoads: 0,
            shareActions: 0,
            errors: 0
        };
        
        this.trackPageLoad();
        this.trackErrors();
    }

    trackPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.metrics.pageLoad;
            Utils.trackEvent('page_load_complete', { load_time: Math.round(loadTime) });
            
            // Log Core Web Vitals
            if ('web-vital' in window) {
                // This would require web-vitals library integration
                console.log('Page load time:', loadTime);
            }
        });
    }

    trackErrors() {
        window.addEventListener('error', (e) => {
            this.metrics.errors++;
            Utils.trackEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno
            });
        });
    }

    trackVideoLoad() {
        this.metrics.videoLoads++;
        Utils.trackEvent('video_loaded', {
            total_loads: this.metrics.videoLoads
        });
    }

    trackShareAction() {
        this.metrics.shareActions++;
        Utils.trackEvent('share_action', {
            total_shares: this.metrics.shareActions
        });
    }
}

// SEO Enhancement
class SEOEnhancer {
    constructor() {
        this.setupStructuredData();
        this.setupMetaTags();
        this.trackPageView();
    }

    setupStructuredData() {
        // Add breadcrumb structured data
        const breadcrumbScript = document.createElement('script');
        breadcrumbScript.type = 'application/ld+json';
        breadcrumbScript.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": CONFIG.SEO.BASE_URL
                }
            ]
        });
        document.head.appendChild(breadcrumbScript);
    }

    setupMetaTags() {
        // Add viewport meta if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(viewport);
        }

        // Add theme-color meta
        const themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        themeColor.content = '#0E0E10';
        document.head.appendChild(themeColor);

        // Add msapplication-TileColor
        const msTileColor = document.createElement('meta');
        msTileColor.name = 'msapplication-TileColor';
        msTileColor.content = '#0E0E10';
        document.head.appendChild(msTileColor);
    }

    trackPageView() {
        // Track page view for analytics
        Utils.trackEvent('page_view', {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer
        });
    }
}

// Global Systems
let coinSystem, videoSystem, shareSystem, withdrawalSystem, performanceMonitor, seoEnhancer;

// Global Functions for HTML onclick handlers
function shareOnWhatsApp() {
    if (shareSystem) shareSystem.shareOnWhatsApp();
}

function shareOnTelegram() {
    if (shareSystem) shareSystem.shareOnTelegram();
}

function copyLink() {
    if (shareSystem) shareSystem.copyLink();
}

function claimDailyBonus() {
    if (coinSystem) coinSystem.claimDailyBonus();
}

function skipAd() {
    if (videoSystem) videoSystem.skipAd();
}

function initiateWithdraw() {
    if (withdrawalSystem) withdrawalSystem.initiateWithdraw();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core systems
    coinSystem = new CoinSystem();
    performanceMonitor = new PerformanceMonitor();
    seoEnhancer = new SEOEnhancer();
    
    // Initialize video system only on index.html
    if (document.getElementById('currentVideo')) {
        videoSystem = new VideoSystem();
    }
    
    // Initialize share system on earn.html
    if (document.querySelector('.action-cards')) {
        shareSystem = new ShareSystem(coinSystem);
    }
    
    // Initialize withdrawal system on withdraw.html
    if (document.getElementById('withdrawBtn')) {
        withdrawalSystem = new WithdrawalSystem(coinSystem);
    }

    // Setup keyboard navigation for action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    // Setup smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    console.log(`${CONFIG.SEO.PLATFORM_NAME} initialized successfully`);
});

// Performance optimizations
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause videos when tab is not visible
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                video.dataset.wasPlaying = 'true';
            }
        });
    } else {
        // Resume videos when tab becomes visible
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.dataset.wasPlaying === 'true') {
                video.play().catch(e => {});
                delete video.dataset.wasPlaying;
            }
        });
    }
});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when service worker is available
        // navigator.serviceWorker.register('/sw.js').then(function(registration) {
        //     console.log('SW registered: ', registration);
        // }).catch(function(registrationError) {
        //     console.log('SW registration failed: ', registrationError);
        // });
    });
}

// Export for potential module usage
window.ERP = {
    CoinSystem,
    VideoSystem,
    ShareSystem,
    WithdrawalSystem,
    Utils,
    CONFIG
};
