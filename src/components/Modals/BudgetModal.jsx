import React, { useState, useEffect } from 'react';
import { X, PieChart } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const BudgetModal = ({ isOpen, onClose, categoryToEdit = null }) => {
  const { categories, budgets, setCategoryBudget } = useFinance();

  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  const expenseCategories = categories.expense || [];

  useEffect(() => {
    if (categoryToEdit) {
      setCategory(categoryToEdit.category);
      setLimit(categoryToEdit.limit || '');
    } else {
      setCategory(expenseCategories[0] || '');
      setLimit('');
    }
  }, [categoryToEdit, isOpen, expenseCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category) {
      alert('Please select a category');
      return;
    }
    if (!limit || Number(limit) <= 0) {
      alert('Please enter a valid monthly spending limit');
      return;
    }

    setCategoryBudget(category, Number(limit));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-500" />
            <span>{categoryToEdit ? 'Edit Category Budget' : 'Set Category Budget'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                const existing = budgets.find(b => b.category === e.target.value);
                if (existing) setLimit(existing.limit);
              }}
              disabled={!!categoryToEdit}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Monthly Limit (₹ INR) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 font-bold text-lg">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 15000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
            >
              Save Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
