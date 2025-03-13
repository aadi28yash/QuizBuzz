class PopupManager {
    constructor() {
        this.overlay = null;
        this.popup = null;
        this.title = null;
        this.message = null;
        this.button = null;
        this.countdownInterval = null;
        this.isActive = false;
        this.callback = null;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeElements());
        } else {
            this.initializeElements();
        }
    }

    initializeElements() {
        this.overlay = document.getElementById('popupOverlay');
        this.popup = document.querySelector('.popup');
        this.title = document.getElementById('popupTitle');
        this.message = document.getElementById('popupMessage');
        this.button = document.querySelector('.popup-close');
        
        if (this.popup && this.overlay) {
            this.initializeEventListeners();
        }
    }

    initializeEventListeners() {
        this.popup.addEventListener('click', (e) => e.stopPropagation());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                e.preventDefault();
            }
        });
        
        this.overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    startCountdown(callback) {
        if (!this.button) return;
        
        this.button.disabled = true;
        let secondsLeft = 3;
        
        // Clear any existing interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Set initial text
        this.button.textContent = `Please wait (${secondsLeft})`;
        
        // Start countdown
        this.countdownInterval = setInterval(() => {
            secondsLeft--;
            
            if (secondsLeft > 0) {
                this.button.textContent = `Please wait (${secondsLeft})`;
            } else {
                clearInterval(this.countdownInterval);
                this.button.disabled = false;
                this.button.textContent = 'OK';
                
                // Add click handler for callback
                if (callback) {
                    this.button.onclick = () => {
                        this.close();
                        callback();
                    };
                } else {
                    this.button.onclick = () => this.close();
                }
            }
        }, 1000);
    }

    show(title, message) {
        if (!this.overlay || !this.popup) {
            this.initializeElements();
        }
        
        this.isActive = true;
        
        if (this.title) this.title.innerHTML = title;
        if (this.message) this.message.textContent = message;
        
        if (this.overlay) {
            this.overlay.style.display = 'block';
            // Don't start countdown for redirecting messages
            if (!message.includes('Redirecting')) {
                this.startCountdown();
            }
        }
    }

    close() {
        if (!this.button || this.button.disabled) return;
        
        this.isActive = false;
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
        if (this.button) {
            this.button.textContent = 'OK';
            this.button.disabled = false;
        }
    }
}

// Create singleton instance
const popupManager = new PopupManager();

// Global functions to use in HTML
function showPopup(title, message, callback = null) {
    let icon = '';
    if (title.toLowerCase().includes('error')) {
        icon = '<i class="fas fa-exclamation-circle" style="color: #dc3545;"></i> ';
    } else if (title.toLowerCase().includes('success')) {
        icon = '<i class="fas fa-check-circle" style="color: #28a745;"></i> ';
    } else if (title.toLowerCase().includes('warning')) {
        icon = '<i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i> ';
    } else {
        icon = '<i class="fas fa-info-circle" style="color: #17a2b8;"></i> ';
    }
    
    popupManager.show(icon + title, message, callback);
}

function closePopup() {
    const popup = document.getElementById('popupOverlay');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Add this function to initialize popup
function initializePopup() {
    const closeBtn = document.getElementById('popupCloseBtn');
    if (closeBtn && !closeBtn.hasAttribute('data-initialized')) {
        closeBtn.onclick = closePopup;
        closeBtn.setAttribute('data-initialized', 'true');
    }
}

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', initializePopup); 