
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { GeminiResponse, Budget, Goal, Expense, Currency } from '../types';
import { formatCurrency } from '../utils/formatting';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    response_type: {
      type: Type.STRING,
      enum: ['EXPENSE_LOGGED', 'BUDGET_ANALYSIS', 'GOAL_CREATED', 'GOAL_UPDATED', 'GENERAL_ADVICE'],
    },
    expense: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        amount: { type: Type.NUMBER },
        category: { type: Type.STRING },
        description: { type: Type.STRING },
        subcategory: { type: Type.STRING, nullable: true },
      },
    },
    goal: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        description: { type: Type.STRING },
        target: { type: Type.NUMBER },
        saved: { type: Type.NUMBER },
        deadline: { type: Type.STRING, nullable: true },
      },
    },
    summary_text: {
      type: Type.STRING,
    },
  },
  required: ['response_type', 'summary_text'],
};

export const getFinancialAdvice = async (
  userInput: string,
  budget: Budget,
  goals: Goal[],
  expenses: Expense[],
  currency: Currency
): Promise<GeminiResponse | null> => {
  try {
    const budgetCategories = Object.keys(budget).join(', ');

    const context = `
      ### CURRENT FINANCIAL CONTEXT (Currency: ${currency.code})
      **Budget:**
      ${Object.entries(budget)
        .map(([cat, data]) => `- ${cat}: Spent ${formatCurrency(data.spent, currency.code, currency.locale)} of ${formatCurrency(data.limit, currency.code, currency.locale)}`)
        .join('\n')}

      **Goals:**
      ${goals
        .map(g => `- ${g.description}: Saved ${formatCurrency(g.saved, currency.code, currency.locale)} of ${formatCurrency(g.target, currency.code, currency.locale)}`)
        .join('\n')}
      
      **Recent Expenses:**
      ${expenses.slice(-5).map(e => `- ${e.description}: ${formatCurrency(e.amount, currency.code, currency.locale)} (${e.category})`).join('\n')}
    `;
    
    let systemInstructionWithContext = SYSTEM_PROMPT.replace('{CURRENCY}', currency.code);
    systemInstructionWithContext = systemInstructionWithContext.replace('{BUDGET_CATEGORIES}', budgetCategories);


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${context}\n\n### USER QUERY\n${userInput}`,
      config: {
        systemInstruction: systemInstructionWithContext,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    return parsedResponse as GeminiResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
};