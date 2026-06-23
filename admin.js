// Admin Credentials
const ADMIN_EMAIL = 'srijanamplify03@gmail.com';
const ADMIN_PASSWORD = 'tgtushar07';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminSession();
    updateDashboardStats();
});

// Clear all localStorage for fresh production start (manual function for admin use)
function clearAllLocalStorageForFreshStart() {
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
    
    console.log('All localStorage data cleared for fresh production start');
    updateDashboardStats();
    loadGalleryItems();
    loadBookings();
    loadNotifications();
    loadPlaceholderItems();
    
    showAdminSuccessModal('All data cleared successfully! The system is now in a fresh state.');
}

// Check if admin is already logged in
function checkAdminSession() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        updateDashboardStats();
        loadGalleryItems();
        loadBookings();
        loadNotifications();
        loadPlaceholderItems();
    }
}

// Handle Admin Login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        errorElement.textContent = '';
        updateDashboardStats();
        loadGalleryItems();
        loadBookings();
        loadNotifications();
        loadPlaceholderItems();
        showAdminSuccessModal('Login successful! Welcome to the Admin Panel.');
    } else {
        errorElement.textContent = 'Invalid email or password. Please try again.';
    }
}

// Handle Admin Logout
function handleAdminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminLoginSection').style.display = 'flex';
    document.getElementById('adminLoginForm').reset();
}

// Show Section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName + 'Section').classList.add('active');
    
    // Add active class to clicked button
    event.target.closest('.nav-btn').classList.add('active');
    
    // Load data based on section
    if (sectionName === 'dashboard') {
        updateDashboardStats();
    } else if (sectionName === 'gallery') {
        loadGalleryItems();
    } else if (sectionName === 'placeholderGallery') {
        loadPlaceholderItems();
    } else if (sectionName === 'bookings') {
        loadBookings();
    } else if (sectionName === 'notifications') {
        loadNotifications();
    }
}

// Update Dashboard Stats
function updateDashboardStats() {
    const galleryContent = JSON.parse(localStorage.getItem('amplifyGallery') || '[]');
    const bookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
    const notifications = JSON.parse(localStorage.getItem('amplifyNotifications') || '[]');
    
    const photos = galleryContent.filter(item => item.type === 'photo').length;
    const videos = galleryContent.filter(item => item.type === 'video').length;
    
    document.getElementById('totalPhotos').textContent = photos;
    document.getElementById('totalVideos').textContent = videos;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('totalNotifications').textContent = notifications.length;
}

// Update File Name Display
function updateFileName() {
    const fileInput = document.getElementById('contentFile');
    const fileName = document.getElementById('fileName');
    
    if (fileInput.files.length > 0) {
        fileName.textContent = fileInput.files[0].name;
    } else {
        fileName.textContent = 'No file chosen';
    }
}

// Handle Content Upload
function handleUpload(event) {
    event.preventDefault();
    
    const name = document.getElementById('contentName').value;
    const type = document.getElementById('contentType').value;
    const fileInput = document.getElementById('contentFile');
    const urlInput = document.getElementById('contentUrl').value;
    
    let contentUrl = urlInput;
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            contentUrl = e.target.result;
            saveContent(name, type, contentUrl);
        };
        
        reader.readAsDataURL(file);
    } else if (contentUrl) {
        saveContent(name, type, contentUrl);
    } else {
        alert('Please either choose a file or enter a URL.');
        return;
    }
}

function saveContent(name, type, url) {
    const galleryContent = JSON.parse(localStorage.getItem('amplifyGallery') || '[]');
    
    const newContent = {
        id: Date.now(),
        name: name,
        type: type,
        url: url,
        timestamp: new Date().toISOString()
    };
    
    galleryContent.push(newContent);
    localStorage.setItem('amplifyGallery', JSON.stringify(galleryContent));
    
    // Reset form
    document.getElementById('uploadForm').reset();
    document.getElementById('fileName').textContent = 'No file chosen';
    
    // Update stats and gallery
    updateDashboardStats();
    loadGalleryItems();
    
    showAdminSuccessModal('Content uploaded successfully!');
}

// Load Gallery Items
function loadGalleryItems(filter = 'all') {
    const galleryContainer = document.getElementById('adminGalleryItems');
    const galleryContent = JSON.parse(localStorage.getItem('amplifyGallery') || '[]');
    
    let filteredContent = galleryContent;
    if (filter !== 'all') {
        filteredContent = galleryContent.filter(item => item.type === filter);
    }
    
    if (filteredContent.length === 0) {
        galleryContainer.innerHTML = '<p class="no-data">No content uploaded yet.</p>';
        return;
    }
    
    galleryContainer.innerHTML = '';
    
    filteredContent.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'gallery-item-card';
        
        let mediaElement;
        if (item.type === 'video') {
            mediaElement = `<video controls><source src="${item.url}" type="video/mp4">Your browser does not support the video tag.</video>`;
        } else {
            mediaElement = `<img src="${item.url}" alt="${item.name}">`;
        }
        
        itemCard.innerHTML = `
            ${mediaElement}
            <div class="gallery-item-info">
                <h4>${item.name}</h4>
                <p>Type: ${item.type === 'video' ? 'Video' : 'Photo'}</p>
                <div class="gallery-item-actions">
                    <button class="delete-btn" onclick="deleteGalleryItem(${item.id})">Delete</button>
                </div>
            </div>
        `;
        
        galleryContainer.appendChild(itemCard);
    });
}

// Filter Gallery
function filterGallery(filter) {
    // Update active button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadGalleryItems(filter);
}

// Delete Gallery Item
function deleteGalleryItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        const galleryContent = JSON.parse(localStorage.getItem('amplifyGallery') || '[]');
        const updatedContent = galleryContent.filter(item => item.id !== id);
        localStorage.setItem('amplifyGallery', JSON.stringify(updatedContent));
        
        updateDashboardStats();
        loadGalleryItems();
        
        showAdminSuccessModal('Item deleted successfully!');
    }
}

// Load Bookings
function loadBookings() {
    const activeBookingsContainer = document.getElementById('activeBookingsList');
    const completedBookingsContainer = document.getElementById('completedBookingsList');
    const bookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
    
    // Separate active and completed bookings
    const activeBookings = bookings.filter(booking => !booking.completed);
    const completedBookings = bookings.filter(booking => booking.completed);
    
    // Load Active Bookings
    if (activeBookings.length === 0) {
        activeBookingsContainer.innerHTML = '<p class="no-data">No active bookings.</p>';
    } else {
        activeBookingsContainer.innerHTML = '';
        activeBookings.forEach(booking => {
            const bookingItem = createBookingCard(booking, false);
            activeBookingsContainer.appendChild(bookingItem);
        });
    }
    
    // Load Completed Bookings
    if (completedBookings.length === 0) {
        completedBookingsContainer.innerHTML = '<p class="no-data">No completed tasks yet.</p>';
    } else {
        completedBookingsContainer.innerHTML = '';
        completedBookings.forEach(booking => {
            const bookingItem = createBookingCard(booking, true);
            completedBookingsContainer.appendChild(bookingItem);
        });
    }
}

// Create Booking Card
function createBookingCard(booking, isCompleted) {
    const bookingItem = document.createElement('div');
    bookingItem.className = 'booking-item';
    
    const timestamp = new Date(booking.timestamp).toLocaleString();
    const completionTimestamp = booking.completionTimestamp ? new Date(booking.completionTimestamp).toLocaleString() : '';
    
    let statusBadge = isCompleted 
        ? '<span class="status-badge completed">Completed ✅</span>'
        : '<span class="status-badge pending">Pending ⏳</span>';
    
    // Email status badge
    let emailStatusBadge = '';
    if (booking.emailSent === true) {
        emailStatusBadge = '<span class="email-status-badge success">Email Sent ✅</span>';
    } else if (booking.emailSent === false && booking.emailError) {
        emailStatusBadge = '<span class="email-status-badge failed">Email Failed ❌</span>';
    } else {
        emailStatusBadge = '<span class="email-status-badge pending">Email Pending ⏳</span>';
    }
    
    let actionButton = '';
    if (!isCompleted) {
        actionButton = `
            <button class="task-complete-btn" onclick="showCompletionConfirmation(${booking.id})">
                Task Complete ✅
            </button>
        `;
    }
    
    // Retry email button if email failed
    let retryEmailButton = '';
    if (booking.emailSent === false && booking.emailError) {
        retryEmailButton = `
            <button class="retry-email-btn" onclick="retrySendEmail(${booking.id})">
                Retry Email 📧
            </button>
        `;
    }
    
    bookingItem.innerHTML = `
        <div class="booking-header">
            <h4>${booking.name}</h4>
            ${statusBadge}
            ${emailStatusBadge}
        </div>
        <div class="booking-details">
            <div class="booking-detail">
                <label>Email</label>
                <span>${booking.email}</span>
            </div>
            <div class="booking-detail">
                <label>Phone</label>
                <span>${booking.phone}</span>
            </div>
            <div class="booking-detail">
                <label>Address</label>
                <span>${booking.address}</span>
            </div>
            <div class="booking-detail">
                <label>Editing Type</label>
                <span>${booking.editingType || 'Not specified'}</span>
            </div>
            <div class="booking-detail">
                <label>Login Method</label>
                <span>${booking.loginMethod || 'Not Logged In'}</span>
            </div>
            <div class="booking-detail">
                <label>Sender Info</label>
                <span>${booking.senderInfo || 'Not available'}</span>
            </div>
        </div>
        <div class="booking-footer">
            <p class="booking-timestamp">Booking Date: ${timestamp}</p>
            ${isCompleted ? `<p class="completion-timestamp">Completion Date: ${completionTimestamp}</p>` : ''}
            ${booking.emailError ? `<p class="email-error">Email Error: ${booking.emailError}</p>` : ''}
            ${actionButton}
            ${retryEmailButton}
        </div>
    `;
    
    return bookingItem;
}

// Task Completion Functions
let currentBookingId = null;

function showCompletionConfirmation(bookingId) {
    currentBookingId = bookingId;
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'block';
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
    currentBookingId = null;
}

function confirmTaskCompletion() {
    if (currentBookingId === null) return;
    
    const bookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
    const bookingIndex = bookings.findIndex(booking => booking.id === currentBookingId);
    
    if (bookingIndex !== -1) {
        // Mark as completed
        bookings[bookingIndex].completed = true;
        bookings[bookingIndex].completionTimestamp = new Date().toISOString();
        
        // Save updated bookings
        localStorage.setItem('amplifyBookings', JSON.stringify(bookings));
        
        // Create admin notification for booking completion
        createAdminBookingCompletionNotification(bookings[bookingIndex]);
        
        // Reload bookings
        loadBookings();
        
        // Show success message
        showAdminSuccessModal('Task marked as completed successfully!');
    }
    
    closeConfirmationModal();
}

// Create Admin Notification for Booking Completion
function createAdminBookingCompletionNotification(bookingData) {
    const notifications = JSON.parse(localStorage.getItem('amplifyNotifications') || '[]');
    
    const notificationBody = `
        Booking ID: ${bookingData.id}
        Name: ${bookingData.name}
        Email: ${bookingData.email}
        Phone: ${bookingData.phone}
        Address: ${bookingData.address}
        Service Type: ${bookingData.editingType || 'Not specified'}
        Booking Time: ${new Date(bookingData.timestamp).toLocaleString()}
        Completion Time: ${new Date(bookingData.completionTimestamp).toLocaleString()}
    `;
    
    const notification = {
        id: Date.now(),
        type: 'Booking Completed',
        body: notificationBody,
        userData: bookingData,
        timestamp: new Date().toISOString()
    };
    
    notifications.push(notification);
    localStorage.setItem('amplifyNotifications', JSON.stringify(notifications));
}

// Retry Sending Email for Failed Email Deliveries
function retrySendEmail(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('amplifyBookings') || '[]');
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found');
        return;
    }
    
    // Check if emailjs is available in admin panel context
    if (typeof emailjs === 'undefined') {
        alert('EmailJS is not loaded. Please ensure the EmailJS library is included in the page.');
        return;
    }
    
    // Get EmailJS configuration from app.js (need to access these constants)
    // Since admin.js is separate, we'll need to load them from localStorage or define them
    const EMAILJS_SERVICE_ID = localStorage.getItem('emailjs_service_id') || 'YOUR_EMAILJS_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = localStorage.getItem('emailjs_template_id') || 'YOUR_EMAILJS_TEMPLATE_ID';
    const EMAILJS_PUBLIC_KEY = localStorage.getItem('emailjs_public_key') || 'YOUR_EMAILJS_PUBLIC_KEY';
    
    if (EMAILJS_SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID') {
        alert('EmailJS is not configured. Please configure EmailJS credentials in app.js and save them to localStorage.');
        return;
    }
    
    // Initialize EmailJS if not already initialized
    if (!emailjs.init) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    
    // Format email content
    const emailParams = {
        to_email: 'srijanamplify03@gmail.com',
        subject: 'New Booking Received - Amplify & CO.',
        booking_name: booking.name,
        booking_address: booking.address,
        booking_email: booking.email,
        booking_phone: booking.phone,
        editing_type: booking.editingType || 'Not specified',
        booking_timestamp: new Date(booking.timestamp).toLocaleString(),
        login_method: booking.loginMethod,
        sender_info: booking.senderInfo || 'Not available',
        booking_id: booking.id
    };
    
    // Send email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams)
        .then(function(response) {
            console.log('Email sent successfully:', response);
            
            // Update booking email status
            const bookingIndex = bookings.findIndex(b => b.id === bookingId);
            if (bookingIndex !== -1) {
                bookings[bookingIndex].emailSent = true;
                bookings[bookingIndex].emailError = null;
                localStorage.setItem('amplifyBookings', JSON.stringify(bookings));
            }
            
            // Reload bookings to show updated status
            loadBookings();
            
            showAdminSuccessModal('Email sent successfully!');
        })
        .catch(function(error) {
            console.error('Email sending failed:', error);
            alert('Failed to send email: ' + (error.text || error.message));
        });
}

// Load Notifications
function loadNotifications() {
    const notificationsContainer = document.getElementById('notificationsList');
    const notifications = JSON.parse(localStorage.getItem('amplifyNotifications') || '[]');
    
    if (notifications.length === 0) {
        notificationsContainer.innerHTML = '<p class="no-data">No notifications yet.</p>';
        return;
    }
    
    notificationsContainer.innerHTML = '';
    
    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        const timestamp = new Date(notification.timestamp).toLocaleString();
        
        // Set icon based on notification type
        let notificationIcon = '🔔';
        if (notification.type === 'New Google User Login') {
            notificationIcon = '🔵';
        } else if (notification.type === 'New Phone User Login') {
            notificationIcon = '📱';
        } else if (notification.type === 'New Booking Received') {
            notificationIcon = '📅';
        } else if (notification.type === 'Booking Completed') {
            notificationIcon = '✅';
        }
        
        notificationItem.innerHTML = `
            <div class="notification-header">
                <h4>${notificationIcon} ${notification.type}</h4>
                <span class="notification-timestamp">${timestamp}</span>
            </div>
            <div class="notification-content">${notification.body}</div>
            ${notification.userData ? `
                <div class="notification-actions">
                    <button class="view-details-btn" onclick="viewNotificationDetails(${notification.id})">View Details</button>
                </div>
            ` : ''}
        `;
        
        notificationsContainer.appendChild(notificationItem);
    });
}

// View Notification Details
function viewNotificationDetails(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('amplifyNotifications') || '[]');
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && notification.userData) {
        let detailsHTML = '<div class="notification-details-modal">';
        detailsHTML += '<h3>Notification Details</h3>';
        detailsHTML += '<div class="details-content">';
        
        for (const [key, value] of Object.entries(notification.userData)) {
            if (value && key !== 'id' && key !== 'completed') {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                detailsHTML += `<div class="detail-row"><label>${formattedKey}:</label><span>${value}</span></div>`;
            }
        }
        
        detailsHTML += '</div>';
        detailsHTML += '<button class="close-details-btn" onclick="closeNotificationDetails()">Close</button>';
        detailsHTML += '</div>';
        
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'notification-details-overlay';
        modal.innerHTML = detailsHTML;
        document.body.appendChild(modal);
        
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeNotificationDetails() {
    const modal = document.querySelector('.notification-details-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Admin Success Modal
function showAdminSuccessModal(message) {
    const modal = document.getElementById('adminSuccessModal');
    document.getElementById('adminSuccessMessage').textContent = message;
    modal.style.display = 'block';
}

function closeAdminSuccessModal() {
    const modal = document.getElementById('adminSuccessModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const successModal = document.getElementById('adminSuccessModal');
    const confirmationModal = document.getElementById('confirmationModal');
    
    if (event.target === successModal) {
        closeAdminSuccessModal();
    }
    
    if (event.target === confirmationModal) {
        closeConfirmationModal();
    }
}

// Placeholder Gallery Management
const placeholderItems = [
    { id: 'photo1', name: 'Photo 1', type: 'photo', index: 0 },
    { id: 'photo2', name: 'Photo 2', type: 'photo', index: 1 },
    { id: 'photo3', name: 'Photo 3', type: 'photo', index: 2 },
    { id: 'video1', name: 'Video 1', type: 'video', index: 3 },
    { id: 'video2', name: 'Video 2', type: 'video', index: 4 },
    { id: 'video3', name: 'Video 3', type: 'video', index: 5 }
];

function loadPlaceholderItems() {
    const container = document.getElementById('placeholderItems');
    const storedContent = JSON.parse(localStorage.getItem('amplifyPlaceholderGallery') || '{}');
    
    container.innerHTML = '';
    
    placeholderItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'placeholder-item-card';
        
        const currentContent = storedContent[item.id];
        let mediaElement;
        let fileName = 'No file uploaded';
        
        if (currentContent && currentContent.url) {
            fileName = currentContent.fileName || 'Uploaded file';
            if (item.type === 'video') {
                mediaElement = `<video controls><source src="${currentContent.url}" type="video/mp4">Your browser does not support the video tag.</video>`;
            } else {
                mediaElement = `<img src="${currentContent.url}" alt="${item.name}">`;
            }
        } else {
            mediaElement = `<div class="placeholder-preview"><span>${item.name}</span></div>`;
        }
        
        itemCard.innerHTML = `
            <div class="placeholder-preview-container">
                ${mediaElement}
            </div>
            <div class="placeholder-info">
                <h4>${item.name}</h4>
                <p class="file-name">${fileName}</p>
                <div class="placeholder-actions">
                    <input type="file" id="${item.id}FileInput" accept="${item.type === 'video' ? 'video/*' : 'image/*'}" style="display: none;" onchange="handlePlaceholderFileChange('${item.id}', this)">
                    <button class="change-btn" onclick="document.getElementById('${item.id}FileInput').click()">
                        <span>🔄</span> Change ${item.type === 'video' ? 'Video' : 'Photo'}
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(itemCard);
    });
}

function handlePlaceholderFileChange(itemId, fileInput) {
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const storedContent = JSON.parse(localStorage.getItem('amplifyPlaceholderGallery') || '{}');
        
        storedContent[itemId] = {
            url: e.target.result,
            fileName: file.name,
            type: file.type,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('amplifyPlaceholderGallery', JSON.stringify(storedContent));
        
        // Reload the placeholder items to show updated preview
        loadPlaceholderItems();
        
        showAdminSuccessModal(`${itemId.replace(/([A-Z])/g, ' $1').trim()} updated successfully!`);
    };
    
    reader.readAsDataURL(file);
}

// Initialize Material Lite components
document.addEventListener('DOMContentLoaded', function() {
    if (typeof componentHandler !== 'undefined') {
        componentHandler.upgradeAllRegistered();
    }
});
