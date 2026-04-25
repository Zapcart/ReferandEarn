// ============================================
// EARNING MODULE - Earning System
// Handles refer, daily bonus, watch ads, cooldowns, and withdrawals
// ============================================

const Earning = {
    // Cooldown tracking
    lastActionTime: 0,
    COOLDOWN_TIME: 3000, // 3 seconds between actions

    // Initialize earning system
    init: () => {
        // Earning system is ready
    },

    // Check if action can be performed (cooldown check)
    canPerformAction: () => {
        const now = Date.now();
        if (now - Earning.lastActionTime < Earning.COOLDOWN_TIME) {
            const remaining = Math.ceil((Earning.COOLDOWN_TIME - (now - Earning.lastActionTime)) / 1000);
            UI.showToast(`Please wait ${remaining} seconds`, 'error');
            return false;
        }
        return true;
    },

    // Record action time
    recordAction: () => {
        Earning.lastActionTime = Date.now();
    },

    // Add coins to user account
    addCoins: async (amount, actionType = 'general') => {
        // FIX: Use Auth.isLoggedIn() as single source of truth
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            UI.showAuthModal('login');
            return false;
        }

        if (!Earning.canPerformAction()) {
            return false;
        }

        try {
            const { doc, updateDoc, increment } = window.firebaseDb;
            const currentUser = Auth.getCurrentUser();
            await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), {
                coins: increment(amount)
            });

            Earning.recordAction();
            
            // Add activity
            const icons = {
                'refer': '👥',
                'daily': '🎁',
                'ad': '📺',
                'general': '🪙'
            };
            
            const titles = {
                'refer': 'Referral Bonus',
                'daily': 'Daily Bonus',
                'ad': 'Ad Watched',
                'general': 'Coins Earned'
            };
            
            UI.addActivity(
                icons[actionType] || icons.general,
                titles[actionType] || titles.general,
                amount,
                'Just now'
            );

            UI.showToast(`+${amount} coins earned!`, 'success');
            return true;
        } catch (error) {
            console.error('Error adding coins:', error);
            UI.showToast('Error adding coins', 'error');
            return false;
        }
    },

    // Handle refer & earn
    handleRefer: () => {
        // FIX: Use Auth.isLoggedIn() as single source of truth
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            UI.showAuthModal('login');
            return;
        }

        const referralCode = document.getElementById('referralCode').value;
        const shareText = `Join QuickEarn and earn real money! Use my referral code: ${referralCode}\n\n⚡ QuickEarn - India's Most Trusted Earning Platform\n💰 Earn money by referring friends\n🎁 Daily bonuses\n📺 Watch ads to earn\n⚡ Instant UPI withdrawals\n\nJoin now: ${window.location.href}?ref=${referralCode}`;

        if (navigator.share) {
            navigator.share({
                title: 'QuickEarn - Earn Money Online',
                text: shareText,
                url: `${window.location.href}?ref=${referralCode}`
            }).then(() => {
                UI.showToast('Shared successfully!', 'success');
            }).catch(() => {
                // User cancelled or share failed
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                UI.showToast('Referral link copied!', 'success');
            }).catch(() => {
                UI.showToast('Failed to copy link', 'error');
            });
        }
    },

    // Share referral (separate function for button)
    shareReferral: () => {
        Earning.handleRefer();
    },

    // Handle daily bonus
    handleDailyBonus: async () => {
        // FIX: Use Auth.isLoggedIn() as single source of truth
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            UI.showAuthModal('login');
            return;
        }

        const userData = Auth.getUserData();
        if (!userData) {
            UI.showToast('Loading user data...', 'info');
            return;
        }

        const today = new Date().toDateString();
        const lastBonus = userData.lastDailyBonus || 0;

        if (lastBonus === today) {
            UI.showToast('Daily bonus already claimed today!', 'error');
            return;
        }

        UI.showLoading();

        try {
            const { doc, updateDoc } = window.firebaseDb;
            const currentUser = Auth.getCurrentUser();
            
            // Add coins
            await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), {
                coins: increment(5),
                lastDailyBonus: today
            });

            UI.hideLoading();
            UI.showToast('Daily bonus claimed! +5 coins', 'success');
            
            // Update button text
            const dailyBonusText = document.getElementById('dailyBonusText');
            if (dailyBonusText) {
                dailyBonusText.textContent = 'Claimed';
            }
        } catch (error) {
            console.error('Error claiming daily bonus:', error);
            UI.hideLoading();
            UI.showToast('Error claiming bonus', 'error');
        }
    },

    // Handle watch ad
    handleWatchAd: async () => {
        // FIX: Use Auth.isLoggedIn() as single source of truth
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            UI.showAuthModal('login');
            return;
        }

        // Simulate ad watching (in production, integrate with actual ad network)
        UI.showLoading();
        
        setTimeout(async () => {
            UI.hideLoading();
            
            const success = await Earning.addCoins(2, 'ad');
            
            if (success) {
                UI.showToast('Ad watched! +2 coins', 'success');
            }
        }, 2000); // Simulate 2-second ad
    },

    // Handle withdrawal
    handleWithdrawal: async (event) => {
        event.preventDefault();

        // FIX: Use Auth.isLoggedIn() as single source of truth
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            UI.showAuthModal('login');
            return;
        }

        const userData = Auth.getUserData();
        if (!userData) {
            UI.showToast('Loading user data...', 'info');
            return;
        }

        const upiId = document.getElementById('upiId').value.trim();
        const amount = parseInt(document.getElementById('withdrawAmount').value);

        // Validation
        const MIN_WITHDRAWAL = 50;
        
        if (!upiId) {
            UI.showToast('Please enter UPI ID', 'error');
            return;
        }

        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
        if (!upiRegex.test(upiId)) {
            UI.showToast('Please enter a valid UPI ID', 'error');
            return;
        }

        if (!amount || amount < MIN_WITHDRAWAL) {
            UI.showToast(`Minimum withdrawal is ${MIN_WITHDRAWAL} coins`, 'error');
            return;
        }

        if (amount > (userData.coins || 0)) {
            UI.showToast('Insufficient coins', 'error');
            return;
        }

        UI.showLoading();

        try {
            const { doc, updateDoc, increment, collection, addDoc } = window.firebaseDb;
            const currentUser = Auth.getCurrentUser();
            
            // Deduct coins
            await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), {
                coins: increment(-amount)
            });

            // Create withdrawal request
            await addDoc(collection(window.firebaseDb, 'withdrawals'), {
                uid: currentUser.uid,
                email: currentUser.email,
                name: userData.name,
                upiId,
                coins: amount,
                rupees: (amount / 100).toFixed(2),
                status: 'pending',
                createdAt: Date.now()
            });

            UI.hideLoading();
            UI.showToast('Withdrawal request submitted!', 'success');
            
            // Reset form
            document.getElementById('withdrawal-form').reset();
            
            // Add activity
            UI.addActivity(
                '💸',
                'Withdrawal Request',
                `-${amount}`,
                'Just now'
            );
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            UI.hideLoading();
            UI.showToast('Error processing withdrawal', 'error');
        }
    },

    // Get earning statistics
    getEarningStats: async () => {
        if (!Auth.currentUser) {
            return null;
        }

        try {
            const { doc, getDoc, collection, query, where, getDocs } = window.firebaseDb;
            
            // Get user data
            const userRef = doc(window.firebaseDb, 'users', Auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                return null;
            }
            
            const userData = userSnap.data();
            
            // Get withdrawal history
            const withdrawalsQuery = query(
                collection(window.firebaseDb, 'withdrawals'),
                where('uid', '==', Auth.currentUser.uid)
            );
            const withdrawalsSnap = await getDocs(withdrawalsQuery);
            
            const totalWithdrawn = withdrawalsSnap.docs.reduce((sum, doc) => {
                return sum + (doc.data().coins || 0);
            }, 0);
            
            return {
                totalCoins: userData.coins || 0,
                totalWithdrawn,
                pendingWithdrawals: withdrawalsSnap.docs.filter(doc => doc.data().status === 'pending').length,
                referralCode: userData.referralCode,
                referredBy: userData.referredBy
            };
        } catch (error) {
            console.error('Error getting earning stats:', error);
            return null;
        }
    }
};

// Make Earning available globally
window.Earning = Earning;

// Initialize earning module
Earning.init();
