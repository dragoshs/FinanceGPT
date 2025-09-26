import React from 'react';
import { Currency } from '../types';

interface CurrencySwitcherProps {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
  currencies: Currency[];
}

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ currentCurrency, onCurrencyChange, currencies }) => {
  return (
    <div>
      <label htmlFor="currency-select" className="sr-only">Select Currency</label>
      <select
        id="currency-select"
        value={currentCurrency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 shadow-sm transition"
        aria-label="Select currency"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySwitcher;