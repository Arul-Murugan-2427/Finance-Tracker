import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Target, 
  Menu, 
  PieChart, 
  BarChart3, 
  Settings, 
  Plus, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const BottomNav = ({ activeTab, setActiveTab, onOpenAddTransaction }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useFinance();

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const primaryTabsLeft = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: ArrowLeftRight },
  ];

  const primaryTabsRight = [
    { id: 'investments', label: 'Invest', icon: TrendingUp },
  ];

  const secondaryTabs = [
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'budgets', label: 'Budgets & Limits', icon: PieChart },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'App Settings & Backup', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar - Perfectly Centered + Icon */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 safe-area-pb">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Left 2 Items: Home & History */}
          <div className="flex items-center justify-around flex-1">
            {primaryTabsLeft.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-xl transition-all ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[11px] mt-0.5">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dead-Center Floating Plus (+) Button */}
          <div className="flex items-center justify-center px-2">
            <button
              onClick={onOpenAddTransaction}
              className="flex items-center justify-center w-13 h-13 -mt-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/35 active:scale-95 transition-transform"
              aria-label="Add transaction"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Right 2 Items: Invest & More */}
          <div className="flex items-center justify-around flex-1">
            {primaryTabsRight.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-xl transition-all ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[11px] mt-0.5">{tab.label}</span>
                </button>
              );
            })}

            {/* More Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-xl transition-all ${
                ['goals', 'budgets', 'reports', 'settings'].includes(activeTab) || isMenuOpen
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile "More" Drawer Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsMenuOpen(false)} 
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl p-6 border-t border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Menu & Options</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-emerald-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <span>Switch Theme ({theme === 'dark' ? 'Dark' : 'Light'})</span>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
