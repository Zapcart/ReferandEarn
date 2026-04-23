// Coin System
class CoinSystem {
    constructor() {
        this.initializeCoins();
        this.updateCoinDisplay();
    }

    initializeCoins() {
        if (!localStorage.getItem('coins')) {
            localStorage.setItem('coins', '0');
        }
        if (!localStorage.getItem('lastDailyBonus')) {
            localStorage.setItem('lastDailyBonus', '0');
        }
    }

    getCoins() {
        return parseInt(localStorage.getItem('coins') || '0');
    }

    addCoins(amount) {
        const currentCoins = this.getCoins();
        const newCoins = currentCoins + amount;
        localStorage.setItem('coins', newCoins.toString());
        this.updateCoinDisplay();
        this.animateCoinIncrease();
        return newCoins;
    }

    updateCoinDisplay() {
        const coinElements = document.querySelectorAll('#coinCount, #balanceAmount, #coinsDisplay');
        const coins = this.getCoins();
        
        coinElements.forEach(element => {
            if (element) {
                element.textContent = coins;
            }
        });

        // Update progress bar on earn page
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = Math.min((coins / 1000) * 100, 100);
            progressFill.style.width = `${progress}%`;
        }

        // Update withdrawal page
        this.updateWithdrawalPage(coins);
    }

    updateWithdrawalPage(coins) {
        const rupeeDisplay = document.getElementById('rupeeDisplay');
        const withdrawBtn = document.getElementById('withdrawBtn');
        const coinsCheck = document.getElementById('coinsCheck');

        if (rupeeDisplay) {
            const rupees = Math.floor((coins / 1000) * 500);
            rupeeDisplay.textContent = `₹${rupees}`;
        }

        if (withdrawBtn) {
            if (coins >= 1000) {
                withdrawBtn.disabled = false;
                if (coinsCheck) {
                    coinsCheck.style.background = '#00C853';
                }
            } else {
                withdrawBtn.disabled = true;
                if (coinsCheck) {
                    coinsCheck.style.background = '#666';
                }
            }
        }
    }

    animateCoinIncrease() {
        const coinDisplay = document.querySelector('.coin-display');
        if (coinDisplay) {
            coinDisplay.style.transform = 'scale(1.2)';
            setTimeout(() => {
                coinDisplay.style.transform = 'scale(1)';
            }, 300);
        }
    }

    canClaimDailyBonus() {
        const lastBonus = parseInt(localStorage.getItem('lastDailyBonus') || '0');
        const today = new Date().toDateString();
        const lastBonusDate = new Date(lastBonus).toDateString();
        return today !== lastBonusDate;
    }

    claimDailyBonus() {
        if (this.canClaimDailyBonus()) {
            this.addCoins(5);
            localStorage.setItem('lastDailyBonus', new Date().toISOString());
            return true;
        }
        return false;
    }
}

// Video System
class VideoSystem {
    constructor() {
        this.currentVideoIndex = 0;
        this.videos = [];
        this.isAdShowing = false;
        this.videoCount = 0;
        this.initializeVideos();
    }

    initializeVideos() {
        // Generate video list dynamically (video1.mp4 to video100.mp4)
        for (let i = 1; i <= 100; i++) {
            this.videos.push(`videos/video${i}.mp4`);
        }
        
        // Shuffle videos for random order
        this.videos.sort(() => Math.random() - 0.5);
        
        this.loadVideo(0);
        this.setupEventListeners();
    }

    loadVideo(index) {
        const video = document.getElementById('currentVideo');
        if (!video) return;

        // Show ad every 3-4 videos
        this.videoCount++;
        if (this.videoCount > 1 && this.videoCount % 4 === 0) {
            this.showAd();
            return;
        }

        video.src = this.videos[index];
        video.play().catch(e => {
            console.log('Autoplay failed, user interaction required');
        });

        // Preload next video
        this.preloadNextVideo(index + 1);
    }

    preloadNextVideo(nextIndex) {
        if (nextIndex < this.videos.length) {
            const nextVideo = document.createElement('video');
            nextVideo.src = this.videos[nextIndex];
            nextVideo.preload = 'auto';
        }
    }

    setupEventListeners() {
        const video = document.getElementById('currentVideo');
        if (!video) return;

        // Touch events for mobile
        let startY = 0;
        let endY = 0;

        video.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        video.addEventListener('touchend', (e) => {
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startY, endY);
        });

        // Wheel event for desktop
        video.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.nextVideo();
            } else {
                this.previousVideo();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                this.nextVideo();
            } else if (e.key === 'ArrowUp') {
                this.previousVideo();
            }
        });
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
        if (this.isAdShowing) return;
        
        this.currentVideoIndex = (this.currentVideoIndex + 1) % this.videos.length;
        this.loadVideo(this.currentVideoIndex);
    }

    previousVideo() {
        if (this.isAdShowing) return;
        
        this.currentVideoIndex = this.currentVideoIndex === 0 
            ? this.videos.length - 1 
            : this.currentVideoIndex - 1;
        this.loadVideo(this.currentVideoIndex);
    }

    showAd() {
        this.isAdShowing = true;
        const adContainer = document.getElementById('adContainer');
        const videoPlayer = document.getElementById('videoPlayer');
        
        if (adContainer && videoPlayer) {
            adContainer.style.display = 'flex';
            videoPlayer.style.display = 'none';
        }
    }
}

// Share System
class ShareSystem {
    constructor(coinSystem) {
        this.coinSystem = coinSystem;
        this.shareUrl = window.location.origin;
        this.shareText = 'Watch viral videos and earn coins! 🪙';
    }

    async shareOnWhatsApp() {
        try {
            const url = `https://wa.me/?text=${encodeURIComponent(this.shareText + ' ' + this.shareUrl)}`;
            window.open(url, '_blank');
            this.addCoinWithDelay();
            return true;
        } catch (error) {
            console.error('WhatsApp share failed:', error);
            return false;
        }
    }

    async shareOnTelegram() {
        try {
            const url = `https://t.me/share/url?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent(this.shareText)}`;
            window.open(url, '_blank');
            this.addCoinWithDelay();
            return true;
        } catch (error) {
            console.error('Telegram share failed:', error);
            return false;
        }
    }

    async copyLink() {
        try {
            await navigator.clipboard.writeText(this.shareUrl);
            this.addCoinWithDelay();
            return true;
        } catch (error) {
            console.error('Copy link failed:', error);
            return false;
        }
    }

    addCoinWithDelay() {
        // Prevent spam clicking
        setTimeout(() => {
            this.coinSystem.addCoins(1);
            showToast('+1 coin added!');
        }, 500);
    }
}

// Toast Notification System
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Withdrawal System
class WithdrawalSystem {
    constructor(coinSystem) {
        this.coinSystem = coinSystem;
    }

    initiateWithdraw() {
        const coins = this.coinSystem.getCoins();
        
        if (coins < 1000) {
            showToast('You need at least 1000 coins to withdraw!');
            return;
        }

        // Create Google Form URL with pre-filled data
        const formUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform';
        const params = new URLSearchParams({
            'entry.123456789': coins.toString(), // Coin amount field
            'entry.987654321': Math.floor((coins / 1000) * 500).toString() // Rupee amount field
        });

        window.open(`${formUrl}?${params.toString()}`, '_blank');
        showToast('Redirecting to withdrawal form...');
    }
}

// Global Functions for HTML onclick handlers
let coinSystem, videoSystem, shareSystem, withdrawalSystem;

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
    if (coinSystem) {
        if (coinSystem.claimDailyBonus()) {
            showToast('Daily bonus claimed! +5 coins');
        } else {
            showToast('Daily bonus already claimed today!');
        }
    }
}

function skipAd() {
    if (videoSystem) {
        const adContainer = document.getElementById('adContainer');
        const videoPlayer = document.getElementById('videoPlayer');
        
        if (adContainer && videoPlayer) {
            adContainer.style.display = 'none';
            videoPlayer.style.display = 'block';
            videoSystem.isAdShowing = false;
        }
    }
}

function initiateWithdraw() {
    if (withdrawalSystem) {
        withdrawalSystem.initiateWithdraw();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    coinSystem = new CoinSystem();
    
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
});

// Performance optimizations
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause videos when tab is not visible
        const videos = document.querySelectorAll('video');
        videos.forEach(video => video.pause());
    } else {
        // Resume videos when tab becomes visible
        const videos = document.querySelectorAll('video');
        videos.forEach(video => video.play().catch(e => {}));
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
