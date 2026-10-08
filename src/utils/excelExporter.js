import * as XLSX from 'xlsx';

export const exportToExcel = (financeData, filename = null) => {
  const { 
    transactions = [], 
    investments = [], 
    goals = [], 
    budgets = [],
    totalBalance = 0,
    thisMonthIncome = 0,
    thisMonthExpense = 0,
    thisMonthInvested = 0
  } = financeData;

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryRows = [
    { Metric: 'Report Generated Date', Value: new Date().toLocaleDateString('en-IN') },
    { Metric: 'Total Net Balance (₹)', Value: totalBalance },
    { Metric: 'This Month Income (₹)', Value: thisMonthIncome },
    { Metric: 'This Month Expenses (₹)', Value: thisMonthExpense },
    { Metric: 'This Month Invested (₹)', Value: thisMonthInvested },
    { Metric: 'Total Transactions Logged', Value: transactions.length },
    { Metric: 'Total Investments Logged', Value: investments.length },
    { Metric: 'Active Financial Goals', Value: goals.length }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // 2. Transactions Sheet
  if (transactions.length > 0) {
    const txRows = transactions.map(t => ({
      'Date': t.date || '',
      'Type': (t.type || '').toUpperCase(),
      'Amount (₹)': Number(t.amount) || 0,
      'Category': t.category || '',
      'Note / Description': t.note || '',
      'Tags': Array.isArray(t.tags) ? t.tags.join(', ') : (t.tags || '')
    }));
    const txSheet = XLSX.utils.json_to_sheet(txRows);
    XLSX.utils.book_append_sheet(workbook, txSheet, 'Transactions');
  } else {
    const emptySheet = XLSX.utils.json_to_sheet([{ Info: 'No transactions recorded yet' }]);
    XLSX.utils.book_append_sheet(workbook, emptySheet, 'Transactions');
  }

  // 3. Investments Sheet
  if (investments.length > 0) {
    const invRows = investments.map(inv => {
      const linkedGoal = goals.find(g => g.id === inv.linkedGoalId);
      return {
        'Date': inv.date || '',
        'Asset Type': inv.type || '',
        'Amount (₹)': Number(inv.amount) || 0,
        'Platform / Broker': inv.platform || '',
        'Linked Goal': linkedGoal ? `${linkedGoal.name} (${linkedGoal.category})` : 'None'
      };
    });
    const invSheet = XLSX.utils.json_to_sheet(invRows);
    XLSX.utils.book_append_sheet(workbook, invSheet, 'Investments');
  } else {
    const emptySheet = XLSX.utils.json_to_sheet([{ Info: 'No investments recorded yet' }]);
    XLSX.utils.book_append_sheet(workbook, emptySheet, 'Investments');
  }

  // 4. Goals Sheet
  if (goals.length > 0) {
    const goalRows = goals.map(g => {
      const target = Number(g.targetAmount) || 1;
      const current = Number(g.currentAmount) || 0;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        'Goal Name': g.name || '',
        'Category': g.category || '',
        'Target Amount (₹)': target,
        'Current Saved (₹)': current,
        'Progress (%)': `${pct}%`,
        'Deadline': g.deadline || 'No Deadline',
        'Status': pct >= 100 ? 'Completed' : 'In Progress'
      };
    });
    const goalSheet = XLSX.utils.json_to_sheet(goalRows);
    XLSX.utils.book_append_sheet(workbook, goalSheet, 'Financial Goals');
  }

  // 5. Budgets Sheet
  if (budgets.length > 0) {
    const budgetRows = budgets.map(b => ({
      'Category': b.category || '',
      'Monthly Spending Limit (₹)': Number(b.limit) || 0
    }));
    const budgetSheet = XLSX.utils.json_to_sheet(budgetRows);
    XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Category Budgets');
  }

  // Generate Excel file name
  const today = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `RupeeTrack_Finance_Backup_${today}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, finalFilename);
};
