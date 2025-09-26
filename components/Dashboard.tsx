
import React from 'react';
import { Budget, Goal, Expense, Currency, TimePeriod, Achievement, CryptoHolding, CryptoPrice } from '../types';
import GoalTracker from './GoalTracker';
import DonutChart from './DonutChart';
import WellnessTracker from './WellnessTracker';
import CryptoTracker from './CryptoTracker';
import { CashIcon, TrendingUpIcon, ChartPieIcon, PlusIcon, PencilIcon, TrashIcon, CalendarIcon, CryptoIcon } from './icons';
import { formatCurrency } from '../utils/formatting';
import { useI18n } from '../i18n';

interface DashboardProps {
  budget: Budget;
  goals: Goal[];
  expenses: Expense[];
  currency: Currency;
  supportedCurrencies: Currency[];
  achievements: Achievement[];
  cryptoHoldings: CryptoHolding[];
  cryptoPrices: CryptoPrice;
  cryptoDisplayCurrency: Currency;
  onCryptoDisplayCurrencyChange: (code: string) => void;
  onAddGoalClick: () => void;
  onAddCategoryClick: () => void;
  onAddCryptoClick: () => void;
  onDeleteGoal: (id: string) => void;
  onDeleteCategory: (category: string) => void;
  onEditCategory: (category: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onEditCrypto: (holding: CryptoHolding) => void;
  onDeleteCrypto: (id: string) => void;
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
    const { t } = useI18n();
    const periods: { id: TimePeriod, label: string }[] = [
        { id: 'week', label: t('timePeriod.week') },
        { id: 'month', label: t('timePeriod.month') },
        { id: 'all', label: t('timePeriod.all') },
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
                {t('timePeriod.custom')}
            </button>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = (props) => {
  const { budget, goals, expenses, currency, supportedCurrencies, achievements, cryptoHoldings, cryptoPrices, cryptoDisplayCurrency, onCryptoDisplayCurrencyChange, onAddGoalClick, onAddCategoryClick, onAddCryptoClick, onDeleteGoal, onDeleteCategory, onEditCategory, onEditExpense, onDeleteExpense, onEditCrypto, onDeleteCrypto, timePeriod, onTimePeriodChange, onCustomDateRangeClick, dateRange } = props;
  const { t } = useI18n();

  const totalSpent = Object.values(budget).reduce((sum, cat) => sum + cat.spent, 0);
  const totalLimit = Object.values(budget).reduce((sum, cat) => sum + cat.limit, 0);
  const netCashFlow = totalLimit - totalSpent;
  
  const topCategory = Object.entries(budget).reduce((top, [cat, data]) => {
      return data.spent > top.spent ? { category: cat, spent: data.spent } : top;
  }, { category: 'None', spent: 0 });

  const totalCryptoValue = cryptoHoldings.reduce((sum, holding) => {
    const price = cryptoPrices[holding.apiId]?.[cryptoDisplayCurrency.code.toLowerCase()] || 0;
    return sum + holding.amount * price;
  }, 0);

  const getStatCardTitle = () => {
    switch (timePeriod) {
        case 'week': return t('timePeriod.week');
        case 'month': return t('timePeriod.month');
        case 'all': return t('timePeriod.all');
        case 'custom': return t('timePeriod.custom');
        default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('financialOverview')}</h2>
            {timePeriod === 'custom' && dateRange.start && dateRange.end && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('showingDataFrom')} <strong>{new Date(dateRange.start).toLocaleDateString()}</strong> {t('to')} <strong>{new Date(dateRange.end).toLocaleDateString()}</strong>
                </p>
            )}
        </div>
        <TimePeriodSelector selected={timePeriod} onChange={onTimePeriodChange} onCustomClick={onCustomDateRangeClick} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title={`${t('statCard.totalSpent')} (${getStatCardTitle()})`}
            value={formatCurrency(totalSpent, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            icon={<CashIcon className="w-6 h-6 text-white" />}
            color="bg-indigo-500"
        />
        <StatCard 
            title={t('statCard.netCashFlow')}
            value={formatCurrency(netCashFlow, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            icon={<TrendingUpIcon className={`w-6 h-6 text-white ${netCashFlow < 0 ? 'transform scale-y-[-1]' : ''}`} />}
            color={netCashFlow >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
        />
         <StatCard 
            title={t('statCard.topSpending')}
            value={topCategory.category}
            icon={<ChartPieIcon className="w-6 h-6 text-white" />}
            color="bg-amber-500"
        />
        <StatCard 
            title={t('statCard.cryptoValue')}
            value={formatCurrency(totalCryptoValue, cryptoDisplayCurrency.code, cryptoDisplayCurrency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            icon={<CryptoIcon className="w-6 h-6 text-white" />}
            color="bg-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('spendingBreakdown')}</h3>
              <button 
                onClick={onAddCategoryClick}
                className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
              >
                <PlusIcon className="w-4 h-4" />
                {t('addCategory')}
              </button>
            </div>
            <DonutChart budget={budget} currency={currency} onDeleteCategory={onDeleteCategory} onEditCategory={onEditCategory} />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6">
             <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('achievements')}</h3>
              <WellnessTracker achievements={achievements} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('financialGoals')}</h3>
                <button 
                  onClick={onAddGoalClick}
                  className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                >
                  <PlusIcon className="w-4 h-4" />
                  {t('addGoal')}
                </button>
              </div>
              {goals.map(goal => (
                <GoalTracker key={goal.id} goal={goal} currency={currency} onDelete={onDeleteGoal} />
              ))}
              {goals.length === 0 && <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">{t('goal.placeholder')}</p>}
            </div>
             <div>
                <CryptoTracker 
                    holdings={cryptoHoldings}
                    prices={cryptoPrices}
                    displayCurrency={cryptoDisplayCurrency}
                    onDisplayCurrencyChange={onCryptoDisplayCurrencyChange}
                    supportedCurrencies={supportedCurrencies}
                    onAddClick={onAddCryptoClick}
                    onEdit={onEditCrypto}
                    onDelete={onDeleteCrypto}
                />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('recentTransactions')}</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {expenses.slice(0).reverse().map(expense => (
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
                        {expenses.length === 0 && <p className="p-4 text-sm text-slate-500 dark:text-slate-400">{t('transactions.placeholder')}</p>}
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