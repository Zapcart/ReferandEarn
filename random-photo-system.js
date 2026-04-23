// Scalable Random Photo System
// Automatically generates photo list from photo1.png to photo100.png
// Prevents immediate duplicates and supports future expansion

class RandomPhotoSystem {
    constructor(config = {}) {
        // Configuration - easily scalable
        this.config = {
            photoCount: config.photoCount || 100,        // Change to 200, 500, etc.
            photoFormat: config.photoFormat || 'png',    // png, jpg, etc.
            photoPath: config.photoPath || 'images',     // folder path
            photoPrefix: config.photoPrefix || 'photo', // filename prefix
            extensionCheck: config.extensionCheck || true // verify file existence
        };
        
        // State management
        this.photoArray = [];
        this.currentPhotoIndex = null;
        this.lastPhotoIndex = null;
        this.availablePhotos = [];
        this.usedPhotos = new Set();
        this.isInitialized = false;
        
        this.init();
    }

    // Initialize the photo system
    async init() {
        try {
            // Generate photo array dynamically
            this.generatePhotoArray();
            
            // Verify photos exist (optional)
            if (this.config.extensionCheck) {
                await this.verifyPhotos();
            }
            
            // Set initial random photo
            this.loadRandomPhoto();
            
            this.isInitialized = true;
            console.log(`Random Photo System initialized with ${this.photoArray.length} photos`);
            
        } catch (error) {
            console.error('Error initializing photo system:', error);
            this.fallbackToDemo();
        }
    }

    // Dynamically generate photo array using loop
    generatePhotoArray() {
        this.photoArray = [];
        
        for (let i = 1; i <= this.config.photoCount; i++) {
            const photoPath = `${this.config.photoPath}/${this.config.photoPrefix}${i}.${this.config.photoFormat}`;
            this.photoArray.push({
                id: i,
                path: photoPath,
                filename: `${this.config.photoPrefix}${i}.${this.config.photoFormat}`,
                index: i - 1
            });
        }
        
        // Initialize available photos array
        this.availablePhotos = [...this.photoArray];
        
        console.log(`Generated ${this.photoArray.length} photo paths`);
    }

    // Verify photos exist (optional - can be disabled for performance)
    async verifyPhotos() {
        const verifiedPhotos = [];
        
        for (const photo of this.photoArray) {
            if (await this.imageExists(photo.path)) {
                verifiedPhotos.push(photo);
            }
        }
        
        if (verifiedPhotos.length > 0) {
            this.photoArray = verifiedPhotos;
            this.availablePhotos = [...verifiedPhotos];
            console.log(`Verified ${verifiedPhotos.length} photos exist`);
        } else {
            console.warn('No photos found, using fallback');
            this.fallbackToDemo();
        }
    }

    // Check if image exists
    async imageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    // Fallback to demo photos if no local photos found
    fallbackToDemo() {
        // Use placeholder service as fallback
        this.photoArray = [];
        for (let i = 1; i <= 50; i++) {
            this.photoArray.push({
                id: i,
                path: `https://picsum.photos/seed/photo${i}/400/400.jpg`,
                filename: `photo${i}.jpg`,
                index: i - 1,
                isDemo: true
            });
        }
        this.availablePhotos = [...this.photoArray];
        console.log('Using demo photos as fallback');
    }

    // Load random photo (no immediate duplicate)
    loadRandomPhoto() {
        if (this.availablePhotos.length === 0) {
            // Reset available photos if all have been used
            this.resetAvailablePhotos();
        }

        // Select random photo from available (excluding last shown)
        let randomIndex;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            randomIndex = Math.floor(Math.random() * this.availablePhotos.length);
            attempts++;
        } while (
            this.lastPhotoIndex !== null && 
            this.availablePhotos[randomIndex].id === this.lastPhotoIndex && 
            attempts < maxAttempts
        );

        // If we can't avoid the last photo after max attempts, use it anyway
        const selectedPhoto = this.availablePhotos[randomIndex];
        
        // Update state
        this.currentPhotoIndex = selectedPhoto.index;
        this.lastPhotoIndex = selectedPhoto.id;
        
        // Remove from available to prevent immediate reuse
        this.availablePhotos.splice(randomIndex, 1);
        this.usedPhotos.add(selectedPhoto.id);

        console.log(`Loaded photo: ${selectedPhoto.filename} (ID: ${selectedPhoto.id})`);
        
        return selectedPhoto;
    }

    // Watch next photo with duplicate prevention
    watchNextPhoto() {
        if (!this.isInitialized) {
            console.warn('Photo system not initialized');
            return null;
        }

        const nextPhoto = this.loadRandomPhoto();
        
        // Trigger photo change event
        this.onPhotoChange(nextPhoto);
        
        return nextPhoto;
    }

    // Reset available photos when all have been used
    resetAvailablePhotos() {
        this.availablePhotos = [...this.photoArray];
        this.usedPhotos.clear();
        console.log('Reset available photos - all photos can be shown again');
    }

    // Get current photo
    getCurrentPhoto() {
        if (this.currentPhotoIndex !== null) {
            return this.photoArray[this.currentPhotoIndex];
        }
        return null;
    }

    // Get photo by ID
    getPhotoById(id) {
        return this.photoArray.find(photo => photo.id === id);
    }

    // Get random photo (without changing current)
    getRandomPhoto() {
        const randomIndex = Math.floor(Math.random() * this.photoArray.length);
        return this.photoArray[randomIndex];
    }

    // Get system statistics
    getStats() {
        return {
            totalPhotos: this.photoArray.length,
            availablePhotos: this.availablePhotos.length,
            usedPhotos: this.usedPhotos.size,
            currentPhoto: this.getCurrentPhoto()?.filename || 'None',
            lastPhotoId: this.lastPhotoIndex,
            isDemo: this.photoArray.some(photo => photo.isDemo)
        };
    }

    // Event handler for photo changes (can be overridden)
    onPhotoChange(photo) {
        // This method can be overridden by the implementing class
        console.log(`Photo changed to: ${photo.filename}`);
    }

    // Update configuration for scalability
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Configuration updated:', this.config);
        
        // Reinitialize with new config
        this.init();
    }

    // Preload photos for better performance
    async preloadPhotos(count = 10) {
        const preloadPromises = [];
        const photosToPreload = this.getRandomPhotos(count);
        
        for (const photo of photosToPreload) {
            preloadPromises.push(
                new Promise((resolve) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = photo.path;
                })
            );
        }
        
        await Promise.all(preloadPromises);
        console.log(`Preloaded ${count} photos`);
    }

    // Get multiple random photos
    getRandomPhotos(count) {
        const shuffled = [...this.photoArray].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, this.photoArray.length));
    }

    // Export configuration for easy scaling
    exportConfig() {
        return {
            photoCount: this.config.photoCount,
            photoFormat: this.config.photoFormat,
            photoPath: this.config.photoPath,
            photoPrefix: this.config.photoPrefix
        };
    }
}

// Usage Example:
// const photoSystem = new RandomPhotoSystem({
//     photoCount: 100,        // Change to 200, 500, etc.
//     photoFormat: 'png',     // or 'jpg'
//     photoPath: 'images',    // folder path
//     photoPrefix: 'photo'    // filename prefix
// });

// For easy scaling to 200 photos:
// photoSystem.updateConfig({ photoCount: 200 });

// Export for use in other files
window.RandomPhotoSystem = RandomPhotoSystem;
