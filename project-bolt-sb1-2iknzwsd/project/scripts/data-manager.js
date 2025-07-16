// Data Manager - Handles all data operations using localStorage
class DataManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default data if not exists
        if (!localStorage.getItem('expenses')) {
            this.initializeDefaultData();
        }
    }

    initializeDefaultData() {
        // Sample expenses
        const sampleExpenses = [
            {
                id: 1,
                category: 'Office Supplies',
                amount: 8900,
                date: '2024-11-15',
                department: 'Marketing',
                employeeName: 'John Doe',
                notes: 'Stationery and equipment',
                timestamp: new Date('2024-11-15').getTime()
            },
            {
                id: 2,
                category: 'Business Lunch',
                amount: 7550,
                date: '2024-11-14',
                department: 'Marketing',
                employeeName: 'Sarah Jade',
                notes: 'Client meeting',
                timestamp: new Date('2024-11-14').getTime()
            },
            {
                id: 3,
                category: 'Travel Expenses',
                amount: 54975,
                date: '2024-11-13',
                department: 'Finance',
                employeeName: 'Mike Johnson',
                notes: 'Business trip',
                timestamp: new Date('2024-11-13').getTime()
            },
            {
                id: 4,
                category: 'Client Dinner',
                amount: 12000,
                date: '2024-11-12',
                department: 'Marketing',
                employeeName: 'Jennifer Lee',
                notes: 'Business dinner',
                timestamp: new Date('2024-11-12').getTime()
            },
            {
                id: 5,
                category: 'Food Catering',
                amount: 25100,
                date: '2024-11-11',
                department: 'Human Resource (HR)',
                employeeName: 'Alice Smith',
                notes: 'Team lunch meeting',
                timestamp: new Date('2024-11-11').getTime()
            }
        ];

        // Sample budgets
        const sampleBudgets = {
            'Marketing': 100000,
            'Finance': 80000,
            'Human Resource (HR)': 50000,
            'Information Technology (IT)': 120000,
            'Operations': 90000
        };

        localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
        localStorage.setItem('budgets', JSON.stringify(sampleBudgets));
        localStorage.setItem('expenseCounter', '5');
    }

    // Expense methods
    addExpense(expense) {
        const expenses = this.getExpenses();
        const counter = parseInt(localStorage.getItem('expenseCounter') || '0') + 1;
        
        expense.id = counter;
        expense.timestamp = new Date(expense.date).getTime();
        
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('expenseCounter', counter.toString());
        
        return expense;
    }

    getExpenses() {
        return JSON.parse(localStorage.getItem('expenses') || '[]');
    }

    getRecentExpenses(limit = 4) {
        const expenses = this.getExpenses();
        return expenses
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    getRecentExpensesByDepartment(department, limit = 4) {
        const expenses = this.getExpenses();
        return expenses
            .filter(expense => expense.department === department)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    getDepartmentStatistics(department) {
        const expenses = this.getExpenses();
        const departmentExpenses = expenses.filter(expense => expense.department === department);
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const thisMonth = departmentExpenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);
            
        const thisYear = departmentExpenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
            thisMonth,
            thisYear,
            totalCount: departmentExpenses.length,
            total: departmentExpenses.reduce((sum, expense) => sum + expense.amount, 0)
        };
    }

    getExpensesByDate(year, month, date) {
        const expenses = this.getExpenses();
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const matchYear = !year || expenseDate.getFullYear() === parseInt(year);
            const matchMonth = !month || (expenseDate.getMonth() + 1) === parseInt(month);
            const matchDate = !date || expense.date === date;
            
            return matchYear && matchMonth && matchDate;
        });
    }

    getExpensesByFilters(filters) {
        const expenses = this.getExpenses();
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            
            // Year filter
            if (filters.year && expenseDate.getFullYear() !== parseInt(filters.year)) {
                return false;
            }
            
            // Month filter
            if (filters.month && (expenseDate.getMonth() + 1) !== parseInt(filters.month)) {
                return false;
            }
            
            // Date filter
            if (filters.date && expense.date !== filters.date) {
                return false;
            }
            
            // Department filter
            if (filters.department && expense.department !== filters.department) {
                return false;
            }
            
            return true;
        });
    }

    getExpensesByDepartment(department) {
        const expenses = this.getExpenses();
        return expenses.filter(expense => expense.department === department);
    }

    getExpensesByDateRange(startDate, endDate) {
        const expenses = this.getExpenses();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return expenses.filter(expense => {
            const expenseTime = new Date(expense.date).getTime();
            return expenseTime >= start && expenseTime <= end;
        });
    }

    // Budget methods
    setBudget(department, amount) {
        const budgets = this.getBudgets();
        budgets[department] = amount;
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }

    getBudgets() {
        return JSON.parse(localStorage.getItem('budgets') || '{}');
    }

    getBudgetStatus() {
        const budgets = this.getBudgets();
        const expenses = this.getExpenses();
        const status = {};

        for (const [department, totalBudget] of Object.entries(budgets)) {
            const departmentExpenses = expenses
                .filter(expense => expense.department === department)
                .reduce((sum, expense) => sum + expense.amount, 0);
            
            const remaining = totalBudget - departmentExpenses;
            const percentage = totalBudget > 0 ? (departmentExpenses / totalBudget) * 100 : 0;

            status[department] = {
                total: totalBudget,
                spent: departmentExpenses,
                remaining: remaining,
                percentage: percentage
            };
        }

        return status;
    }

    // Report methods
    getMonthlyExpensesByDepartment(year = new Date().getFullYear()) {
        const expenses = this.getExpenses();
        const monthlyData = {};

        // Initialize months
        for (let month = 1; month <= 12; month++) {
            monthlyData[month] = {};
        }

        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getFullYear() === year) {
                const month = expenseDate.getMonth() + 1;
                const department = expense.department;

                if (!monthlyData[month][department]) {
                    monthlyData[month][department] = 0;
                }
                monthlyData[month][department] += expense.amount;
            }
        });

        return monthlyData;
    }

    getYearlyExpensesByDepartment() {
        const expenses = this.getExpenses();
        const yearlyData = {};

        expenses.forEach(expense => {
            const year = new Date(expense.date).getFullYear();
            const department = expense.department;

            if (!yearlyData[year]) {
                yearlyData[year] = {};
            }
            if (!yearlyData[year][department]) {
                yearlyData[year][department] = 0;
            }
            yearlyData[year][department] += expense.amount;
        });

        return yearlyData;
    }

    getDailyExpensesLast7Days() {
        const expenses = this.getExpenses();
        const dailyData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayExpenses = expenses.filter(expense => expense.date === dateStr);
            const departmentTotals = {};

            dayExpenses.forEach(expense => {
                if (!departmentTotals[expense.department]) {
                    departmentTotals[expense.department] = 0;
                }
                departmentTotals[expense.department] += expense.amount;
            });

            const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

            dailyData.push({
                date: dateStr,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                total: total,
                departments: departmentTotals
            });
        }

        return dailyData;
    }

    // User management
    registerUser(user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === user.email);
        
        if (existingUser) {
            throw new Error('User already exists');
        }

        user.id = Date.now();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Invalid credentials');
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    logoutUser() {
        localStorage.removeItem('currentUser');
    }

    // Utility methods
    formatCurrency(amount) {
        return `Rs. ${amount.toLocaleString()}`;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getAvailableYears() {
        const expenses = this.getExpenses();
        const years = [...new Set(expenses.map(expense => new Date(expense.date).getFullYear()))];
        return years.sort((a, b) => b - a);
    }
}

// Create global instance
window.dataManager = new DataManager();