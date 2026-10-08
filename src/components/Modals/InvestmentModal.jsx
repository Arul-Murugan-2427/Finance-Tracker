import React, { useState, useEffect } from 'react';
import { X, Calendar, Layers, Target, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getTodayISO } from '../../utils/formatters';

const INVESTMENT_TYPES = [
  { id: 'Gold', label: 'Gold (SGB, Digital, Bullion)', emoji: '🪙' },
  { id: 'Stocks', label: 'Direct Equity / Stocks', emoji: '📈' },
  { id: 'SIP/Mutual Funds', label: 'SIP / Mutual Funds', emoji: '💹' },
  { id: 'Fixed Deposit', label: 'Fixed Deposit / Recurring Deposit', emoji: '🏦' },
  { id: 'Crypto', label: 'Cryptocurrency', emoji: '🪙' },
  { id: 'Other', label: 'Other Asset Class', emoji: '💼' },
];

export const InvestmentModal = ({ isOpen, onClose, initialData = null }) => {
  const { goals, addInvestment, editInvestment } = useFinance();

  const [type, setType] = useState('SIP/Mutual Funds');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [platform, setPlatform] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'SIP/Mutual Funds');
      setAmount(initialData.amount || '');
      setDate(initialData.date || getTodayISO());
      setPlatform(initialData.platform || '');
      setLinkedGoalId(initialData.linkedGoalId || '');
    } else {
      setType('SIP/Mutual Funds');
      setAmount('');
      setDate(getTodayISO());
      setPlatform('');
      setLinkedGoalId('');
    }
  }, [initialData, isOpen]);

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
      date: date || getTodayISO(),
      platform: platform.trim() || type,
      linkedGoalId: linkedGoalId || null
    };

    if (initialData && initialData.id) {
      editInvestment(initialData.id, payload);
    } else {
      addInvestment(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-500">✨</span> {initialData ? 'Edit Investment' : 'Log Investment Entry'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Note Banner */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-medium">
            💡 Investments are kept strictly isolated from regular expenses and represent wealth accumulation!
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Invested Amount (₹ INR) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-500 font-bold text-lg">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Asset Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Investment Asset Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {INVESTMENT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Date Invested *
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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Platform / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Platform / Broker / Note
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Zerodha, Groww, HDFC Bank, Coin"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Link to Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Link to Goal (Optional)</span>
            </label>
            <select
              value={linkedGoalId}
              onChange={(e) => setLinkedGoalId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Standalone (No Linked Goal) --</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.icon} {goal.name} (Target: ₹{goal.targetAmount.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Linking will automatically add this investment amount to the target goal's progress bar.
            </p>
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
              className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              {initialData ? 'Save Changes' : 'Save Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
