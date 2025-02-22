import { Expense } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_NEW_GEMINI_API_KEY') {
  console.error('Invalid or missing Gemini API key. Please set VITE_GEMINI_API_KEY in your .env file');
}

const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

interface AIRecommendation {
  title: string;
  description: string;
  savings: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  impact: string;
  timeframe: string;
  roi: number;
}

interface AIResponse {
  recommendations: AIRecommendation[];
  insights: {
    summary: string;
    topSpendingAreas: string[];
    potentialSavings: number;
    riskAreas: string[];
  };
}

async function generateGeminiResponse(prompt: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_NEW_GEMINI_API_KEY') {
      throw new Error('Invalid or missing Gemini API key');
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: prompt
        },
        temperature: 0.3,
        top_k: 20,
        top_p: 0.8,
        max_output_tokens: 2048,
        safety_settings: [
          {
            category: "HARM_CATEGORY_DANGEROUS",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Full error response:', errorData);
      if (errorData.error?.message?.includes('API key not valid')) {
        throw new Error('Invalid Gemini API key. Please check your environment variables.');
      }
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    
    if (!data.candidates?.[0]?.output) {
      throw new Error('Invalid response format from Gemini API');
    }
    return data.candidates[0].output;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export async function getAIRecommendations(expenses: Expense[]): Promise<any> {
  try {
    if (!expenses.length) {
      return getDefaultRecommendations('No expenses to analyze');
    }

    const analysis = analyzeExpenseData(expenses);
    
    // Simplified prompt for better JSON response
    const prompt = `
You are a financial AI advisor. Analyze these business expenses and provide cost-cutting recommendations.

Expense Data:
Total Spent: $${analysis.totalSpent}
Average Monthly Expense: $${analysis.averageExpense}
Categories: ${Object.entries(analysis.categoryBreakdown)
  .map(([category, amount]) => `\n- ${category}: $${amount} (${((amount/analysis.totalSpent) * 100).toFixed(1)}%)`)
  .join('')}

Recent Transactions:
${expenses.slice(0, 3).map(exp => 
  `- ${exp.category}: $${exp.amount} - ${exp.description}`
).join('\n')}

Provide ONLY a JSON response in this exact format (no additional text):
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
}`;

    const response = await generateGeminiResponse(prompt);
    
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!parsedResponse.recommendations || !parsedResponse.insights) {
        throw new Error('Invalid response structure');
      }

      return formatResponse(parsedResponse, analysis);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw response:', response);
      return getDefaultRecommendations('Invalid response format');
    }
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return getDefaultRecommendations(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function getExpenseAnalysis(expenses: Expense[], timeframe: string): Promise<any> {
  try {
    const analysis = analyzeExpenseData(expenses);
    const prompt = `
      Analyze these ${timeframe} expenses and provide insights:
      Total Spent: $${analysis.totalSpent}
      Average Expense: $${analysis.averageExpense}
      Category Breakdown:
      ${Object.entries(analysis.categoryBreakdown)
        .map(([category, amount]) => `${category}: $${amount}`)
        .join('\n')}

      Provide analysis in this JSON format:
      {
        "summary": "A concise summary of spending patterns and areas of concern",
        "trends": ["Key trend observations"],
        "recommendations": ["Specific actionable recommendations"],
        "projectedSavings": "Estimated annual savings if recommendations are followed (number)"
      }
    `;

    const response = await generateGeminiResponse(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return getDefaultAnalysis();
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Expense Analysis Error:', error);
    return getDefaultAnalysis();
  }
}

function analyzeExpenseData(expenses: Expense[]) {
  const categoryBreakdown = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by month
  const monthlyData = expenses.reduce((acc, exp) => {
    const month = exp.date.substring(0, 7);
    if (!acc[month]) {
      acc[month] = { total: 0, count: 0 };
    }
    acc[month].total += exp.amount;
    acc[month].count++;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const monthCount = Object.keys(monthlyData).length || 1;

  return {
    totalSpent,
    averageExpense: totalSpent / monthCount,
    highestExpense: Math.max(...expenses.map(exp => exp.amount)),
    categoryBreakdown,
    monthlyTrends: Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        total: data.total,
        average: data.total / data.count
      }))
      .sort((a, b) => b.month.localeCompare(a.month)),
    topCategories: Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category)
  };
}

function formatResponse(aiSuggestions: any, analysis: ReturnType<typeof analyzeExpenseData>) {
  const recommendations = (aiSuggestions.recommendations || []).map((rec: any) => ({
    title: rec.title || 'Optimization Opportunity',
    description: rec.description || 'Review spending patterns',
    savings: typeof rec.savings === 'number' ? 
      Math.min(rec.savings, analysis.totalSpent * 0.5) : 
      Math.round(analysis.totalSpent * 0.1),
    priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
    category: rec.category || analysis.topCategories[0] || 'General',
    action: rec.action || 'Review',
    impact: rec.impact || 'Medium',
    timeframe: rec.timeframe || '1-3 months',
    roi: typeof rec.roi === 'number' ? Math.min(rec.roi, 500) : 100
  }));

  return {
    recommendations: recommendations.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    }),
    insights: {
      summary: aiSuggestions.insights?.summary || `Analysis of ${analysis.topCategories.length} spending categories`,
      topSpendingAreas: analysis.topCategories.slice(0, 3),
      potentialSavings: recommendations.reduce((sum, rec) => sum + rec.savings, 0),
      riskAreas: aiSuggestions.insights?.riskAreas || 
        analysis.topCategories.slice(0, 2).map(cat => `High spending in ${cat}`)
    }
  };
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
        title: "Optimize Cloud Infrastructure",
        description: "Review and optimize cloud resource allocation",
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
      summary: `Using default recommendations. Reason: ${reason}`,
      topSpendingAreas: ["Software", "Infrastructure"],
      potentialSavings: 3500,
      riskAreas: ["Unoptimized cloud resources", "Software license redundancy"]
    }
  };
}

function getDefaultAnalysis() {
  return {
    summary: "Unable to generate detailed analysis. Using default insights.",
    trends: [
      "Monthly expenses show typical business spending patterns",
      "Major expenses concentrated in core business categories"
    ],
    recommendations: [
      "Review and optimize current spending patterns",
      "Consider implementing budget controls",
      "Monitor high-expense categories closely"
    ],
    projectedSavings: 5000
  };
}