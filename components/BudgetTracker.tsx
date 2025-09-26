
import React from 'react';
import { ExpenseCategory } from '../types';

interface BudgetTrackerProps {
  category: ExpenseCategory;
  spent: number;
  limit: number;
}

const getCategoryColor = (category: ExpenseCategory) => {
  switch (category) {
    case ExpenseCategory.Housing: return 'bg-blue-500';
    case ExpenseCategory.Transportation: return 'bg-purple-500';
    case ExpenseCategory.FoodAndDining: return 'bg-orange-500';
    case ExpenseCategory.Healthcare: return 'bg-red-500';
    case ExpenseCategory.Entertainment: return 'bg-yellow-500';
    case ExpenseCategory.Shopping: return 'bg-pink-500';
    case ExpenseCategory.PersonalCare: return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ category, spent, limit }) => {
  const percentage = Math.min((spent / limit) * 100, 100);
  const isOverBudget = spent > limit;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-medium text-gray-700">{category}</span>
        <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-gray-500'}`}>
          ${spent.toFixed(0)} / ${limit.toFixed(0)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${isOverBudget ? 'bg-red-500' : getCategoryColor(category)} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BudgetTracker;
