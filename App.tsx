import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ChatWindow from './components/ChatWindow';
import AddGoalModal from './components/AddGoalModal';
import AddCategoryModal from './components/AddCategoryModal';
import ConfirmationModal from './components/ConfirmationModal';
import EditExpenseModal from './components/EditExpenseModal';
import EditCategoryModal from './components/EditCategoryModal';
import DateRangeModal from './components/DateRangeModal';
import AddCryptoModal from './components/AddCryptoModal';
import {
  Budget,
  Goal,
  Expense,
  ChatMessage,
  MessageRole,
  ResponseType,
  GeminiResponse,
  Currency,
  TimePeriod,
  ExpenseCategory,
  Achievement,
  CryptoHolding,
  CryptoPrice,
  CryptoCoin,
  Income,
  BudgetCategory,
} from './types';
import { INITIAL_BUDGET, INITIAL_GOALS, INITIAL_EXPENSES, SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, INITIAL_INCOME } from './constants';
import { getFinancialAdvice, getCelebratoryMessage } from './services/geminiService';
import { fetchCryptoPrices, fetchSupportedCoins } from './services/cryptoService';
import CurrencySwitcher from './components/CurrencySwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';
import { MoonIcon, SunIcon } from './components/icons';
import { I18nProvider, useI18n } from './i18n';

const getInitialTheme = (): 'light' | 'dark' => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'dark';
};

const AppContent: React.FC = () => {
  const [budget, setBudget] = useState<Budget>(INITIAL_BUDGET);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [income, setIncome] = useState<Income[]>(INITIAL_INCOME);
  const { t, languageCode, setLanguageCode } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMessages([{ role: MessageRole.MODEL, content: t('initialGreeting') }]);
  }, [t]);


  const [isLoading, setIsLoading] = useState(false);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ name: string; limit: number } | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  
  const [isPlaygroundMode, setIsPlaygroundMode] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [awardedAchievements, setAwardedAchievements] = useState<Set<string>>(new Set());
  
  // Crypto State
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice>({});
  const [supportedCoins, setSupportedCoins] = useState<CryptoCoin[]>([]);
  const [isAddCryptoModalOpen, setIsAddCryptoModalOpen] = useState(false);
  const [editingCrypto, setEditingCrypto] = useState<CryptoHolding | null>(null);
  const [cryptoDisplayCurrencyCode, setCryptoDisplayCurrencyCode] = useState<string>(currencyCode);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Sync crypto display currency when main currency changes
  useEffect(() => {
    setCryptoDisplayCurrencyCode(currencyCode);
  }, [currencyCode]);
  
  // Fetch supported coins on initial load
  useEffect(() => {
    const loadSupportedCoins = async () => {
      const coins = await fetchSupportedCoins();
      setSupportedCoins(coins);
    };
    loadSupportedCoins();
  }, []);

  // Fetch crypto prices when holdings change
  useEffect(() => {
    if (cryptoHoldings.length > 0) {
      const fetchPrices = async () => {
        const coinIds = cryptoHoldings.map(h => h.apiId);
        const currencyCodes = SUPPORTED_CURRENCIES.map(c => c.code);
        const prices = await fetchCryptoPrices(coinIds, currencyCodes);
        if (prices) {
          setCryptoPrices(prices);
        }
      };
      fetchPrices();
    }
  }, [cryptoHoldings]);

  // Financial Wellness System Logic
  useEffect(() => {
    const checkAchievements = async () => {
      // Goal Milestone Achievements
      goals.forEach(async (goal) => {
        // 50% Milestone
        const achievementId50 = `goal-50-${goal.id}`;
        if (goal.saved / goal.target >= 0.5 && !awardedAchievements.has(achievementId50)) {
          const message = await getCelebratoryMessage(`Reaching 50% of the goal: "${goal.description}"`);
          setAchievements(prev => [...prev, { id: achievementId50, title: 'Goal Milestone!', message, date: new Date().toISOString() }]);
          setAwardedAchievements(prev => new Set(prev).add(achievementId50));
        }

        // 75% Milestone
        const achievementId75 = `goal-75-${goal.id}`;
        if (goal.saved / goal.target >= 0.75 && !awardedAchievements.has(achievementId75)) {
          const message = await getCelebratoryMessage(`Reaching 75% of the goal: "${goal.description}"`);
          setAchievements(prev => [...prev, { id: achievementId75, title: 'Almost There!', message, date: new Date().toISOString() }]);
          setAwardedAchievements(prev => new Set(prev).add(achievementId75));
        }
      });
      
      // 3-Month Under Budget Streak Achievement
      const budgetStreakId = 'under-budget-3-months';
      if (!awardedAchievements.has(budgetStreakId)) {
        const today = new Date();
        let isStreak = true;
        const totalBudgetLimit = (Object.values(budget) as BudgetCategory[]).reduce((sum, cat) => sum + cat.limit, 0);

        if (totalBudgetLimit > 0) { // Only check if a budget is actually set
            for (let i = 1; i <= 3; i++) {
                // Get the start and end of the i-th previous month
                const dateForMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const year = dateForMonth.getFullYear();
                const month = dateForMonth.getMonth();
    
                const startDate = new Date(year, month, 1);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(year, month + 1, 0);
                endDate.setHours(23, 59, 59, 999);

                const monthlyExpenses = expenses
                    .filter(e => {
                        const expenseDate = new Date(e.date);
                        return expenseDate >= startDate && expenseDate <= endDate;
                    })
                    .reduce((sum, e) => sum + e.amount, 0);
                
                if (monthlyExpenses > totalBudgetLimit) {
                    isStreak = false;
                    break;
                }
            }
        } else {
            isStreak = false; // No budget limit means no streak is possible
        }
    
        if (isStreak) {
            const message = await getCelebratoryMessage("Staying under budget for 3 consecutive months");
            setAchievements(prev => [...prev, { id: budgetStreakId, title: 'Budgeting Pro!', message, date: new Date().toISOString() }]);
            setAwardedAchievements(prev => new Set(prev).add(budgetStreakId));
        }
      }
    };

    checkAchievements();
  }, [goals, expenses, budget, awardedAchievements]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  const cryptoDisplayCurrency = SUPPORTED_CURRENCIES.find(c => c.code === cryptoDisplayCurrencyCode) || SUPPORTED_CURRENCIES[0];

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (timePeriod === 'custom' && dateRange.start && dateRange.end) {
        startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
    } else if (timePeriod === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timePeriod === 'week') {
        startDate = new Date(now);
        const dayOfWeek = now.getDay();
        startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startDate.setHours(0, 0, 0, 0);
    } else {
        startDate = new Date(0);
    }

    const relevantExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    const relevantIncome = income.filter(i => {
        const incomeDate = new Date(i.date);
        return incomeDate >= startDate && incomeDate <= endDate;
    });

    const totalIncome = relevantIncome.reduce((sum, i) => sum + i.amount, 0);

    const newBudget = JSON.parse(JSON.stringify(budget)) as Budget;
    Object.keys(budget).forEach(category => {
        if (!newBudget[category]) newBudget[category] = { ...budget[category], spent: 0 };
    });

    for (const category in newBudget) {
        newBudget[category].spent = 0;
    }
    
    relevantExpenses.forEach(expense => {
        if (newBudget[expense.category]) {
            newBudget[expense.category].spent += expense.amount;
        } else {
           if (newBudget[ExpenseCategory.Other]) {
                newBudget[ExpenseCategory.Other].spent += expense.amount;
           }
        }
    });

    return { filteredExpenses: relevantExpenses, filteredBudget: newBudget, totalIncome };
  }, [expenses, income, budget, timePeriod, dateRange]);

  const handleGeminiResponse = useCallback((response: GeminiResponse) => {
    const newModelMessage: ChatMessage = { role: MessageRole.MODEL, content: response.summary_text };
    setMessages(prev => [...prev, newModelMessage]);

    if (response.response_type === ResponseType.EXPENSE_LOGGED && response.expense) {
        const expensesToLog = Array.isArray(response.expense) ? response.expense : [response.expense];

        const newExpenses: Expense[] = expensesToLog.map(exp => ({
            id: new Date().toISOString() + Math.random(),
            ...exp,
            date: new Date().toISOString(),
        }));

        setExpenses(prev => [...prev, ...newExpenses]);
        
        setBudget(prevBudget => {
            const newBudget = { ...prevBudget };
            newExpenses.forEach(newExpense => {
                const category = newExpense.category;
                if (!newBudget[category]) {
                    console.warn(`AI returned non-existent category: ${category}. Creating it now.`);
                    newBudget[category] = { limit: newExpense.amount > 0 ? newExpense.amount : 1, spent: 0 };
                }
                newBudget[category] = {
                    ...newBudget[category],
                    spent: newBudget[category].spent + newExpense.amount,
                };
            });
            return newBudget;
        });
    }

    switch (response.response_type) {
      case ResponseType.GOAL_CREATED:
        if (response.goal && typeof response.goal.target === 'number') {
          const newGoal: Goal = {
            id: new Date().toISOString(),
            description: response.goal.description,
            target: response.goal.target,
            saved: 0,
            deadline: response.goal.deadline,
          };
          setGoals(prev => [...prev, newGoal]);
        }
        break;
        
      case ResponseType.GOAL_UPDATED:
        if(response.goal && response.goal.description && typeof response.goal.saved === 'number'){
            setGoals(prevGoals => prevGoals.map(g => {
                if(g.description.toLowerCase().includes(response.goal.description.toLowerCase())){
                    return {...g, saved: g.saved + response.goal.saved};
                }
                return g;
            }));
        }
        break;
    }
  }, []);

  const handleSendMessage = useCallback(async (userInput: string, isPlayground: boolean, image?: { data: string, mimeType: string }) => {
    const newUserMessage: ChatMessage = { role: MessageRole.USER, content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    const geminiResponse = await getFinancialAdvice(userInput, budget, goals, expenses, selectedCurrency, languageCode, isPlayground, image?.data, image?.mimeType);

    if (geminiResponse) {
      handleGeminiResponse(geminiResponse);
    } else {
      const errorMessage: ChatMessage = {
        role: MessageRole.MODEL,
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  }, [budget, goals, expenses, selectedCurrency, languageCode, handleGeminiResponse]);
  
  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleAddGoal = useCallback((goalData: Omit<Goal, 'id' | 'saved'>) => {
    const newGoal: Goal = {
      id: new Date().toISOString(),
      ...goalData,
      saved: 0,
    };
    setGoals(prev => [...prev, newGoal]);
    setIsAddGoalModalOpen(false);
  }, []);

  const handleAddCategory = useCallback((categoryData: { name: string; limit: number }) => {
    if (!budget[categoryData.name]) {
      setBudget(prev => ({
        ...prev,
        [categoryData.name]: { limit: categoryData.limit, spent: 0 }
      }));
    }
    setIsAddCategoryModalOpen(false);
  }, [budget]);

  const handleDeleteGoal = useCallback((id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    if (!goalToDelete) return;

    setConfirmationState({
      isOpen: true,
      title: t('deleteGoalModal.title'),
      message: t('deleteGoalModal.message', { description: goalToDelete.description }),
      onConfirm: () => {
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      },
    });
  }, [goals, t]);

  const handleDeleteCategory = useCallback((categoryName: string) => {
    setConfirmationState({
      isOpen: true,
      title: t('deleteCategoryModal.title'),
      message: t('deleteCategoryModal.message', { categoryName }),
      onConfirm: () => {
        let amountToMove = 0;
        const updatedExpenses = expenses.map(e => {
            if (e.category === categoryName) {
                amountToMove += e.amount;
                return { ...e, category: ExpenseCategory.Other };
            }
            return e;
        });
        setExpenses(updatedExpenses);

        setBudget(prevBudget => {
          const newBudget = { ...prevBudget };
          if (newBudget[ExpenseCategory.Other]) {
            // FIX: Immutable update for 'Other' category
            newBudget[ExpenseCategory.Other] = {
              ...newBudget[ExpenseCategory.Other],
              spent: newBudget[ExpenseCategory.Other].spent + amountToMove,
            };
          }
          delete newBudget[categoryName];
          return newBudget;
        });
      },
    });
  }, [expenses, t]);

  const handleDeleteExpense = useCallback((id: string) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    if (!expenseToDelete) return;

    setConfirmationState({
      isOpen: true,
      title: t('deleteTransactionModal.title'),
      message: t('deleteTransactionModal.message', { description: expenseToDelete.description }),
      onConfirm: () => {
        setBudget(prevBudget => {
          const newBudget = { ...prevBudget };
          const category = expenseToDelete.category;
          if (newBudget[category]) {
            // FIX: Immutable update for the category's spent amount
            newBudget[category] = {
              ...newBudget[category],
              spent: newBudget[category].spent - expenseToDelete.amount,
            };
          }
          return newBudget;
        });
        setExpenses(prevExpenses => prevExpenses.filter(e => e.id !== id));
      },
    });
  }, [expenses, t]);

  const closeConfirmationModal = () => {
    setConfirmationState({ ...confirmationState, isOpen: false });
  };
  
  const handleUpdateExpense = useCallback((updatedExpense: Expense) => {
      const originalExpense = expenses.find(e => e.id === updatedExpense.id);
      if (!originalExpense) return;

      setExpenses(prevExpenses => prevExpenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));

      setBudget(prevBudget => {
          const newBudget = { ...prevBudget };
          const originalCategoryName = originalExpense.category;
          const newCategoryName = updatedExpense.category;

          // FIX: Immutable updates for budget spent amounts
          if (originalCategoryName === newCategoryName) {
              if (newBudget[originalCategoryName]) {
                  const amountDifference = updatedExpense.amount - originalExpense.amount;
                  newBudget[originalCategoryName] = {
                      ...newBudget[originalCategoryName],
                      spent: newBudget[originalCategoryName].spent + amountDifference
                  };
              }
          } else {
              if (newBudget[originalCategoryName]) {
                  newBudget[originalCategoryName] = {
                      ...newBudget[originalCategoryName],
                      spent: newBudget[originalCategoryName].spent - originalExpense.amount
                  };
              }
              if (newBudget[newCategoryName]) {
                  newBudget[newCategoryName] = {
                      ...newBudget[newCategoryName],
                      spent: newBudget[newCategoryName].spent + updatedExpense.amount
                  };
              } else {
                  newBudget[newCategoryName] = { limit: updatedExpense.amount, spent: updatedExpense.amount };
              }
          }
          return newBudget;
      });

      setEditingExpense(null);
  }, [expenses]);

  const handleUpdateCategory = useCallback((originalName: string, updatedCategory: { name: string; limit: number }) => {
    setBudget(prevBudget => {
        const newBudget = { ...prevBudget };
        
        if (originalName !== updatedCategory.name) {
            const originalCategoryData = newBudget[originalName];
            newBudget[updatedCategory.name] = {
                spent: originalCategoryData.spent,
                limit: updatedCategory.limit
            };
            delete newBudget[originalName];
        } else {
            // FIX: Correctly update limit immutably
            newBudget[originalName] = {
                ...newBudget[originalName],
                limit: updatedCategory.limit
            };
        }
        return newBudget;
    });

    if (originalName !== updatedCategory.name) {
        setExpenses(prevExpenses =>
            prevExpenses.map(e =>
                e.category === originalName ? { ...e, category: updatedCategory.name } : e
            )
        );
    }
    
    setEditingCategory(null);
  }, []);
  
  const handleAddOrUpdateCrypto = useCallback((holding: Omit<CryptoHolding, 'id'>, id?: string) => {
    if(id) { // Update
        setCryptoHoldings(prev => prev.map(h => h.id === id ? { ...h, ...holding } : h));
    } else { // Add
        const newHolding: CryptoHolding = {
            id: new Date().toISOString(),
            ...holding,
        }
        setCryptoHoldings(prev => [...prev, newHolding]);
    }
    setIsAddCryptoModalOpen(false);
    setEditingCrypto(null);
  }, []);

  const handleDeleteCrypto = useCallback((id: string) => {
    const holdingToDelete = cryptoHoldings.find(h => h.id === id);
    if (!holdingToDelete) return;
    setConfirmationState({
        isOpen: true,
        title: t('deleteCryptoModal.title'),
        message: t('deleteCryptoModal.message', { name: holdingToDelete.name }),
        onConfirm: () => {
            setCryptoHoldings(prev => prev.filter(h => h.id !== id));
        },
    });
  }, [cryptoHoldings, t]);

  const handleSetCustomDateRange = useCallback((start: string, end: string) => {
    setDateRange({ start, end });
    setTimePeriod('custom');
    setIsDateRangeModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-2">
                    <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m12 0V9" />
                    </svg>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">FinanceGPT</h1>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher
                    currentLanguage={languageCode}
                    onLanguageChange={setLanguageCode}
                    languages={SUPPORTED_LANGUAGES}
                  />
                  <CurrencySwitcher
                    currentCurrency={currencyCode}
                    onCurrencyChange={setCurrencyCode}
                    currencies={SUPPORTED_CURRENCIES}
                  />
                   <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
                    aria-label="Toggle dark mode"
                  >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                  </button>
                </div>
            </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
            <Dashboard 
              budget={filteredData.filteredBudget}
              goals={goals} 
              expenses={filteredData.filteredExpenses}
              totalIncome={filteredData.totalIncome}
              currency={selectedCurrency}
              supportedCurrencies={SUPPORTED_CURRENCIES}
              achievements={achievements}
              cryptoHoldings={cryptoHoldings}
              cryptoPrices={cryptoPrices}
              cryptoDisplayCurrency={cryptoDisplayCurrency}
              onCryptoDisplayCurrencyChange={setCryptoDisplayCurrencyCode}
              onAddGoalClick={() => setIsAddGoalModalOpen(true)}
              onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
              onAddCryptoClick={() => { setEditingCrypto(null); setIsAddCryptoModalOpen(true); }}
              onDeleteGoal={handleDeleteGoal}
              onDeleteCategory={handleDeleteCategory}
              onEditCategory={(categoryName) => setEditingCategory({ name: categoryName, limit: budget[categoryName].limit })}
              onEditExpense={(expense) => setEditingExpense(expense)}
              onDeleteExpense={handleDeleteExpense}
              onEditCrypto={(holding) => { setEditingCrypto(holding); setIsAddCryptoModalOpen(true); }}
              onDeleteCrypto={handleDeleteCrypto}
              timePeriod={timePeriod}
              onTimePeriodChange={setTimePeriod}
              onCustomDateRangeClick={() => setIsDateRangeModalOpen(true)}
              dateRange={dateRange}
            />
            <ChatWindow 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
              isPlaygroundMode={isPlaygroundMode}
              onPlaygroundModeChange={setIsPlaygroundMode}
              onNewMessage={handleNewMessage}
            />
        </div>
      </main>

      {isAddGoalModalOpen && <AddGoalModal onClose={() => setIsAddGoalModalOpen(false)} onAddGoal={handleAddGoal} currency={selectedCurrency} />}
      {isAddCategoryModalOpen && <AddCategoryModal onClose={() => setIsAddCategoryModalOpen(false)} onAddCategory={handleAddCategory} currency={selectedCurrency} />}
      {isAddCryptoModalOpen && <AddCryptoModal onClose={() => { setIsAddCryptoModalOpen(false); setEditingCrypto(null); }} onSave={handleAddOrUpdateCrypto} supportedCoins={supportedCoins} initialData={editingCrypto} supportedCurrencies={SUPPORTED_CURRENCIES} cryptoPrices={cryptoPrices} previewCurrency={cryptoDisplayCurrency} />}
      {editingExpense && <EditExpenseModal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} onUpdateExpense={handleUpdateExpense} expense={editingExpense} currency={selectedCurrency} budget={budget} />}
      {editingCategory && <EditCategoryModal isOpen={!!editingCategory} onClose={() => setEditingCategory(null)} onUpdateCategory={handleUpdateCategory} category={editingCategory} currency={selectedCurrency} />}
      {confirmationState.isOpen && <ConfirmationModal isOpen={confirmationState.isOpen} onClose={closeConfirmationModal} onConfirm={confirmationState.onConfirm} title={confirmationState.title} message={confirmationState.message} />}
      {isDateRangeModalOpen && <DateRangeModal onClose={() => setIsDateRangeModalOpen(false)} onSetDateRange={handleSetCustomDateRange} />}
    </div>
  );
};

const App: React.FC = () => (
  <I18nProvider>
    <AppContent />
  </I18nProvider>
);

export default App;
