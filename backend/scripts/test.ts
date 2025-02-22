import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // Test server connection
    console.log('Testing server connection...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('Server status:', health.data);

    // Add multiple expenses
    console.log('\nAdding expenses...');
    const expenses = [
      {
        category: 'Software',
        amount: 6000,
        description: 'Enterprise CRM License',
        date: new Date().toISOString().split('T')[0]
      },
      {
        category: 'Infrastructure',
        amount: 4500,
        description: 'Cloud Services - Q1',
        date: new Date().toISOString().split('T')[0]
      },
      {
        category: 'Marketing',
        amount: 3000,
        description: 'Digital Marketing Campaign',
        date: new Date().toISOString().split('T')[0]
      }
    ];

    for (const expense of expenses) {
      const response = await axios.post(`${API_URL}/expenses`, expense);
      console.log('Added expense:', response.data);
    }

    // Get expenses
    console.log('\nFetching expenses...');
    const expensesList = await axios.get(`${API_URL}/expenses`);
    console.log('All Expenses:', expensesList.data);

    // Get analytics with AI recommendations
    console.log('\nFetching analytics and recommendations...');
    const analytics = await axios.get(`${API_URL}/analytics`);
    console.log('Analytics:', analytics.data);

  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Error: Could not connect to the server. Is it running?');
    } else if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testAPI(); 