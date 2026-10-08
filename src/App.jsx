import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthView } from './components/Views/AuthView';
import { Sidebar } from './components/Layout/Sidebar';
import { BottomNav } from './components/Layout/BottomNav';
import { Header } from './components/Layout/Header';

import { DashboardView } from './components/Views/DashboardView';
import { TransactionsView } from './components/Views/TransactionsView';
import { InvestmentsView } from './components/Views/InvestmentsView';
import { GoalsView } from './components/Views/GoalsView';
import { BudgetsView } from './components/Views/BudgetsView';
import { ReportsView } from './components/Views/ReportsView';
import { SettingsView } from './components/Views/SettingsView';

import { TransactionModal } from './components/Modals/TransactionModal';
import { InvestmentModal } from './components/Modals/InvestmentModal';
import { GoalModal } from './components/Modals/GoalModal';
import { TopUpGoalModal } from './components/Modals/TopUpGoalModal';
import { BudgetModal } from './components/Modals/BudgetModal';
import { ConfirmModal } from './components/Modals/ConfirmModal';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { dataLoading, deleteTransaction, deleteInvestment, deleteGoal, deleteBudget, resetAllData } = useFinance();

  // Modal Visibility & Editing States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedTopUpGoal, setSelectedTopUpGoal] = useState(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: true
  });

  if (dataLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-slate-300 text-sm font-medium">Syncing account financial data from database...</p>
      </div>
    );
  }

  // Open Handlers
  const handleOpenAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddInvestment = () => {
    setEditingInvestment(null);
    setIsInvestmentModalOpen(true);
  };

  const handleOpenEditInvestment = (inv) => {
    setEditingInvestment(inv);
    setIsInvestmentModalOpen(true);
  };

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenTopUpGoal = (goal) => {
    setSelectedTopUpGoal(goal);
    setIsTopUpModalOpen(true);
  };

  const handleOpenAddBudget = () => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  const handleOpenEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  // Confirm Delete Handlers
  const handleOpenConfirmDelete = (entityType, id, name) => {
    let title = 'Delete Confirmation';
    let message = `Are you sure you want to delete "${name}"?`;
    let action = () => {};

    if (entityType === 'transaction') {
      title = 'Delete Transaction';
      message = `Are you sure you want to delete transaction "${name}"?`;
      action = () => deleteTransaction(id);
    } else if (entityType === 'investment') {
      title = 'Delete Investment';
      message = `Are you sure you want to delete investment "${name}"?`;
      action = () => deleteInvestment(id);
    } else if (entityType === 'goal') {
      title = 'Delete Goal';
      message = `Are you sure you want to delete goal "${name}"? Linked investments will be unlinked.`;
      action = () => deleteGoal(id);
    } else if (entityType === 'budget') {
      title = 'Delete Budget Cap';
      message = `Are you sure you want to delete budget limit for category "${name}"?`;
      action = () => deleteBudget(id);
    }

    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: action,
      isDanger: true
    });
  };

  const handleOpenConfirmReset = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset All Data',
      message: 'This action will permanently delete all stored transactions, investments, goals, and custom settings from local storage. Are you sure?',
      onConfirm: resetAllData,
      isDanger: true
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar for Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTransaction={handleOpenAddTransaction}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header
          activeTab={activeTab}
          onOpenAddTransaction={handleOpenAddTransaction}
        />

        {/* Dynamic Main View Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenAddTransaction={handleOpenAddTransaction}
              onOpenAddInvestment={handleOpenAddInvestment}
              onOpenTopUpGoal={handleOpenTopUpGoal}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenAddTransaction={handleOpenAddTransaction}
              onEditTransaction={handleOpenEditTransaction}
              onOpenConfirmDelete={handleOpenConfirmDelete}
            />
          )}

          {activeTab === 'investments' && (
            <InvestmentsView
              onOpenAddInvestment={handleOpenAddInvestment}
              onEditInvestment={handleOpenEditInvestment}
              onOpenConfirmDelete={handleOpenConfirmDelete}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              onOpenAddGoal={handleOpenAddGoal}
              onEditGoal={handleOpenEditGoal}
              onOpenTopUpGoal={handleOpenTopUpGoal}
              onOpenConfirmDelete={handleOpenConfirmDelete}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              onOpenAddBudget={handleOpenAddBudget}
              onEditBudget={handleOpenEditBudget}
              onOpenConfirmDelete={handleOpenConfirmDelete}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenConfirmReset={handleOpenConfirmReset}
            />
          )}
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTransaction={handleOpenAddTransaction}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        initialData={editingTransaction}
      />

      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        initialData={editingInvestment}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        initialData={editingGoal}
      />

      <TopUpGoalModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        goal={selectedTopUpGoal}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categoryToEdit={editingBudget}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDanger={confirmConfig.isDanger}
      />
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
