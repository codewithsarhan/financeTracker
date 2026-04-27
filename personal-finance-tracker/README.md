# Personal Finance Tracker

A modern, responsive personal finance tracking web application built with vanilla HTML, CSS, and JavaScript. Track your income, expenses, budgets, and savings goals with beautiful charts and intuitive UI.

## Features

### Dashboard
- **Summary Cards**: View total balance, income, expenses, and savings at a glance
- **Interactive Charts**: Visualize spending by category and monthly trends
- **Recent Transactions**: Quick access to your latest transactions
- **Quick Add**: Add transactions directly from the dashboard

### Transactions Management
- **Add/Edit/Delete**: Full CRUD operations for transactions
- **Categorization**: Organize transactions by category (Salary, Food, Transport, etc.)
- **Advanced Filtering**: Filter by type, category, and date range
- **Search**: Quick search through transactions
- **Pagination**: Navigate through large transaction lists easily

### Budget Planner
- **Category Budgets**: Set monthly budgets for different categories
- **Progress Tracking**: Visual progress bars show spending vs. budget
- **Alerts**: Get warned when approaching or exceeding budget limits
- **Color Indicators**: Green (safe), Yellow (warning), Red (over budget)

### Savings Goals
- **Goal Creation**: Set savings goals with target amounts and deadlines
- **Progress Circles**: Beautiful circular progress indicators
- **Contributions**: Add contributions to track your progress
- **Completion Tracking**: Celebrate when you reach your goals
- **Days Remaining**: See how much time you have left

### Financial Reports
- **Monthly/Yearly Views**: Switch between monthly and yearly reports
- **Income vs Expenses**: Bar chart comparison
- **Expense Breakdown**: Pie chart showing category distribution
- **Spending Trends**: Line chart showing spending patterns
- **CSV Export**: Download your financial data for record keeping

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables, Grid, Flexbox
- **JavaScript (ES6+)**: Vanilla JavaScript, no frameworks
- **Chart.js**: Data visualization and charts
- **LocalStorage**: Client-side data persistence

## How to Run

1. **Download or clone** this repository
2. **Open** `index.html` in your web browser
3. **Start tracking** your finances!

No build tools, no server setup, no dependencies to install. Just open and use!

### Recommended Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Data Storage

All your data is stored **locally** in your browser using `localStorage`. This means:

✅ **Privacy**: Your financial data never leaves your device  
✅ **Speed**: Instant access, no network requests  
✅ **Offline**: Works without internet connection  
✅ **No Account Required**: No sign-up needed  

**Important**: 
- Data is stored per browser. Clearing browser data will delete your finances
- Use the CSV export feature to backup your data regularly
- Data does not sync across devices or browsers

## File Structure

```
personal-finance-tracker/
│
├── index.html                  ← Main dashboard
├── README.md                   ← Project documentation
│
├── css/
│   ├── style.css               ← Global styles & variables
│   ├── dashboard.css           ← Dashboard layout
│   ├── transactions.css        ← Transactions page
│   ├── budget.css              ← Budget planner
│   ├── goals.css               ← Savings goals
│   ├── charts.css              ← Chart styles
│   └── animations.css          ← Animations & transitions
│
├── js/
│   ├── app.js                  ← App initialization
│   ├── dashboard.js            ← Dashboard logic
│   ├── transactions.js         ← Transaction management
│   ├── budget.js               ← Budget planning
│   ├── goals.js                ← Goals tracking
│   ├── charts.js               ← Chart rendering
│   ├── storage.js              ← LocalStorage helpers
│   └── utils.js                ← Utility functions
│
├── pages/
│   ├── transactions.html       ← Transactions page
│   ├── budget.html             ← Budget planner page
│   ├── goals.html              ← Savings goals page
│   └── reports.html            ← Reports page
│
└── assets/
    ├── icons/                  ← SVG icons (embedded in code)
    └── fonts/                  ← System fonts used
```

## Default Categories

### Income Categories
- Salary
- Freelance
- Other

### Expense Categories
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Other

## Usage Tips

1. **Start with Transactions**: Add your income and expenses first
2. **Set Budgets**: Create monthly budgets to control spending
3. **Create Goals**: Set savings goals to stay motivated
4. **Check Reports**: Review monthly reports to understand your finances
5. **Export Regularly**: Backup your data using CSV export

## Currency

The application uses **USD ($)** by default. All amounts are formatted as US currency.

## Future Enhancements

Potential features for future versions:

- [ ] Multi-currency support
- [ ] Dark mode theme
- [ ] Data import/export (JSON)
- [ ] Recurring transactions
- [ ] Multiple accounts/wallets
- [ ] Cloud sync option
- [ ] Mobile app (PWA)
- [ ] Budget rollover
- [ ] Investment tracking
- [ ] Bill reminders
- [ ] Custom categories
- [ ] Data encryption

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

## Credits

- **Chart.js**: https://www.chartjs.org/
- **Icons**: Inline SVG icons (custom designed)
- **Fonts**: System fonts (no external fonts)

## License

This project is open source and available for personal and commercial use.

## Support

If you find this project helpful, consider:
- Starring the repository
- Sharing with others
- Contributing improvements

---

**Built with ❤️ for better financial management**
