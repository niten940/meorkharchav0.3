// Authentication Manager - Handles user authentication and authorization
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize demo users if not exists
        if (!localStorage.getItem('users')) {
            this.initializeDemoUsers();
        }
        
        // Check authentication on page load
        this.checkAuthentication();
    }

    // initializeDemoUsers() {
    //     const demoUsers = [
    //         {
    //             id: 1,
    //             name: 'Admin User',
    //             email: 'admin@merokharcha.com',
    //             password: 'admin123',
    //             role: 'admin',
    //             department: 'Management'
    //         },
    //         {
    //             id: 2,
    //             name: 'Employee User',
    //             email: 'employee@merokharcha.com',
    //             password: 'emp123',
    //             role: 'employee',
    //             department: 'Marketing'
    //         }
    //     ];

    //     localStorage.setItem('users', JSON.stringify(demoUsers));
    // }

    checkAuthentication() {
        const currentUser = this.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // If not logged in and not on login page, redirect to login
        if (!currentUser && currentPage !== 'index.html') {
            window.location.href = 'index.html';
            return;
        }
        
        // If logged in and on login page, redirect to home
        if (currentUser && currentPage === 'index.html') {
            window.location.href = 'home.html';
            return;
        }
        
        // If logged in, setup the page for the user role
        if (currentUser) {
            this.setupUserInterface(currentUser);
        }
    }

    setupUserInterface(user) {
        // Add role class to body
        document.body.className = user.role;
        
        // Update user welcome message
        const userWelcome = document.getElementById('userWelcome');
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${user.name} (${user.role})`;
        }
        
        // Hide/show elements based on role
        if (user.role === 'employee') {
            this.setupEmployeeInterface(user);
        } else if (user.role === 'admin') {
            this.setupAdminInterface(user);
        }
    }

    setupEmployeeInterface(user) {
        // Pre-fill department and employee name in forms
        const departmentField = document.getElementById('department');
        const employeeNameField = document.getElementById('employeeName');
        
        if (departmentField) {
            departmentField.value = user.department;
            departmentField.disabled = true;
        }
        
        if (employeeNameField) {
            employeeNameField.value = user.name;
            employeeNameField.disabled = true;
        }
    }

    setupAdminInterface(user) {
        // Admin has access to all features
        // No special setup needed as admin elements are shown by default
    }

    registerUser(userData) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        userData.id = Date.now();
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        
        return userData;
    }

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    logoutUser() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        switch (permission) {
            case 'admin':
                return user.role === 'admin';
            case 'budget':
                return user.role === 'admin';
            case 'all_departments':
                return user.role === 'admin';
            default:
                return true;
        }
    }

    getUserDepartment() {
        const user = this.getCurrentUser();
        return user ? user.department : null;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    isEmployee() {
        const user = this.getCurrentUser();
        return user && user.role === 'employee';
    }
}

// Create global instance
window.authManager = new AuthManager();

// Global logout function
function logout() {
    authManager.logoutUser();
}