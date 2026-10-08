import React, { useState, useEffect } from 'react';
import { X, Calendar, Target, Smile } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getGoalEmoji, getTodayISO } from '../../utils/formatters';

const EMOJI_OPTIONS = ['🛟', '🪙', '📈', '💹', '✈️', '🚗', '🏠', '🎓', '💍', '💻', '🎯', '🏦', '🏖️', '🛵'];

export const GoalModal = ({ isOpen, onClose, initialData = null }) => {
  const { addGoal, editGoal } = useFinance();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Emergency Fund');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'Emergency Fund');
      setTargetAmount(initialData.targetAmount || '');
      setInitialAmount(initialData.baseAmount || initialData.currentAmount || '0');
      setDeadline(initialData.deadline || '');
      setIcon(initialData.icon || getGoalEmoji(initialData.name, initialData.category));
    } else {
      setName('');
      setCategory('Emergency Fund');
      setTargetAmount('');
      setInitialAmount('');
      setDeadline('');
      setIcon('🛟');
    }
  }, [initialData, isOpen]);

  // Auto detect emoji when name or category changes if user hasn't manually clicked one
  const handleNameChange = (val) => {
    setName(val);
    const autoEmoji = getGoalEmoji(val, category);
    setIcon(autoEmoji);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    const autoEmoji = getGoalEmoji(name, val);
    setIcon(autoEmoji);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a goal name');
      return;
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      targetAmount: Number(targetAmount),
      currentAmount: Number(initialAmount || 0),
      deadline: deadline || null,
      icon: icon || getGoalEmoji(name, category)
    };

    if (initialData && initialData.id) {
      editGoal(initialData.id, payload);
    } else {
      addGoal(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎯</span> {initialData ? 'Edit Goal' : 'Create Financial Goal'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Goal Name & Emoji Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Goal Name *
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Reserve, Car Downpayment"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="w-14 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl select-none">
                {icon}
              </div>
            </div>
          </div>

          {/* Emoji Picker Row */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5" />
              <span>Icon (Auto-assigned or pick below)</span>
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              {EMOJI_OPTIONS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setIcon(emo)}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === emo
                      ? 'bg-emerald-500 text-white scale-110 shadow-md'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Emergency Fund">Emergency Fund (🛟)</option>
              <option value="Gold">Gold & Jewellery (🪙)</option>
              <option value="Stock Market">Stock Market / Equity (📈)</option>
              <option value="SIP">SIP / Mutual Funds (💹)</option>
              <option value="Trip">Trip & Travel (✈️)</option>
              <option value="Vehicle">Vehicle / Car / Bike (🚗)</option>
              <option value="Home">Home & Real Estate (🏠)</option>
              <option value="Education">Education & Courses (🎓)</option>
              <option value="Wedding">Wedding & Family (💍)</option>
              <option value="Gadget">Gadget & Tech (💻)</option>
              <option value="General Target">General Savings (🎯)</option>
            </select>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Target Amount (₹ INR) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 font-bold text-lg">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Starting / Current Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Existing Saved Base Amount (₹ INR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                ₹
              </div>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Note: Linked investments will automatically add to this base amount!
            </p>
          </div>

          {/* Deadline Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Target / Deadline Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              {initialData ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
