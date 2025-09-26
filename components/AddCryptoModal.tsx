import React, { useState, useEffect, useMemo } from 'react';
import { CryptoCoin, CryptoHolding, Currency, CryptoPrice } from '../types';
import { CloseIcon } from './icons';
import { formatCurrency } from '../utils/formatting';
import { fetchCryptoPrices } from '../services/cryptoService';
import { useI18n } from '../i18n';


interface AddCryptoModalProps {
  onClose: () => void;
  onSave: (holding: Omit<CryptoHolding, 'id'>, id?: string) => void;
  supportedCoins: CryptoCoin[];
  initialData?: CryptoHolding | null;
  supportedCurrencies: Currency[];
  cryptoPrices: CryptoPrice;
  previewCurrency: Currency;
}

const AddCryptoModal: React.FC<AddCryptoModalProps> = ({ onClose, onSave, supportedCoins, initialData, supportedCurrencies, cryptoPrices, previewCurrency }) => {
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const [amount, setAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [prefetchedPrices, setPrefetchedPrices] = useState<CryptoPrice>({});
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const { t } = useI18n();

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing && initialData) {
      const coin = supportedCoins.find(c => c.id === initialData.apiId);
      if (coin) {
        handleCoinSelect(coin, true);
        setSearchTerm(`${coin.name} (${coin.symbol.toUpperCase()})`);
      }
      setAmount(initialData.amount.toString());
    }
  }, [initialData, isEditing, supportedCoins]);
  
  const filteredCoins = useMemo(() => {
    if (!searchTerm || (isEditing && selectedCoin)) return [];
    return supportedCoins
      .filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 100); // Limit results for performance
  }, [searchTerm, supportedCoins, isEditing, selectedCoin]);

  const previewValue = useMemo(() => {
    if (!selectedCoin || !amount) return 0;
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) return 0;

    const allPrices = { ...cryptoPrices, ...prefetchedPrices };
    const price = allPrices[selectedCoin.id]?.[previewCurrency.code.toLowerCase()];
    if (!price) return 0;
    
    return amountValue * price;
  }, [selectedCoin, amount, cryptoPrices, prefetchedPrices, previewCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseFloat(amount);
    if (selectedCoin && !isNaN(amountValue) && amountValue > 0) {
      onSave({
        apiId: selectedCoin.id,
        name: selectedCoin.name,
        symbol: selectedCoin.symbol,
        amount: amountValue,
      }, initialData?.id);
    }
  };

  const handleCoinSelect = async (coin: CryptoCoin, shouldClearSearch = true) => {
    setSelectedCoin(coin);
    if(shouldClearSearch) {
        setSearchTerm(`${coin.name} (${coin.symbol.toUpperCase()})`);
    }

    const allPrices = { ...cryptoPrices, ...prefetchedPrices };
    if (!allPrices[coin.id]) {
        setIsFetchingPrice(true);
        const currencyCodes = supportedCurrencies.map(c => c.code);
        const newPrices = await fetchCryptoPrices([coin.id], currencyCodes);
        if (newPrices) {
            setPrefetchedPrices(prev => ({ ...prev, ...newPrices }));
        }
        setIsFetchingPrice(false);
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
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{isEditing ? t('addCryptoModal.title.edit') : t('addCryptoModal.title.add')}</h2>
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
            <div className="relative">
              <label htmlFor="coin-search" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('addCryptoModal.searchLabel')}</label>
              <input
                type="text"
                id="coin-search"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                }}
                placeholder={t('addCryptoModal.searchPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-700"
                required
                autoComplete="off"
                disabled={isEditing}
              />
              {searchTerm && !selectedCoin && filteredCoins.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {filteredCoins.map(coin => (
                    <li
                      key={coin.id}
                      onClick={() => handleCoinSelect(coin)}
                      className="px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                    >
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('addCryptoModal.amountLabel')}</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t('addCryptoModal.amountPlaceholder')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                    required
                    min="0.00000001"
                    step="any"
                />
            </div>

            {(isFetchingPrice || previewValue > 0) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isFetchingPrice ? (
                          <span className="animate-pulse">{t('addCryptoModal.fetchingPrice')}</span>
                      ) : (
                          <>
                            {t('addCryptoModal.estimatedValue')}: <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(previewValue, previewCurrency.code, previewCurrency.locale)}</span>
                          </>
                      )}
                    </p>
                </div>
            )}
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
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={!selectedCoin || !amount || isFetchingPrice}
            >
              {isEditing ? t('addCryptoModal.button.edit') : t('addCryptoModal.button.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCryptoModal;