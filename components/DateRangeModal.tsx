import React, { useState } from 'react';
import { CloseIcon } from './icons';
import { useI18n } from '../i18n';

interface DateRangeModalProps {
  onClose: () => void;
  onSetDateRange: (start: string, end: string) => void;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({ onClose, onSetDateRange }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (start && end) {
      onSetDateRange(start, end);
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
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('dateRangeModal.title')}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('dateRangeModal.startLabel')}</label>
              <input
                type="date"
                id="start-date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('dateRangeModal.endLabel')}</label>
              <input
                type="date"
                id="end-date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                required
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
              {t('dateRangeModal.button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DateRangeModal;