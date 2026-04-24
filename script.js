// ============================================
// ZAPCART REFER & EARN PLATFORM - FIREBASE INTEGRATED
// ============================================

// Global Configuration
const CONFIG = {
    COIN_CONVERSION_RATE: 500,
    MIN_WITHDRAWAL_COINS: 1000,
    DAILY_COIN_LIMIT: 50, // Max 50 coins per day
    COOLDOWN_TIME: 5000, // 5 seconds cooldown between actions
    REFERRAL_REWARD: 2, // Coins for referring
    WATCH_PHOTO_REWARD: 1, // Coins for watching photos
    WATCH_AD_REWARD: 5, // Coins for watching ads
    SHARE_REWARD: 2, // Coins for sharing (once per day)
    BASE_URL: 'https://yourdomain.com'
};

// ============================================
// FIREBASE AUTHENTICATION INTEGRATION
// ============================================

const SessionManager = {
    // Check if user is logged in via Firebase
    isLoggedIn() {
        return window.auth && window.auth.currentUser !== null;
    },
    
    // Get current user data from Firebase
    getCurrentUser() {
        if (window.auth && window.auth.currentUser) {
            return {
                email: window.auth.currentUser.email,
                uid: window.auth.currentUser.uid
            };
        }
        return null;
    }
};

// ============================================
// COIN SYSTEM (Firebase Integration)
// ============================================

const CoinSystem = {
    STORAGE_KEY: 'zapcart_coin_data',
    
    // Initialize coin data structure
    initializeCoinData() {
        const existingData = localStorage.getItem(this.STORAGE_KEY);
        if (!existingData) {
            const initialData = {
                coins: 0,
                lastClaim: '',
                watchCount: 0,
                lastShareDate: '',
                dailyEarned: 0,
                lastActionTime: 0
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
            return initialData;
        }
        return JSON.parse(existingData);
    },
    
    // Get user coin data
    getCoinData() {
        return this.initializeCoinData();
    },
    
    // Add coins via Firebase
    async addCoins(amount, actionType = 'general') {
        if (!window.auth || !window.auth.currentUser) {
            alert('Login first');
            return false;
        }
        
        try {
            // Call Firebase addCoins function
            await window.addCoins(amount);
            return true;
        } catch (error) {
            alert('Error adding coins');
            return false;
        }
    },
    
    // Get current coins from Firebase (updated via onSnapshot)
    getCoins() {
        const coinEl = document.getElementById('coinCount');
        return coinEl ? parseInt(coinEl.textContent) || 0 : 0;
    }
};

// ============================================
// ANTI-GLITCH PROTECTION
// ============================================

const AntiGlitch = {
    disabledButtons: new Set(),
    lastActionTime: 0,
    
    // Disable button with cooldown
    disableButton(button, duration = CONFIG.COOLDOWN_TIME) {
        if (this.disabledButtons.has(button)) return;
        
        button.disabled = true;
        button.classList.add('disabled');
        this.disabledButtons.add(button);
        
        setTimeout(() => {
            button.disabled = false;
            button.classList.remove('disabled');
            this.disabledButtons.delete(button);
        }, duration);
    },
    
    // Check if action is allowed
    canPerformAction() {
        const now = Date.now();
        return (now - this.lastActionTime) >= CONFIG.COOLDOWN_TIME;
    },
    
    // Record action time
    recordAction() {
        this.lastActionTime = Date.now();
    }
};

// ============================================
// NOTIFICATION SYSTEM (Toast Messages)
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

let currentAuthMode = 'login';

function showLoginModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'flex';
    switchAuthTab('login');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

function switchAuthTab(mode) {
    currentAuthMode = mode;
    const title = document.getElementById('authTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const confirmGroup = document.getElementById('confirmPasswordGroup');
    const nameGroup = document.getElementById('nameGroup');
    const footerText = document.getElementById('authFooterText');
    
    if (mode === 'login') {
        title.textContent = 'Login';
        submitBtn.innerHTML = '<span class="btn-icon">🔐</span><span>Login</span>';
        confirmGroup.style.display = 'none';
        nameGroup.style.display = 'none';
        footerText.innerHTML = "Don't have an account? <a href=\"#\" onclick=\"switchAuthTab('signup')\">Sign Up</a>";
    } else {
        title.textContent = 'Sign Up';
        submitBtn.innerHTML = '<span class="btn-icon">📝</span><span>Sign Up</span>';
        confirmGroup.style.display = 'block';
        nameGroup.style.display = 'block';
        footerText.innerHTML = "Already have an account? <a href=\"#\" onclick=\"switchAuthTab('login')\">Login</a>";
    }
}

function handleAuth() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const submitBtn = document.getElementById('authSubmitBtn');
    
    // Validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Password length validation
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    if (currentAuthMode === 'signup') {
        const name = document.getElementById('name').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        
        if (!name) {
            alert('Please enter your name');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Call Firebase signup function (handles loading internally)
        window.signup();
    } else {
        // Call Firebase login function (handles loading internally)
        window.login();
    }
}

function logout() {
    // Call Firebase logout function
    window.logout();
}

function updateUIForLoggedInUser(userData) {
    // Show dashboard, hide hero
    document.getElementById('userDashboard').style.display = 'block';
    document.getElementById('heroSection').style.display = 'none';
    
    // Update header buttons
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'flex';
    document.getElementById('withdrawBtn').style.display = 'flex';
    
    // Update dashboard info - show name instead of email
    const displayName = userData.name || userData.email;
    document.getElementById('userEmailDisplay').textContent = `Welcome ${displayName} 👋`;
    // Referral code will be updated by Firebase onSnapshot
}

function updateUIForLoggedOutUser() {
    // Hide dashboard, show hero
    document.getElementById('userDashboard').style.display = 'none';
    document.getElementById('heroSection').style.display = 'block';
    
    // Update header buttons
    document.getElementById('loginBtn').style.display = 'flex';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('withdrawBtn').style.display = 'none';
}

// ============================================
// EARNING ACTIONS (Protected)
// ============================================

function handleReferAction() {
    if (!SessionManager.isLoggedIn()) {
        showToast('Please login first', 'error');
        showLoginModal();
        return;
    }
    
    // Get referral code from Firebase data
    const referralCodeEl = document.getElementById('userReferralCode');
    const referralCode = referralCodeEl ? referralCodeEl.value : '';
    openRealSharePanel(referralCode);
}

function handleWatchPhotos() {
    if (!window.auth || !window.auth.currentUser) {
        alert("Please login to start earning");
        scrollToLoginSection();
        return;
    }
    
    if (!AntiGlitch.canPerformAction()) {
        alert('Wait 5 seconds');
        return;
    }
    
    const button = event.target.closest('button');
    AntiGlitch.disableButton(button);
    AntiGlitch.recordAction();
    
    // Call Firebase addCoins
    window.addCoins(CONFIG.WATCH_PHOTO_REWARD);
    window.location.href = 'watch.html';
}

function handleWatchAds() {
    if (!window.auth || !window.auth.currentUser) {
        alert("Please login to start earning");
        scrollToLoginSection();
        return;
    }
    
    if (!AntiGlitch.canPerformAction()) {
        alert('Wait 5 seconds');
        return;
    }
    
    const button = event.target.closest('button');
    AntiGlitch.disableButton(button);
    AntiGlitch.recordAction();
    
    // Call Firebase addCoins
    window.addCoins(CONFIG.WATCH_AD_REWARD);
}

function handleShareAction() {
    if (!window.auth || !window.auth.currentUser) {
        alert("Please login to start earning");
        scrollToLoginSection();
        return;
    }
    
    if (!AntiGlitch.canPerformAction()) {
        alert('Wait 5 seconds');
        return;
    }
    
    const button = event.target.closest('button');
    AntiGlitch.disableButton(button);
    AntiGlitch.recordAction();
    
    // Call Firebase addCoins
    window.addCoins(CONFIG.SHARE_REWARD);
    
    // Open share options
    const referralCodeEl = document.getElementById('userReferralCode');
    const referralCode = referralCodeEl ? referralCodeEl.value : '';
    openRealSharePanel(referralCode);
}

// ============================================
// REFERRAL SYSTEM
// ============================================

function copyUserReferralCode() {
    const code = document.getElementById('userReferralCode').value;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Referral code copied!', 'success');
    });
}

function shareReferralOnWhatsApp() {
    const referralCodeEl = document.getElementById('userReferralCode');
    const referralCode = referralCodeEl ? referralCodeEl.value : '';
    const message = `Join me on Zapcart and start earning money! Use my referral code: ${referralCode}\n\n🪙 Zapcart - India's Most Trusted Refer & Earn Platform\n💰 Earn money by referring friends\n⚡ Instant withdrawals\n🔒 100% secure\n\nJoin now: ${CONFIG.BASE_URL}/?ref=${referralCode}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showToast('Opening WhatsApp...', 'info');
}

function copyReferralCode() {
    const code = document.getElementById('referralCode').value;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Referral code copied!', 'success');
    });
}

function shareOnWhatsApp() {
    const code = document.getElementById('referralCode').value;
    const message = `Join me on Zapcart and start earning money! Use my referral code: ${code}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function shareOnTelegram() {
    const code = document.getElementById('referralCode').value;
    const message = `Join me on Zapcart and start earning money! Use my referral code: ${code}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(CONFIG.BASE_URL)}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function shareOnFacebook() {
    const code = document.getElementById('referralCode').value;
    const url = `${CONFIG.BASE_URL}?ref=${code}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

// ============================================
// SHARE PANEL
// ============================================

function openRealSharePanel(referralCode) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="modal-backdrop" onclick="closeShareModal()"></div>
        <div class="share-modal-content">
            <div class="share-header">
                <h3>Share & Earn</h3>
                <button class="modal-close" onclick="closeShareModal()">&times;</button>
            </div>
            
            <div class="referral-code-section">
                <h4>Your Referral Code</h4>
                <div class="referral-box">
                    <input type="text" id="shareReferralCode" value="${referralCode}" readonly>
                    <button class="copy-btn" onclick="copyShareReferralCode()">
                        <span class="btn-icon">📋</span>
                        <span>Copy</span>
                    </button>
                </div>
            </div>
            
            <div class="share-options">
                <h4>Share via</h4>
                <div class="share-buttons-grid">
                    <button class="share-btn whatsapp" onclick="shareOnWhatsAppReal()">
                        <span class="share-icon">📱</span>
                        <span>WhatsApp</span>
                    </button>
                    <button class="share-btn telegram" onclick="shareOnTelegramReal()">
                        <span class="share-icon">✈️</span>
                        <span>Telegram</span>
                    </button>
                    <button class="share-btn native" onclick="shareWithWebShareAPI()">
                        <span class="share-icon">📤</span>
                        <span>Share</span>
                    </button>
                </div>
            </div>
            
            <div class="share-info">
                <p>🎉 Earn coins when friends join using your code!</p>
            </div>
        </div>
    `;

    document.body.appendChild(shareModal);
}

function closeShareModal() {
    const shareModal = document.querySelector('.share-modal');
    if (shareModal) shareModal.remove();
}

function copyShareReferralCode() {
    const code = document.getElementById('shareReferralCode').value;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Referral code copied!', 'success');
    });
}

function shareOnWhatsAppReal() {
    const code = document.getElementById('shareReferralCode').value;
    const message = `Join me on Zapcart and start earning money! Use my referral code: ${code}\n\n🪙 Zapcart - India's Most Trusted Refer & Earn Platform\n💰 Earn money by referring friends\n⚡ Instant withdrawals\n🔒 100% secure\n\nJoin now: ${CONFIG.BASE_URL}/?ref=${code}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    closeShareModal();
}

function shareOnTelegramReal() {
    const code = document.getElementById('shareReferralCode').value;
    const message = `Join me on Zapcart and start earning money! Use my referral code: ${code}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(CONFIG.BASE_URL + '?ref=' + code)}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    closeShareModal();
}

async function shareWithWebShareAPI() {
    const code = document.getElementById('shareReferralCode').value;
    const shareData = {
        title: 'Join Zapcart - Earn Money Online',
        text: `Join me on Zapcart and start earning money! Use my referral code: ${code}`,
        url: `${CONFIG.BASE_URL}/?ref=${code}`
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showToast('Shared successfully!', 'success');
        } else {
            const shareUrl = `${CONFIG.BASE_URL}/?ref=${code}`;
            await navigator.clipboard.writeText(shareUrl);
            showToast('Link copied to clipboard!', 'success');
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
    closeShareModal();
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function scrollToEarningMethods() {
    const element = document.getElementById('earning-methods');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToLoginSection() {
    showLoginModal();
}

async function startWatchingPhotos() {
    if (!SessionManager.isLoggedIn()) {
        showToast('Please login first', 'error');
        showLoginModal();
        return;
    }
    
    const placeholder = document.querySelector('.watch-placeholder');
    const loading = document.getElementById('loadingAnimation');
    const container = document.getElementById('mediaContainer');
    
    if (placeholder && loading && container) {
        placeholder.style.display = 'none';
        loading.style.display = 'block';
        
        setTimeout(async () => {
            try {
                if (window.mediaSystem) {
                    await window.mediaSystem.loadMediaItems();
                    window.mediaSystem.displayCurrentMedia();
                    mediaLoaded = true;
                }
                loading.style.display = 'none';
                showToast('Photos loaded!', 'success');
            } catch (error) {
                console.error('Error loading media:', error);
                loading.style.display = 'none';
                showToast('Error loading photos', 'error');
                placeholder.style.display = 'block';
            }
        }, 2000);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    animateValue(element, start, end, duration) {
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
    },
    
    formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Show hero section by default (earning methods visible)
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('userDashboard').style.display = 'none';
    
    // Firebase auth state listener will handle UI updates
    // The onAuthStateChanged in the Firebase script will update the UI automatically
});
