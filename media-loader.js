// Dynamic Media Loader System
// Automatically loads photos and videos from local folders without hardcoding filenames

class MediaLoaderSystem {
    constructor() {
        this.mediaItems = [];
        this.currentIndex = 0;
        this.isLoading = false;
        this.maxPhotos = 20;
        this.maxVideos = 20;
        this.loadedCount = 0;
        this.failedCount = 0;
        
        // Configuration
        this.config = {
            imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            videoExtensions: ['mp4', 'webm', 'ogg'],
            preloadCount: 3,
            retryAttempts: 2
        };
        
        this.init();
    }

    async init() {
        try {
            // Don't auto-load media on initialization
            // Wait for user to click "Watch Photo & Earn Money" button
            this.setupEventListeners();
            console.log('Media loader initialized - waiting for user interaction');
        } catch (error) {
            console.error('Media loader initialization failed:', error);
            this.showEmptyState();
        }
    }

    async loadMediaItems() {
        this.showLoadingState();
        
        // Load photos
        const photos = await this.loadPhotos();
        
        // Load videos
        const videos = await this.loadVideos();
        
        // Combine and shuffle media
        this.mediaItems = [...photos, ...videos];
        this.shuffleMedia();
        
        // Hide loading state
        this.hideLoadingState();
        
        // Show empty state if no media found
        if (this.mediaItems.length === 0) {
            this.showEmptyState();
            return;
        }
        
        console.log(`Loaded ${this.mediaItems.length} media items (${photos.length} photos, ${videos.length} videos)`);
    }

    async loadPhotos() {
        const photos = [];
        
        for (let i = 1; i <= this.maxPhotos; i++) {
            const photo = await this.loadPhoto(i);
            if (photo) {
                photos.push(photo);
            }
        }
        
        return photos;
    }

    async loadPhoto(index) {
        const extensions = this.config.imageExtensions;
        
        for (const ext of extensions) {
            const path = `images/photo${index}.${ext}`;
            
            try {
                const exists = await this.checkFileExists(path);
                if (exists) {
                    return {
                        type: 'photo',
                        path: path,
                        index: index,
                        extension: ext
                    };
                }
            } catch (error) {
                // File doesn't exist, try next extension
                continue;
            }
        }
        
        return null;
    }

    async loadVideos() {
        const videos = [];
        
        for (let i = 1; i <= this.maxVideos; i++) {
            const video = await this.loadVideo(i);
            if (video) {
                videos.push(video);
            }
        }
        
        return videos;
    }

    async loadVideo(index) {
        const extensions = this.config.videoExtensions;
        
        for (const ext of extensions) {
            const path = `videos/video${index}.${ext}`;
            
            try {
                const exists = await this.checkFileExists(path);
                if (exists) {
                    return {
                        type: 'video',
                        path: path,
                        index: index,
                        extension: ext
                    };
                }
            } catch (error) {
                // File doesn't exist, try next extension
                continue;
            }
        }
        
        return null;
    }

    async checkFileExists(path) {
        return new Promise((resolve) => {
            const img = new Image();
            const video = document.createElement('video');
            
            // Determine file type by extension
            const isVideo = path.match(/\.(mp4|webm|ogg)$/i);
            
            if (isVideo) {
                video.src = path;
                video.onloadeddata = () => resolve(true);
                video.onerror = () => resolve(false);
            } else {
                img.src = path;
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
            }
            
            // Set timeout to prevent hanging
            setTimeout(() => resolve(false), 3000);
        });
    }

    shuffleMedia() {
        for (let i = this.mediaItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mediaItems[i], this.mediaItems[j]] = [this.mediaItems[j], this.mediaItems[i]];
        }
    }

    displayCurrentMedia() {
        if (this.mediaItems.length === 0) return;
        
        const container = document.getElementById('mediaContainer');
        if (!container) return;
        
        // Clear existing media
        container.innerHTML = '';
        
        // Create media items for current, prev, and next
        const indices = [
            (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length,
            this.currentIndex,
            (this.currentIndex + 1) % this.mediaItems.length
        ];
        
        indices.forEach((index, position) => {
            const mediaItem = this.mediaItems[index];
            const element = this.createMediaElement(mediaItem, position);
            
            if (position === 1) {
                element.classList.add('active');
            } else if (position === 0) {
                element.classList.add('prev');
            } else {
                element.classList.add('next');
            }
            
            container.appendChild(element);
        });
        
        // Preload additional media
        this.preloadMedia();
        
        // Setup video autoplay for current media
        this.setupVideoAutoplay();
    }

    createMediaElement(media, position) {
        const element = document.createElement('div');
        element.className = 'media-item';
        element.setAttribute('data-media-type', media.type);
        
        if (media.type === 'photo') {
            const img = document.createElement('img');
            img.src = media.path;
            img.alt = `Photo ${media.index} - Earn money by watching this amazing photo on Zapcart`;
            img.loading = 'lazy'; // Add lazy loading
            img.decoding = 'async'; // Add async decoding for better performance
            img.setAttribute('data-index', media.index);
            
            // Add error handling
            img.onerror = () => {
                console.warn(`Failed to load image: ${media.path}`);
                img.style.display = 'none';
                element.innerHTML = '<div class="media-error">Photo unavailable</div>';
            };
            
            // Add load event for analytics
            img.onload = () => {
                console.log(`Image loaded: ${media.path}`);
                // Add coins for viewing photo (if implemented)
                if (typeof addCoins === 'function') {
                    addCoins(1);
                }
            };
            
            element.appendChild(img);
        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = media.path;
            video.alt = `Video ${media.index} - Earn money by watching this amazing video on Zapcart`;
            video.setAttribute('data-index', media.index);
            video.playsInline = true;
            video.muted = true;
            video.loop = true;
            video.setAttribute('poster', `images/thumb${media.index}.jpg`); // Add poster image
            
            // Add error handling
            video.onerror = () => {
                console.warn(`Failed to load video: ${media.path}`);
                video.style.display = 'none';
                element.innerHTML = '<div class="media-error">Video unavailable</div>';
            };
            
            // Add load event for analytics
            video.onloadeddata = () => {
                console.log(`Video loaded: ${media.path}`);
                // Add coins for viewing video (if implemented)
                if (typeof addCoins === 'function') {
                    addCoins(2);
                }
            };
            
            element.appendChild(video);
        }
        
        // Add media type indicator
        const indicator = document.createElement('div');
        indicator.className = `media-type-indicator ${media.type}`;
        indicator.textContent = media.type === 'photo' ? '📸 Photo' : '🎬 Video';
        element.appendChild(indicator);
        
        // Add progress bar for videos
        if (media.type === 'video') {
            const progress = document.createElement('div');
            progress.className = 'media-progress';
            progress.innerHTML = '<div class="media-progress-bar"></div>';
            element.appendChild(progress);
        }
        
        return element;
    }

    setupVideoAutoplay() {
        const activeItem = document.querySelector('.media-item.active');
        if (!activeItem) return;
        
        const video = activeItem.querySelector('video');
        if (video) {
            // Try to autoplay
            video.play().catch(error => {
                console.log('Autoplay failed, user interaction required:', error);
            });
            
            // Setup progress tracking
            const progressBar = activeItem.querySelector('.media-progress-bar');
            if (progressBar) {
                video.addEventListener('timeupdate', () => {
                    const progress = (video.currentTime / video.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                });
                
                video.addEventListener('ended', () => {
                    // Auto advance to next media
                    setTimeout(() => this.nextMedia(), 1000);
                });
            }
        }
    }

    preloadMedia() {
        const preloadCount = this.config.preloadCount;
        const startIndex = (this.currentIndex + 2) % this.mediaItems.length;
        
        for (let i = 0; i < preloadCount; i++) {
            const index = (startIndex + i) % this.mediaItems.length;
            const mediaItem = this.mediaItems[index];
            
            // Preload in background
            if (mediaItem.type === 'photo') {
                const img = new Image();
                img.src = mediaItem.path;
            } else if (mediaItem.type === 'video') {
                const video = document.createElement('video');
                video.src = mediaItem.path;
                video.preload = 'metadata';
            }
        }
    }

    nextMedia() {
        if (this.mediaItems.length === 0) return;
        
        // Pause current video
        const currentVideo = document.querySelector('.media-item.active video');
        if (currentVideo) {
            currentVideo.pause();
        }
        
        // Update index
        this.currentIndex = (this.currentIndex + 1) % this.mediaItems.length;
        
        // Update display
        this.updateMediaDisplay('next');
    }

    previousMedia() {
        if (this.mediaItems.length === 0) return;
        
        // Pause current video
        const currentVideo = document.querySelector('.media-item.active video');
        if (currentVideo) {
            currentVideo.pause();
        }
        
        // Update index
        this.currentIndex = (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
        
        // Update display
        this.updateMediaDisplay('prev');
    }

    updateMediaDisplay(direction) {
        const container = document.getElementById('mediaContainer');
        if (!container) return;
        
        const activeItem = container.querySelector('.media-item.active');
        const prevItem = container.querySelector('.media-item.prev');
        const nextItem = container.querySelector('.media-item.next');
        
        // Animate transition
        if (direction === 'next') {
            if (activeItem) activeItem.classList.add('prev');
            if (activeItem) activeItem.classList.remove('active');
            if (nextItem) nextItem.classList.add('active');
            if (nextItem) nextItem.classList.remove('next');
            
            // Create new next item
            const nextIndex = (this.currentIndex + 1) % this.mediaItems.length;
            const newNextItem = this.createMediaElement(this.mediaItems[nextIndex], 2);
            newNextItem.classList.add('next');
            container.appendChild(newNextItem);
            
            // Remove old prev item
            if (prevItem) prevItem.remove();
        } else {
            if (activeItem) activeItem.classList.add('next');
            if (activeItem) activeItem.classList.remove('active');
            if (prevItem) prevItem.classList.add('active');
            if (prevItem) prevItem.classList.remove('prev');
            
            // Create new prev item
            const prevIndex = (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
            const newPrevItem = this.createMediaElement(this.mediaItems[prevIndex], 0);
            newPrevItem.classList.add('prev');
            container.appendChild(newPrevItem);
            
            // Remove old next item
            if (nextItem) nextItem.remove();
        }
        
        // Setup video autoplay for new active media
        this.setupVideoAutoplay();
        
        // Preload additional media
        this.preloadMedia();
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                this.nextMedia();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.previousMedia();
            }
        });
        
        // Touch/swipe navigation
        let touchStartY = 0;
        let touchEndY = 0;
        
        const container = document.getElementById('mediaContainer');
        if (container) {
            container.addEventListener('touchstart', (e) => {
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            container.addEventListener('touchend', (e) => {
                touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe(touchStartY, touchEndY);
            }, { passive: true });
        }
        
        // Wheel navigation
        container?.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.nextMedia();
            } else {
                this.previousMedia();
            }
        }, { passive: false });
        
        // Visibility change - pause videos when tab is not visible
        document.addEventListener('visibilitychange', () => {
            const activeVideo = document.querySelector('.media-item.active video');
            if (activeVideo) {
                if (document.hidden) {
                    activeVideo.pause();
                } else {
                    activeVideo.play().catch(() => {});
                }
            }
        });
    }

    handleSwipe(startY, endY) {
        const swipeThreshold = 50;
        const diff = startY - endY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextMedia(); // Swipe up
            } else {
                this.previousMedia(); // Swipe down
            }
        }
    }

    showLoadingState() {
        const container = document.getElementById('mediaContainer');
        if (container) {
            container.innerHTML = '<div class="loading-spinner"></div>';
        }
    }

    hideLoadingState() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const container = document.getElementById('mediaContainer');
        
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
        
        if (container) {
            container.style.display = 'none';
        }
    }

    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const container = document.getElementById('mediaContainer');
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        if (container) {
            container.style.display = 'block';
        }
    }

    // Public methods for global access
    getCurrentMedia() {
        return this.mediaItems[this.currentIndex] || null;
    }

    getMediaCount() {
        return this.mediaItems.length;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }
}

// Initialize the media system when DOM is loaded
let mediaSystem;

document.addEventListener('DOMContentLoaded', function() {
    mediaSystem = new MediaLoaderSystem();
    
    // Make it globally accessible for button onclick handlers
    window.mediaSystem = mediaSystem;
    
    console.log('Dynamic Media Loader System initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaLoaderSystem;
}
