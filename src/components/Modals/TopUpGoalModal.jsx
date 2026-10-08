import React, { useState } from 'react';
import { X, Plus, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';

export const TopUpGoalModal = ({ isOpen, onClose, goal }) => {
  const { topUpGoal } = useFinance();
  const [amount, setAmount] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      alert('Please enter a valid top-up amount');
      return;
    }

    topUpGoal(goal.id, num);
    setAmount('');
    onClose();
  };

  const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{goal.icon || '🎯'}</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Top-Up</h3>
              <p className="text-xs text-slate-500">{goal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
              <span>Current Savings:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(goal.currentAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
              <span>Target Amount:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(goal.targetAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Remaining Needed:</span>
              <span className="font-bold">{formatINR(remainingNeeded)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Add Top-up Amount (₹ INR) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 font-bold text-lg">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {[1000, 5000, 10000, 25000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                +₹{preset >= 1000 ? `${preset/1000}k` : preset}
              </button>
            ))}
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
              Add Top-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
