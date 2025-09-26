import React, { useState } from 'react';
import { Goal, Currency } from '../types';
import { CloseIcon } from './icons';
import { useI18n } from '../i18n';

interface AddGoalModalProps {
  onClose: () => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'saved'>) => void;
  currency: Currency;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose, onAddGoal, currency }) => {
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(target);
    if (description.trim() && !isNaN(targetAmount) && targetAmount > 0) {
      onAddGoal({
        description,
        target: targetAmount,
        deadline: deadline || undefined,
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('addGoalModal.title')}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('addGoalModal.descriptionLabel')}</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('addGoalModal.descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('addGoalModal.targetLabel', { currencyCode: currency.code })}</label>
              <input
                  type="number"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="2000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  required
                  min="0.01"
                  step="0.01"
              />
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('addGoalModal.deadlineLabel')}</label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end items-center p-5 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl space-x-3 border-t dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-800"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('addGoalModal.button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;