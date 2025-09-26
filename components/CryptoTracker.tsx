

import React from 'react';
import { CryptoHolding, CryptoPrice, Currency } from '../types';
import { formatCurrency } from '../utils/formatting';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import { useI18n } from '../i18n';

interface CryptoTrackerProps {
    holdings: CryptoHolding[];
    prices: CryptoPrice;
    displayCurrency: Currency;
    onDisplayCurrencyChange: (code: string) => void;
    supportedCurrencies: Currency[];
    onAddClick: () => void;
    onEdit: (holding: CryptoHolding) => void;
    onDelete: (id: string) => void;
}

const CryptoTracker: React.FC<CryptoTrackerProps> = ({ holdings, prices, displayCurrency, onDisplayCurrencyChange, supportedCurrencies, onAddClick, onEdit, onDelete }) => {
    const { t } = useI18n();
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('cryptoHoldings')}</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="crypto-currency-select" className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('crypto.displayIn')}</label>
                        <select
                            id="crypto-currency-select"
                            value={displayCurrency.code}
                            onChange={(e) => onDisplayCurrencyChange(e.target.value)}
                            className="block w-full pl-3 pr-8 py-1 text-sm border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 shadow-sm transition"
                        >
                            {supportedCurrencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                    </div>
                    <button 
                      onClick={onAddClick}
                      className="flex items-center gap-1 text-sm bg-sky-100 text-sky-700 font-semibold px-3 py-1 rounded-full hover:bg-sky-200 transition-colors dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-900 whitespace-nowrap"
                    >
                      <PlusIcon className="w-4 h-4" />
                      {t('crypto.addAsset')}
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {holdings.map(holding => {
                        const price = prices[holding.apiId]?.[displayCurrency.code.toLowerCase()] || 0;
                        const value = holding.amount * price;
                        return (
                            <li key={holding.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {holding.name} ({holding.symbol.toUpperCase()}) - {holding.amount} {t('crypto.coinsUnit')}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {t('crypto.pricePerCoinUnit')} {formatCurrency(price, displayCurrency.code, displayCurrency.locale)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(value, displayCurrency.code, displayCurrency.locale)}</span>
                                    <button
                                      onClick={() => onEdit(holding)}
                                      className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                                      aria-label={`Edit ${holding.name}`}
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => onDelete(holding.id)}
                                      className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400"
                                      aria-label={`Delete ${holding.name}`}
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                    {holdings.length === 0 && <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">{t('crypto.placeholder')}</p>}
                </ul>
            </div>
        </div>
    );
};

export default CryptoTracker;