// Transactions Manager - Add/edit/delete/filter transactions

const transactionsManager = {
    currentTransactions: [],
    filteredTransactions: [],
    currentPage: 1,
    itemsPerPage: 10,
    editingId: null,

    /**
     * Initialize transactions page
     */
    init() {
        this.loadTransactions();
        this.setupEventListeners();
        this.renderTransactions();
    },

    /**
     * Load all transactions from storage
     */
    loadTransactions() {
        this.currentTransactions = utils.sortByDate(storage.getTransactions());
        this.filteredTransactions = [...this.currentTransactions];
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add transaction button
        const addBtn = document.getElementById('addTransactionBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.editingId = null;
                document.getElementById('modalTitle').textContent = 'Add Transaction';
                document.getElementById('submitBtn').textContent = 'Add Transaction';
                this.resetForm();
                app.openModal('transactionModal');
            });
        }

        // Add first transaction button
        const addFirstBtn = document.getElementById('addFirstTransaction');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => {
                document.getElementById('addTransactionBtn').click();
            });
        }

        // Modal close buttons
        const closeBtns = document.querySelectorAll('.modal-close, .modal-cancel');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                app.closeModal('transactionModal');
            });
        });

        // Form submission
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Search input with debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(() => {
                this.applyFilters();
            }, 300));
        }

        // Filter controls
        const filterType = document.getElementById('filterType');
        const filterCategory = document.getElementById('filterCategory');
        const filterDateFrom = document.getElementById('filterDateFrom');
        const filterDateTo = document.getElementById('filterDateTo');

        [filterType, filterCategory, filterDateFrom, filterDateTo].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });

        // Clear filters button
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Set default date
        const dateInput = document.getElementById('date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    },

    /**
     * Render transactions table
     */
    renderTransactions() {
        const tbody = document.getElementById('transactionsBody');
        const emptyState = document.getElementById('emptyState');
        const countBadge = document.getElementById('transactionCount');

        if (!tbody) return;

        // Update count
        if (countBadge) {
            countBadge.textContent = `${this.filteredTransactions.length} transaction${this.filteredTransactions.length !== 1 ? 's' : ''}`;
        }

        // Show/hide empty state
        if (this.filteredTransactions.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Paginate
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(start, end);

        // Render rows
        tbody.innerHTML = pageTransactions.map(t => `
            <tr>
                <td>${utils.formatDate(t.date, 'short')}</td>
                <td>${t.description || '-'}</td>
                <td><span class="category-badge">${utils.getCategoryName(t.category)}</span></td>
                <td><span class="type-badge ${t.type}">${t.type}</span></td>
                <td class="amount-cell ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}${utils.formatCurrency(t.amount)}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="transactionsManager.editTransaction('${t.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon delete" onclick="transactionsManager.deleteTransaction('${t.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Render pagination
        this.renderPagination();
    },

    /**
     * Render pagination controls
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        
        if (totalPages <= 1) return;

        // Remove existing pagination
        const existingPagination = document.querySelector('.pagination');
        if (existingPagination) existingPagination.remove();

        const pagination = document.createElement('div');
        pagination.className = 'pagination';

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTransactions();
            }
        });

        // Page numbers
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= this.currentPage - 1 && i <= this.currentPage + 1)
            ) {
                pageNumbers.push(i);
            }
        }

        pagination.appendChild(prevBtn);

        pageNumbers.forEach((num, index) => {
            if (index > 0 && num - pageNumbers[index - 1] > 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 8px';
                pagination.appendChild(ellipsis);
            }

            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${num === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = num;
            pageBtn.addEventListener('click', () => {
                this.currentPage = num;
                this.renderTransactions();
            });
            pagination.appendChild(pageBtn);
        });

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTransactions();
            }
        });

        pagination.appendChild(nextBtn);

        // Append after table
        const tableSection = document.querySelector('.transactions-table-section');
        if (tableSection) {
            tableSection.appendChild(pagination);
        }
    },

    /**
     * Apply filters to transactions
     */
    applyFilters() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('filterType')?.value || 'all';
        const categoryFilter = document.getElementById('filterCategory')?.value || 'all';
        const dateFrom = document.getElementById('filterDateFrom')?.value;
        const dateTo = document.getElementById('filterDateTo')?.value;

        this.filteredTransactions = this.currentTransactions.filter(t => {
            // Search filter
            const matchesSearch = !searchTerm || 
                (t.description && t.description.toLowerCase().includes(searchTerm)) ||
                utils.getCategoryName(t.category).toLowerCase().includes(searchTerm);

            // Type filter
            const matchesType = typeFilter === 'all' || t.type === typeFilter;

            // Category filter
            const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

            // Date range filter
            const matchesDateFrom = !dateFrom || t.date >= dateFrom;
            const matchesDateTo = !dateTo || t.date <= dateTo;

            return matchesSearch && matchesType && matchesCategory && matchesDateFrom && matchesDateTo;
        });

        this.currentPage = 1;
        this.renderTransactions();
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterType').value = 'all';
        document.getElementById('filterCategory').value = 'all';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';

        this.filteredTransactions = [...this.currentTransactions];
        this.currentPage = 1;
        this.renderTransactions();
    },

    /**
     * Edit transaction
     * @param {string} id - Transaction ID
     */
    editTransaction(id) {
        const transaction = this.currentTransactions.find(t => t.id === id);
        if (!transaction) return;

        this.editingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Transaction';
        document.getElementById('submitBtn').textContent = 'Update Transaction';
        document.getElementById('editId').value = id;
        document.getElementById('type').value = transaction.type;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
        document.getElementById('date').value = transaction.date;
        document.getElementById('description').value = transaction.description || '';

        app.openModal('transactionModal');
    },

    /**
     * Delete transaction
     * @param {string} id - Transaction ID
     */
    deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        const transactions = storage.getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        storage.saveTransactions(filtered);

        this.loadTransactions();
        this.applyFilters();
        utils.showNotification('Transaction deleted', 'success');
    },

    /**
     * Handle form submission (add or edit)
     */
    handleSubmit() {
        const amount = parseFloat(document.getElementById('amount').value);
        
        if (!utils.validateAmount(amount)) {
            utils.showNotification('Please enter a valid amount', 'error');
            return;
        }

        const transactionData = {
            type: document.getElementById('type').value,
            amount: amount,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value
        };

        let transactions = storage.getTransactions();

        if (this.editingId) {
            // Update existing transaction
            const index = transactions.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                transactions[index] = { ...transactions[index], ...transactionData };
                utils.showNotification('Transaction updated successfully!');
            }
        } else {
            // Add new transaction
            transactions.push({
                id: utils.generateId(),
                ...transactionData
            });
            utils.showNotification('Transaction added successfully!');
        }

        storage.saveTransactions(transactions);
        app.closeModal('transactionModal');
        this.loadTransactions();
        this.applyFilters();
        this.resetForm();
    },

    /**
     * Reset form
     */
    resetForm() {
        const form = document.getElementById('transactionForm');
        if (form) {
            form.reset();
            document.getElementById('editId').value = '';
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        }
        this.editingId = null;
    }
};

// Initialize transactions manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('transactionsTable')) {
        transactionsManager.init();
    }
});

// Make transactions manager available globally
window.transactionsManager = transactionsManager;
