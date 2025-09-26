import React from 'react';
import { Budget, Goal, Expense, Currency, TimePeriod } from '../types';
import GoalTracker from './GoalTracker';
import DonutChart from './DonutChart';
import { CashIcon, TrendingUpIcon, ChartPieIcon, PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from './icons';
import { formatCurrency } from '../utils/formatting';

interface DashboardProps {
  budget: Budget;
  goals: Goal[];
  expenses: Expense[];
  currency: Currency;
  onAddGoalClick: () => void;
  onAddCategoryClick: () => void;
  onDeleteGoal: (id: string) => void;
  onDeleteCategory: (category: string) => void;
  onEditCategory: (category: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  onCustomDateRangeClick: () => void;
  dateRange: { start: string | null; end: string | null };
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
        </div>
    </div>
);

const TimePeriodSelector: React.FC<{ selected: TimePeriod, onChange: (period: TimePeriod) => void, onCustomClick: () => void }> = ({ selected, onChange, onCustomClick }) => {
    const periods: { id: TimePeriod, label: string }[] = [
        { id: 'week', label: 'This Week' },
        { id: 'month', label: 'This Month' },
        { id: 'all', label: 'All Time' },
    ];
    return (
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
            {periods.map(period => (
                <button
                    key={period.id}
                    onClick={() => onChange(period.id)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${selected === period.id ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    {period.label}
                </button>
            ))}
            <button
                onClick={onCustomClick}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${selected === 'custom' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
                <CalendarIcon className="w-4 h-4" />
                Custom
            </button>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ budget, goals, expenses, currency, onAddGoalClick, onAddCategoryClick, onDeleteGoal, onDeleteCategory, onEditCategory, onEditExpense, onDeleteExpense, timePeriod, onTimePeriodChange, onCustomDateRangeClick, dateRange }) => {
  const totalSpent = Object.values(budget).reduce((sum, cat) => sum + cat.spent, 0);
  const totalLimit = Object.values(budget).reduce((sum, cat) => sum + cat.limit, 0);
  const netCashFlow = totalLimit - totalSpent;
  
  const topCategory = Object.entries(budget).reduce((top, [cat, data]) => {
      return data.spent > top.spent ? { category: cat, spent: data.spent } : top;
  }, { category: 'None', spent: 0 });

  const getStatCardTitle = () => {
    switch (timePeriod) {
        case 'week': return 'This Week';
        case 'month': return 'This Month';
        case 'all': return 'All Time';
        case 'custom': return 'Custom Range';
        default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Financial Overview</h2>
            {timePeriod === 'custom' && dateRange.start && dateRange.end && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Showing data from <strong>{new Date(dateRange.start).toLocaleDateString()}</strong> to <strong>{new Date(dateRange.end).toLocaleDateString()}</strong>
                </p>
            )}
        </div>
        <TimePeriodSelector selected={timePeriod} onChange={onTimePeriodChange} onCustomClick={onCustomDateRangeClick} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title={`Total Spent (${getStatCardTitle()})`}
            value={formatCurrency(totalSpent, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            icon={<CashIcon className="w-6 h-6 text-white" />}
            color="bg-indigo-500"
        />
        <StatCard 
            title="Net Cash Flow" 
            value={formatCurrency(netCashFlow, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            icon={<TrendingUpIcon className={`w-6 h-6 text-white ${netCashFlow < 0 ? 'transform scale-y-[-1]' : ''}`} />}
            color={netCashFlow >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
        />
         <StatCard 
            title="Top Spending Category" 
            value={topCategory.category}
            icon={<ChartPieIcon className="w-6 h-6 text-white" />}
            color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Spending Breakdown</h3>
              <button 
                onClick={onAddCategoryClick}
                className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
              >
                <PlusIcon className="w-4 h-4" />
                Add Category
              </button>
            </div>
            <DonutChart budget={budget} currency={currency} onDeleteCategory={onDeleteCategory} onEditCategory={onEditCategory} />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Financial Goals</h3>
                <button 
                  onClick={onAddGoalClick}
                  className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
              {goals.map(goal => (
                <GoalTracker key={goal.id} goal={goal} currency={currency} onDelete={onDeleteGoal} />
              ))}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Transactions</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {expenses.slice(0).reverse().slice(0, 5).map(expense => (
                            <li key={expense.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{expense.description}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {expense.category}
                                      {expense.subcategory && <span className="ml-2 text-slate-400 dark:text-slate-500">({expense.subcategory})</span>}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(expense.amount, currency.code, currency.locale)}</span>
                                    <button
                                      onClick={() => onEditExpense(expense)}
                                      className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                                      aria-label={`Edit transaction: ${expense.description}`}
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteExpense(expense.id)}
                                      className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400"
                                      aria-label={`Delete transaction: ${expense.description}`}
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                        {expenses.length === 0 && <p className="p-4 text-sm text-slate-500 dark:text-slate-400">No transactions for this period.</p>}
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;