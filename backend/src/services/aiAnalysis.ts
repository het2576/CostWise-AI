import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function analyzeExpenses(expenses: any[]) {
  try {
    if (!expenses.length) {
      return getDefaultRecommendations('No expenses to analyze');
    }

    if (!API_KEY) {
      console.warn('No Gemini API key provided, using default recommendations');
      return getDefaultRecommendations('Using default recommendations');
    }

    const expenseAnalysis = analyzeExpenseData(expenses);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Create a more structured prompt
      const prompt = `
        As an AI financial advisor, analyze these business expenses and provide cost-cutting recommendations.
        Total Spent: $${expenseAnalysis.totalSpent}
        Categories: ${Object.keys(expenseAnalysis.categoryBreakdown).join(', ')}
        Category Breakdown:
        ${Object.entries(expenseAnalysis.categoryBreakdown)
          .map(([category, amount]) => `${category}: $${amount}`)
          .join('\n')}

        Provide recommendations in this exact JSON format:
        {
          "recommendations": [
            {
              "title": "string",
              "description": "string",
              "savings": number,
              "priority": "high" | "medium" | "low",
              "category": "string",
              "action": "string",
              "impact": "string",
              "timeframe": "string",
              "roi": number
            }
          ],
          "insights": {
            "summary": "string",
            "topSpendingAreas": ["string"],
            "potentialSavings": number,
            "riskAreas": ["string"]
          }
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('No JSON found in AI response');
          return getDefaultRecommendations('Invalid AI response format');
        }
        
        const aiSuggestions = JSON.parse(jsonMatch[0]);
        return {
          recommendations: formatRecommendations(aiSuggestions.recommendations),
          insights: {
            summary: aiSuggestions.insights?.summary || 'Analysis of current expenses',
            topSpendingAreas: aiSuggestions.insights?.topSpendingAreas || [],
            potentialSavings: aiSuggestions.insights?.potentialSavings || 0,
            riskAreas: aiSuggestions.insights?.riskAreas || []
          }
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return getDefaultRecommendations('Failed to parse AI response');
      }
    } catch (aiError) {
      console.error('AI Analysis Error:', aiError);
      return getDefaultRecommendations('AI analysis unavailable');
    }
  } catch (error) {
    console.error('Expense Analysis Error:', error);
    return getDefaultRecommendations('Error analyzing expenses');
  }
}

function analyzeExpenseData(expenses: any[]) {
  const categoryBreakdown = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    highestExpense: Math.max(...expenses.map(exp => exp.amount)),
    averageExpense: expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length,
    categoryBreakdown
  };
}

function formatRecommendations(recommendations: any[] = []) {
  return recommendations.map(rec => ({
    title: rec.title || 'Cost Optimization Opportunity',
    description: rec.description || 'Review current spending patterns',
    savings: typeof rec.savings === 'number' ? rec.savings : 1000,
    priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
    category: rec.category || 'General',
    action: rec.action || 'Review',
    impact: rec.impact || 'Medium',
    timeframe: rec.timeframe || '1-3 months',
    roi: typeof rec.roi === 'number' ? rec.roi : 100
  }));
}

function getDefaultRecommendations(reason: string) {
  return {
    recommendations: [
      {
        title: "Review Software Subscriptions",
        description: "Audit and consolidate software licenses and subscriptions",
        savings: 2000,
        priority: "medium",
        category: "Software",
        action: "Audit",
        impact: "Medium",
        timeframe: "1 month",
        roi: 150
      },
      {
        title: "Optimize Cloud Resources",
        description: "Review and optimize cloud infrastructure usage",
        savings: 1500,
        priority: "high",
        category: "Infrastructure",
        action: "Optimize",
        impact: "High",
        timeframe: "2 weeks",
        roi: 200
      }
    ],
    insights: {
      summary: `Using default recommendations. ${reason}`,
      topSpendingAreas: ["Software", "Infrastructure"],
      potentialSavings: 3500,
      riskAreas: ["Unoptimized cloud resources", "Software license redundancy"]
    }
  };
} 