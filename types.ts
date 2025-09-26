export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export enum ExpenseCategory {
  Housing = 'Housing',
  Transportation = 'Transportation',
  FoodAndDining = 'Food & Dining',
  Utilities = 'Utilities',
  Subscriptions = 'Subscriptions',
  Healthcare = 'Healthcare',
  Entertainment = 'Entertainment',
  Shopping = 'Shopping',
  PersonalCare = 'Personal Care',
  DebtRepayment = 'Debt Repayment',
  Education = 'Education',
  Other = 'Other',
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
}

export interface BudgetCategory {
  limit: number;
  spent: number;
}

export type Budget = Record<string, BudgetCategory>;

export interface Goal {
  id: string;
  description: string;
  target: number;
  saved: number;
  deadline?: string;
}

export interface Currency {
  code: string;
  name: string;
  locale: string;
}

export interface Achievement {
  id: string;
  title: string;
  message: string;
  date: string;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface CryptoCoin {
    id: string;
    symbol: string;
    name: string;
}

export interface CryptoHolding {
    id: string; // Unique ID for the holding instance
    apiId: string; // ID from the CoinGecko API e.g., 'bitcoin'
    name: string;
    symbol: string;
    amount: number;
}

export type CryptoPrice = Record<string, { [currency: string]: number }>;


export enum ResponseType {
  EXPENSE_LOGGED = 'EXPENSE_LOGGED',
  BUDGET_ANALYSIS = 'BUDGET_ANALYSIS',
  GOAL_CREATED = 'GOAL_CREATED',
  GOAL_UPDATED = 'GOAL_UPDATED',
  GENERAL_ADVICE = 'GENERAL_ADVICE',
  SCENARIO_ANALYSIS = 'SCENARIO_ANALYSIS',
}

export interface GeminiExpensePayload {
  amount: number;
  category: string;
  description: string;
  subcategory?: string;
}

export interface GeminiGoalPayload {
  description: string;
  target?: number;
  saved?: number;
  deadline?: string;
}

export interface GeminiResponse {
  response_type: ResponseType;
  expense?: GeminiExpensePayload | GeminiExpensePayload[];
  goal?: GeminiGoalPayload;
  summary_text: string;
}

export type TimePeriod = 'week' | 'month' | 'all' | 'custom';