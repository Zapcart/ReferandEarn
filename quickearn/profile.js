// ============================================
// PROFILE MODULE - User Profile Management
// Handles profile picture upload, profile editing
// ============================================

const Profile = {
    selectedProfilePic: null,

    // Upload profile picture
    uploadProfilePic: async (file) => {
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            return false;
        }

        // Validate file
        if (!file) {
            UI.showToast('Please select a file', 'error');
            return false;
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            UI.showToast('Please select a valid image file', 'error');
            return false;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            UI.showToast('File size must be less than 5MB', 'error');
            return false;
        }

        UI.showLoading();

        try {
            const { ref, uploadBytes, getDownloadURL } = window.firebaseStorage;
            const { doc, updateDoc } = window.firebaseDb;
            const currentUser = Auth.getCurrentUser();

            // Create storage reference
            const storageRef = ref(window.firebaseStorage, `profile_pics/${currentUser.uid}/${Date.now()}_${file.name}`);

            // Upload file
            await uploadBytes(storageRef, file);

            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update user document with profile picture URL
            await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), {
                profilePic: downloadURL
            });

            UI.hideLoading();
            UI.showToast('Profile picture updated!', 'success');
            
            // Update UI
            UI.updateHeader(Auth.currentUser, Auth.getUserData());
            
            return true;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            UI.hideLoading();
            UI.showToast('Error uploading profile picture', 'error');
            return false;
        }
    },

    // Update user profile
    updateProfile: async (name, bio) => {
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            return false;
        }

        // Validation
        if (!name || name.trim().length === 0) {
            UI.showToast('Name is required', 'error');
            return false;
        }

        if (name.trim().length > 50) {
            UI.showToast('Name must be less than 50 characters', 'error');
            return false;
        }

        if (bio && bio.length > 200) {
            UI.showToast('Bio must be less than 200 characters', 'error');
            return false;
        }

        UI.showLoading();

        try {
            const { doc, updateDoc } = window.firebaseDb;
            const currentUser = Auth.getCurrentUser();

            await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), {
                name: name.trim(),
                bio: bio ? bio.trim() : ''
            });

            UI.hideLoading();
            UI.showToast('Profile updated!', 'success');
            
            // Update UI
            UI.updateHeader(Auth.currentUser, Auth.getUserData());
            
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            UI.hideLoading();
            UI.showToast('Error updating profile', 'error');
            return false;
        }
    },

    // Handle profile picture selection
    handleProfilePicSelect: (event) => {
        const file = event.target.files[0];
        if (file) {
            Profile.selectedProfilePic = file;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profilePicPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    // Remove profile picture
    removeProfilePic: async () => {
        if (!Auth.isLoggedIn()) {
            UI.showToast('Please login first', 'error');
            return;
        }

        UI.showLoading();

        try {
            const { doc, updateDoc } = window.firebaseDb;
            const currentUser = Auth.getCurrentUser();

            // Remove profile picture from user document
            await updateDoc(doc(window.firebaseDb, 'users', currentUser.uid), {
                profilePic: null
            });

            UI.hideLoading();
            UI.showToast('Profile picture removed', 'success');
            
            // Update preview to default
            const userData = Auth.getUserData();
            document.getElementById('profilePicPreview').src = Profile.getDefaultProfilePic(userData?.name || 'User');
            
            // Update UI
            UI.updateHeader(Auth.currentUser, Auth.getUserData());
            
            Profile.selectedProfilePic = null;
        } catch (error) {
            console.error('Error removing profile picture:', error);
            UI.hideLoading();
            UI.showToast('Error removing profile picture', 'error');
        }
    },

    // Handle profile form submission
    handleProfileUpdate: async (event) => {
        event.preventDefault();

        const name = document.getElementById('profileName').value.trim();
        const bio = document.getElementById('profileBio').value.trim();

        // Upload profile picture if selected
        if (Profile.selectedProfilePic) {
            const uploadSuccess = await Profile.uploadProfilePic(Profile.selectedProfilePic);
            if (!uploadSuccess) {
                return;
            }
            Profile.selectedProfilePic = null;
        }

        // Update profile data
        const updateSuccess = await Profile.updateProfile(name, bio);
        if (updateSuccess) {
            UI.hideProfileModal();
        }
    },

    // Get profile picture URL
    getProfilePic: () => {
        const userData = Auth.getUserData();
        if (!userData) {
            return null;
        }
        return userData.profilePic || null;
    },

    // Get default profile picture (based on name)
    getDefaultProfilePic: (name) => {
        if (!name) {
            return 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=128';
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
    },

    // Get profile picture URL or default
    getProfilePicUrl: () => {
        const userData = Auth.getUserData();
        if (!userData) {
            return Profile.getDefaultProfilePic('User');
        }
        return userData.profilePic || Profile.getDefaultProfilePic(userData.name);
    }
};

// Make Profile available globally
window.Profile = Profile;

// Setup bio character count
document.addEventListener('DOMContentLoaded', () => {
    const bioInput = document.getElementById('profileBio');
    const charCount = document.getElementById('bioCharCount');
    
    if (bioInput && charCount) {
        bioInput.addEventListener('input', () => {
            charCount.textContent = bioInput.value.length;
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', UI.closeProfileDropdown);
});
