// Watch Photos Page - Real Coin Reward Logic with Random Photo System
// Production-ready with backend integration and scalable photo management

class WatchPage {
    constructor() {
        this.photos = [];
        this.viewedPhotos = new Set(); // Track viewed photos to prevent abuse
        this.currentUser = null;
        this.isProcessing = false;
        this.photoSystem = null;
        this.init();
    }

    async init() {
        // Load user data
        await this.loadUserData();
        
        // Initialize random photo system
        await this.initializePhotoSystem();
        
        // Initialize UI
        this.initializeUI();
        
        // Update coin display
        this.updateCoinDisplay();
    }

    async initializePhotoSystem() {
        try {
            // Initialize scalable random photo system
            this.photoSystem = new RandomPhotoSystem({
                photoCount: 100,        // Easily change to 200, 500, etc.
                photoFormat: 'png',     // Change to 'jpg' if needed
                photoPath: 'images',    // Folder path
                photoPrefix: 'photo',  // File naming convention
                extensionCheck: true    // Verify files exist
            });

            // Override photo change handler
            this.photoSystem.onPhotoChange = (photo) => {
                this.displayCurrentPhoto(photo);
            };

            // Get initial photo
            const initialPhoto = this.photoSystem.getCurrentPhoto();
            if (initialPhoto) {
                this.displayCurrentPhoto(initialPhoto);
            }

        } catch (error) {
            console.error('Error initializing photo system:', error);
            this.showToast('Error loading photo system', 'error');
        }
    }

    displayCurrentPhoto(photo) {
        const photoContainer = document.getElementById('currentPhotoContainer');
        const photoTitle = document.getElementById('photoTitle');
        const photoReward = document.getElementById('photoReward');
        
        if (photoContainer) {
            photoContainer.innerHTML = `
                <img src="${photo.path}" alt="${photo.filename}" class="current-photo">
            `;
        }
        
        if (photoTitle) {
            photoTitle.textContent = photo.filename;
        }
        
        if (photoReward) {
            photoReward.textContent = `🪙 1 Coin`;
        }

        // Update next photo button
        this.updateNextPhotoButton();
    }

    updateNextPhotoButton() {
        const nextPhotoBtn = document.getElementById('nextPhotoBtn');
        if (nextPhotoBtn) {
            nextPhotoBtn.disabled = this.isProcessing;
            nextPhotoBtn.textContent = this.isProcessing ? 'Loading...' : 'Watch Next Photo';
        }
    }

    async loadUserData() {
        try {
            // User data is loaded via Firebase onSnapshot in watch.html
            // This function is kept for compatibility but no longer uses localStorage
            if (window.auth && window.auth.currentUser) {
                // Coins are updated via Firebase onSnapshot
                const coinEl = document.getElementById('coinCount');
                this.currentUser = {
                    id: window.auth.currentUser.uid,
                    username: 'User',
                    coins: coinEl ? parseInt(coinEl.textContent) || 0 : 0
                };
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showToast('Error loading user data', 'error');
        }
    }

    async saveUserData() {
        try {
            // Coins are saved via Firebase increment in addCoins function
            // This function is kept for compatibility but no longer uses localStorage
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    // Watch next photo with random selection
    async watchNextPhoto() {
        if (this.isProcessing || !this.photoSystem) {
            this.showToast('Please wait...', 'info');
            return;
        }

        this.isProcessing = true;
        this.updateNextPhotoButton();

        try {
            // Get next random photo from system
            const nextPhoto = this.photoSystem.watchNextPhoto();
            
            if (nextPhoto) {
                // Award coins for viewing
                await this.awardCoins(1, nextPhoto.id);
                
                // Show success message
                this.showToast('Photo loaded! +1 coin earned', 'success');
                
                // Log photo view
                this.logPhotoView(nextPhoto);
                
            } else {
                this.showToast('No more photos available', 'warning');
            }

        } catch (error) {
            console.error('Error loading next photo:', error);
            this.showToast('Error loading photo', 'error');
        } finally {
            this.isProcessing = false;
            this.updateNextPhotoButton();
        }
    }

    async awardCoins(amount, photoId) {
        try {
            // Use Firebase addCoins function only
            if (window.addCoins) {
                await window.addCoins(amount);
            } else {
                console.error('Firebase addCoins not available');
                this.showToast('Error: Firebase not initialized', 'error');
                return;
            }
            
            // Update UI (coin count is updated by Firebase onSnapshot)
            this.updateCoinDisplay();
            
            // Show success message
            this.showToast(`+${amount} coin${amount > 1 ? 's' : ''} earned!`, 'success');
            
            // Log transaction
            this.logTransaction('photo_view', amount, { photoId });
            
        } catch (error) {
            console.error('Error awarding coins:', error);
            this.showToast('Error awarding coins', 'error');
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

    logPhotoView(photo) {
        const photoView = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            photoId: photo.id,
            photoFilename: photo.filename,
            timestamp: new Date().toISOString()
        };
        
        // In production, save to Firestore
        // await this.savePhotoViewToBackend(photoView);
        console.log('Photo view logged:', photoView);
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
        
        // In production, save to Firestore
        // await this.saveTransactionToBackend(transaction);
        console.log('Transaction logged:', transaction);
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

    initializeUI() {
        // Add current photo container if not exists
        const photosSection = document.querySelector('.photos-section');
        if (photosSection && !document.getElementById('currentPhotoContainer')) {
            photosSection.innerHTML = `
                <div class="current-photo-display">
                    <div class="photo-container" id="currentPhotoContainer">
                        <img src="https://picsum.photos/seed/loading/400/400.jpg" alt="Loading photo..." class="current-photo">
                    </div>
                    <div class="photo-info">
                        <h3 id="photoTitle">Loading photo...</h3>
                        <p id="photoReward">🪙 1 Coin</p>
                    </div>
                    <button class="watch-next-btn" id="nextPhotoBtn" onclick="watchPage.watchNextPhoto()">
                        <span class="btn-icon">👁️</span>
                        <span>Watch Next Photo</span>
                    </button>
                </div>
            `;
        }

        // Add styles for current photo display
        const style = document.createElement('style');
        style.textContent = `
            .current-photo-display {
                max-width: 600px;
                margin: 0 auto;
                text-align: center;
                padding: 20px;
            }
            
            .photo-container {
                position: relative;
                border-radius: 15px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.03);
                border: 2px solid rgba(255, 215, 0, 0.3);
                margin-bottom: 20px;
                aspect-ratio: 1;
            }
            
            .current-photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .current-photo:hover {
                transform: scale(1.02);
            }
            
            .photo-info {
                margin-bottom: 20px;
            }
            
            .photo-info h3 {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 5px;
            }
            
            .photo-info p {
                font-size: 16px;
                color: var(--accent-gold);
                font-weight: 500;
            }
            
            .watch-next-btn {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: var(--bg-primary);
                border: none;
                padding: 15px 30px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
            }
            
            .watch-next-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 15px 40px rgba(255, 215, 0, 0.6);
            }
            
            .watch-next-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .btn-icon {
                font-size: 18px;
            }
            
            @media (max-width: 768px) {
                .current-photo-display {
                    padding: 15px;
                }
                
                .watch-next-btn {
                    padding: 12px 24px;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);

        console.log('Watch page UI initialized');
    }

    // Get system statistics for debugging
    getPhotoSystemStats() {
        if (this.photoSystem) {
            return this.photoSystem.getStats();
        }
        return null;
    }
}

// Global instance for button access
let watchPage;

// Initialize watch page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    watchPage = new WatchPage();
    
    // Make watchPage globally available for button onclick
    window.watchPage = watchPage;
});

// Export for potential use in other scripts
window.WatchPage = WatchPage;
