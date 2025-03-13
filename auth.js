// Login function
function login() {
    try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        if (!username || !password || !role) {
            showError('All fields are required!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role
        );

        if (!user) {
            showError('Invalid credentials! Please check your username, password, and role.');
            return;
        }

        // Set current user with session data
        const session = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            isAuthenticated: true
        };
        localStorage.setItem('currentUser', JSON.stringify(session));

        // Show success message and redirect based on role
        Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: `Welcome back, ${user.name}!`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            if (role === 'teacher') {
                window.location.href = 'teacher_dashboard.html';
            } else {
                window.location.href = 'student_dashboard.html';
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred during login. Please try again.');
    }
}

// Register function
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;

    // Validate inputs
    if (!username || !password || !name || !role) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'All fields are required!'
        });
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if username already exists
    if (users.some(user => user.username === username)) {
        Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'Username already exists!'
        });
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username,
        password,
        name,
        role
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Show success message and redirect
    Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Please login to continue',
        timer: 2000,
        showConfirmButton: false
    }).then(() => {
        window.location.replace('login.html');
    });
}

// Logout function
function logout() {
    showConfirm('Logout', 'Are you sure you want to logout?')
    .then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

// Check authentication
function checkAuth(requiredRole) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAuthenticated || currentUser.role !== requiredRole) {
        showError(`Please login as a ${requiredRole} to access this page.`).then(() => {
            window.location.href = 'login.html';
        });
        return false;
    }
    return true;
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('teacher_dashboard')) {
        checkAuth('teacher');
    } else if (currentPath.includes('student_dashboard')) {
        checkAuth('student');
    }
});

// Initialize users if not exists
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('users')) {
        const initialUsers = [
            {
                id: '1',
                name: 'Demo Teacher',
                username: 'teacher',
                password: 'teacher123',
                role: 'teacher'
            },
            {
                id: '2',
                name: 'Demo Student',
                username: 'student',
                password: 'student123',
                role: 'student'
            }
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
});

// Helper functions for alerts
function showError(message) {
    return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message
    });
}

function showSuccess(message, timer = 1500) {
    return Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        timer: timer,
        showConfirmButton: false
    });
}

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
