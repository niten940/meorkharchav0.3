// Reports page functionality
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let currentSlide = 0;
let autoPlayInterval;
let countdownInterval;
let isAutoPlaying = true;
let timeRemaining = 5;

// Chart instances
let pieChart, barChart, lineChart;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!authManager.getCurrentUser()) {
        window.location.href = 'index.html';
        return;
    }
    
    initializeSliders();
    initializeChartSlider();
    loadChartData();
    loadMonthlyReport();
    loadYearlyReport();
    loadDailyReport();
    updateYearDisplay();
});

function initializeChartSlider() {
    // Initialize indicators click handlers
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Start auto-play
    startAutoPlay();
}

function loadChartData() {
    const currentYearData = getCurrentYearData();
    
    // Initialize charts
    createPieChart(currentYearData);
    createBarChart(currentYearData);
    createLineChart();
}

function getCurrentYearData() {
    let yearlyData;
    
    if (authManager.isAdmin()) {
        yearlyData = dataManager.getYearlyExpensesByDepartment();
    } else {
        const userDept = authManager.getUserDepartment();
        yearlyData = dataManager.getYearlyExpensesByDepartment();
        Object.keys(yearlyData).forEach(year => {
            const yearData = yearlyData[year];
            yearlyData[year] = {};
            if (yearData[userDept]) {
                yearlyData[year][userDept] = yearData[userDept];
            }
        });
    }
    
    return yearlyData[currentYear] || {};
}

function createPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    const departments = Object.keys(data);
    const amounts = Object.values(data);
    
    const colors = [
        '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', 
        '#06B6D4', '#84CC16', '#F97316', '#EC4899'
    ];
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: departments,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, departments.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = dataManager.formatCurrency(context.parsed);
                            const percentage = ((context.parsed / amounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createBarChart(data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (barChart) {
        barChart.destroy();
    }
    
    const departments = Object.keys(data);
    const amounts = Object.values(data);
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: departments,
            datasets: [{
                label: 'Expenses',
                data: amounts,
                backgroundColor: 'rgba(20, 184, 166, 0.8)',
                borderColor: '#14B8A6',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Expenses: ${dataManager.formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rs. ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function createLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    if (lineChart) {
        lineChart.destroy();
    }
    
    const monthlyData = dataManager.getMonthlyExpensesByDepartment(currentYear);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let datasets = [];
    const colors = ['#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    if (authManager.isAdmin()) {
        const allDepartments = ['Marketing', 'Finance', 'Human Resource (HR)', 'Information Technology (IT)', 'Operations'];
        
        allDepartments.forEach((dept, index) => {
            const deptData = months.map((_, monthIndex) => {
                return monthlyData[monthIndex + 1] && monthlyData[monthIndex + 1][dept] || 0;
            });
            
            datasets.push({
                label: dept,
                data: deptData,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                tension: 0.4,
                fill: false
            });
        });
    } else {
        const userDept = authManager.getUserDepartment();
        const deptData = months.map((_, monthIndex) => {
            return monthlyData[monthIndex + 1] && monthlyData[monthIndex + 1][userDept] || 0;
        });
        
        datasets.push({
            label: userDept,
            data: deptData,
            borderColor: '#14B8A6',
            backgroundColor: '#14B8A620',
            tension: 0.4,
            fill: true
        });
    }
    
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${dataManager.formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rs. ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function goToSlide(slideIndex) {
    // Update indicators
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === slideIndex);
    });
    
    // Update slides
    document.querySelectorAll('.chart-slide').forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        if (index === slideIndex) {
            slide.classList.add('active');
        } else if (index < slideIndex) {
            slide.classList.add('prev');
        }
    });
    
    currentSlide = slideIndex;
    resetTimer();
}

function nextChart() {
    const nextSlide = (currentSlide + 1) % 3;
    goToSlide(nextSlide);
}

function previousChart() {
    const prevSlide = (currentSlide - 1 + 3) % 3;
    goToSlide(prevSlide);
}

function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    
    autoPlayInterval = setInterval(() => {
        if (isAutoPlaying) {
            nextChart();
        }
    }, 5000);
    
    startCountdown();
}

function startCountdown() {
    timeRemaining = 5;
    updateTimerDisplay();
    
    countdownInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            timeRemaining = 5;
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = isAutoPlaying ? `${timeRemaining}s` : 'Paused';
    }
}

function resetTimer() {
    if (isAutoPlaying) {
        startCountdown();
    }
}

function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    const playIcon = document.getElementById('playIcon');
    
    if (isAutoPlaying) {
        playIcon.textContent = '⏸️';
        startAutoPlay();
    } else {
        playIcon.textContent = '▶️';
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        updateTimerDisplay();
    }
}

function initializeSliders() {
    // Initialize month slider
    $('#monthSlider').slider({
        range: false,
        min: 1,
        max: 12,
        value: currentMonth,
        slide: function(event, ui) {
            currentMonth = ui.value;
            loadMonthlyReport();
        }
    });

    // Year navigation
    document.getElementById('prevYear').addEventListener('click', function() {
        currentYear--;
        updateYearDisplay();
        loadYearlyReport();
    });

    document.getElementById('nextYear').addEventListener('click', function() {
        currentYear++;
        updateYearDisplay();
        loadYearlyReport();
    });
}

function updateYearDisplay() {
    document.getElementById('currentYear').textContent = currentYear;
}

function loadMonthlyReport() {
    let monthlyData;
    
    if (authManager.isAdmin()) {
        monthlyData = dataManager.getMonthlyExpensesByDepartment(currentYear);
    } else {
        // Employee sees only their department data
        const userDept = authManager.getUserDepartment();
        monthlyData = dataManager.getMonthlyExpensesByDepartment(currentYear);
        // Filter to show only user's department
        Object.keys(monthlyData).forEach(month => {
            const monthData = monthlyData[month];
            monthlyData[month] = {};
            if (monthData[userDept]) {
                monthlyData[month][userDept] = monthData[userDept];
            }
        });
    }
    
    const container = document.getElementById('monthlyChart');
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthData = monthlyData[currentMonth] || {};
    
    if (Object.keys(currentMonthData).length === 0) {
        container.innerHTML = '<div class="no-data">No data available for ' + monthNames[currentMonth - 1] + ' ' + currentYear + '</div>';
        return;
    }

    const departments = Object.keys(currentMonthData);
    const maxAmount = Math.max(...Object.values(currentMonthData));

    container.innerHTML = `
        <div class="chart-title">Monthly Expenses for ${monthNames[currentMonth - 1]} ${currentYear}</div>
        <div class="chart-bars">
            ${departments.map(dept => {
                const amount = currentMonthData[dept];
                const height = (amount / maxAmount) * 100;
                return `
                    <div class="chart-bar" style="height: ${height}%" title="${dept}: ${dataManager.formatCurrency(amount)}">
                        <div class="chart-bar-value">${dataManager.formatCurrency(amount)}</div>
                        <div class="chart-bar-label">${dept.split(' ')[0]}</div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="chart-legend">
            ${departments.map(dept => `
                <div class="legend-item">
                    <div class="legend-color" style="background: linear-gradient(180deg, #14B8A6, #0f9488);"></div>
                    <span>${dept}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function loadYearlyReport() {
    let yearlyData;
    
    if (authManager.isAdmin()) {
        yearlyData = dataManager.getYearlyExpensesByDepartment();
    } else {
        // Employee sees only their department data
        const userDept = authManager.getUserDepartment();
        yearlyData = dataManager.getYearlyExpensesByDepartment();
        // Filter to show only user's department
        Object.keys(yearlyData).forEach(year => {
            const yearData = yearlyData[year];
            yearlyData[year] = {};
            if (yearData[userDept]) {
                yearlyData[year][userDept] = yearData[userDept];
            }
        });
    }
    
    const container = document.getElementById('yearlyChart');
    
    const currentYearData = yearlyData[currentYear] || {};
    
    if (Object.keys(currentYearData).length === 0) {
        container.innerHTML = '<div class="no-data">No data available for ' + currentYear + '</div>';
        return;
    }

    const departments = Object.keys(currentYearData);
    const maxAmount = Math.max(...Object.values(currentYearData));

    container.innerHTML = `
        <div class="chart-title">Yearly Expenses for ${currentYear}</div>
        <div class="chart-bars">
            ${departments.map(dept => {
                const amount = currentYearData[dept];
                const height = (amount / maxAmount) * 100;
                return `
                    <div class="chart-bar" style="height: ${height}%" title="${dept}: ${dataManager.formatCurrency(amount)}">
                        <div class="chart-bar-value">${dataManager.formatCurrency(amount)}</div>
                        <div class="chart-bar-label">${dept.split(' ')[0]}</div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="chart-legend">
            ${departments.map(dept => `
                <div class="legend-item">
                    <div class="legend-color" style="background: linear-gradient(180deg, #14B8A6, #0f9488);"></div>
                    <span>${dept}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function loadDailyReport() {
    let dailyData;
    
    if (authManager.isAdmin()) {
        dailyData = dataManager.getDailyExpensesLast7Days();
    } else {
        // Employee sees only their department data
        const userDept = authManager.getUserDepartment();
        dailyData = dataManager.getDailyExpensesLast7Days();
        // Filter to show only user's department
        dailyData = dailyData.map(day => ({
            ...day,
            departments: day.departments[userDept] ? { [userDept]: day.departments[userDept] } : {},
            total: day.departments[userDept] || 0
        }));
    }
    
    const container = document.getElementById('dailyChart');
    
    if (dailyData.every(day => day.total === 0)) {
        container.innerHTML = '<div class="no-data">No expenses in the last 7 days</div>';
        return;
    }

    container.innerHTML = `
        <div class="chart-title">Day-to-Day Expenses (Last 7 Days)</div>
        <div class="daily-chart">
            ${dailyData.map(day => {
                const departmentList = Object.keys(day.departments).length > 0 
                    ? Object.keys(day.departments).join(', ')
                    : 'No expenses';
                
                return `
                    <div class="daily-item">
                        <div class="daily-date">${day.dayName}</div>
                        <div class="daily-amount">${dataManager.formatCurrency(day.total)}</div>
                        <div class="daily-departments">${departmentList}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}