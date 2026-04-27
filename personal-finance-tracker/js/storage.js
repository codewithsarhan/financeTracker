// Storage Helper - localStorage read/write helpers

const storage = {
    /**
     * Get data from localStorage
     * @param {string} key - The key to retrieve
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed data or default value
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage: ${error}`);
            return defaultValue;
        }
    },

    /**
     * Set data in localStorage
     * @param {string} key - The key to set
     * @param {*} data - The data to store
     */
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error writing to localStorage: ${error}`);
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - The key to remove
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage: ${error}`);
        }
    },

    /**
     * Clear all data from localStorage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error(`Error clearing localStorage: ${error}`);
        }
    },

    /**
     * Get all transactions
     * @returns {Array} Array of transaction objects
     */
    getTransactions() {
        return this.get('transactions', []);
    },

    /**
     * Save transactions
     * @param {Array} transactions - Array of transaction objects
     */
    saveTransactions(transactions) {
        this.set('transactions', transactions);
    },

    /**
     * Get all budgets
     * @returns {Array} Array of budget objects
     */
    getBudgets() {
        return this.get('budgets', []);
    },

    /**
     * Save budgets
     * @param {Array} budgets - Array of budget objects
     */
    saveBudgets(budgets) {
        this.set('budgets', budgets);
    },

    /**
     * Get all goals
     * @returns {Array} Array of goal objects
     */
    getGoals() {
        return this.get('goals', []);
    },

    /**
     * Save goals
     * @param {Array} goals - Array of goal objects
     */
    saveGoals(goals) {
        this.set('goals', goals);
    },

    /**
     * Get app settings
     * @returns {Object} Settings object
     */
    getSettings() {
        return this.get('settings', {
            currency: 'USD',
            firstDayOfWeek: 0,
            theme: 'light'
        });
    },

    /**
     * Save app settings
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        this.set('settings', settings);
    }
};

// Make storage available globally
window.storage = storage;
