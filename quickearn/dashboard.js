// ============================================
// DASHBOARD MODULE - Dashboard Management
// Handles user data display, coin balance, and dashboard updates
// ============================================

const Dashboard = {
    // Initialize dashboard
    init: () => {
        // Dashboard is updated via UI.updateDashboard()
        // This module provides additional dashboard-specific functionality
    },

    // Get formatted coin balance
    getFormattedBalance: (coins) => {
        return coins.toLocaleString();
    },

    // Convert coins to rupees (1000 coins = ₹10)
    coinsToRupees: (coins) => {
        return (coins / 100).toFixed(2);
    },

    // Get user statistics
    getUserStats: async (uid) => {
        try {
            const { doc, getDoc, collection, query, where, getDocs } = window.firebaseDb;
            
            // Get user document
            const userRef = doc(window.firebaseDb, 'users', uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                return null;
            }
            
            const userData = userSnap.data();
            
            // Get withdrawal history
            const withdrawalsQuery = query(
                collection(window.firebaseDb, 'withdrawals'),
                where('uid', '==', uid)
            );
            const withdrawalsSnap = await getDocs(withdrawalsQuery);
            
            const totalWithdrawn = withdrawalsSnap.docs.reduce((sum, doc) => {
                return sum + (doc.data().coins || 0);
            }, 0);
            
            return {
                totalCoins: userData.coins || 0,
                totalWithdrawn,
                referralCount: 0, // Would need separate tracking
                memberSince: new Date(userData.createdAt).toLocaleDateString()
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    },

    // Update coin display across all elements
    updateCoinDisplay: (coins) => {
        // Update dashboard coins
        const dashboardCoins = document.getElementById('dashboardCoins');
        if (dashboardCoins) {
            dashboardCoins.textContent = Dashboard.getFormattedBalance(coins);
        }
        
        // Update rupee value
        const rupeeValue = document.getElementById('rupeeValue');
        if (rupeeValue) {
            rupeeValue.textContent = Dashboard.coinsToRupees(coins);
        }
        
        // Update header coins
        const headerCoins = document.getElementById('headerCoins');
        if (headerCoins) {
            headerCoins.textContent = Dashboard.getFormattedBalance(coins);
        }
    },

    // Check if user can withdraw
    canWithdraw: (coins, amount) => {
        const MIN_WITHDRAWAL = 50;
        return coins >= amount && amount >= MIN_WITHDRAWAL;
    },

    // Get withdrawal limits
    getWithdrawalLimits: () => {
        return {
            min: 50,
            max: 10000
        };
    }
};

// Make Dashboard available globally
window.Dashboard = Dashboard;
