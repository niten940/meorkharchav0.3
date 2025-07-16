// Add expenses page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!authManager.getCurrentUser()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set today's date as default
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Handle form submission
    document.getElementById('expenseForm').addEventListener('submit', handleSubmit);
    
    // Setup form based on user role
    setupFormForUser();
});

function setupFormForUser() {
    const user = authManager.getCurrentUser();
    
    if (user.role === 'employee') {
        // Pre-fill and disable department and employee name for employees
        const departmentField = document.getElementById('department');
        const employeeNameField = document.getElementById('employeeName');
        
        if (departmentField) {
            departmentField.value = user.department;
            departmentField.disabled = true;
            departmentField.required = false; // Remove required since it's auto-filled
        }
        
        if (employeeNameField) {
            employeeNameField.value = user.name;
            employeeNameField.disabled = true;
            employeeNameField.required = false; // Remove required since it's auto-filled
        }
    }
}

function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const user = authManager.getCurrentUser();
    
    const expense = {
        category: formData.get('category'),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date'),
        department: user.role === 'employee' ? user.department : formData.get('department'),
        employeeName: user.role === 'employee' ? user.name : formData.get('employeeName'),
        notes: formData.get('notes') || ''
    };

    try {
        dataManager.addExpense(expense);
        showSuccessMessage('Expense added successfully!');
        clearForm();
    } catch (error) {
        showErrorMessage('Error adding expense: ' + error.message);
    }
}

function clearForm() {
    document.getElementById('expenseForm').reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Re-setup form for user after clearing
    setTimeout(setupFormForUser, 100);
}

function showSuccessMessage(message) {
    // Remove existing message
    const existing = document.querySelector('.success-message');
    if (existing) {
        existing.remove();
    }

    // Create and show new message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message show';
    messageDiv.textContent = message;
    
    const form = document.querySelector('.expense-form-container');
    form.insertBefore(messageDiv, form.firstChild);

    // Auto hide after 3 seconds
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

function showErrorMessage(message) {
    alert(message); // Simple error handling for now
}