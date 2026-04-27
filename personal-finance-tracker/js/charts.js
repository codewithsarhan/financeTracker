// Charts Renderer - Chart rendering for reports page

const chartsRenderer = {
    charts: {},

    /**
     * Initialize charts on reports page
     */
    init() {
        try {
            this.setupEventListeners();
            this.loadReportData();
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Report period change
        const periodSelect = document.getElementById('reportPeriod');
        if (periodSelect) {
            periodSelect.addEventListener('change', () => {
                this.togglePeriodInputs();
                this.loadReportData();
            });
        }

        // Month/Year change
        const monthInput = document.getElementById('reportMonth');
        const yearInput = document.getElementById('reportYear');
        
        if (monthInput) {
            monthInput.addEventListener('change', () => this.loadReportData());
        }
        
        if (yearInput) {
            yearInput.addEventListener('change', () => this.loadReportData());
        }

        // Export button
        const exportBtn = document.getElementById('exportReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // Set default period
        this.togglePeriodInputs();
    },

    /**
     * Toggle period input visibility
     */
    togglePeriodInputs() {
        const period = document.getElementById('reportPeriod')?.value || 'monthly';
        const monthInput = document.getElementById('reportMonth');
        const yearInput = document.getElementById('reportYear');

        if (period === 'monthly') {
            if (monthInput) monthInput.style.display = 'block';
            if (yearInput) yearInput.style.display = 'none';
            
            // Set default to current month
            if (monthInput && !monthInput.value) {
                const now = new Date();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                monthInput.value = `${now.getFullYear()}-${month}`;
            }
        } else {
            if (monthInput) monthInput.style.display = 'none';
            if (yearInput) yearInput.style.display = 'block';
            
            // Set default to current year
            if (yearInput && !yearInput.value) {
                yearInput.value = new Date().getFullYear();
            }
        }
    },

    /**
     * Load report data and render charts
     */
    loadReportData() {
        try {
            const period = document.getElementById('reportPeriod')?.value || 'monthly';
            const transactions = storage.getTransactions();
            
            let filteredTransactions = [];
            let labels = [];

            if (period === 'monthly') {
                const monthValue = document.getElementById('reportMonth')?.value;
                if (!monthValue) {
                    // Set default to current month
                    const now = new Date();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    document.getElementById('reportMonth').value = `${now.getFullYear()}-${month}`;
                    return this.loadReportData();
                }

                const [year, month] = monthValue.split('-').map(Number);
                filteredTransactions = utils.filterByMonthYear(transactions, month - 1, year);
                labels = [new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })];
            } else {
                let year = parseInt(document.getElementById('reportYear')?.value);
                if (!year) {
                    // Set default to current year
                    year = new Date().getFullYear();
                    document.getElementById('reportYear').value = year;
                }

                filteredTransactions = transactions.filter(t => {
                    const date = new Date(t.date);
                    return date.getFullYear() === year;
                });

                // Group by month
                for (let i = 0; i < 12; i++) {
                    labels.push(new Date(year, i).toLocaleDateString('en-US', { month: 'short' }));
                }
            }

            this.updateSummaryStats(filteredTransactions, period);
            this.renderIncomeExpenseChart(filteredTransactions, period, labels);
            this.renderExpenseBreakdownChart(filteredTransactions);
            this.renderSpendingTrendChart(filteredTransactions, period, labels);
        } catch (error) {
            console.error('Error loading report data:', error);
        }
    },

    /**
     * Update summary statistics
     * @param {Array} transactions - Filtered transactions
     * @param {string} period - Report period
     */
    updateSummaryStats(transactions, period) {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

        const incomeEl = document.getElementById('reportIncome');
        const expensesEl = document.getElementById('reportExpenses');
        const savingsEl = document.getElementById('reportSavings');
        const rateEl = document.getElementById('reportSavingsRate');

        if (incomeEl) incomeEl.textContent = utils.formatCurrency(totalIncome);
        if (expensesEl) expensesEl.textContent = utils.formatCurrency(totalExpenses);
        if (savingsEl) {
            savingsEl.textContent = utils.formatCurrency(savings);
            savingsEl.style.color = savings >= 0 ? 'var(--secondary)' : 'var(--danger)';
        }
        if (rateEl) {
            rateEl.textContent = `${savingsRate.toFixed(1)}%`;
            rateEl.style.color = savingsRate >= 20 ? 'var(--secondary)' : savingsRate >= 0 ? 'var(--warning)' : 'var(--danger)';
        }
    },

    /**
     * Render income vs expense bar chart
     * @param {Array} transactions - Filtered transactions
     * @param {string} period - Report period
     * @param {Array} labels - Time period labels
     */
    renderIncomeExpenseChart(transactions, period, labels) {
        try {
            const canvas = document.getElementById('incomeExpenseChart');
            if (!canvas) return;

            let incomeData = [];
            let expenseData = [];

            if (period === 'monthly') {
                const income = transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                incomeData = [income];
                expenseData = [expense];
            } else {
                const year = parseInt(document.getElementById('reportYear')?.value) || new Date().getFullYear();
                for (let i = 0; i < 12; i++) {
                    const monthTransactions = utils.filterByMonthYear(transactions, i, year);
                    
                    incomeData.push(
                        monthTransactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + t.amount, 0)
                    );
                    
                    expenseData.push(
                        monthTransactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + t.amount, 0)
                    );
                }
            }

            // Destroy existing chart
            if (this.charts.incomeExpense) {
                this.charts.incomeExpense.destroy();
            }

            this.charts.incomeExpense = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Income',
                            data: incomeData,
                            backgroundColor: '#10B981',
                            borderRadius: 6
                        },
                        {
                            label: 'Expenses',
                            data: expenseData,
                            backgroundColor: '#EF4444',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering income/expense chart:', error);
        }
    },

    /**
     * Render expense breakdown pie chart
     * @param {Array} transactions - Filtered transactions
     */
    renderExpenseBreakdownChart(transactions) {
        const canvas = document.getElementById('expenseBreakdownChart');
        if (!canvas) return;

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

        // Destroy existing chart
        if (this.charts.expenseBreakdown) {
            this.charts.expenseBreakdown.destroy();
        }

        this.charts.expenseBreakdown = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels.length ? labels : ['No data'],
                datasets: [{
                    data: data.length ? data : [1],
                    backgroundColor: data.length ? colors : ['#E5E7EB'],
                    borderWidth: 2,
                    borderColor: '#fff'
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
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Render spending trend line chart
     * @param {Array} transactions - Filtered transactions
     * @param {string} period - Report period
     * @param {Array} labels - Time period labels
     */
    renderSpendingTrendChart(transactions, period, labels) {
        const canvas = document.getElementById('spendingTrendChart');
        if (!canvas) return;

        let expenseData = [];

        if (period === 'monthly') {
            // For monthly, show weekly breakdown
            const weeks = [1, 2, 3, 4];
            labels = weeks.map(w => `Week ${w}`);
            
            const monthValue = document.getElementById('reportMonth')?.value;
            const [year, month] = monthValue.split('-').map(Number);
            
            weeks.forEach(week => {
                const startDay = (week - 1) * 7 + 1;
                const endDay = week * 7;
                
                const weekExpenses = transactions.filter(t => {
                    const day = new Date(t.date).getDate();
                    return t.type === 'expense' && day >= startDay && day <= endDay;
                });
                
                expenseData.push(weekExpenses.reduce((sum, t) => sum + t.amount, 0));
            });
        } else {
            const year = parseInt(document.getElementById('reportYear')?.value);
            for (let i = 0; i < 12; i++) {
                const monthTransactions = utils.filterByMonthYear(transactions, i, year);
                const expense = monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                expenseData.push(expense);
            }
        }

        // Destroy existing chart
        if (this.charts.spendingTrend) {
            this.charts.spendingTrend.destroy();
        }

        this.charts.spendingTrend = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Export report to CSV
     */
    exportToCSV() {
        const transactions = storage.getTransactions();
        
        if (transactions.length === 0) {
            utils.showNotification('No transactions to export', 'error');
            return;
        }

        // Create CSV content
        let csv = 'Date,Type,Category,Description,Amount\n';
        
        transactions.forEach(t => {
            csv += `${t.date},${t.type},${utils.getCategoryName(t.category)},"${t.description || ''}",${t.amount}\n`;
        });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        utils.showNotification('Report exported successfully!');
    }
};

// Initialize charts renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('incomeExpenseChart')) {
        chartsRenderer.init();
    }
});

// Make charts renderer available globally
window.chartsRenderer = chartsRenderer;
