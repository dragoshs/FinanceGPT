import React, { useState } from 'react';
import { Currency } from '../types';
import { CloseIcon, QuestionMarkCircleIcon } from './icons';
import { useI18n } from '../i18n';

interface AddCategoryModalProps {
  onClose: () => void;
  onAddCategory: (category: { name: string; limit: number }) => void;
  currency: Currency;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, onAddCategory, currency }) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitAmount = parseFloat(limit);
    if (name.trim() && !isNaN(limitAmount) && limitAmount > 0) {
      onAddCategory({
        name: name.trim(),
        limit: limitAmount,
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
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('addCategoryModal.title')}</h2>
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
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('addCategoryModal.nameLabel')}</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('addCategoryModal.namePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <div className="flex items-center mb-1">
                <label htmlFor="limit" className="block text-sm font-medium text-slate-600 dark:text-slate-300">{t('addCategoryModal.limitLabel', { currencyCode: currency.code })}</label>
                <div className="relative group ml-2">
                    <QuestionMarkCircleIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {t('common.monthlyLimitTooltip')}
                    </div>
                </div>
              </div>
              <input
                  type="number"
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  required
                  min="0.01"
                  step="0.01"
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
              {t('addCategoryModal.button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;