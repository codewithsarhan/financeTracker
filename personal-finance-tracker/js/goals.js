// Goals Tracker - Savings goal tracker logic

const goalsTracker = {
    editingId: null,

    /**
     * Initialize goals page
     */
    init() {
        this.loadGoals();
        this.setupEventListeners();
    },

    /**
     * Load and render goals
     */
    loadGoals() {
        const goals = storage.getGoals();
        const goalsList = document.getElementById('goalsList');
        const emptyState = document.getElementById('emptyState');

        if (goals.length === 0) {
            if (goalsList) goalsList.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Render goal cards
        if (goalsList) {
            goalsList.innerHTML = goals.map(goal => {
                const percentage = utils.calculatePercentage(goal.currentAmount, goal.targetAmount);
                const remaining = goal.targetAmount - goal.currentAmount;
                const daysLeft = utils.daysBetween(new Date(), goal.deadline);
                const statusClass = this.getStatusClass(percentage);
                const isCompleted = percentage >= 100;

                return `
                    <div class="card goal-card ${isCompleted ? 'completed' : ''}">
                        ${isCompleted ? '<div class="completed-badge">✓ Goal Completed!</div>' : ''}
                        
                        <div class="goal-header">
                            <div>
                                <div class="goal-title">${goal.name}</div>
                                <div class="goal-deadline">Target: ${utils.formatDate(goal.deadline, 'short')}</div>
                            </div>
                            <div class="goal-actions">
                                <button class="btn-icon edit" onclick="goalsTracker.editGoal('${goal.id}')" title="Edit">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button class="btn-icon delete" onclick="goalsTracker.deleteGoal('${goal.id}')" title="Delete">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="goal-progress">
                            <div class="progress-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle class="progress-circle-bg" cx="50" cy="50" r="45"/>
                                    <circle class="progress-circle-fill ${statusClass}" 
                                        cx="50" cy="50" r="45" 
                                        stroke-dasharray="283" 
                                        stroke-dashoffset="${283 - (283 * percentage / 100)}"/>
                                </svg>
                                <div class="progress-text">
                                    <div class="progress-percentage">${percentage.toFixed(1)}%</div>
                                    <div class="progress-label">Complete</div>
                                </div>
                            </div>
                        </div>

                        <div class="goal-amounts">
                            <div class="goal-current">
                                <div class="goal-current-label">Current</div>
                                <div class="goal-current-value">${utils.formatCurrency(goal.currentAmount)}</div>
                            </div>
                            <div class="goal-target">
                                <div class="goal-target-label">Target</div>
                                <div class="goal-target-value">${utils.formatCurrency(goal.targetAmount)}</div>
                            </div>
                        </div>

                        <div class="goal-remaining">
                            <div class="remaining-amount">${utils.formatCurrency(remaining)} remaining</div>
                            <div class="remaining-days">${daysLeft > 0 ? daysLeft + ' days left' : 'Deadline passed'}</div>
                        </div>

                        <div class="goal-footer">
                            ${!isCompleted ? `
                                <button class="btn btn-primary btn-sm" onclick="goalsTracker.openContributionModal('${goal.id}')">
                                    Add Contribution
                                </button>
                            ` : ''}
                            <button class="btn btn-secondary btn-sm" onclick="goalsTracker.editGoal('${goal.id}')">
                                Edit Goal
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    /**
     * Get status class based on percentage
     * @param {number} percentage - Completion percentage
     * @returns {string} Status class
     */
    getStatusClass(percentage) {
        if (percentage >= 75) return 'safe';
        if (percentage >= 40) return 'warning';
        return 'danger';
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add goal button
        const addBtn = document.getElementById('addGoalBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.editingId = null;
                document.getElementById('modalTitle').textContent = 'Add Savings Goal';
                document.getElementById('submitBtn').textContent = 'Save Goal';
                this.resetForm();
                app.openModal('goalModal');
            });
        }

        // Add first goal button
        const addFirstBtn = document.getElementById('addFirstGoal');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => {
                document.getElementById('addGoalBtn').click();
            });
        }

        // Modal close buttons for goal modal
        const goalCloseBtns = document.querySelectorAll('#goalModal .modal-close, #goalModal .modal-cancel');
        goalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                app.closeModal('goalModal');
            });
        });

        // Goal form submission
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Modal close buttons for contribution modal
        const contribCloseBtns = document.querySelectorAll('#contributionModal .modal-close, #contributionModal .modal-cancel');
        contribCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                app.closeModal('contributionModal');
            });
        });

        // Contribution form submission
        const contribForm = document.getElementById('contributionForm');
        if (contribForm) {
            contribForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContribution();
            });
        }
    },

    /**
     * Edit goal
     * @param {string} id - Goal ID
     */
    editGoal(id) {
        const goals = storage.getGoals();
        const goal = goals.find(g => g.id === id);
        if (!goal) return;

        this.editingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Savings Goal';
        document.getElementById('submitBtn').textContent = 'Update Goal';
        document.getElementById('editId').value = id;
        document.getElementById('name').value = goal.name;
        document.getElementById('targetAmount').value = goal.targetAmount;
        document.getElementById('currentAmount').value = goal.currentAmount;
        document.getElementById('deadline').value = goal.deadline;

        app.openModal('goalModal');
    },

    /**
     * Delete goal
     * @param {string} id - Goal ID
     */
    deleteGoal(id) {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        const goals = storage.getGoals();
        const filtered = goals.filter(g => g.id !== id);
        storage.saveGoals(filtered);

        this.loadGoals();
        utils.showNotification('Goal deleted', 'success');
    },

    /**
     * Handle goal form submission
     */
    handleSubmit() {
        const name = document.getElementById('name').value.trim();
        const targetAmount = parseFloat(document.getElementById('targetAmount').value);
        const currentAmount = parseFloat(document.getElementById('currentAmount').value) || 0;
        const deadline = document.getElementById('deadline').value;

        if (!name) {
            utils.showNotification('Please enter a goal name', 'error');
            return;
        }

        if (!utils.validateAmount(targetAmount)) {
            utils.showNotification('Please enter a valid target amount', 'error');
            return;
        }

        let goals = storage.getGoals();

        if (this.editingId) {
            // Update existing goal
            const index = goals.findIndex(g => g.id === this.editingId);
            if (index !== -1) {
                goals[index].name = name;
                goals[index].targetAmount = targetAmount;
                goals[index].currentAmount = currentAmount;
                goals[index].deadline = deadline;
                utils.showNotification('Goal updated successfully!');
            }
        } else {
            // Add new goal
            goals.push({
                id: utils.generateId(),
                name,
                targetAmount,
                currentAmount,
                deadline
            });
            utils.showNotification('Goal created!');
        }

        storage.saveGoals(goals);
        app.closeModal('goalModal');
        this.loadGoals();
        this.resetForm();
    },

    /**
     * Open contribution modal
     * @param {string} goalId - Goal ID
     */
    openContributionModal(goalId) {
        document.getElementById('goalId').value = goalId;
        document.getElementById('contributionAmount').value = '';
        app.openModal('contributionModal');
    },

    /**
     * Handle contribution submission
     */
    handleContribution() {
        const goalId = document.getElementById('goalId').value;
        const amount = parseFloat(document.getElementById('contributionAmount').value);

        if (!utils.validateAmount(amount)) {
            utils.showNotification('Please enter a valid amount', 'error');
            return;
        }

        const goals = storage.getGoals();
        const goal = goals.find(g => g.id === goalId);

        if (!goal) {
            utils.showNotification('Goal not found', 'error');
            return;
        }

        goal.currentAmount += amount;

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount) {
            utils.showNotification('🎉 Congratulations! Goal completed!', 'success');
        } else {
            utils.showNotification(`Added ${utils.formatCurrency(amount)} to ${goal.name}`);
        }

        storage.saveGoals(goals);
        app.closeModal('contributionModal');
        this.loadGoals();
    },

    /**
     * Reset form
     */
    resetForm() {
        const form = document.getElementById('goalForm');
        if (form) {
            form.reset();
            document.getElementById('editId').value = '';
            document.getElementById('currentAmount').value = '0';
        }
        this.editingId = null;
    }
};

// Initialize goals tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('goalsList')) {
        goalsTracker.init();
    }
});

// Make goals tracker available globally
window.goalsTracker = goalsTracker;
