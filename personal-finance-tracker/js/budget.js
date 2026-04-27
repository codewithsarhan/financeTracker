// Budget Planner - Budget category logic & alerts

const budgetPlanner = {
    editingId: null,

    /**
     * Initialize budget page
     */
    init() {
        this.loadBudgets();
        this.setupEventListeners();
    },

    /**
     * Load and render budgets
     */
    loadBudgets() {
        const budgets = storage.getBudgets();
        const transactions = storage.getTransactions();
        const { month, year } = utils.getCurrentMonthYear();

        // Calculate total budget and spent
        let totalBudget = 0;
        let totalSpent = 0;

        const budgetList = document.getElementById('budgetList');
        const emptyState = document.getElementById('emptyState');

        if (budgets.length === 0) {
            if (budgetList) budgetList.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            this.updateSummary(0, 0, 0);
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Render budget cards
        if (budgetList) {
            budgetList.innerHTML = budgets.map(budget => {
                // Calculate spent this month for this category
                const monthTransactions = utils.filterByMonthYear(transactions, month, year);
                const spent = monthTransactions
                    .filter(t => t.type === 'expense' && t.category === budget.category)
                    .reduce((sum, t) => sum + t.amount, 0);

                totalBudget += budget.amount;
                totalSpent += spent;

                const percentage = utils.calculatePercentage(spent, budget.amount);
                const remaining = budget.amount - spent;
                const statusClass = this.getStatusClass(percentage);

                return `
                    <div class="card budget-card">
                        <div class="budget-card-header">
                            <div class="budget-category">
                                <div class="category-icon">${utils.getCategoryIcon(budget.category)}</div>
                                <div class="category-name">${utils.getCategoryName(budget.category)}</div>
                            </div>
                            <div class="budget-actions">
                                <button class="btn-icon edit" onclick="budgetPlanner.editBudget('${budget.id}')" title="Edit">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button class="btn-icon delete" onclick="budgetPlanner.deleteBudget('${budget.id}')" title="Delete">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="budget-info">
                            <div class="budget-amounts">
                                <span class="budget-spent">${utils.formatCurrency(spent)} spent</span>
                                <span class="budget-total">of ${utils.formatCurrency(budget.amount)}</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar ${statusClass}" style="width: ${percentage}%"></div>
                            </div>
                            <div class="budget-percentage ${statusClass}">${percentage.toFixed(1)}%</div>
                        </div>

                        ${percentage >= 80 ? `
                            <div class="budget-alert ${statusClass}">
                                ${percentage >= 100 
                                    ? '⚠️ Budget exceeded!' 
                                    : '⚠️ Approaching budget limit!'}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        const totalRemaining = totalBudget - totalSpent;
        this.updateSummary(totalBudget, totalSpent, totalRemaining);
    },

    /**
     * Get status class based on percentage
     * @param {number} percentage - Usage percentage
     * @returns {string} Status class
     */
    getStatusClass(percentage) {
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'safe';
    },

    /**
     * Update summary cards
     * @param {number} budget - Total budget
     * @param {number} spent - Total spent
     * @param {number} remaining - Remaining amount
     */
    updateSummary(budget, spent, remaining) {
        const totalBudgetEl = document.getElementById('totalBudget');
        const totalSpentEl = document.getElementById('totalSpent');
        const totalRemainingEl = document.getElementById('totalRemaining');

        if (totalBudgetEl) totalBudgetEl.textContent = utils.formatCurrency(budget);
        if (totalSpentEl) totalSpentEl.textContent = utils.formatCurrency(spent);
        if (totalRemainingEl) {
            totalRemainingEl.textContent = utils.formatCurrency(remaining);
            totalRemainingEl.style.color = remaining >= 0 ? 'var(--secondary)' : 'var(--danger)';
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add budget button
        const addBtn = document.getElementById('addBudgetBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.editingId = null;
                document.getElementById('modalTitle').textContent = 'Add Budget Category';
                document.getElementById('submitBtn').textContent = 'Save Budget';
                this.resetForm();
                app.openModal('budgetModal');
            });
        }

        // Add first budget button
        const addFirstBtn = document.getElementById('addFirstBudget');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => {
                document.getElementById('addBudgetBtn').click();
            });
        }

        // Modal close buttons
        const closeBtns = document.querySelectorAll('.modal-close, .modal-cancel');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                app.closeModal('budgetModal');
            });
        });

        // Form submission
        const form = document.getElementById('budgetForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    },

    /**
     * Edit budget
     * @param {string} id - Budget ID
     */
    editBudget(id) {
        const budgets = storage.getBudgets();
        const budget = budgets.find(b => b.id === id);
        if (!budget) return;

        this.editingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Budget Category';
        document.getElementById('submitBtn').textContent = 'Update Budget';
        document.getElementById('editId').value = id;
        document.getElementById('category').value = budget.category;
        document.getElementById('amount').value = budget.amount;

        app.openModal('budgetModal');
    },

    /**
     * Delete budget
     * @param {string} id - Budget ID
     */
    deleteBudget(id) {
        if (!confirm('Are you sure you want to delete this budget category?')) return;

        const budgets = storage.getBudgets();
        const filtered = budgets.filter(b => b.id !== id);
        storage.saveBudgets(filtered);

        this.loadBudgets();
        utils.showNotification('Budget category deleted', 'success');
    },

    /**
     * Handle form submission
     */
    handleSubmit() {
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);

        if (!category) {
            utils.showNotification('Please select a category', 'error');
            return;
        }

        if (!utils.validateAmount(amount)) {
            utils.showNotification('Please enter a valid amount', 'error');
            return;
        }

        let budgets = storage.getBudgets();

        if (this.editingId) {
            // Update existing budget
            const index = budgets.findIndex(b => b.id === this.editingId);
            if (index !== -1) {
                budgets[index].category = category;
                budgets[index].amount = amount;
                utils.showNotification('Budget updated successfully!');
            }
        } else {
            // Check if category already exists
            const existing = budgets.find(b => b.category === category);
            if (existing) {
                utils.showNotification('Budget category already exists', 'error');
                return;
            }

            // Add new budget
            budgets.push({
                id: utils.generateId(),
                category,
                amount
            });
            utils.showNotification('Budget category added!');
        }

        storage.saveBudgets(budgets);
        app.closeModal('budgetModal');
        this.loadBudgets();
        this.resetForm();
    },

    /**
     * Reset form
     */
    resetForm() {
        const form = document.getElementById('budgetForm');
        if (form) {
            form.reset();
            document.getElementById('editId').value = '';
        }
        this.editingId = null;
    }
};

// Initialize budget planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('budgetList')) {
        budgetPlanner.init();
    }
});

// Make budget planner available globally
window.budgetPlanner = budgetPlanner;
