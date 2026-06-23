// Global Variables
let captchaValue = '';
let currentCaptcha = '';
let currentUser = null;
let generatedOTP = '';
let otpPhoneNumber = '';
let googleUser = null;

// Firebase Configuration
// IMPORTANT: Replace these values with your actual Firebase project configuration
// Get your config from: https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

// Google OAuth Client ID
// IMPORTANT: Replace with your actual Google OAuth Client ID
// Get your client ID from: https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// EmailJS Configuration
// IMPORTANT: Replace these with your actual EmailJS credentials
// Get your credentials from: https://www.emailjs.com/
const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const ADMIN_EMAIL = "srijanamplify03@gmail.com";

// Initialize Firebase
let firebaseAuth = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        console.log('Firebase initialized successfully');
    }
} catch (e) {
    console.log('Firebase initialization skipped - config needed:', e.message);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // One-time clear for fresh production delivery
    if (!localStorage.getItem('amplifyProductionCleared')) {
        clearAllLocalStorageForFreshProduction();
        localStorage.setItem('amplifyProductionCleared', 'true');
    }
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        console.log('EmailJS initialized successfully');
        
        // Save EmailJS credentials to localStorage for admin panel access
        localStorage.setItem('emailjs_service_id', EMAILJS_SERVICE_ID);
        localStorage.setItem('emailjs_template_id', EMAILJS_TEMPLATE_ID);
        localStorage.setItem('emailjs_public_key', EMAILJS_PUBLIC_KEY);
    } else {
        console.log('EmailJS initialization skipped - config needed');
    }
    
    initializeScrollAnimations();
    initializeGalleryScrollAnimations();
    generatePremiumCaptcha();
    loadGalleryContent();
    checkUserSession();
    initializeOTPInputs();
    initializeGoogleSignIn();
    initializePremiumLoginAnimations();
    initializeRecaptcha();
});

// Clear all localStorage for fresh production delivery (one-time)
function clearAllLocalStorageForFreshProduction() {
    const keysToRemove = [
        'amplifyUser',
        'amplifyBookings',
        'amplifyNotifications',
        'amplifyGallery',
        'amplifyPlaceholderGallery',
        'amplifyLogins'
    ];
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
    
    console.log('All localStorage data cleared for fresh production delivery');
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
}

// Gallery Scroll Animations with Video Auto-play and Parallax
function initializeGalleryScrollAnimations() {
    const observerOptions = {
        threshold: 0.25,
        rootMargin: '0px 0px -150px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const item = entry.target;
            const video = item.querySelector('video');
            
            if (entry.isIntersecting) {
                item.classList.add('visible');
                // Auto-play video when visible with fade in
                if (video) {
                    video.style.opacity = '1';
                    video.play().catch(e => console.log('Video autoplay prevented:', e));
                }
            } else {
                // Pause video when not visible with fade out
                if (video) {
                    video.style.opacity = '0.7';
                    video.pause();
                }
            }
        });
    }, observerOptions);

    const galleryItems = document.querySelectorAll('.gallery-scroll-item');
    galleryItems.forEach(el => observer.observe(el));
    
    // Add parallax effect on scroll
    window.addEventListener('scroll', () => {
        galleryItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const scrollProgress = 1 - (rect.top / window.innerHeight);
            
            if (scrollProgress > 0 && scrollProgress < 1) {
                const parallaxOffset = scrollProgress * 30;
                item.style.transform = `translateY(${parallaxOffset}px)`;
            }
        });
    }, { passive: true });
}

// Smooth scroll to section
function scrollToWhyUs() {
    document.getElementById('why-us').scrollIntoView({ behavior: 'smooth' });
}

function scrollToBooking() {
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

// Gallery Functions
function openGallery() {
    const modal = document.getElementById('galleryModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    loadGalleryContent();
}

function closeGallery() {
    const modal = document.getElementById('galleryModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Pause all videos when closing
    const videos = modal.querySelectorAll('video');
    videos.forEach(video => video.pause());
}

// Load gallery content from localStorage (admin uploads)
function loadGalleryContent() {
    const galleryGrid = document.getElementById('galleryGrid');
    const scrollGallery = document.getElementById('scrollGallery');
    const storedContent = localStorage.getItem('amplifyGallery');
    const placeholderContent = localStorage.getItem('amplifyPlaceholderGallery');
    
    // First, update placeholder items in scroll gallery
    if (scrollGallery && placeholderContent) {
        const placeholders = JSON.parse(placeholderContent);
        const placeholderIds = ['photo1', 'photo2', 'photo3', 'video1', 'video2', 'video3'];
        const galleryItems = scrollGallery.querySelectorAll('.gallery-scroll-item');
        
        galleryItems.forEach((item, index) => {
            if (index < placeholderIds.length) {
                const placeholderId = placeholderIds[index];
                const content = placeholders[placeholderId];
                const mediaContainer = item.querySelector('.gallery-media-container');
                
                if (content && content.url && mediaContainer) {
                    if (content.type && content.type.startsWith('video')) {
                        mediaContainer.innerHTML = `
                            <video muted loop playsinline>
                                <source src="${content.url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        `;
                    } else {
                        mediaContainer.innerHTML = `<img src="${content.url}" alt="${placeholderId}">`;
                    }
                }
            }
        });
        
        // Re-initialize scroll animations for updated items
        initializeGalleryScrollAnimations();
    }
    
    if (storedContent) {
        const content = JSON.parse(storedContent);
        
        // Update modal gallery
        if (galleryGrid) {
            galleryGrid.innerHTML = '';
            content.forEach(item => {
                const galleryItem = document.createElement('div');
                galleryItem.className = `gallery-item ${item.type === 'video' ? 'video-item' : 'photo-item'}`;
                
                if (item.type === 'video') {
                    galleryItem.innerHTML = `
                        <video controls>
                            <source src="${item.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                } else {
                    galleryItem.innerHTML = `<img src="${item.url}" alt="${item.name}">`;
                }
                
                galleryGrid.appendChild(galleryItem);
            });
        }
        
        // Update scroll gallery with additional content (if any)
        if (scrollGallery && !placeholderContent) {
            scrollGallery.innerHTML = '';
            content.forEach((item, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = `gallery-scroll-item ${item.type === 'video' ? 'video-item' : 'photo-item'}`;
                galleryItem.dataset.index = index;
                
                const captions = ['Premium Photography', 'Cinematic Excellence', 'Brand Storytelling', 'Visual Impact', 'Creative Vision', 'Motion Graphics'];
                const caption = captions[index % captions.length];
                
                if (item.type === 'video') {
                    galleryItem.innerHTML = `
                        <div class="gallery-media-container">
                            <video muted loop playsinline>
                                <source src="${item.url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div class="gallery-caption">${caption}</div>
                    `;
                } else {
                    galleryItem.innerHTML = `
                        <div class="gallery-media-container">
                            <img src="${item.url}" alt="${item.name}">
                        </div>
                        <div class="gallery-caption">${caption}</div>
                    `;
                }
                
                scrollGallery.appendChild(galleryItem);
            });
            
            // Re-initialize scroll animations for new items
            initializeGalleryScrollAnimations();
        }
    }
}

// Booking Functions - Glassmorphism
function openGlassBooking() {
    const form = document.getElementById('bookingFormContainer');
    const triggerBtn = document.getElementById('bookingTriggerBtn');
    form.classList.add('active');
    triggerBtn.classList.add('hidden');
    generatePremiumCaptcha();
}

function closeGlassBooking() {
    const form = document.getElementById('bookingFormContainer');
    const triggerBtn = document.getElementById('bookingTriggerBtn');
    form.classList.remove('active');
    triggerBtn.classList.remove('hidden');
    document.getElementById('bookingForm').reset();
}

// Premium CAPTCHA Functions
function generatePremiumCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = captcha;
    const captchaCanvas = document.getElementById('captchaCanvas');
    if (captchaCanvas) {
        captchaCanvas.textContent = captcha;
    }
}

// Submit Booking Form
function submitBooking(event) {
    event.preventDefault();
    
    const captchaInput = document.getElementById('captchaInput').value.toUpperCase();
    
    if (captchaInput !== currentCaptcha) {
        alert('CAPTCHA verification failed. Please try again.');
        generatePremiumCaptcha();
        document.getElementById('captchaInput').value = '';
        return;
    }
    
    // Determine login method and sender information
    let loginMethod = 'Not Logged In';
    let senderInfo = '';
    
    if (currentUser) {
        if (currentUser.loginMethod === 'google' && currentUser.email) {
            loginMethod = 'Google Login';
            senderInfo = currentUser.email;
        } else if (currentUser.loginMethod === 'phone' && currentUser.phone) {
            loginMethod = 'Phone Login';
            senderInfo = currentUser.phone;
        }
    }
    
    const bookingData = {
        id: Date.now(),
        name: document.getElementById('bookingName').value,
        address: document.getElementById('bookingAddress').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        editingType: document.getElementById('bookingType').value,
        userId: currentUser ? currentUser.uid : null,
        loginMethod: loginMethod,
        senderInfo: senderInfo,
        timestamp: new Date().toISOString(),
        completed: false,
        emailSent: false,
        emailError: null
    };
    
    // Store booking in localStorage (always save first)
    const bookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('amplifyBookings', JSON.stringify(bookings));
    
    // Create admin notification for new booking
    createAdminNotification('New Booking Received', bookingData);
    
    // Send email notification
    sendBookingEmail(bookingData)
        .then(() => {
            // Email sent successfully - update booking
            const updatedBookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
            const bookingIndex = updatedBookings.findIndex(b => b.id === bookingData.id);
            if (bookingIndex !== -1) {
                updatedBookings[bookingIndex].emailSent = true;
                updatedBookings[bookingIndex].emailError = null;
                localStorage.setItem('amplifyBookings', JSON.stringify(updatedBookings));
            }
        })
        .catch((error) => {
            // Email failed - update booking with error
            console.error('Email sending failed:', error);
            const updatedBookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
            const bookingIndex = updatedBookings.findIndex(b => b.id === bookingData.id);
            if (bookingIndex !== -1) {
                updatedBookings[bookingIndex].emailSent = false;
                updatedBookings[bookingIndex].emailError = error.message || 'Email delivery failed';
                localStorage.setItem('amplifyBookings', JSON.stringify(updatedBookings));
            }
            
            // Create admin notification for email failure
            createAdminNotification('Email Delivery Failed', {
                bookingId: bookingData.id,
                error: error.message || 'Email delivery failed',
                bookingData: bookingData
            });
        });
    
    // Show success message (booking is saved regardless of email status)
    closeGlassBooking();
    showSuccessModal('Your appointment has been booked successfully! We will contact you soon.');
}

// Send Booking Email via EmailJS
function sendBookingEmail(bookingData) {
    return new Promise((resolve, reject) => {
        // Check if EmailJS is configured
        if (typeof emailjs === 'undefined' || EMAILJS_SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID') {
            console.log('EmailJS not configured - skipping email send');
            // Resolve anyway to not block booking (booking is saved)
            resolve();
            return;
        }

        // Format email content
        const emailParams = {
            to_email: ADMIN_EMAIL,
            subject: 'New Booking Received - Amplify & CO.',
            booking_name: bookingData.name,
            booking_address: bookingData.address,
            booking_email: bookingData.email,
            booking_phone: bookingData.phone,
            editing_type: bookingData.editingType || 'Not specified',
            booking_timestamp: new Date(bookingData.timestamp).toLocaleString(),
            login_method: bookingData.loginMethod,
            sender_info: bookingData.senderInfo || 'Not available',
            booking_id: bookingData.id
        };

        // Send email using EmailJS
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams)
            .then(function(response) {
                console.log('Email sent successfully:', response);
                resolve(response);
            })
            .catch(function(error) {
                console.error('Email sending failed:', error);
                reject(new Error(error.text || 'Email delivery failed'));
            });
    });
}

// Login Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchLoginTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'gmail') {
        tabs[0].classList.add('active');
        document.getElementById('gmailLogin').style.display = 'block';
        document.getElementById('phoneLogin').style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        document.getElementById('gmailLogin').style.display = 'none';
        document.getElementById('phoneLogin').style.display = 'block';
    }
}

function handleGmailLogin(event) {
    event.preventDefault();
    const email = document.getElementById('gmailInput').value;
    
    // Store login
    const logins = JSON.parse(localStorage.getItem('amplifyLogins') || '[]');
    logins.push({
        type: 'gmail',
        value: email,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('amplifyLogins', JSON.stringify(logins));
    
    // Send email notification
    sendEmailNotification({ email: email }, 'login');
    
    closeLoginModal();
    showSuccessModal('Login successful! Welcome to Amplify & CO.');
}

function handlePhoneLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('phoneInput').value;
    
    // Store login
    const logins = JSON.parse(localStorage.getItem('amplifyLogins') || '[]');
    logins.push({
        type: 'phone',
        value: phone,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('amplifyLogins', JSON.stringify(logins));
    
    // Send email notification
    sendEmailNotification({ phone: phone }, 'login');
    
    closeLoginModal();
    showSuccessModal('Login successful! Welcome to Amplify & CO.');
}

// Success Modal
function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    document.getElementById('successMessage').textContent = message;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Email Notification Function (Simulated)
// In production, this would use a backend service like EmailJS, SendGrid, or a server API
function sendEmailNotification(data, type) {
    const adminEmail = 'srijanamplify03@gmail.com';
    
    let emailSubject = '';
    let emailBody = '';
    
    if (type === 'login') {
        emailSubject = 'New User Login - Amplify & CO.';
        emailBody = `
            New user login detected:
            
            Login Type: ${data.type === 'gmail' ? 'Gmail' : 'Phone Number'}
            ${data.email ? 'Email: ' + data.email : ''}
            ${data.phone ? 'Phone: ' + data.phone : ''}
            Timestamp: ${new Date().toLocaleString()}
        `;
    } else if (type === 'booking') {
        emailSubject = 'New Booking Appointment - Amplify & CO.';
        emailBody = `
            New booking appointment received:
            
            Name: ${data.name}
            Address: ${data.address}
            Email: ${data.email}
            Phone: ${data.phone}
            Type of Editing: ${data.editingType}
            Timestamp: ${new Date().toLocaleString()}
        `;
    }
    
    console.log('Email Notification:', {
        to: adminEmail,
        subject: emailSubject,
        body: emailBody
    });
    
    // Store notification for admin panel
    const notifications = JSON.parse(localStorage.getItem('amplifyNotifications') || '[]');
    notifications.push({
        type: type,
        data: data,
        subject: emailSubject,
        body: emailBody,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('amplifyNotifications', JSON.stringify(notifications));
    
    // Note: In production, integrate with EmailJS or similar service
    // Example EmailJS integration:
    /*
    emailjs.send('service_id', 'template_id', {
        to_email: adminEmail,
        subject: emailSubject,
        message: emailBody
    }).then(function(response) {
        console.log('Email sent successfully:', response);
    }, function(error) {
        console.log('Email failed:', error);
    });
    */
}

// Close modals when clicking outside
window.onclick = function(event) {
    const galleryModal = document.getElementById('galleryModal');
    const bookingModal = document.getElementById('bookingModal');
    const loginModal = document.getElementById('loginModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === galleryModal) {
        closeGallery();
    }
    if (event.target === bookingModal) {
        closeBookingForm();
    }
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === successModal) {
        closeSuccessModal();
    }
}

// Smooth scroll for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Parallax effect on scroll
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Header background change on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
        header.style.padding = '15px 50px';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        header.style.padding = '20px 50px';
    }
});

// Premium Login Functions
function openPremiumLogin() {
    const login = document.getElementById('premiumLogin');
    login.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
        login.querySelector('.login-content-wrapper').style.opacity = '1';
        login.querySelector('.login-content-wrapper').style.transform = 'translateY(0)';
    }, 50);
}

function closePremiumLogin() {
    const login = document.getElementById('premiumLogin');
    login.querySelector('.login-content-wrapper').style.opacity = '0';
    login.querySelector('.login-content-wrapper').style.transform = 'translateY(-50px)';
    
    setTimeout(() => {
        login.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function initializePremiumLoginAnimations() {
    const wrapper = document.querySelector('.login-content-wrapper');
    if (wrapper) {
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateY(-50px)';
        wrapper.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }
}

// Google Sign-In with Firebase and Official Google Identity Services
function initializeGoogleSignIn() {
    const googleBtn = document.getElementById('googleSignInButton');
    if (!googleBtn) return;

    // Check if Google Identity Services is available and client ID is configured
    if (typeof google !== 'undefined' && google.accounts && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        // Initialize Google Identity Services with official account selection
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            ux_mode: 'popup',
            prompt: 'select_account'
        });

        // Render the Google Sign-In button
        google.accounts.id.renderButton(googleBtn, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            logo_alignment: 'left'
        });
    } else if (firebaseAuth) {
        // Use Firebase Auth with Google Provider
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        
        googleBtn.innerHTML = `
            <button class="custom-google-btn" onclick="handleFirebaseGoogleSignIn()">
                <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Sign in with Google</span>
            </button>
        `;
    } else {
        // Configuration needed mode
        googleBtn.innerHTML = `
            <div class="config-needed-message">
                <p>⚠️ Google OAuth not configured</p>
                <small>Please add your Google Client ID and Firebase config</small>
            </div>
        `;
        console.warn('Google OAuth: Please configure GOOGLE_CLIENT_ID and firebaseConfig in app.js');
    }
}

// Handle Google Identity Services credential response
function handleGoogleCredentialResponse(response) {
    // Decode the JWT token
    const payload = parseJwt(response.credential);
    
    // Create user object from Google credential
    const user = {
        displayName: payload.name,
        email: payload.email,
        photoURL: payload.picture,
        uid: payload.sub,
        loginMethod: 'google',
        loginDate: new Date().toISOString()
    };
    
    handleSuccessfulLogin(user);
    createAdminNotification('New Google User Login', user);
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

function handleFirebaseGoogleSignIn() {
    if (!firebaseAuth) {
        alert('Firebase not configured. Please add your Firebase config in app.js');
        return;
    }
    
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    firebaseAuth.signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            googleUser = {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                uid: user.uid,
                phone: user.phoneNumber || '',
                loginMethod: 'google'
            };
            handleSuccessfulLogin(googleUser);
        })
        .catch((error) => {
            console.error('Google Sign-In Error:', error);
            if (error.code === 'auth/popup-blocked') {
                alert('Please allow popups for this site to use Google Sign-In.');
            } else if (error.code === 'auth/unauthorized-domain') {
                alert('This domain is not authorized. Please add it to your Firebase console.');
            } else {
                alert('Sign-in failed: ' + error.message);
            }
        });
}

// Phone OTP Functions with Firebase Authentication
let confirmationResult = null;

function sendOTP() {
    const countryCode = document.getElementById('countryCode').value;
    const phone = document.getElementById('phoneLoginInput').value;
    
    if (!phone || phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    if (!firebaseAuth) {
        alert('Firebase not configured. Please add your Firebase config in app.js');
        return;
    }
    
    const phoneNumber = countryCode + phone;
    otpPhoneNumber = phoneNumber;
    
    // Show loading state
    const sendBtn = document.querySelector('.send-otp-btn');
    sendBtn.textContent = 'Sending...';
    sendBtn.disabled = true;
    
    // Use Firebase Phone Auth
    firebaseAuth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then((result) => {
            confirmationResult = result;
            
            // Show OTP verification UI
            document.getElementById('otpVerification').style.display = 'block';
            document.querySelector('.phone-login-form').style.display = 'none';
            
            // Focus first OTP input
            setTimeout(() => {
                document.querySelector('.otp-input').focus();
            }, 100);
            
            // Reset button
            sendBtn.textContent = 'Send OTP';
            sendBtn.disabled = false;
        })
        .catch((error) => {
            console.error('OTP Send Error:', error);
            
            // Reset button
            sendBtn.textContent = 'Send OTP';
            sendBtn.disabled = false;
            
            if (error.code === 'auth/invalid-phone-number') {
                alert('Invalid phone number format. Please check and try again.');
            } else if (error.code === 'auth/too-many-requests') {
                alert('Too many attempts. Please try again later.');
            } else {
                alert('Failed to send OTP: ' + error.message);
            }
        });
}

function handleSuccessfulLogin(user) {
    currentUser = user;
    
    // Store user session with complete information
    const userSession = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        phone: user.phone || '',
        loginMethod: user.loginMethod || (user.phone ? 'phone' : 'google'),
        loginDate: new Date().toISOString()
    };
    
    localStorage.setItem('amplifyUser', JSON.stringify(userSession));
    
    // Update UI
    updateUserProfileUI(user);
    
    // Close login
    closePremiumLogin();
    
    // Show success
    showSuccessModal(`Welcome back, ${user.displayName}!`);
    
    // Store login notification
    const logins = JSON.parse(localStorage.getItem('amplifyLogins') || '[]');
    logins.push({
        type: user.loginMethod || (user.phone ? 'phone' : 'google'),
        value: user.email || user.phone,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('amplifyLogins', JSON.stringify(logins));
    
    // Create admin notification
    const notificationType = user.loginMethod === 'phone' ? 'New Phone User Login' : 'New Google User Login';
    createAdminNotification(notificationType, userSession);
}

function updateUserProfileUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const profilePhoto = document.getElementById('profilePhoto');
    const profileName = document.getElementById('profileName');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (profilePhoto) profilePhoto.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User');
    if (profileName) profileName.textContent = user.displayName || 'User';
}

function checkUserSession() {
    const storedUser = localStorage.getItem('amplifyUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserProfileUI(currentUser);
    }
}

// Phone OTP Functions
function sendOTP() {
    const countryCode = document.getElementById('countryCode').value;
    const phone = document.getElementById('phoneLoginInput').value;
    
    if (!phone || phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    otpPhoneNumber = countryCode + phone;
    
    // Generate 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, this would send via SMS API (Twilio, Firebase Auth, etc.)
    console.log('OTP sent to:', otpPhoneNumber, 'OTP:', generatedOTP);
    
    // Show OTP verification UI
    document.getElementById('otpVerification').style.display = 'block';
    document.querySelector('.phone-login-form').style.display = 'none';
    
    // Focus first OTP input
    setTimeout(() => {
        document.querySelector('.otp-input').focus();
    }, 100);
}

function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let enteredOTP = '';
    
    otpInputs.forEach(input => {
        enteredOTP += input.value;
    });
    
    if (enteredOTP.length !== 6) {
        alert('Please enter the complete 6-digit OTP');
        return;
    }
    
    if (!confirmationResult) {
        alert('OTP session expired. Please request a new OTP.');
        resetOTPForm();
        return;
    }
    
    // Verify OTP with Firebase
    confirmationResult.confirm(enteredOTP)
        .then((result) => {
            const user = result.user;
            currentUser = {
                displayName: user.displayName || 'Phone User',
                email: user.email || '',
                photoURL: user.photoURL || 'https://ui-avatars.com/api/?name=Phone+User&background=d4af37&color=fff',
                uid: user.uid,
                phone: user.phoneNumber,
                loginMethod: 'phone'
            };
            
            handleSuccessfulLogin(currentUser);
            resetOTPForm();
        })
        .catch((error) => {
            console.error('OTP Verification Error:', error);
            
            if (error.code === 'auth/invalid-verification-code') {
                alert('Invalid OTP. Please try again.');
                otpInputs.forEach(input => input.value = '');
                otpInputs[0].focus();
            } else if (error.code === 'auth/code-expired') {
                alert('OTP expired. Please request a new OTP.');
                resetOTPForm();
            } else {
                alert('Verification failed: ' + error.message);
            }
        });
}

function resendOTP() {
    // Clear previous confirmation result
    confirmationResult = null;
    sendOTP();
}

function resetOTPForm() {
    document.getElementById('otpVerification').style.display = 'none';
    document.querySelector('.phone-login-form').style.display = 'block';
    document.getElementById('phoneLoginInput').value = '';
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => input.value = '');
    confirmationResult = null;
}

// Initialize reCAPTCHA for Firebase Phone Auth
function initializeRecaptcha() {
    if (!firebaseAuth) return;
    
    // Create invisible reCAPTCHA verifier
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('phoneMethod', {
        'size': 'invisible',
        'callback': function(response) {
            // reCAPTCHA solved, allow signInWithPhoneNumber
        }
    });
    
    // Render the reCAPTCHA
    window.recaptchaVerifier.render().then(function(widgetId) {
        window.recaptchaWidgetId = widgetId;
    });
}

// OTP Input Handling
function initializeOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, 6);
            pastedData.split('').forEach((char, i) => {
                if (otpInputs[i]) {
                    otpInputs[i].value = char;
                }
            });
            if (pastedData.length < 6) {
                otpInputs[pastedData.length].focus();
            }
        });
    });
}

// User Profile Functions
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('active');
}

function showMyProfile() {
    toggleProfileDropdown();
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Populate profile data
    document.getElementById('profileLargePhoto').src = currentUser.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.displayName || 'User');
    document.getElementById('profileLargeName').textContent = currentUser.displayName || 'User';
    document.getElementById('profileLargeEmail').textContent = currentUser.email || currentUser.phone || '';
}

function showMyBookings() {
    toggleProfileDropdown();
    const modal = document.getElementById('bookingsModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Load user bookings
    const bookingsList = document.getElementById('userBookingsList');
    const allBookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
    const userBookings = allBookings.filter(booking => 
        booking.userId === currentUser.uid || 
        booking.email === currentUser.email ||
        booking.phone === currentUser.phone
    );
    
    if (userBookings.length === 0) {
        bookingsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No bookings found.</p>';
    } else {
        bookingsList.innerHTML = userBookings.map(booking => `
            <div class="user-booking-item">
                <h4>${booking.name}</h4>
                <div class="user-booking-details">
                    <div class="user-booking-detail">
                        <label>Service</label>
                        <span>${booking.editingType || 'N/A'}</span>
                    </div>
                    <div class="user-booking-detail">
                        <label>Date</label>
                        <span>${new Date(booking.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div class="user-booking-detail">
                        <label>Email</label>
                        <span>${booking.email}</span>
                    </div>
                    <div class="user-booking-detail">
                        <label>Phone</label>
                        <span>${booking.phone}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function handleLogout() {
    toggleProfileDropdown();
    
    // Clear user session
    localStorage.removeItem('amplifyUser');
    currentUser = null;
    googleUser = null;
    
    // Update UI
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('userProfile').style.display = 'none';
    
    // Show success message
    showSuccessModal('You have been logged out successfully.');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeBookingsModal() {
    const modal = document.getElementById('bookingsModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    const profileContainer = document.querySelector('.profile-container');
    const dropdown = document.getElementById('profileDropdown');
    
    if (profileContainer && !profileContainer.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Premium Contact Widget Toggle
function toggleContactWidget() {
    const panel = document.getElementById('contactPanel');
    panel.classList.toggle('active');
}

// Close contact widget when clicking outside
window.addEventListener('click', (e) => {
    const widget = document.getElementById('premiumContactWidget');
    const panel = document.getElementById('contactPanel');
    
    if (widget && !widget.contains(e.target)) {
        panel.classList.remove('active');
    }
});

// Create Admin Notification
function createAdminNotification(type, userData) {
    const notifications = JSON.parse(localStorage.getItem('amplifyNotifications') || '[]');
    
    let notificationBody = '';
    
    if (type === 'New Google User Login') {
        notificationBody = `
            User Name: ${userData.displayName}
            Gmail Address: ${userData.email}
            Login Method: Google
            Login Time: ${new Date(userData.loginDate).toLocaleString()}
            Profile Photo: ${userData.photoURL}
        `;
    } else if (type === 'New Phone User Login') {
        notificationBody = `
            User Name: ${userData.displayName}
            Phone Number: ${userData.phone}
            Login Method: Phone OTP
            Login Time: ${new Date(userData.loginDate).toLocaleString()}
        `;
    } else if (type === 'New Booking Received') {
        notificationBody = `
            Name: ${userData.name}
            Email: ${userData.email}
            Phone: ${userData.phone}
            Address: ${userData.address}
            Service Type: ${userData.editingType || 'Not specified'}
            Booking Time: ${new Date(userData.timestamp).toLocaleString()}
            Login Method: ${userData.loginMethod || 'Not Logged In'}
            Sender Info: ${userData.senderInfo || 'Not available'}
            Email Status: ${userData.emailSent ? '✅ Sent Successfully' : '⏳ Pending'}
        `;
    } else if (type === 'Booking Completed') {
        notificationBody = `
            Booking ID: ${userData.id}
            Name: ${userData.name}
            Email: ${userData.email}
            Phone: ${userData.phone}
            Service Type: ${userData.editingType || 'Not specified'}
            Booking Time: ${new Date(userData.timestamp).toLocaleString()}
            Completion Time: ${new Date(userData.completionTimestamp).toLocaleString()}
        `;
    } else if (type === 'Email Delivery Failed') {
        notificationBody = `
            Booking ID: ${userData.bookingId}
            Error: ${userData.error}
            Name: ${userData.bookingData.name}
            Email: ${userData.bookingData.email}
            Phone: ${userData.bookingData.phone}
            Please retry sending the email manually.
        `;
    }
    
    const notification = {
        id: Date.now(),
        type: type,
        body: notificationBody,
        userData: userData,
        timestamp: new Date().toISOString()
    };
    
    notifications.push(notification);
    localStorage.setItem('amplifyNotifications', JSON.stringify(notifications));
}
