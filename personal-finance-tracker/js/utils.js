// Utility Functions - Currency format, date helpers, etc.

const utils = {
    /**
     * Format amount as USD currency
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format date to readable string
     * @param {string|Date} date - The date to format
     * @param {string} format - Format type (short, long, iso)
     * @returns {string} Formatted date string
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }

        switch (format) {
            case 'short':
                return d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'long':
                return d.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'iso':
                return d.toISOString().split('T')[0];
            default:
                return d.toLocaleDateString('en-US');
        }
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID string
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Calculate percentage safely
     * @param {number} current - Current value
     * @param {number} total - Total value
     * @returns {number} Percentage (0-100)
     */
    calculatePercentage(current, total) {
        if (!total || total === 0) return 0;
        return Math.min((current / total) * 100, 100);
    },

    /**
     * Validate amount input
     * @param {*} value - Value to validate
     * @returns {boolean} Is valid amount
     */
    validateAmount(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0 && isFinite(num);
    },

    /**
     * Debounce function for search
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(fn, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Get category display name
     * @param {string} category - Category key
     * @returns {string} Display name
     */
    getCategoryName(category) {
        const categories = {
            salary: 'Salary',
            freelance: 'Freelance',
            food: 'Food & Dining',
            transport: 'Transportation',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            bills: 'Bills & Utilities',
            healthcare: 'Healthcare',
            other: 'Other'
        };
        return categories[category] || category;
    },

    /**
     * Get category icon emoji
     * @param {string} category - Category key
     * @returns {string} Emoji icon
     */
    getCategoryIcon(category) {
        const icons = {
            salary: '💰',
            freelance: '💼',
            food: '🍽️',
            transport: '🚗',
            shopping: '🛍️',
            entertainment: '🎬',
            bills: '📄',
            healthcare: '🏥',
            other: '📦'
        };
        return icons[category] || '📦';
    },

    /**
     * Calculate days between dates
     * @param {string|Date} date1 - First date
     * @param {string|Date} date2 - Second date
     * @returns {number} Number of days
     */
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Get current month and year
     * @returns {Object} Month and year
     */
    getCurrentMonthYear() {
        const now = new Date();
        return {
            month: now.getMonth(),
            year: now.getFullYear(),
            monthName: now.toLocaleDateString('en-US', { month: 'long' })
        };
    },

    /**
     * Filter transactions by month/year
     * @param {Array} transactions - All transactions
     * @param {number} month - Month (0-11)
     * @param {number} year - Year
     * @returns {Array} Filtered transactions
     */
    filterByMonthYear(transactions, month, year) {
        return transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });
    },

    /**
     * Sort transactions by date (newest first)
     * @param {Array} transactions - Transactions to sort
     * @returns {Array} Sorted transactions
     */
    sortByDate(transactions) {
        return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /**
     * Show notification message
     * @param {string} message - Message to show
     * @param {string} type - Type (success, error, warning)
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'var(--secondary)' : type === 'error' ? 'var(--danger)' : 'var(--warning)'};
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('removing');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Make utils available globally
window.utils = utils;
