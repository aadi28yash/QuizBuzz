// Create a new file utils.js
function showLoading() {
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideLoading() {
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Add error handling utility
function handleError(error) {
    hideLoading();
    showPopup('Error', error.message || 'An unexpected error occurred');
}

// Add success message utility
function showSuccess(message, timer = 2000) {
    return Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        timer: timer,
        timerProgressBar: true,
        showConfirmButton: false
    });
}

// Add data validation utility
function validateInput(data, rules) {
    const errors = [];
    
    for (const [field, value] of Object.entries(data)) {
        if (rules[field]) {
            if (rules[field].required && !value) {
                errors.push(`${field} is required`);
            }
            if (rules[field].minLength && value.length < rules[field].minLength) {
                errors.push(`${field} must be at least ${rules[field].minLength} characters`);
            }
            if (rules[field].pattern && !rules[field].pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
        }
    }
    
    return errors;
}

// Add local storage wrapper
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    }
}; 

// Error message popup
function showError(message) {
    return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message
    });
}

// Warning/Confirmation popup
function showConfirm(title, text) {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    });
}

// Info popup
function showInfo(title, text) {
    return Swal.fire({
        icon: 'info',
        title: title,
        text: text
    });
}

// Score popup
function showScore(score, total) {
    const percentage = Math.round((score / total) * 100);
    return Swal.fire({
        icon: 'success',
        title: 'Quiz Completed!',
        html: `
            <h3>Your Score: ${score}/${total}</h3>
            <h4>${percentage}%</h4>
        `,
        confirmButtonText: 'Back to Dashboard'
    });
}