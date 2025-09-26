import React from 'react';
import { Budget, Currency } from '../types';
import { formatCurrency } from '../utils/formatting';
import { TrashIcon, PencilIcon } from './icons';
import { useI18n } from '../i18n';

const PALETTE = [
  '#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ef4444', '#f59e0b', '#ec4899',
  '#14b8a6', '#6366f1', '#d946ef', '#06b6d4', '#f43f5e',
];

const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const getCategoryColor = (category: string) => {
  const hash = stringToHash(category);
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
};


const DonutChart: React.FC<{ budget: Budget, currency: Currency, onDeleteCategory: (category: string) => void, onEditCategory: (category: string) => void }> = ({ budget, currency, onDeleteCategory, onEditCategory }) => {
  const { t } = useI18n();
  const categories = Object.entries(budget).filter(([, data]) => data.spent > 0);
  const totalSpent = categories.reduce((sum, [, data]) => sum + data.spent, 0);

  if (totalSpent === 0 && Object.keys(budget).length === 0) {
      return <div className="text-center text-slate-500 dark:text-slate-400 p-8">{t('donut.noCategories')}</div>;
  }
  
  if (totalSpent === 0) {
      return <div className="text-center text-slate-500 dark:text-slate-400 p-8">{t('donut.noSpending')}</div>;
  }

  let cumulativePercentage = 0;

  return (
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
                {categories.map(([category, data]) => {
                    const percentage = (data.spent / totalSpent) * 100;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = -cumulativePercentage;
                    cumulativePercentage += percentage;
                    const color = getCategoryColor(category);

                    return (
                        <circle
                            key={category}
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    );
                })}
            </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('donut.totalSpent')}</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalSpent, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
        </div>
        <div className="w-full">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {Object.entries(budget).map(([category, data]) => {
                    const isOverBudget = data.limit > 0 && data.spent > data.limit;
                    return (
                        <li key={category} className="flex items-center justify-between text-sm py-3">
                            <div className="flex items-center">
                                <span 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: getCategoryColor(category) }}
                                ></span>
                                <span className={`${isOverBudget ? 'text-red-600 dark:text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`font-semibold mr-1 ${isOverBudget ? 'text-red-600 dark:text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{formatCurrency(data.spent, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                               <button
                                onClick={() => onEditCategory(category)}
                                className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                aria-label={`Edit category: ${category}`}
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteCategory(category)}
                                className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                aria-label={`Delete category: ${category}`}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    </div>
  );
};

export default DonutChart;