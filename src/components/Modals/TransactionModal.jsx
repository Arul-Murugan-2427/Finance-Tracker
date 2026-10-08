import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Tag, FileText, IndianRupee } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getTodayISO } from '../../utils/formatters';

export const TransactionModal = ({ isOpen, onClose, initialData = null }) => {
  const { categories, addTransaction, editTransaction, addCustomCategory } = useFinance();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount || '');
      setCategory(initialData.category || '');
      setDate(initialData.date || getTodayISO());
      setNote(initialData.note || '');
      setTags(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''));
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(getTodayISO());
      setNote('');
      setTags('');
    }
    setShowAddCategoryInput(false);
    setNewCatName('');
  }, [initialData, isOpen]);

  // Available categories for current type
  const availableCategories = categories[type] || [];

  useEffect(() => {
    if (!category && availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
  }, [type, availableCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const payload = {
      type,
      amount: Number(amount),
      category: category || availableCategories[0] || 'General',
      date: date || getTodayISO(),
      note,
      tags
    };

    if (initialData && initialData.id) {
      editTransaction(initialData.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCustomCategory(newCatName.trim(), type);
      setCategory(newCatName.trim());
      setNewCatName('');
      setShowAddCategoryInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Income / Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expense (-₹)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income (+₹)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Amount (₹ INR) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Category</span>
              </button>
            </div>

            {showAddCategoryInput ? (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500"
                >
                  Add
                </button>
              </div>
            ) : null}

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Note / Description
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Swiggy order, Rent credit"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Tags (comma separated)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. food, fixed, office"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex gap-3">
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
              {initialData ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
