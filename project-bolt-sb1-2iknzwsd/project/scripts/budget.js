// Budget page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and admin permission
    if (!authManager.getCurrentUser() || !authManager.hasPermission('admin')) {
        window.location.href = 'home.html';
        return;
    }
    
    loadBudgetStatus();
    
    // Handle budget form submission
    document.getElementById('budgetForm').addEventListener('submit', handleBudgetSubmit);
});

function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const department = formData.get('department');
    const amount = parseFloat(formData.get('amount'));

    try {
        dataManager.setBudget(department, amount);
        showSuccessMessage('Budget set successfully!');
        document.getElementById('budgetForm').reset();
        loadBudgetStatus();
    } catch (error) {
        showErrorMessage('Error setting budget: ' + error.message);
    }
}

function loadBudgetStatus() {
    const budgetStatus = dataManager.getBudgetStatus();
    const container = document.getElementById('budgetStatusList');
    
    if (Object.keys(budgetStatus).length === 0) {
        container.innerHTML = '<div class="no-budget">No budget information available</div>';
        return;
    }

    container.innerHTML = Object.entries(budgetStatus).map(([department, status]) => {
        const percentage = Math.min(status.percentage, 100);
        const isOverBudget = status.remaining < 0;
        const remainingText = isOverBudget ? 'Over Budget' : `${((100 - status.percentage)).toFixed(1)}% remaining`;
        
        let progressClass = 'normal';
        if (status.percentage > 90) {
            progressClass = 'danger';
        } else if (status.percentage > 75) {
            progressClass = 'warning';
        }

        return `
            <div class="budget-status-item">
                <div class="budget-status-header">
                    <div class="budget-department">${department}</div>
                    <div class="budget-amounts">
                        <div class="budget-total">Total: ${dataManager.formatCurrency(status.total)}</div>
                        <div class="budget-remaining ${isOverBudget ? 'negative' : 'positive'}">
                            Remaining: ${dataManager.formatCurrency(status.remaining)}
                        </div>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-percentage">${remainingText}</div>
            </div>
        `;
    }).join('');
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
    
    const form = document.querySelector('.budget-form-container');
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