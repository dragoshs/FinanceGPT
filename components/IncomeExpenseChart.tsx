import React from 'react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatting';
import { useI18n } from '../i18n';

interface IncomeExpenseChartProps {
  income: number;
  expenses: number;
  currency: Currency;
}

const Bar: React.FC<{ value: number; maxValue: number; color: string; label: string; currency: Currency; }> = ({ value, maxValue, color, label, currency }) => {
  const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex flex-col items-center w-1/3">
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
        {formatCurrency(value, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </div>
      <div
        className={`w-12 rounded-lg ${color} transition-all duration-700 ease-out`}
        style={{ height: `${heightPercentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
        aria-label={`${label} bar`}
      ></div>
      <div className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
};


const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ income, expenses, currency }) => {
    const { t } = useI18n();
    const maxValue = Math.max(income, expenses, 1); // use 1 to avoid division by zero if both are 0
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 text-center">{t('incomeVsExpenses.title')}</h3>
            <div className="flex justify-around items-end h-48">
                <Bar value={income} maxValue={maxValue} color="bg-emerald-500" label={t('incomeVsExpenses.income')} currency={currency} />
                <Bar value={expenses} maxValue={maxValue} color="bg-indigo-500" label={t('incomeVsExpenses.expenses')} currency={currency} />
            </div>
        </div>
    );
};

export default IncomeExpenseChart;