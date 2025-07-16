// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle login form
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    
    // Handle register form
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
});

function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const user = authManager.loginUser(email, password);
        showSuccessMessage('Login successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    } catch (error) {
        showErrorMessage(error.message);
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
        showErrorMessage('Passwords do not match');
        return;
    }

    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: password,
        role: formData.get('role'),
        department: formData.get('department')
    };

    try {
        authManager.registerUser(userData);
        showSuccessMessage('Registration successful! You can now login.');
        setTimeout(() => {
            showLoginForm();
            document.getElementById('registerFormElement').reset();
        }, 1500);
    } catch (error) {
        showErrorMessage(error.message);
    }
}

function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    clearMessages();
}

function showRegisterForm() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    clearMessages();
}

function showSuccessMessage(message) {
    clearMessages();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message show';
    messageDiv.textContent = message;
    
    const authContainer = document.querySelector('.login-card');
    authContainer.insertBefore(messageDiv, authContainer.firstChild);
}

function showErrorMessage(message) {
    clearMessages();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message show';
    messageDiv.textContent = message;
    
    const authContainer = document.querySelector('.login-card');
    authContainer.insertBefore(messageDiv, authContainer.firstChild);
}

function clearMessages() {
    const existing = document.querySelectorAll('.success-message, .error-message');
    existing.forEach(el => el.remove());
}