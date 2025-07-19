// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!authManager.getCurrentUser()) {
        window.location.href = 'index.html';
        return;
    }
    
    loadRecentExpenses();
    
    if (authManager.isAdmin()) {
        loadBudgetStatus();
    } else {
        loadEmployeeDashboard();
    }
});

function loadRecentExpenses() {
    let recentExpenses;
    
    if (authManager.isAdmin()) {
        recentExpenses = dataManager.getRecentExpenses();
    } else {
        // Employee sees only their department's expenses
        const userDept = authManager.getUserDepartment();
        recentExpenses = dataManager.getRecentExpensesByDepartment(userDept);
    }
    
    const container = document.getElementById('recentExpensesList');
    
    if (recentExpenses.length === 0) {
        container.innerHTML = '<div class="no-expenses">No recent expenses found</div>';
        return;
    }

    container.innerHTML = recentExpenses.map(expense => `
        <div class="expense-row">
            <div class="expense-cell" data-label="Type">${expense.category}</div>
            <div class="expense-cell" data-label="Employee">${expense.employeeName}</div>
            <div class="expense-cell" data-label="Department">${expense.department}</div>
            <div class="expense-cell expense-amount" data-label="Amount">${dataManager.formatCurrency(expense.amount)}</div>
        </div>
    `).join('');
}

function loadBudgetStatus() {
    const budgetStatus = dataManager.getBudgetStatus();
    const container = document.getElementById('budgetList');
    
    if (Object.keys(budgetStatus).length === 0) {
        container.innerHTML = '<div class="no-budget">No budget information available</div>';
        return;
    }

    container.innerHTML = Object.entries(budgetStatus).map(([department, status]) => {
        const percentage = Math.min(status.percentage, 100);
        const remaining = status.remaining;
        const remainingPercentage = Math.max(100 - status.percentage, 0);
        
        return `
            <div class="budget-item">
                <div class="budget-header">
                    <div class="budget-department">${department}</div>
                    <div class="budget-amounts">
                        ${dataManager.formatCurrency(remaining)} / ${dataManager.formatCurrency(status.total)}
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="budget-remaining-text">
                    ${remainingPercentage.toFixed(1)}% remaining
                </div>
            </div>
        `;
    }).join('');
}

function loadEmployeeDashboard() {
    const userDept = authManager.getUserDepartment();
    const container = document.getElementById('departmentExpenses');
    
    if (!container) return;
    
    // Get department statistics
    const departmentStats = dataManager.getDepartmentStatistics(userDept);
    const recentDeptExpenses = dataManager.getRecentExpensesByDepartment(userDept, 5);
    
    container.innerHTML = `
        <div class="department-summary">
            <div class="summary-card">
                <h3>Total This Month</h3>
                <div class="value">${dataManager.formatCurrency(departmentStats.thisMonth)}</div>
            </div>
            <div class="summary-card">
                <h3>Total This Year</h3>
                <div class="value">${dataManager.formatCurrency(departmentStats.thisYear)}</div>
            </div>
            <div class="summary-card">
                <h3>Total Expenses</h3>
                <div class="value">${departmentStats.totalCount}</div>
            </div>
        </div>
        
        <h3>Recent Department Expenses</h3>
        <div class="expenses-table">
            <div class="table-header">
                <div class="header-cell">Type</div>
                <div class="header-cell">Employee</div>
                <div class="header-cell">Amount</div>
                <div class="header-cell">Date</div>
            </div>
            <div class="table-body">
                ${recentDeptExpenses.map(expense => `
                    <div class="expense-row">
                        <div class="expense-cell">${expense.category}</div>
                        <div class="expense-cell">${expense.employeeName}</div>
                        <div class="expense-cell expense-amount">${dataManager.formatCurrency(expense.amount)}</div>
                        <div class="expense-cell">${dataManager.formatDate(expense.date)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}




// Slider functionality
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slides-container');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const dots = document.querySelectorAll('.slider-dot');
    
    let currentIndex = 0;
    let slideInterval;
    const slideCount = slides.length;
    
    // Set up the slider
    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Next slide
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slideCount;
        updateSlider();
        resetInterval();
    }
    
    // Previous slide
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateSlider();
        resetInterval();
    }
    
    // Button events
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
            resetInterval();
        });
    });
    
    // Auto slide
    function startInterval() {
        slideInterval = setInterval(nextSlide, 4000); // Change slide every 5 seconds
    }
    
    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }
    
    startInterval();
    
    // Pause on hover
    const sliderContainer = document.querySelector('.features-slider');
    sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    sliderContainer.addEventListener('mouseleave', startInterval);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });
});