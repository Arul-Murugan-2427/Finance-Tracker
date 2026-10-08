export const INITIAL_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments Dividend', 'Bonus', 'Rental Income', 'Other Income'],
  expense: ['Housing & Rent', 'Groceries & Food', 'Utilities & Bills', 'Transportation & Fuel', 'Shopping & Clothing', 'Dining Out & Swiggy', 'Entertainment & Subscriptions', 'Healthcare & Medical', 'EMIs & Loans', 'Travel & Leisure', 'Miscellaneous']
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 75000,
    category: 'Salary',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    note: 'Monthly Salary Credit',
    tags: ['salary', 'income']
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 15000,
    category: 'Freelance',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
    note: 'UI Design Project Client Payment',
    tags: ['freelance']
  },
  {
    id: 'tx-3',
    type: 'income',
    amount: 3500,
    category: 'Investments Dividend',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    note: 'TCS Quarterly Dividend',
    tags: ['dividend', 'investment']
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 22000,
    category: 'Housing & Rent',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split('T')[0],
    note: 'Apartment Rent Payment',
    tags: ['rent', 'fixed']
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 6500,
    category: 'Groceries & Food',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
    note: 'Supermarket monthly groceries',
    tags: ['food', 'groceries']
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 3200,
    category: 'Utilities & Bills',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 8).toISOString().split('T')[0],
    note: 'Electricity and Broadband Bill',
    tags: ['utilities']
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 1800,
    category: 'Dining Out & Swiggy',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString().split('T')[0],
    note: 'Weekend Dinner with Friends',
    tags: ['dining', 'swiggy']
  },
  {
    id: 'tx-8',
    type: 'expense',
    amount: 4500,
    category: 'Shopping & Clothing',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 14).toISOString().split('T')[0],
    note: 'Festival Clothing Purchase',
    tags: ['shopping']
  }
];

export const INITIAL_INVESTMENTS = [
  {
    id: 'inv-1',
    type: 'Mutual Funds',
    amount: 10000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
    platform: 'Groww (Nifty 50 Index Fund)',
    linkedGoalId: 'goal-1'
  },
  {
    id: 'inv-2',
    type: 'Stocks',
    amount: 15000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 11).toISOString().split('T')[0],
    platform: 'Zerodha (TCS & HDFC Bank)',
    linkedGoalId: 'goal-2'
  },
  {
    id: 'inv-3',
    type: 'Fixed Deposit',
    amount: 50000,
    date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15).toISOString().split('T')[0],
    platform: 'HDFC Bank FD',
    linkedGoalId: 'goal-1'
  }
];

export const INITIAL_GOALS = [
  {
    id: 'goal-1',
    name: 'Emergency Savings Fund',
    category: 'Savings',
    targetAmount: 300000,
    currentAmount: 60000,
    baseAmount: 60000,
    manualTopUps: 0,
    deadline: '2026-12-31',
    icon: '🛡️'
  },
  {
    id: 'goal-2',
    name: 'New EV SUV Car',
    category: 'Vehicle',
    targetAmount: 800000,
    currentAmount: 165000,
    baseAmount: 150000,
    manualTopUps: 15000,
    deadline: '2027-06-30',
    icon: '🚗'
  },
  {
    id: 'goal-3',
    name: 'Maldives Vacation',
    category: 'Travel',
    targetAmount: 150000,
    currentAmount: 45000,
    baseAmount: 45000,
    manualTopUps: 0,
    deadline: '2026-11-15',
    icon: '✈️'
  }
];

export const INITIAL_BUDGETS = [
  { category: 'Housing & Rent', limit: 25000 },
  { category: 'Groceries & Food', limit: 10000 },
  { category: 'Dining Out & Swiggy', limit: 5000 },
  { category: 'Shopping & Clothing', limit: 8000 }
];

export const INITIAL_RECURRING = [
  {
    id: 'rec-1',
    title: 'Netflix Premium 4K',
    amount: 649,
    category: 'Entertainment & Subscriptions',
    frequency: 'monthly',
    nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString().split('T')[0]
  },
  {
    id: 'rec-2',
    title: 'Airtel Fiber Broadband',
    amount: 999,
    category: 'Utilities & Bills',
    frequency: 'monthly',
    nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().split('T')[0]
  }
];
