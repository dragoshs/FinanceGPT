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

export enum ResponseType {
  EXPENSE_LOGGED = 'EXPENSE_LOGGED',
  BUDGET_ANALYSIS = 'BUDGET_ANALYSIS',
  GOAL_CREATED = 'GOAL_CREATED',
  GOAL_UPDATED = 'GOAL_UPDATED',
  GENERAL_ADVICE = 'GENERAL_ADVICE',
}

export interface GeminiExpensePayload {
  amount: number;
  category: string;
  description: string;
  subcategory?: string;
}

// FIX: Added optional 'saved' property and made 'target' optional to support both goal creation and updates.
export interface GeminiGoalPayload {
  description: string;
  target?: number;
  saved?: number;
  deadline?: string;
}

export interface GeminiResponse {
  response_type: ResponseType;
  expense?: GeminiExpensePayload;
  goal?: GeminiGoalPayload;
  summary_text: string;
}

export type TimePeriod = 'week' | 'month' | 'all' | 'custom';