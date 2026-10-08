import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_INVESTMENTS, 
  INITIAL_GOALS, 
  INITIAL_BUDGETS,
  INITIAL_RECURRING
} from '../utils/sampleData';
import { getGoalEmoji } from '../utils/formatters';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const FinanceProvider = ({ children }) => {
  const { token, user } = useAuth();
  const userId = user?.id || 'guest';

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rupeetrack_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('rupeetrack_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Lazy Initializers from user-scoped localStorage to prevent empty-state wipes
  const [transactions, setTransactions] = useState(() => {
    if (!user) return INITIAL_TRANSACTIONS;
    try {
      const saved = localStorage.getItem(`rupeetrack_tx_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [investments, setInvestments] = useState(() => {
    if (!user) return INITIAL_INVESTMENTS;
    try {
      const saved = localStorage.getItem(`rupeetrack_inv_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
    } catch {
      return INITIAL_INVESTMENTS;
    }
  });

  const [goals, setGoals] = useState(() => {
    if (!user) return INITIAL_GOALS;
    try {
      const saved = localStorage.getItem(`rupeetrack_goals_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [budgets, setBudgets] = useState(() => {
    if (!user) return INITIAL_BUDGETS;
    try {
      const saved = localStorage.getItem(`rupeetrack_budgets_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [categories, setCategories] = useState(() => {
    if (!user) return INITIAL_CATEGORIES;
    try {
      const saved = localStorage.getItem(`rupeetrack_categories_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [recurring, setRecurring] = useState(() => {
    if (!user) return INITIAL_RECURRING;
    try {
      const saved = localStorage.getItem(`rupeetrack_recurring_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_RECURRING;
    } catch {
      return INITIAL_RECURRING;
    }
  });

  const [settings, setSettings] = useState(() => {
    if (!user) return { monthlyTarget: 60000 };
    try {
      const saved = localStorage.getItem(`rupeetrack_settings_${userId}`);
      return saved ? JSON.parse(saved) : { monthlyTarget: 60000 };
    } catch {
      return { monthlyTarget: 60000 };
    }
  });

  const [dataLoading, setDataLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  // Auth header helper
  const getAuthHeaders = () => {
    const headers = { 
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Sync state changes to user-scoped localStorage
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`rupeetrack_tx_${userId}`, JSON.stringify(transactions));
  }, [transactions, userId, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`rupeetrack_inv_${userId}`, JSON.stringify(investments));
  }, [investments, userId, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`rupeetrack_goals_${userId}`, JSON.stringify(goals));
  }, [goals, userId, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`rupeetrack_budgets_${userId}`, JSON.stringify(budgets));
  }, [budgets, userId, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`rupeetrack_categories_${userId}`, JSON.stringify(categories));
  }, [categories, userId, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`rupeetrack_recurring_${userId}`, JSON.stringify(recurring));
  }, [recurring, userId, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`rupeetrack_settings_${userId}`, JSON.stringify(settings));
  }, [settings, userId, user]);

  // Initial Fetch & Auto-Sync with PostgreSQL Backend when token/user changes
  useEffect(() => {
    if (!token || !user) {
      setTransactions(INITIAL_TRANSACTIONS);
      setInvestments(INITIAL_INVESTMENTS);
      setGoals(INITIAL_GOALS);
      setBudgets(INITIAL_BUDGETS);
      setCategories(INITIAL_CATEGORIES);
      setRecurring(INITIAL_RECURRING);
      setDataLoading(false);
      return;
    }

    const fetchBackendData = async () => {
      setDataLoading(true);

      // If operating in Local Offline Mode, skip network requests
      if (typeof token === 'string' && token.startsWith('local-token-')) {
        setBackendConnected(false);
        try {
          const savedTx = localStorage.getItem(`rupeetrack_tx_${userId}`);
          setTransactions(savedTx ? JSON.parse(savedTx) : INITIAL_TRANSACTIONS);
          const savedInv = localStorage.getItem(`rupeetrack_inv_${userId}`);
          setInvestments(savedInv ? JSON.parse(savedInv) : INITIAL_INVESTMENTS);
          const savedGoals = localStorage.getItem(`rupeetrack_goals_${userId}`);
          setGoals(savedGoals ? JSON.parse(savedGoals) : INITIAL_GOALS);
          const savedBudgets = localStorage.getItem(`rupeetrack_budgets_${userId}`);
          setBudgets(savedBudgets ? JSON.parse(savedBudgets) : INITIAL_BUDGETS);
          const savedCats = localStorage.getItem(`rupeetrack_categories_${userId}`);
          setCategories(savedCats ? JSON.parse(savedCats) : INITIAL_CATEGORIES);
          const savedRec = localStorage.getItem(`rupeetrack_recurring_${userId}`);
          setRecurring(savedRec ? JSON.parse(savedRec) : INITIAL_RECURRING);
          const savedSet = localStorage.getItem(`rupeetrack_settings_${userId}`);
          if (savedSet) setSettings(JSON.parse(savedSet));
        } catch (e) {
          console.warn('Failed to parse cached local storage:', e);
        }
        setDataLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}`, 'Bypass-Tunnel-Reminder': 'true' };

        // Fetch user-scoped resources from PostgreSQL directly
        const [txRes, invRes, goalRes, budgetRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/transactions`, { headers }),
          fetch(`${API_BASE_URL}/investments`, { headers }),
          fetch(`${API_BASE_URL}/goals`, { headers }),
          fetch(`${API_BASE_URL}/budgets`, { headers }),
          fetch(`${API_BASE_URL}/categories`, { headers })
        ]);

        let connected = false;

        if (txRes.ok) {
          connected = true;
          const txData = await txRes.json();
          const parsed = Array.isArray(txData) ? txData.map(t => ({ ...t, amount: Number(t.amount) })) : [];
          setTransactions(parsed);
          localStorage.setItem(`rupeetrack_tx_${userId}`, JSON.stringify(parsed));
        }

        if (invRes.ok) {
          connected = true;
          const invData = await invRes.json();
          const parsed = Array.isArray(invData) ? invData.map(inv => ({ ...inv, amount: Number(inv.amount) })) : [];
          setInvestments(parsed);
          localStorage.setItem(`rupeetrack_inv_${userId}`, JSON.stringify(parsed));
        }

        if (goalRes.ok) {
          connected = true;
          const goalData = await goalRes.json();
          const parsed = Array.isArray(goalData) ? goalData.map(g => ({
            ...g,
            targetAmount: Number(g.targetAmount),
            currentAmount: Number(g.currentAmount || 0),
            baseAmount: Number(g.baseAmount || 0),
            manualTopUps: Number(g.manualTopUps || 0)
          })) : [];
          setGoals(parsed);
          localStorage.setItem(`rupeetrack_goals_${userId}`, JSON.stringify(parsed));
        }

        if (budgetRes.ok) {
          connected = true;
          const budgetData = await budgetRes.json();
          const parsed = Array.isArray(budgetData) ? budgetData.map(b => ({
            ...b,
            limit: Number(b.limit)
          })) : [];
          setBudgets(parsed);
          localStorage.setItem(`rupeetrack_budgets_${userId}`, JSON.stringify(parsed));
        }

        if (catRes.ok) {
          connected = true;
          const catData = await catRes.json();
          if (catData && (Array.isArray(catData.income) || Array.isArray(catData.expense))) {
            const parsed = {
              income: catData.income || [],
              expense: catData.expense || []
            };
            setCategories(parsed);
            localStorage.setItem(`rupeetrack_categories_${userId}`, JSON.stringify(parsed));
          }
        }

        setBackendConnected(connected);
      } catch (err) {
        console.warn('Backend not connected or failed to fetch user data:', err.message);
        setBackendConnected(false);
      } finally {
        setDataLoading(false);
      }
    };

    fetchBackendData();
  }, [token, user, userId]);

  // Recalculate goal amounts whenever investments change
  const updatedGoals = useMemo(() => {
    return goals.map(goal => {
      const linkedInvestmentsTotal = investments
        .filter(inv => inv.linkedGoalId === goal.id)
        .reduce((sum, inv) => sum + Number(inv.amount), 0);
      
      const manualAdditions = goal.manualTopUps || 0;
      const totalAmount = (goal.baseAmount || 0) + linkedInvestmentsTotal + manualAdditions;
      
      return {
        ...goal,
        currentAmount: totalAmount > 0 ? totalAmount : (goal.currentAmount || 0)
      };
    });
  }, [goals, investments]);

  // Metric Computations
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalIncomeAllTime = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalExpenseAllTime = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalBalance = totalIncomeAllTime - totalExpenseAllTime;

  const thisMonthIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income' && t.date && t.date.startsWith(currentYearMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, currentYearMonth]);

  const thisMonthExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.date && t.date.startsWith(currentYearMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, currentYearMonth]);

  const thisMonthInvested = useMemo(() => {
    return investments
      .filter(inv => inv.date && inv.date.startsWith(currentYearMonth))
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
  }, [investments, currentYearMonth]);

  const thisMonthSavedAndInvested = (thisMonthIncome - thisMonthExpense);

  const categorySpendingThisMonth = useMemo(() => {
    const map = {};
    transactions
      .filter(t => t.type === 'expense' && t.date && t.date.startsWith(currentYearMonth))
      .forEach(t => {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions, currentYearMonth]);

  const categorySpendingAllTime = useMemo(() => {
    const map = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions]);

  const investmentAllocation = useMemo(() => {
    const map = {
      'Gold': 0,
      'Stocks': 0,
      'SIP/Mutual Funds': 0,
      'Fixed Deposit': 0,
      'Crypto': 0,
      'Other': 0
    };
    investments.forEach(inv => {
      const type = inv.type || 'Other';
      map[type] = (map[type] || 0) + Number(inv.amount);
    });
    return map;
  }, [investments]);

  const sixMonthTrend = useMemo(() => {
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-IN', { month: 'short' });

      const inc = transactions
        .filter(t => t.type === 'income' && t.date && t.date.startsWith(ym))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const exp = transactions
        .filter(t => t.type === 'expense' && t.date && t.date.startsWith(ym))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const inv = investments
        .filter(t => t.date && t.date.startsWith(ym))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      trend.push({
        month: monthLabel,
        yearMonth: ym,
        Income: inc,
        Expense: exp,
        Invested: inv
      });
    }
    return trend;
  }, [transactions, investments]);

  const recentActivity = useMemo(() => {
    const txItems = transactions.map(t => ({
      id: t.id,
      activityType: 'transaction',
      title: t.note || t.category,
      subtitle: t.category,
      amount: t.amount,
      type: t.type,
      date: t.date,
      tags: t.tags
    }));

    const invItems = investments.map(inv => ({
      id: inv.id,
      activityType: 'investment',
      title: inv.platform || inv.type,
      subtitle: `${inv.type} Investment`,
      amount: inv.amount,
      type: 'investment',
      date: inv.date,
      tags: ['investment']
    }));

    return [...txItems, ...invItems]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 7);
  }, [transactions, investments]);

  // Handlers for Transactions
  const addTransaction = async (tx) => {
    const newTx = {
      ...tx,
      id: 'tx-' + Date.now(),
      amount: Number(tx.amount),
      tags: typeof tx.tags === 'string' ? tx.tags.split(',').map(s => s.trim()).filter(Boolean) : (tx.tags || [])
    };
    setTransactions(prev => [newTx, ...prev]);

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newTx)
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync new transaction to PostgreSQL:', err);
      }
    }
  };

  const editTransaction = async (id, updatedTx) => {
    const payload = {
      ...updatedTx,
      id,
      amount: Number(updatedTx.amount),
      tags: typeof updatedTx.tags === 'string' ? updatedTx.tags.split(',').map(s => s.trim()).filter(Boolean) : (updatedTx.tags || [])
    };
    setTransactions(prev => prev.map(t => t.id === id ? payload : t));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync updated transaction to PostgreSQL:', err);
      }
    }
  };

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to delete transaction from PostgreSQL:', err);
      }
    }
  };

  // Handlers for Investments
  const addInvestment = async (inv) => {
    const newInv = {
      ...inv,
      id: 'inv-' + Date.now(),
      amount: Number(inv.amount),
      linkedGoalId: inv.linkedGoalId || null
    };
    setInvestments(prev => [newInv, ...prev]);

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/investments`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newInv)
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync new investment to PostgreSQL:', err);
      }
    }
  };

  const editInvestment = async (id, updatedInv) => {
    const payload = {
      ...updatedInv,
      id,
      amount: Number(updatedInv.amount),
      linkedGoalId: updatedInv.linkedGoalId || null
    };
    setInvestments(prev => prev.map(inv => inv.id === id ? payload : inv));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/investments/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync updated investment to PostgreSQL:', err);
      }
    }
  };

  const deleteInvestment = async (id) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/investments/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to delete investment from PostgreSQL:', err);
      }
    }
  };

  // Handlers for Goals
  const addGoal = async (goal) => {
    const icon = goal.icon || getGoalEmoji(goal.name, goal.category);
    const newGoal = {
      ...goal,
      id: 'goal-' + Date.now(),
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount || 0),
      baseAmount: Number(goal.currentAmount || 0),
      manualTopUps: 0,
      createdAt: new Date().toISOString().split('T')[0],
      icon
    };
    setGoals(prev => [...prev, newGoal]);

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/goals`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newGoal)
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync goal to PostgreSQL:', err);
      }
    }
  };

  const editGoal = async (id, updatedGoal) => {
    const icon = updatedGoal.icon || getGoalEmoji(updatedGoal.name, updatedGoal.category);
    const payload = {
      ...updatedGoal,
      id,
      targetAmount: Number(updatedGoal.targetAmount),
      currentAmount: Number(updatedGoal.currentAmount || 0),
      icon
    };

    setGoals(prev => prev.map(g => g.id === id ? {
      ...g,
      ...payload,
      baseAmount: Number(updatedGoal.currentAmount || g.baseAmount || 0)
    } : g));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/goals/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync goal update to PostgreSQL:', err);
      }
    }
  };

  const deleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setInvestments(prev => prev.map(inv => inv.linkedGoalId === id ? { ...inv, linkedGoalId: null } : inv));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/goals/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to delete goal from PostgreSQL:', err);
      }
    }
  };

  const topUpGoal = async (goalId, amount) => {
    const topupNum = Number(amount);
    if (!topupNum || topupNum <= 0) return;

    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedManual = (g.manualTopUps || 0) + topupNum;
        return {
          ...g,
          manualTopUps: updatedManual,
          currentAmount: (g.currentAmount || 0) + topupNum
        };
      }
      return g;
    }));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/goals/${goalId}/topup`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ amount: topupNum })
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync goal topup to PostgreSQL:', err);
      }
    }
  };

  // Handlers for Budgets
  const setCategoryBudget = async (category, limit) => {
    const limitNum = Number(limit);
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category);
      if (exists) {
        return prev.map(b => b.category === category ? { ...b, limit: limitNum } : b);
      }
      return [...prev, { category, limit: limitNum }];
    });

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/budgets`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ category, limit: limitNum })
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync budget to PostgreSQL:', err);
      }
    }
  };

  const deleteBudget = async (category) => {
    setBudgets(prev => prev.filter(b => b.category !== category));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/budgets/${encodeURIComponent(category)}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to delete budget from PostgreSQL:', err);
      }
    }
  };

  // Handlers for Custom Categories
  const addCustomCategory = async (name, type = 'expense') => {
    const clean = name.trim();
    if (!clean) return;
    setCategories(prev => {
      const currentList = prev[type] || [];
      if (currentList.includes(clean)) return prev;
      return {
        ...prev,
        [type]: [...currentList, clean]
      };
    });

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ name: clean, type })
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to sync category to PostgreSQL:', err);
      }
    }
  };

  const deleteCustomCategory = async (name, type = 'expense') => {
    setCategories(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter(c => c !== name)
    }));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify({ name, type })
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to delete category from PostgreSQL:', err);
      }
    }
  };

  const editCustomCategory = async (oldName, newName, type = 'expense') => {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (!cleanOld || !cleanNew || cleanOld === cleanNew) return;

    setCategories(prev => ({
      ...prev,
      [type]: (prev[type] || []).map(c => c === cleanOld ? cleanNew : c)
    }));

    // Cascade update transactions category name
    setTransactions(prev => prev.map(t => (t.category === cleanOld && t.type === type) ? { ...t, category: cleanNew } : t));

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ oldName: cleanOld, newName: cleanNew, type })
        });
        if (res.ok) setBackendConnected(true);
      } catch (err) {
        console.error('Failed to edit category in PostgreSQL:', err);
      }
    }
  };

  const addRecurring = (rec) => {
    const newRec = { ...rec, id: 'rec-' + Date.now(), amount: Number(rec.amount) };
    setRecurring(prev => [...prev, newRec]);
  };

  const deleteRecurring = (id) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  };

  const updateMonthlyTarget = (amount) => {
    setSettings(prev => ({ ...prev, monthlyTarget: Number(amount) }));
  };

  // Export Excel Backup (.xlsx)
  const exportExcel = () => {
    import('../utils/excelExporter').then(({ exportToExcel }) => {
      exportToExcel({
        transactions,
        investments,
        goals: updatedGoals,
        budgets,
        totalBalance,
        thisMonthIncome,
        thisMonthExpense,
        thisMonthInvested
      });
    });
  };

  const exportJSON = () => {
    exportExcel();
  };

  const importJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions && Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (data.investments && Array.isArray(data.investments)) setInvestments(data.investments);
      if (data.goals && Array.isArray(data.goals)) setGoals(data.goals);
      if (data.budgets && Array.isArray(data.budgets)) setBudgets(data.budgets);
      if (data.categories) setCategories(data.categories);
      if (data.recurring && Array.isArray(data.recurring)) setRecurring(data.recurring);
      if (data.settings) setSettings(data.settings);

      if (backendConnected && token) {
        fetch(`${API_BASE_URL}/sync`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data)
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const resetAllData = () => {
    setTransactions([]);
    setInvestments([]);
    setGoals([]);
    setBudgets([]);
    setCategories(INITIAL_CATEGORIES);
    setRecurring([]);
    setSettings({ monthlyTarget: 60000 });
  };

  const value = {
    theme,
    toggleTheme,
    transactions,
    investments,
    goals: updatedGoals,
    budgets,
    categories,
    recurring,
    settings,
    backendConnected,
    dataLoading,

    
    // Computed Metrics
    totalBalance,
    thisMonthIncome,
    thisMonthExpense,
    thisMonthInvested,
    thisMonthSavedAndInvested,
    categorySpendingThisMonth,
    categorySpendingAllTime,
    investmentAllocation,
    sixMonthTrend,
    recentActivity,
    
    // Actions
    addTransaction,
    editTransaction,
    deleteTransaction,
    
    addInvestment,
    editInvestment,
    deleteInvestment,
    
    addGoal,
    editGoal,
    deleteGoal,
    topUpGoal,
    
    setCategoryBudget,
    deleteBudget,
    
    addCustomCategory,
    editCustomCategory,
    deleteCustomCategory,
    
    addRecurring,
    deleteRecurring,
    
    updateMonthlyTarget,
    exportExcel,
    exportJSON,
    importJSON,
    resetAllData
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
