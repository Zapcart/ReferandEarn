// ============================================
// UI MODULE - User Interface Utilities
// Handles modals, toasts, and DOM manipulation
// ============================================

const UI = {
    // Show authentication modal
    showAuthModal: (mode = 'login') => {
        const modal = document.getElementById('authModal');
        modal.classList.add('active');
        UI.switchAuthTab(mode);
    },

    // Hide authentication modal
    hideAuthModal: () => {
        const modal = document.getElementById('authModal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('authForm').reset();
    },

    // Switch between login and signup tabs
    switchAuthTab: (mode) => {
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.mode === mode) {
                tab.classList.add('active');
            }
        });

        const nameGroup = document.getElementById('nameGroup');
        const referralGroup = document.getElementById('referralGroup');
        const confirmGroup = document.getElementById('confirmGroup');
        const authTitle = document.getElementById('authTitle');
        const authSubmit = document.getElementById('authSubmit');

        if (mode === 'signup') {
            nameGroup.style.display = 'flex';
            referralGroup.style.display = 'flex';
            confirmGroup.style.display = 'flex';
            authTitle.textContent = 'Sign Up';
            authSubmit.textContent = 'Create Account';
        } else {
            nameGroup.style.display = 'none';
            referralGroup.style.display = 'none';
            confirmGroup.style.display = 'none';
            authTitle.textContent = 'Login';
            authSubmit.textContent = 'Login';
        }
    },

    // Show toast notification
    showToast: (message, type = 'info') => {
        const container = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Show loading overlay
    showLoading: () => {
        document.getElementById('loadingOverlay').style.display = 'flex';
    },

    // Hide loading overlay
    hideLoading: () => {
        document.getElementById('loadingOverlay').style.display = 'none';
    },

    // Update header based on auth state
    updateHeader: (user, userData) => {
        const headerNav = document.getElementById('headerNav');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (user && userData) {
            // Show profile dropdown, hide nav buttons
            headerNav.style.display = 'none';
            profileDropdown.style.display = 'block';
            
            // Update profile dropdown content
            const profilePic = Profile.getProfilePicUrl();
            document.getElementById('headerProfilePic').src = profilePic;
            document.getElementById('headerProfileName').textContent = userData.name || 'User';
            document.getElementById('dropdownProfilePic').src = profilePic;
            document.getElementById('dropdownUserName').textContent = userData.name || 'User';
            document.getElementById('dropdownUsername').textContent = '@' + (userData.username || 'user');
        } else {
            // Show nav buttons, hide profile dropdown
            headerNav.style.display = 'flex';
            profileDropdown.style.display = 'none';
            
            headerNav.innerHTML = `
                <button class="btn btn-primary" onclick="UI.showAuthModal('login')">Login</button>
                <button class="btn btn-secondary" onclick="UI.showAuthModal('signup')">Sign Up</button>
            `;
        }
    },

    // Toggle profile dropdown
    toggleProfileDropdown: () => {
        const dropdownMenu = document.getElementById('dropdownMenu');
        dropdownMenu.classList.toggle('active');
    },

    // Close profile dropdown when clicking outside
    closeProfileDropdown: (event) => {
        const profileDropdown = document.getElementById('profileDropdown');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (!profileDropdown.contains(event.target)) {
            dropdownMenu.classList.remove('active');
        }
    },

    // Show profile modal
    showProfileModal: () => {
        const modal = document.getElementById('profileModal');
        modal.classList.add('active');
        
        // Populate form with current user data
        const userData = Auth.getUserData();
        if (userData) {
            document.getElementById('profileName').value = userData.name || '';
            document.getElementById('profileUsername').value = '@' + (userData.username || 'user');
            document.getElementById('profileBio').value = userData.bio || '';
            document.getElementById('profileEmail').value = userData.email || '';
            document.getElementById('profileReferralCode').value = userData.referralCode || '';
            document.getElementById('bioCharCount').textContent = (userData.bio || '').length;
            
            // Set profile picture
            const profilePic = Profile.getProfilePicUrl();
            document.getElementById('profilePicPreview').src = profilePic;
        }
        
        // Close dropdown
        document.getElementById('dropdownMenu').classList.remove('active');
    },

    // Hide profile modal
    hideProfileModal: () => {
        const modal = document.getElementById('profileModal');
        modal.classList.remove('active');
    },

    // Show dashboard
    showDashboard: () => {
        UI.showDashboard();
        document.getElementById('dropdownMenu').classList.remove('active');
    },

    // Update dashboard with user data
    updateDashboard: (userData) => {
        if (!userData) return;

        // Update welcome text
        document.getElementById('welcomeText').textContent = `Welcome ${userData.name}! 👋`;
        
        // Update coin balance
        document.getElementById('dashboardCoins').textContent = userData.coins || 0;
        
        // Update rupee value (1000 coins = ₹10)
        const rupeeValue = ((userData.coins || 0) / 100).toFixed(2);
        document.getElementById('rupeeValue').textContent = rupeeValue;
        
        // Update header coins
        const headerCoins = document.getElementById('headerCoins');
        if (headerCoins) {
            headerCoins.textContent = userData.coins || 0;
        }
        
        // Update referral code
        document.getElementById('referralCode').value = userData.referralCode || '';
        
        // Update daily bonus button text
        const today = new Date().toDateString();
        const lastBonus = userData.lastDailyBonus || 0;
        const dailyBonusText = document.getElementById('dailyBonusText');
        
        if (lastBonus === today) {
            dailyBonusText.textContent = 'Claimed';
        } else {
            dailyBonusText.textContent = 'Claim';
        }
    },

    // Copy referral code to clipboard
    copyReferralCode: () => {
        const code = document.getElementById('referralCode').value;
        navigator.clipboard.writeText(code).then(() => {
            UI.showToast('Referral code copied!', 'success');
        }).catch(() => {
            UI.showToast('Failed to copy code', 'error');
        });
    },

    // Add activity item to list
    addActivity: (icon, title, amount, time) => {
        const activityList = document.getElementById('activityList');
        const emptyState = activityList.querySelector('.activity-empty');
        
        if (emptyState) {
            emptyState.remove();
        }
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-icon">${icon}</span>
            <div class="activity-info">
                <div class="activity-title">${title}</div>
                <div class="activity-time">${time}</div>
            </div>
            <span class="activity-amount">+${amount}</span>
        `;
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Keep only last 10 activities
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    },

    // Switch between landing page and dashboard
    showDashboard: () => {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    },

    showLanding: () => {
        document.getElementById('landingPage').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
};

// Make UI available globally
window.UI = UI;
