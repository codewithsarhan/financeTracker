// App Initialization - App init, routing, state management

const app = {
    /**
     * Initialize the application
     */
    init() {
        console.log('Personal Finance Tracker initialized');
        
        // Initialize sample data if first visit
        this.initSampleData();
        
        // Setup modal handlers
        this.setupModalHandlers();
        
        // Setup storage event listener for cross-tab sync
        this.setupStorageSync();
    },

    /**
     * Initialize sample data for first-time users
     */
    initSampleData() {
        const hasVisited = storage.get('hasVisited', false);
        
        if (!hasVisited) {
            // Add sample transactions
            const sampleTransactions = [
                {
                    id: utils.generateId(),
                    type: 'income',
                    amount: 5000,
                    category: 'salary',
                    date: new Date().toISOString().split('T')[0],
                    description: 'Monthly salary'
                },
                {
                    id: utils.generateId(),
                    type: 'expense',
                    amount: 1200,
                    category: 'bills',
                    date: new Date().toISOString().split('T')[0],
                    description: 'Rent payment'
                },
                {
                    id: utils.generateId(),
                    type: 'expense',
                    amount: 150,
                    category: 'food',
                    date: new Date().toISOString().split('T')[0],
                    description: 'Grocery shopping'
                }
            ];
            
            storage.saveTransactions(sampleTransactions);
            storage.set('hasVisited', true);
            
            console.log('Sample data initialized');
        }
    },

    /**
     * Setup modal open/close handlers
     */
    setupModalHandlers() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal);
                }
            }
        });
    },

    /**
     * Open modal
     * @param {string} modalId - Modal element ID
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close modal
     * @param {HTMLElement} modal - Modal element
     */
    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * Setup storage event listener for cross-tab synchronization
     */
    setupStorageSync() {
        window.addEventListener('storage', (e) => {
            console.log('Storage updated from another tab:', e.key);
            // Reload data if needed
            if (e.key === 'transactions' || e.key === 'budgets' || e.key === 'goals') {
                window.location.reload();
            }
        });
    },

    /**
     * Get app state summary
     * @returns {Object} App state
     */
    getState() {
        const transactions = storage.getTransactions();
        const budgets = storage.getBudgets();
        const goals = storage.getGoals();
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = totalIncome - totalExpenses;
        
        return {
            transactionCount: transactions.length,
            budgetCount: budgets.length,
            goalCount: goals.length,
            totalIncome,
            totalExpenses,
            balance
        };
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Make app available globally
window.app = app;
