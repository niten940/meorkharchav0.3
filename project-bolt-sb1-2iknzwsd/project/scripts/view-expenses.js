// View expenses page functionality
let filteredExpenses = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!authManager.getCurrentUser()) {
        window.location.href = 'index.html';
        return;
    }
    
    loadExpenses();
    populateYearFilter();
});

function loadExpenses() {
    if (authManager.isAdmin()) {
        filteredExpenses = dataManager.getExpenses();
    } else {
        // Employee sees only their department's expenses
        const userDept = authManager.getUserDepartment();
        filteredExpenses = dataManager.getExpensesByDepartment(userDept);
    }
    displayExpenses(filteredExpenses);
}

function displayExpenses(expenses) {
    const container = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        container.innerHTML = '<div class="no-expenses">No expenses found</div>';
        return;
    }

    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = expenses.map((expense, index) => `
        <div class="expense-row">
            <div class="expense-cell" data-label="S.N.">${index + 1}</div>
            <div class="expense-cell" data-label="Details">
                <div class="expense-details">
                    <div class="expense-title">${expense.category}</div>
                    <div class="expense-description">${expense.notes || 'No description'}</div>
                </div>
            </div>
            <div class="expense-cell" data-label="Type">${getCategoryType(expense.category)}</div>
            <div class="expense-cell expense-amount" data-label="Amount">${dataManager.formatCurrency(expense.amount)}</div>
            <div class="expense-cell" data-label="Date">${dataManager.formatDate(expense.date)}</div>
            ${authManager.isAdmin() ? `
                <div class="expense-cell" data-label="Department">${expense.department}</div>
                <div class="expense-cell" data-label="Employee">${expense.employeeName}</div>
            ` : ''}
        </div>
    `).join('');
}

function getCategoryType(category) {
    const typeMapping = {
        'Office Supplies': 'Office',
        'Business Lunch': 'Food',
        'Travel Expenses': 'Travel',
        'Client Dinner': 'Food',
        'Food Catering': 'Food',
        'Accommodation': 'Accommodation',
        'Transportation': 'Transport',
        'Equipment': 'Office'
    };
    return typeMapping[category] || 'Other';
}

function populateYearFilter() {
    const years = dataManager.getAvailableYears();
    const yearFilter = document.getElementById('yearFilter');
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

//Apply filters based on selected year, month, and department
function applyFilters() {
    const year = document.getElementById('yearFilter').value;
    const month = document.getElementById('monthFilter').value;
    const department = document.getElementById('departmentFilter') ? document.getElementById('departmentFilter').value : '';

    const filters = { year, month };
    
    // Add department filter for admin
    if (authManager.isAdmin() && department) {
        filters.department = department;
    }
    
    // Get base expenses based on user role
    let baseExpenses;
    if (authManager.isAdmin()) {
        baseExpenses = dataManager.getExpenses();
    } else {
        baseExpenses = dataManager.getExpensesByDepartment(authManager.getUserDepartment());
    }
    
    // Apply filters
    filteredExpenses = baseExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const matchYear = !filters.year || expenseDate.getFullYear() === parseInt(filters.year);
        const matchMonth = !filters.month || (expenseDate.getMonth() + 1) === parseInt(filters.month);
        const matchDepartment = !filters.department || expense.department === filters.department;
        
        return matchYear && matchMonth && matchDepartment;
    });
    
    displayExpenses(filteredExpenses);
}

//clear all filters and reload original expenses
function clearFilters() {
    // Reset all filter inputs
    document.getElementById('yearFilter').value = '';
    document.getElementById('monthFilter').value = '';
    
    // Only reset department filter if it exists (for admin users)
    if (document.getElementById('departmentFilter')) {
        document.getElementById('departmentFilter').value = '';
    }
    
    // Reload the original expenses
    loadExpenses();
}