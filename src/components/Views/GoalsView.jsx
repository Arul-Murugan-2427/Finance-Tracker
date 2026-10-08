import React from 'react';
import { 
  Plus, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatDate, calculateGoalStatus } from '../../utils/formatters';

export const GoalsView = ({ onOpenAddGoal, onEditGoal, onOpenTopUpGoal, onOpenConfirmDelete }) => {
  const { goals, investments } = useFinance();

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Goals</h2>
          <p className="text-xs text-slate-500">Target progress, days remaining countdowns & top-up contributions</p>
        </div>
        <button
          onClick={onOpenAddGoal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 rounded-3xl space-y-3">
          <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No financial goals created yet.</p>
          <p className="text-xs max-w-sm mx-auto">Set target goals for Emergency Fund, Trips, Gadgets, Cars, or House downpayments with auto emojis!</p>
          <button
            onClick={onOpenAddGoal}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const statusInfo = calculateGoalStatus(goal);
            const isCompleted = statusInfo.status === 'Completed';

            // Linked investments
            const linkedInvs = investments.filter(inv => inv.linkedGoalId === goal.id);
            const linkedTotal = linkedInvs.reduce((sum, i) => sum + Number(i.amount), 0);

            return (
              <div
                key={goal.id}
                className={`glass-card p-6 rounded-3xl space-y-5 transition-all ${
                  isCompleted ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl select-none flex-shrink-0 shadow-sm">
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                        {goal.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">{goal.category}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color} flex items-center gap-1`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                    <span>{statusInfo.status}</span>
                  </span>
                </div>

                {/* Progress Bar & Amount */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatINR(goal.currentAmount)}
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      Target: {formatINR(goal.targetAmount)}
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                          : statusInfo.status === 'Behind'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${statusInfo.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {statusInfo.progressPercent}% Saved
                    </span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {statusInfo.daysRemaining !== null ? (
                          statusInfo.daysRemaining === 0 ? 'Deadline Today!' : `${statusInfo.daysRemaining} days left`
                        ) : (
                          `Target: ${formatDate(goal.deadline)}`
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Linked Investments info if any */}
                {linkedInvs.length > 0 && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      Linked Investments ({linkedInvs.length}):
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">+{formatINR(linkedTotal)}</span>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenTopUpGoal(goal)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Top-Up</span>
                    </button>

                    {isCompleted && (
                      <button
                        onClick={handleCelebrate}
                        className="px-3 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        title="Celebrate!"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Celebrate</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenConfirmDelete('goal', goal.id, goal.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                      title="Delete Goal"
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
  );
};
