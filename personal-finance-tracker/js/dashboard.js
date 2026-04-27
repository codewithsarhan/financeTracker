// Dashboard Logic - Dashboard logic & summary cards

const dashboard = {
    charts: {},

    /**
     * Initialize dashboard
     */
    init() {
        this.updateSummaryCards();
        this.loadRecentTransactions();
        this.initCharts();
        this.setupEventListeners();
    },

    /**
     * Update summary cards with current data
     */
    updateSummaryCards() {
        const transactions = storage.getTransactions();
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = totalIncome - totalExpenses;
        const savings = balance > 0 ? balance : 0;

        // Update DOM
        const totalBalanceEl = document.getElementById('totalBalance');
        const totalIncomeEl = document.getElementById('totalIncome');
        const totalExpensesEl = document.getElementById('totalExpenses');
        const totalSavingsEl = document.getElementById('totalSavings');

        if (totalBalanceEl) totalBalanceEl.textContent = utils.formatCurrency(balance);
        if (totalIncomeEl) totalIncomeEl.textContent = utils.formatCurrency(totalIncome);
        if (totalExpensesEl) totalExpensesEl.textContent = utils.formatCurrency(totalExpenses);
        if (totalSavingsEl) totalSavingsEl.textContent = utils.formatCurrency(savings);
    },

    /**
     * Load and display recent transactions
     */
    loadRecentTransactions() {
        const container = document.getElementById('recentTransactionsList');
        if (!container) return;

        const transactions = storage.getTransactions();
        const recent = utils.sortByDate(transactions).slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <p>No transactions yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recent.map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${t.description || utils.getCategoryName(t.category)}</div>
                    <div class="transaction-meta">
                        <span>${utils.getCategoryIcon(t.category)} ${utils.getCategoryName(t.category)}</span>
                        <span>•</span>
                        <span>${utils.formatDate(t.date, 'short')}</span>
                    </div>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}${utils.formatCurrency(t.amount)}
                </div>
            </div>
        `).join('');
    },

    /**
     * Initialize dashboard charts
     */
    initCharts() {
        this.initCategoryChart();
        this.initTrendChart();
    },

    /**
     * Initialize spending by category chart
     */
    initCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const transactions = storage.getTransactions();
        const expenses = transactions.filter(t => t.type === 'expense');

        // Group by category
        const categoryTotals = {};
        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const labels = Object.keys(categoryTotals).map(utils.getCategoryName);
        const data = Object.values(categoryTotals);
        const colors = [
            '#4F46E5', '#10B981', '#F59E0B', '#EF4444', 
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ];

        this.charts.category = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels.length ? labels : ['No data'],
                datasets: [{
                    data: data.length ? data : [1],
                    backgroundColor: data.length ? colors : ['#E5E7EB'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    },

    /**
     * Initialize monthly trend chart
     */
    initTrendChart() {
        this.updateTrendChart('daily');
    },

    /**
     * Update trend chart based on time period
     * @param {string} period - 'daily', 'monthly', or 'yearly'
     */
    updateTrendChart(period = 'monthly') {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;

        const transactions = storage.getTransactions();
        let labels = [];
        let incomeData = [];
        let expenseData = [];

        const now = new Date();

        if (period === 'daily') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                
                const dayTransactions = transactions.filter(t => t.date === dateStr);
                const income = dayTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = dayTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                incomeData.push(income);
                expenseData.push(expense);
            }
        } else if (period === 'monthly') {
            // Last 6 months
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push({
                    month: date.getMonth(),
                    year: date.getFullYear(),
                    label: date.toLocaleDateString('en-US', { month: 'short' })
                });
            }

            labels = months.map(m => m.label);

            months.forEach(m => {
                const monthTransactions = utils.filterByMonthYear(transactions, m.month, m.year);
                const income = monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                incomeData.push(income);
                expenseData.push(expense);
            });
        } else if (period === 'yearly') {
            // Last 5 years
            for (let i = 4; i >= 0; i--) {
                const year = now.getFullYear() - i;
                labels.push(year.toString());
                
                const yearTransactions = transactions.filter(t => {
                    const date = new Date(t.date);
                    return date.getFullYear() === year;
                });
                
                const income = yearTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = yearTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                incomeData.push(income);
                expenseData.push(expense);
            }
        }

        // Destroy existing chart
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        this.charts.trend = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            },
                            font: {
                                size: 10
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add transaction button
        const addBtn = document.getElementById('addTransactionBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                app.openModal('transactionModal');
                this.resetForm();
            });
        }

        // Modal close buttons
        const closeBtns = document.querySelectorAll('.modal-close, .modal-cancel');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                app.closeModal('transactionModal');
            });
        });

        // Transaction form submission
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddTransaction();
            });
        }

        // Set default date to today
        const dateInput = document.getElementById('date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Chart filter buttons
        const filterBtns = document.querySelectorAll('.chart-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                // Update chart with selected period
                const period = btn.dataset.period;
                this.updateTrendChart(period);
            });
        });
    },

    /**
     * Handle adding a new transaction
     */
    handleAddTransaction() {
        const type = document.getElementById('type').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!utils.validateAmount(amount)) {
            utils.showNotification('Please enter a valid amount', 'error');
            return;
        }

        const transaction = {
            id: utils.generateId(),
            type,
            amount,
            category,
            date,
            description
        };

        // Save to storage
        const transactions = storage.getTransactions();
        transactions.push(transaction);
        storage.saveTransactions(transactions);

        // Close modal
        app.closeModal('transactionModal');

        // Refresh dashboard
        this.updateSummaryCards();
        this.loadRecentTransactions();
        this.updateCharts();

        // Reset form
        this.resetForm();

        utils.showNotification('Transaction added successfully!');
    },

    /**
     * Reset transaction form
     */
    resetForm() {
        const form = document.getElementById('transactionForm');
        if (form) {
            form.reset();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        }
    },

    /**
     * Update charts with new data
     */
    updateCharts() {
        if (this.charts.category) {
            this.charts.category.destroy();
            this.initCategoryChart();
        }
        if (this.charts.trend) {
            this.charts.trend.destroy();
            this.initTrendChart();
        }
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('totalBalance')) {
        dashboard.init();
    }
});

// Make dashboard available globally
window.dashboard = dashboard;
