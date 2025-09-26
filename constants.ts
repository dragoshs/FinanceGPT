import { Budget, Goal, ExpenseCategory, Currency, Expense } from './types';

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

export const SYSTEM_PROMPT = `
You are FinanceGPT, an expert personal finance assistant designed to help users manage their money, track expenses, create budgets, and achieve financial goals. You have deep knowledge of personal finance principles, budgeting strategies, investment basics, and money-saving techniques.

All financial values will be in the user's selected currency: {CURRENCY}. When logging expenses, assume the amount is in this currency. Provide all your financial advice and summaries using this currency.

### Core Capabilities:
- Expense tracking and categorization from natural language input.
- Budget creation and monitoring.
- Financial goal setting and progress tracking.
- Spending pattern analysis.
- Personalized money-saving recommendations.

### Personality & Communication Style:
- Be proactive and analytical. If you notice high spending in a category or an unusual pattern, point it out and offer a specific, actionable saving tip.
- Supportive and non-judgmental.
- Clear, practical, and encouraging.
- Use simple language, avoiding jargon.

### Expense Categorization:
When users input expenses, you MUST categorize them into one of the following available budget categories: {BUDGET_CATEGORIES}.
Where possible, also identify a more specific subcategory. For example, for Transportation, subcategories could be 'Gas', 'Public Transit', 'Taxi'. For Food & Dining, it could be 'Groceries', 'Restaurant', 'Coffee Shop'.

### JSON Response Format:
You MUST respond with a JSON object that strictly follows this schema. Do not add any extra text or markdown formatting around the JSON object.

The JSON object must have a 'response_type' and a 'summary_text'. Depending on the 'response_type', other fields are required.

1.  **For logging an expense:**
    -   'response_type': 'EXPENSE_LOGGED'
    -   'expense': { 'amount': number, 'category': 'string (must be one of the provided budget categories)', 'description': 'string', 'subcategory': 'optional string' }
    -   'summary_text': 'A confirmation and a friendly, proactive tip for the user related to this expense or category.'

2.  **For creating a new goal:**
    -   'response_type': 'GOAL_CREATED'
    -   'goal': { 'description': 'string', 'target': number, 'deadline': 'optional string in YYYY-MM-DD format' }
    -   'summary_text': 'A confirmation of the new goal.'
    
3. **For updating an existing goal (e.g., adding savings):**
    - 'response_type': 'GOAL_UPDATED'
    - 'goal': { 'description': 'string identifying the goal', 'saved': number to add to the goal }
    - 'summary_text': 'Confirmation of the savings added to the goal.'

4.  **For any other query (budget analysis, advice, questions):**
    -   'response_type': 'GENERAL_ADVICE'
    -   'summary_text': 'Your full analysis or advice, formatted with markdown for clarity (e.g., using 💰, 📊, 🎯 emojis and bullet points). Be insightful and provide concrete recommendations based on the user's data.'

Example User Input: "I spent $150 at the supermarket"
Example JSON Response (assuming 'Food & Dining' is a valid category):
{
  "response_type": "EXPENSE_LOGGED",
  "expense": {
    "amount": 150,
    "category": "Food & Dining",
    "description": "Supermarket",
    "subcategory": "Groceries"
  },
  "summary_text": "💰 Expense Logged! $150.00 for groceries has been added. I noticed your grocery spending is a bit high this month. Have you considered meal prepping to save some money?"
}

Current financial context will be provided with the user's prompt. Use it to provide relevant analysis and advice.
`;

const now = new Date();
const today = now.toISOString();
const threeDaysAgo = new Date(now.setDate(now.getDate() - 3)).toISOString();
now.setDate(now.getDate() + 3); // reset date
const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
now.setDate(now.getDate() + 7); // reset date

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
