import { Budget, Goal, ExpenseCategory, Currency, Expense, Income } from './types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  // Most commonly used currencies first
  { code: 'USD', name: 'United States Dollar', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', locale: 'fr-FR' }, // Using fr-FR as an example for symbol-after-number format
  { code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CNY', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'INR', name: 'Indian Rupee', locale: 'en-IN' },
  // Other European and major currencies, sorted alphabetically
  { code: 'BGN', name: 'Bulgarian Lev', locale: 'bg-BG' },
  { code: 'HRK', name: 'Croatian Kuna', locale: 'hr-HR' },
  { code: 'CZK', name: 'Czech Koruna', locale: 'cs-CZ' },
  { code: 'DKK', name: 'Danish Krone', locale: 'da-DK' },
  { code: 'HUF', name: 'Hungarian Forint', locale: 'hu-HU' },
  { code: 'ISK', name: 'Icelandic Króna', locale: 'is-IS' },
  { code: 'NOK', name: 'Norwegian Krone', locale: 'nb-NO' },
  { code: 'PLN', name: 'Polish Złoty', locale: 'pl-PL' },
  { code: 'RON', name: 'Romanian Leu', locale: 'ro-RO' },
  { code: 'RUB', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'SEK', name: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'TRY', name: 'Turkish Lira', locale: 'tr-TR' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', locale: 'uk-UA' },
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'pt', name: 'Português' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ro', name: 'Română' },
];

export const SYSTEM_PROMPT = `
You are FinanceGPT, an expert personal finance assistant. Your goal is to help users manage their money, track expenses, create budgets, simulate financial scenarios, and achieve their goals.

Respond in the user's selected language: {LANGUAGE}.
All financial values are in the user's selected currency: {CURRENCY}.

### Core Capabilities & Personality:
- **Proactive & Analytical:** Point out high spending or unusual patterns and offer specific, actionable saving tips.
- **Supportive & Non-judgmental:** Be clear, practical, and encouraging. Use simple language.

### JSON Response Format:
You MUST respond with a JSON object that strictly follows this schema. Do not add any extra text or markdown formatting. The JSON object must have a 'response_type' and a 'summary_text'.

---

### FEATURE 1: Standard Financial Tracking

**1. Logging an Expense (from text):**
- 'response_type': 'EXPENSE_LOGGED'
- 'expense': An array of one or more expense objects: [{ 'amount': number, 'category': 'string (must be one of the provided budget categories)', 'description': 'string', 'subcategory': 'optional string' }]
- 'summary_text': 'A confirmation and a friendly, proactive tip.'

**2. Analyzing a Receipt Image:**
- The user will provide an image of a receipt.
- Your task is to analyze the receipt, itemize the purchases, and categorize each item.
- 'response_type': 'EXPENSE_LOGGED'
- 'expense': An array of expense objects, one for each identified item or logical grouping on the receipt.
- 'summary_text': Start with "🧾 Receipt Analyzed! Here's the breakdown:". Then, provide a clear summary of the logged expenses. Crucially, end with a "💡 Smart Tip" that offers a specific, actionable saving opportunity based on the items purchased (e.g., suggesting store brands, identifying non-essential impulse buys).

**3. Creating or Updating a Goal:**
- For new goals: 'response_type': 'GOAL_CREATED', 'goal': { 'description', 'target', 'deadline' }
- For updates: 'response_type': 'GOAL_UPDATED', 'goal': { 'description', 'saved' }
- 'summary_text': A confirmation message.

**4. General Advice:**
- 'response_type': 'GENERAL_ADVICE'
- 'summary_text': Your full analysis or advice, formatted with markdown for clarity (using 💰, 📊, 🎯 emojis).

### FEATURE 2: Financial Playground Mode

When the user enables "Playground Mode", your role shifts to a financial simulator.
- Use your advanced reasoning and real-time data (via Google Search tool) to answer hypothetical "what-if" questions.
- 'response_type': 'SCENARIO_ANALYSIS'
- 'summary_text': A detailed analysis of the scenario. Use markdown, bullet points, and bold text to present the simulation results clearly. Be creative and informative.
- **Example Playground Queries:** "What if I get a 10% raise? How quickly could I pay off my credit card debt?", "Simulate my budget if I moved to Austin, Texas, using the current cost of living.", "Can I afford to take a 3-month sabbatical next year?"

---

### AVAILABLE BUDGET CATEGORIES:
You MUST categorize expenses into one of the following: {BUDGET_CATEGORIES}.

Current financial context will be provided with the user's prompt. Use it to provide relevant analysis and advice.
`;

const now = new Date();
const today = now.toISOString();
const threeDaysAgo = new Date(new Date().setDate(now.getDate() - 3)).toISOString();
const sevenDaysAgo = new Date(new Date().setDate(now.getDate() - 7)).toISOString();

export const INITIAL_INCOME: Income[] = [
    { id: 'i1', description: 'Monthly Salary', amount: 4500, date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() },
    { id: 'i2', description: 'Freelance Project', amount: 750, date: sevenDaysAgo },
    { id: 'i3', description: 'Stock Dividend', amount: 125, date: new Date(new Date().setDate(now.getDate() - 15)).toISOString() },
];

export const INITIAL_EXPENSES: Expense[] = [
    { id: 'e1', description: 'Monthly Rent', amount: 1200, category: ExpenseCategory.Housing, date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() },
    { id: 'e2', description: 'Gas Bill', amount: 65, category: ExpenseCategory.Utilities, date: threeDaysAgo },
    { id: 'e3', description: 'Groceries from Walmart', amount: 154.78, category: ExpenseCategory.FoodAndDining, subcategory: 'Groceries', date: threeDaysAgo },
    { id: 'e4', description: 'Dinner with friends', amount: 85.20, category: ExpenseCategory.FoodAndDining, subcategory: 'Restaurant', date: sevenDaysAgo },
    { id: 'e5', description: 'Netflix Subscription', amount: 15.99, category: ExpenseCategory.Subscriptions, date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
    { id: 'e6', description: 'New shoes', amount: 110.00, category: ExpenseCategory.Shopping, date: sevenDaysAgo },
];

const calculateInitialSpent = (category: ExpenseCategory): number => {
    return INITIAL_EXPENSES
        .filter(e => e.category === category && new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((sum, e) => sum + e.amount, 0);
};

export const INITIAL_BUDGET: Budget = {
  [ExpenseCategory.Housing]: { limit: 1500, spent: calculateInitialSpent(ExpenseCategory.Housing) },
  [ExpenseCategory.Transportation]: { limit: 300, spent: calculateInitialSpent(ExpenseCategory.Transportation) },
  [ExpenseCategory.FoodAndDining]: { limit: 500, spent: calculateInitialSpent(ExpenseCategory.FoodAndDining) },
  [ExpenseCategory.Utilities]: { limit: 200, spent: calculateInitialSpent(ExpenseCategory.Utilities) },
  [ExpenseCategory.Subscriptions]: { limit: 50, spent: calculateInitialSpent(ExpenseCategory.Subscriptions) },
  [ExpenseCategory.Healthcare]: { limit: 200, spent: calculateInitialSpent(ExpenseCategory.Healthcare) },
  [ExpenseCategory.Entertainment]: { limit: 150, spent: calculateInitialSpent(ExpenseCategory.Entertainment) },
  [ExpenseCategory.Shopping]: { limit: 250, spent: calculateInitialSpent(ExpenseCategory.Shopping) },
  [ExpenseCategory.PersonalCare]: { limit: 100, spent: calculateInitialSpent(ExpenseCategory.PersonalCare) },
  [ExpenseCategory.DebtRepayment]: { limit: 300, spent: calculateInitialSpent(ExpenseCategory.DebtRepayment) },
  [ExpenseCategory.Education]: { limit: 100, spent: calculateInitialSpent(ExpenseCategory.Education) },
  [ExpenseCategory.Other]: { limit: 100, spent: calculateInitialSpent(ExpenseCategory.Other) },
};

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    description: 'Save for a vacation',
    target: 5000,
    saved: 1200,
    deadline: '2025-07-01',
  },
  {
    id: 'g2',
    description: 'Pay off credit card debt',
    target: 3000,
    saved: 500,
  },
];