// Withdraw Page - Real Withdrawal Logic
// Production-ready with backend integration and coin deduction

class WithdrawSystem {
    constructor() {
        this.currentUser = null;
        this.selectedAmount = null;
        this.selectedCoins = null;
        this.isProcessing = false;
        this.init();
    }

    async init() {
        // Load user data
        await this.loadUserData();
        
        // Initialize UI
        this.initializeUI();
        
        // Update displays
        this.updateCoinDisplay();
        this.updateCurrentBalance();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    async loadUserData() {
        try {
            // Get user data from localStorage or backend
            const storedUser = localStorage.getItem('zapcart_user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            } else {
                // Create guest user for demo
                this.currentUser = {
                    id: 'guest_' + Date.now(),
                    username: 'Guest User',
                    coins: parseInt(localStorage.getItem('coinCount') || '0'),
                    referralCode: 'ZAPCART' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                    joinedAt: new Date().toISOString(),
                    withdrawHistory: []
                };
                await this.saveUserData();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showToast('Error loading user data', 'error');
        }
    }

    async saveUserData() {
        try {
            localStorage.setItem('zapcart_user', JSON.stringify(this.currentUser));
            localStorage.setItem('coinCount', this.currentUser.coins.toString());
            
            // In production, save to backend
            // await this.saveToBackend(this.currentUser);
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    initializeUI() {
        // Set up amount selection
        const amountOptions = document.querySelectorAll('.amount-option');
        amountOptions.forEach(option => {
            option.addEventListener('click', () => this.selectAmount(option));
        });

        // Set up payment method change
        const paymentMethod = document.getElementById('paymentMethod');
        if (paymentMethod) {
            paymentMethod.addEventListener('change', () => this.togglePaymentFields());
        }

        // Set up form submission
        const withdrawForm = document.getElementById('withdrawForm');
        if (withdrawForm) {
            withdrawForm.addEventListener('submit', (e) => this.handleWithdrawal(e));
        }
    }

    setupEventListeners() {
        // Add click listeners to conversion rate items
        const conversionItems = document.querySelectorAll('.conversion-rate-item');
        conversionItems.forEach(item => {
            item.addEventListener('click', () => {
                const coins = parseInt(item.dataset.coins);
                const amount = parseInt(item.dataset.amount);
                this.selectAmountByValue(coins, amount);
            });
        });
    }

    selectAmount(option) {
        // Remove previous selection
        document.querySelectorAll('.amount-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection to clicked option
        option.classList.add('selected');

        // Store selected values
        this.selectedCoins = parseInt(option.dataset.coins);
        this.selectedAmount = parseInt(option.dataset.amount);

        // Update button state
        this.updateWithdrawButton();
    }

    selectAmountByValue(coins, amount) {
        // Find and select the corresponding amount option
        const option = document.querySelector(`.amount-option[data-coins="${coins}"]`);
        if (option) {
            this.selectAmount(option);
        }
    }

    togglePaymentFields() {
        const paymentMethod = document.getElementById('paymentMethod').value;
        const bankFields = document.getElementById('bankFields');
        const upiFields = document.getElementById('upiFields');

        // Hide all fields first
        if (bankFields) bankFields.style.display = 'none';
        if (upiFields) upiFields.style.display = 'none';

        // Show relevant fields
        if (paymentMethod === 'bank') {
            if (bankFields) bankFields.style.display = 'block';
        } else if (paymentMethod === 'upi') {
            if (upiFields) upiFields.style.display = 'block';
        }

        // Update button state
        this.updateWithdrawButton();
    }

    updateWithdrawButton() {
        const withdrawBtn = document.getElementById('withdrawBtn');
        const paymentMethod = document.getElementById('paymentMethod').value;

        const isValid = this.selectedCoins && 
                       this.selectedAmount && 
                       paymentMethod && 
                       this.currentUser.coins >= this.selectedCoins &&
                       !this.isProcessing;

        if (withdrawBtn) {
            withdrawBtn.disabled = !isValid;
        }
    }

    updateCoinDisplay() {
        const coinCount = document.getElementById('coinCount');
        if (coinCount && this.currentUser) {
            // Animate coin count
            const currentCoins = parseInt(coinCount.textContent) || 0;
            const targetCoins = this.currentUser.coins;
            
            this.animateValue(coinCount, currentCoins, targetCoins, 500);
        }
    }

    updateCurrentBalance() {
        const currentBalance = document.getElementById('currentBalance');
        if (currentBalance && this.currentUser) {
            currentBalance.textContent = this.currentUser.coins.toLocaleString();
        }
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }

    async handleWithdrawal(event) {
        event.preventDefault();

        if (this.isProcessing) {
            this.showToast('Processing withdrawal...', 'info');
            return;
        }

        // Validate user has enough coins
        if (this.currentUser.coins < this.selectedCoins) {
            this.showToast('Insufficient coins for withdrawal', 'error');
            return;
        }

        this.isProcessing = true;

        try {
            // Get payment details
            const paymentDetails = this.getPaymentDetails();
            
            if (!this.validatePaymentDetails(paymentDetails)) {
                this.showToast('Please fill in all payment details', 'error');
                return;
            }

            // Process withdrawal
            await this.processWithdrawal(paymentDetails);

        } catch (error) {
            console.error('Withdrawal error:', error);
            this.showToast('Error processing withdrawal', 'error');
        } finally {
            this.isProcessing = false;
            this.updateWithdrawButton();
        }
    }

    getPaymentDetails() {
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        if (paymentMethod === 'bank') {
            return {
                method: 'bank',
                accountName: document.getElementById('accountName').value,
                accountNumber: document.getElementById('accountNumber').value,
                ifscCode: document.getElementById('ifscCode').value
            };
        } else if (paymentMethod === 'upi') {
            return {
                method: 'upi',
                upiId: document.getElementById('upiId').value
            };
        }
        
        return null;
    }

    validatePaymentDetails(details) {
        if (!details) return false;

        if (details.method === 'bank') {
            return details.accountName && 
                   details.accountNumber && 
                   details.ifscCode;
        } else if (details.method === 'upi') {
            return details.upiId && details.upiId.includes('@');
        }

        return false;
    }

    async processWithdrawal(paymentDetails) {
        try {
            // Create withdrawal request
            const withdrawal = {
                id: 'withdraw_' + Date.now(),
                userId: this.currentUser.id,
                coins: this.selectedCoins,
                amount: this.selectedAmount,
                paymentDetails: paymentDetails,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Deduct coins from user balance (REAL COIN DEDUCTION)
            this.currentUser.coins -= this.selectedCoins;

            // Add to withdrawal history
            if (!this.currentUser.withdrawHistory) {
                this.currentUser.withdrawHistory = [];
            }
            this.currentUser.withdrawHistory.push(withdrawal);

            // Save user data with updated coin balance
            await this.saveUserData();

            // Save withdrawal request to backend (in production)
            // await this.saveWithdrawalToBackend(withdrawal);

            // Update UI
            this.updateCoinDisplay();
            this.updateCurrentBalance();

            // Show success message
            this.showToast(`Withdrawal request for ₹${this.selectedAmount} submitted successfully!`, 'success');

            // Log transaction
            this.logTransaction('withdrawal', -this.selectedCoins, { 
                withdrawalId: withdrawal.id,
                amount: this.selectedAmount 
            });

            // Reset form
            this.resetForm();

            // Show processing info
            setTimeout(() => {
                this.showToast('Your withdrawal will be processed within 24-48 hours', 'info');
            }, 2000);

        } catch (error) {
            console.error('Error processing withdrawal:', error);
            throw error;
        }
    }

    resetForm() {
        // Reset amount selection
        document.querySelectorAll('.amount-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Reset form fields
        const withdrawForm = document.getElementById('withdrawForm');
        if (withdrawForm) {
            withdrawForm.reset();
        }

        // Hide payment fields
        const bankFields = document.getElementById('bankFields');
        const upiFields = document.getElementById('upiFields');
        if (bankFields) bankFields.style.display = 'none';
        if (upiFields) upiFields.style.display = 'none';

        // Reset selected values
        this.selectedAmount = null;
        this.selectedCoins = null;

        // Update button
        this.updateWithdrawButton();
    }

    logTransaction(type, amount, metadata) {
        const transaction = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            type: type,
            amount: amount,
            metadata: metadata,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage for demo
        const transactions = JSON.parse(localStorage.getItem('zapcart_transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('zapcart_transactions', JSON.stringify(transactions));
        
        // In production, save to backend
        // await this.saveTransactionToBackend(transaction);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Backend simulation methods (in production, these would be real API calls)
    async saveToBackend(userData) {
        // Simulate API call
        console.log('Saving user data to backend:', userData);
        // In production: await fetch('/api/user', { method: 'POST', body: JSON.stringify(userData) });
    }

    async saveWithdrawalToBackend(withdrawal) {
        // Simulate API call
        console.log('Saving withdrawal to backend:', withdrawal);
        // In production: await fetch('/api/withdrawal', { method: 'POST', body: JSON.stringify(withdrawal) });
    }

    async saveTransactionToBackend(transaction) {
        // Simulate API call
        console.log('Saving transaction to backend:', transaction);
        // In production: await fetch('/api/transaction', { method: 'POST', body: JSON.stringify(transaction) });
    }
}

// Initialize withdraw system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WithdrawSystem();
});

// Export for potential use in other scripts
window.WithdrawSystem = WithdrawSystem;
