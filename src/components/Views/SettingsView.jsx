import React, { useState, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3,
  Check, 
  X,
  AlertTriangle, 
  ShieldCheck, 
  Database,
  Layers
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const SettingsView = ({ onOpenConfirmReset }) => {
  const { 
    theme, 
    toggleTheme, 
    categories, 
    addCustomCategory, 
    editCustomCategory,
    deleteCustomCategory,
    exportExcel,
    importJSON,
    restoreSampleData
  } = useFinance();

  const [activeCategoryTab, setActiveCategoryTab] = useState('expense'); // expense or income
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // name of category being edited
  const [editCatInput, setEditCatInput] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  const fileInputRef = useRef(null);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      addCustomCategory(newCatInput.trim(), activeCategoryTab);
      setNewCatInput('');
    }
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setEditCatInput(cat);
  };

  const handleSaveEdit = (cat) => {
    if (editCatInput.trim() && editCatInput.trim() !== cat) {
      editCustomCategory(cat, editCatInput.trim(), activeCategoryTab);
    }
    setEditingCategory(null);
    setEditCatInput('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importJSON(event.target.result);
      if (result.success) {
        setImportStatus({ success: true, message: 'JSON Backup restored successfully!' });
      } else {
        setImportStatus({ success: false, message: `Import failed: ${result.error}` });
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">App Settings & Data</h2>
        <p className="text-xs text-slate-500">Theme preferences, category management, JSON backup, & data controls</p>
      </div>

      {/* Theme Preference Card */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-emerald-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <span>Appearance & Theme</span>
        </h3>
        <p className="text-xs text-slate-500">
          Toggle between clean crisp Light mode and deep dark OLED Black mode.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
          <button
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500 mb-2" />
            <div className="text-sm font-bold text-slate-900 dark:text-white">Light Theme</div>
            <div className="text-[11px] text-slate-400">Clean white aesthetic</div>
          </button>

          <button
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-6 h-6 text-emerald-400 mb-2" />
            <div className="text-sm font-bold text-slate-900 dark:text-white">Dark Theme</div>
            <div className="text-[11px] text-slate-400">Deep black slate aesthetic</div>
          </button>
        </div>
      </div>

      {/* Category Manager Card */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>Category Manager</span>
            </h3>
            <p className="text-xs text-slate-500">Edit, rename, add or remove income & expense categories</p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveCategoryTab('expense');
                setEditingCategory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Expense Categories
            </button>
            <button
              onClick={() => {
                setActiveCategoryTab('income');
                setEditingCategory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Income Categories
            </button>
          </div>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder={`New ${activeCategoryTab} category name...`}
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {(categories[activeCategoryTab] || []).map((cat) => (
            <div
              key={cat}
              className="px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border border-slate-200/50 dark:border-slate-700/50"
            >
              {editingCategory === cat ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editCatInput}
                    onChange={(e) => setEditCatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(cat);
                      if (e.key === 'Escape') setEditingCategory(null);
                    }}
                    autoFocus
                    className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(cat)}
                    className="p-1 text-emerald-500 hover:text-emerald-400"
                    title="Save rename"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span>{cat}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                      title="Edit / Rename category"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomCategory(cat, activeCategoryTab)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Excel Backup & Restore Card */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <span>Excel Sheet Data Export & Restore</span>
          </h3>
          <p className="text-xs text-slate-500">
            Download your full financial records as an Excel spreadsheet (.xlsx) with separate sheets for Transactions, Investments, Goals, and Budgets!
          </p>
        </div>

        {importStatus && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            importStatus.success ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
          }`}>
            {importStatus.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={exportExcel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel Sheet (.xlsx)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Import JSON Backup File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone: Data Reset Card */}
      <div className="glass-card p-6 rounded-3xl border border-rose-500/20 space-y-4">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
          <AlertTriangle className="w-5 h-5" />
          <span>Reset or Restore Data</span>
        </div>
        <p className="text-xs text-slate-500">
          Clear all transactions, investments, and goals from local storage, or reset to initial sample data.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={restoreSampleData}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-emerald-500" />
            <span>Restore Sample Data</span>
          </button>

          <button
            onClick={onOpenConfirmReset}
            className="px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
