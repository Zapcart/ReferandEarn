// ============================================
// AUTH MODULE - Authentication System
// Handles Firebase Auth, signup, login, logout
// SINGLE SOURCE OF TRUTH: onAuthStateChanged
// ============================================

const Auth = {
    currentUser: null,
    userData: null,
    isInitialized: false,
    authListener: null,

    // Initialize authentication (called once)
    init: () => {
        if (Auth.isInitialized) {
            console.warn('Auth already initialized');
            return;
        }

        // Wait for Firebase to be available
        const checkFirebase = setInterval(() => {
            if (window.firebaseAuth && window.firebaseDb) {
                clearInterval(checkFirebase);
                Auth.setupAuthListener();
                Auth.isInitialized = true;
            }
        }, 100);
    },

    // Setup auth state listener (SINGLE SOURCE OF TRUTH)
    setupAuthListener: () => {
        // Remove existing listener if any
        if (Auth.authListener) {
            Auth.authListener();
        }

        const { onAuthStateChanged } = window.firebaseAuth;
        
        Auth.authListener = onAuthStateChanged(window.firebaseAuth, (user) => {
            console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
            
            // Update global currentUser immediately
            Auth.currentUser = user;
            
            if (user) {
                // User is logged in, fetch user data from Firestore
                Auth.fetchUserData(user.uid);
            } else {
                // User is logged out
                Auth.userData = null;
                UI.updateHeader(null, null);
                UI.showLanding();
            }
        });
    },

    // Check if user is logged in (uses auth.currentUser as source of truth)
    isLoggedIn: () => {
        return Auth.currentUser !== null;
    },

    // Get current user data
    getCurrentUser: () => {
        return Auth.currentUser;
    },

    // Get user data from Firestore
    getUserData: () => {
        return Auth.userData;
    },

    // Fetch user data from Firestore
    fetchUserData: async (uid) => {
        try {
            const { doc, getDoc, onSnapshot } = window.firebaseDb;
            const userRef = doc(window.firebaseDb, 'users', uid);
            
            // Real-time listener for user data
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    Auth.userData = docSnap.data();
                    
                    // Update UI
                    UI.updateHeader(Auth.currentUser, Auth.userData);
                    UI.updateDashboard(Auth.userData);
                    UI.showDashboard();
                } else {
                    console.error('User document not found');
                }
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            UI.showToast('Error loading user data', 'error');
        }
    },

    // Handle authentication form submission
    handleAuth: async (event) => {
        event.preventDefault();
        
        const mode = document.querySelector('.auth-tab.active').dataset.mode;
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const submitBtn = document.getElementById('authSubmit');
        
        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            UI.showToast('Please enter a valid email', 'error');
            return;
        }
        
        if (password.length < 6) {
            UI.showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (mode === 'signup') {
            await Auth.handleSignup(email, password, submitBtn);
        } else {
            await Auth.handleLogin(email, password, submitBtn);
        }
    },

    // Handle signup
    handleSignup: async (email, password, submitBtn) => {
        const name = document.getElementById('name').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const referralCode = document.getElementById('referralInput').value.trim();
        
        // Validation
        if (!name) {
            UI.showToast('Please enter your name', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            UI.showToast('Passwords do not match', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        UI.showLoading();
        
        try {
            const { createUserWithEmailAndPassword } = window.firebaseAuth;
            const userCred = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
            const user = userCred.user;
            
            // Generate unique referral code
            const userReferralCode = 'QE' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Check if referral code is valid
            let referredBy = null;
            if (referralCode) {
                referredBy = await Auth.validateReferralCode(referralCode);
            }
            
            // Generate username from name (lowercase, no spaces)
            const username = name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);

            // Create user document in Firestore
            const { doc, setDoc } = window.firebaseDb;
            await setDoc(doc(window.firebaseDb, 'users', user.uid), {
                name,
                username,
                email,
                coins: referredBy ? 10 : 0, // Bonus if referred
                referralCode: userReferralCode,
                referredBy,
                profilePic: null, // Will be uploaded later
                bio: '',
                createdAt: Date.now(),
                lastLoginAt: Date.now(),
                lastDailyBonus: 0
            });
            
            // If referral was valid, give bonus to referrer
            if (referredBy) {
                await Auth.rewardReferrer(referralCode);
            }
            
            UI.showToast('Account created successfully!', 'success');
            UI.hideAuthModal();
            
        } catch (error) {
            console.error('Signup error:', error);
            
            // Handle specific errors
            let errorMessage = 'Signup failed';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already registered';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }
            
            UI.showToast(errorMessage, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            UI.hideLoading();
        }
    },

    // Handle login
    handleLogin: async (email, password, submitBtn) => {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        UI.showLoading();
        
        try {
            const { signInWithEmailAndPassword } = window.firebaseAuth;
            await signInWithEmailAndPassword(window.firebaseAuth, email, password);
            
            // Update last login timestamp
            if (Auth.currentUser) {
                const { doc, updateDoc } = window.firebaseDb;
                await updateDoc(doc(window.firebaseDb, 'users', Auth.currentUser.uid), {
                    lastLoginAt: Date.now()
                });
            }
            
            UI.showToast('Login successful!', 'success');
            UI.hideAuthModal();
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific errors
            let errorMessage = 'Login failed';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'User not found';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid credentials';
            }
            
            UI.showToast(errorMessage, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
            UI.hideLoading();
        }
    },

    // Handle logout
    logout: async () => {
        try {
            const { signOut } = window.firebaseAuth;
            await signOut(window.firebaseAuth);
            UI.showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            UI.showToast('Logout failed', 'error');
        }
    },

    // Validate referral code
    validateReferralCode: async (code) => {
        try {
            const { collection, query, where, getDocs } = window.firebaseDb;
            const q = query(collection(window.firebaseDb, 'users'), where('referralCode', '==', code));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                return code; // Valid referral code
            }
            return null; // Invalid referral code
        } catch (error) {
            console.error('Error validating referral code:', error);
            return null;
        }
    },

    // Reward referrer
    rewardReferrer: async (referralCode) => {
        try {
            const { collection, query, where, getDocs, doc, updateDoc, increment } = window.firebaseDb;
            const q = query(collection(window.firebaseDb, 'users'), where('referralCode', '==', referralCode));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const referrerDoc = querySnapshot.docs[0];
                await updateDoc(doc(window.firebaseDb, 'users', referrerDoc.id), {
                    coins: increment(10)
                });
            }
        } catch (error) {
            console.error('Error rewarding referrer:', error);
        }
    },

    // Handle auth state change (called from main HTML)
    handleAuthStateChange: (user) => {
        Auth.currentUser = user;
        
        if (user) {
            Auth.fetchUserData(user.uid);
        } else {
            Auth.userData = null;
            UI.updateHeader(null, null);
            UI.showLanding();
        }
    }
};

// Make Auth available globally
window.Auth = Auth;

// Initialize auth module
Auth.init();
