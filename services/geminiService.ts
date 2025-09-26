// Fix: Correct import path for GoogleGenAI
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { GeminiResponse, Budget, Goal, Expense, Currency, ResponseType } from '../types';
import { formatCurrency } from '../utils/formatting';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Update response schema to be valid. Removed ONE_OF and nullable properties.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    response_type: {
      type: Type.STRING,
      enum: ['EXPENSE_LOGGED', 'BUDGET_ANALYSIS', 'GOAL_CREATED', 'GOAL_UPDATED', 'GENERAL_ADVICE', 'SCENARIO_ANALYSIS'],
    },
    expense: {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              subcategory: { type: Type.STRING },
          }
      }
    },
    goal: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        target: { type: Type.NUMBER },
        saved: { type: Type.NUMBER },
        deadline: { type: Type.STRING },
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
  currency: Currency,
  language: string,
  isPlaygroundMode: boolean,
  base64Image?: string,
  imageMimeType?: string
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
    
    let systemInstructionWithContext = SYSTEM_PROMPT
      .replace('{CURRENCY}', currency.code)
      .replace('{LANGUAGE}', language);
    systemInstructionWithContext = systemInstructionWithContext.replace('{BUDGET_CATEGORIES}', budgetCategories);

    const contents: any[] = [];
    if (base64Image && imageMimeType) {
        contents.push({
            inlineData: { mimeType: imageMimeType, data: base64Image },
        });
    }
    contents.push({ text: `${context}\n\n### USER QUERY\n${userInput}` });

    // Fix: Conditionally set config to avoid sending responseSchema with googleSearch tool.
    const config: any = {
      systemInstruction: systemInstructionWithContext,
    };

    if (isPlaygroundMode) {
      config.tools = [{ googleSearch: {} }];
    } else {
      config.responseMimeType = "application/json";
      config.responseSchema = responseSchema;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contents },
      config,
    });
    
    // Fix: Handle non-JSON response for playground mode.
    if (isPlaygroundMode) {
      return {
        response_type: ResponseType.SCENARIO_ANALYSIS,
        summary_text: response.text,
      };
    }

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    return parsedResponse as GeminiResponse;

  } catch (error)
 {
    console.error("Error calling Gemini API:", error);
    return null;
  }
};


export const getCelebratoryMessage = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `You are a fun, encouraging financial assistant. Write a short, celebratory message (1-2 sentences) for a user based on the following achievement. Use emojis like 🏆, 🎉, ✨. Achievement: "${prompt}"`;
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating celebratory message:", error);
        return "Congratulations on your achievement!";
    }
};