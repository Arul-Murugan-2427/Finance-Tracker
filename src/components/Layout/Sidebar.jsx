import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Target, 
  PieChart, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  Plus,
  IndianRupee,
  LogOut,
  User
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ activeTab, setActiveTab, onOpenAddTransaction }) => {
  const { theme, toggleTheme } = useFinance();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-xl">
            <IndianRupee className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg leading-none">
              Rupee<span className="text-emerald-600 dark:text-emerald-400">Track</span>
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Personal Finance</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* User Card */}
        {user && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">ID: {user.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddTransaction}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>
    </aside>
  );
};
