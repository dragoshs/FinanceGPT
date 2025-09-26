import React from 'react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatting';
import { useI18n } from '../i18n';

interface IncomeExpenseChartProps {
  income: number;
  expenses: number;
  currency: Currency;
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ income, expenses, currency }) => {
    const { t } = useI18n();
    const total = income + expenses;
    const netCashFlow = income - expenses;

    if (total === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">{t('incomeVsExpenses.title')}</h3>
                <div className="h-48 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    {t('incomeVsExpenses.noData')}
                </div>
            </div>
        );
    }
    
    const incomePercentage = (income / total) * 100;
    const expensesPercentage = (expenses / total) * 100;

    const segments = [
        { percentage: incomePercentage, color: '#10b981', label: t('incomeVsExpenses.income'), value: income },
        { percentage: expensesPercentage, color: '#6366f1', label: t('incomeVsExpenses.expenses'), value: expenses },
    ];

    let cumulativePercentage = 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">{t('incomeVsExpenses.title')}</h3>
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-40 h-40 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="currentColor"
                            className="text-slate-200 dark:text-slate-700"
                            strokeWidth="3"
                        />
                        {segments.map((segment, index) => {
                            if (segment.percentage === 0) return null;
                            const strokeDasharray = `${segment.percentage} ${100 - segment.percentage}`;
                            const strokeDashoffset = -cumulativePercentage;
                            cumulativePercentage += segment.percentage;
                            
                            return (
                                <circle
                                    key={index}
                                    cx="18"
                                    cy="18"
                                    r="15.9155"
                                    fill="none"
                                    stroke={segment.color}
                                    strokeWidth="3"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{t('statCard.netCashFlow')}</span>
                        <span className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(netCashFlow, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
                <div className="w-full">
                    <ul className="space-y-2">
                        {segments.map((segment, index) => (
                             <li key={index} className="flex items-center justify-between text-sm py-1">
                                <div className="flex items-center">
                                    <span 
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: segment.color }}
                                    ></span>
                                    <span className="text-slate-600 dark:text-slate-300">{segment.label}</span>
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {formatCurrency(segment.value, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default IncomeExpenseChart;