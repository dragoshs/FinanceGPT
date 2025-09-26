import React from 'react';
import { Goal, Currency } from '../types';
import { formatCurrency } from '../utils/formatting';
import { TrashIcon } from './icons';

interface GoalTrackerProps {
  goal: Goal;
  currency: Currency;
  onDelete: (id: string) => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goal, currency, onDelete }) => {
  const percentage = Math.min((goal.saved / goal.target) * 100, 100);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-4 relative">
       <button 
        onClick={() => onDelete(goal.id)}
        className="absolute top-2 right-2 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label={`Delete goal: ${goal.description}`}
      >
        <TrashIcon className="w-4 h-4" />
      </button>
      <div className="flex justify-between items-baseline mb-1 pr-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{goal.description}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
            Target: {formatCurrency(goal.target, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>
     
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
        <div
          className="bg-teal-500 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        >
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <p className="font-medium text-slate-600 dark:text-slate-300">
            {formatCurrency(goal.saved, currency.code, currency.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} saved
        </p>
        <p className="font-semibold text-teal-600 dark:text-teal-400">{percentage.toFixed(0)}%</p>
      </div>
    </div>
  );
};

export default GoalTracker;