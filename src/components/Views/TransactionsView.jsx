import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit2, 
  Repeat, 
  Calendar, 
  Tag, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExporter';

export const TransactionsView = ({ onOpenAddTransaction, onEditTransaction, onOpenConfirmDelete }) => {
  const { 
    transactions, 
    categories, 
    recurring, 
    deleteRecurring, 
    addTransaction 
  } = useFinance();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, income, expense
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // all, this_month, last_month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // All combined available categories
  const allCategories = useMemo(() => {
    const set = new Set([...(categories.income || []), ...(categories.expense || [])]);
    return Array.from(set);
  }, [categories]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastYM = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    return transactions.filter(t => {
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Date Range filter
      if (dateRangeFilter === 'this_month' && (!t.date || !t.date.startsWith(currentYM))) return false;
      if (dateRangeFilter === 'last_month' && (!t.date || !t.date.startsWith(lastYM))) return false;
      if (dateRangeFilter === 'custom') {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
      }

      // Amount filter
      if (minAmount && Number(t.amount) < Number(minAmount)) return false;
      if (maxAmount && Number(t.amount) > Number(maxAmount)) return false;

      // Search keyword (note, category, tags)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const noteMatch = (t.note || '').toLowerCase().includes(query);
        const catMatch = (t.category || '').toLowerCase().includes(query);
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase().includes(query));
        if (!noteMatch && !catMatch && !tagMatch) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [transactions, typeFilter, categoryFilter, dateRangeFilter, startDate, endDate, minAmount, maxAmount, searchTerm]);

  // Quick process recurring item into today's transaction
  const handleProcessRecurring = (rec) => {
    const todayStr = new Date().toISOString().split('T')[0];
    addTransaction({
      type: rec.type || 'expense',
      amount: rec.amount,
      category: rec.category,
      date: todayStr,
      note: `Recurring: ${rec.note}`,
      tags: ['recurring']
    });
    alert(`Logged ₹${rec.amount} for "${rec.note}"!`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateRangeFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction Logs</h2>
          <p className="text-xs text-slate-500">Track, edit, and filter all income and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filteredTransactions, `transactions_${new Date().toISOString().slice(0, 10)}.csv`)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Recurring Bills Banner */}
      {recurring.length > 0 && (
        <div className="glass-card p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Repeat className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recurring Bills & Subscriptions</h3>
            </div>
            <span className="text-[11px] text-slate-400">{recurring.length} active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recurring.map((rec) => (
              <div key={rec.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{rec.note}</h4>
                  <p className="text-[11px] text-slate-500">{rec.category} • Due: {rec.dueDate}th</p>
                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">{formatINR(rec.amount)}</span>
                </div>
                <button
                  onClick={() => handleProcessRecurring(rec)}
                  className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  Log Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Keyword Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by note, category, or #tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Type Filter Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Toggle Filters Panel */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all ${
              showFilters || categoryFilter !== 'all' || dateRangeFilter !== 'all' || minAmount
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {allCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Date Range Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date Range</label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="custom">Custom Dates</option>
              </select>
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Amount (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max Amount (₹)</label>
              <input
                type="number"
                placeholder="100000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            {/* Custom Dates Pickers */}
            {dateRangeFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2 md:col-span-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List / Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Showing {filteredTransactions.length} of {transactions.length} entries
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <p className="text-base font-semibold">No transactions match your search or filters.</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-5 h-5 stroke-[2.5]" /> : <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tx.note || tx.category}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="flex items-center gap-1 ml-1">
                            {tx.tags.map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    <span className={`text-base font-extrabold ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatINR(tx.amount)}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenConfirmDelete('transaction', tx.id, tx.note || tx.category)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
