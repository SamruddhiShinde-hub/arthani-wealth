import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Trash2, Info } from 'lucide-react';

type IncomeEntry = {
  id: string;
  source: string;
  category: 'Salary' | 'Business' | 'Freelance' | 'Investments' | 'Rental' | 'Pension' | 'Other';
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly' | 'One-time';
  date: string;
  notes: string;
};

type ExpenseEntry = {
  id: string;
  description: string;
  category: 'Housing' | 'Transportation' | 'Food' | 'Utilities' | 'Healthcare' | 'Entertainment' | 'Education' | 'Shopping' | 'Insurance' | 'EMI' | 'Other';
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly' | 'One-time';
  date: string;
  notes: string;
};

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');

  // Load saved data
  useEffect(() => {
    const savedIncomes = storage.get('incomes', []);
    const savedExpenses = storage.get('expenses', []);
    console.log('Loading incomes & expenses:', { savedIncomes, savedExpenses });
    setIncomes(savedIncomes);
    setExpenses(savedExpenses);
    setIsLoaded(true);
  }, []);

  // Save data (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving incomes & expenses');
      storage.set('incomes', incomes);
      storage.set('expenses', expenses);
    }
  }, [isLoaded, incomes, expenses]);

  // Calculate monthly equivalent
  const getMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'Monthly': return amount;
      case 'Quarterly': return amount / 3;
      case 'Yearly': return amount / 12;
      case 'One-time': return 0;
      default: return amount;
    }
  };

  // Calculate totals
  const totalMonthlyIncome = incomes.reduce((sum, income) => sum + getMonthlyAmount(income.amount, income.frequency), 0);
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + getMonthlyAmount(expense.amount, expense.frequency), 0);
  const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome) * 100 : 0;

  // Calculate continuing income (passive income that will continue after death)
  const continuingIncome = incomes
    .filter(income => 
      income.category === 'Rental' || 
      income.category === 'Business' || 
      income.category === 'Investments' ||
      income.category === 'Pension'
    )
    .reduce((sum, income) => sum + getMonthlyAmount(income.amount, income.frequency), 0);

  // Income by category
  const incomeByCategory = incomes.reduce((acc, income) => {
    const monthly = getMonthlyAmount(income.amount, income.frequency);
    acc[income.category] = (acc[income.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  // Expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const monthly = getMonthlyAmount(expense.amount, expense.frequency);
    acc[expense.category] = (acc[expense.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  // Add new income
  const addIncome = () => {
    const newIncome: IncomeEntry = {
      id: Date.now().toString(),
      source: '',
      category: 'Salary',
      amount: 0,
      frequency: 'Monthly',
      date: new Date().toISOString().slice(0, 10),
      notes: ''
    };

    setIncomes([newIncome, ...incomes]);
    
  };

  // Add new expense
  
  const addExpense = () => {
    const newExpense: ExpenseEntry = {
      id: Date.now().toString(),
      description: '',
      category: 'Food',
      amount: 0,
      frequency: 'Monthly',
      date: new Date().toISOString().slice(0, 10),
      notes: ''
    };

    setExpenses([newExpense, ...expenses]);
  };

  // Update income
  const updateIncome = (id: string, field: keyof IncomeEntry, value: any) => {
    setIncomes(incomes.map(income => 
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  // Update expense
  const updateExpense = (id: string, field: keyof ExpenseEntry, value: any) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  // Delete income
  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Income & Expenses Tracker</h1>

      {/* Continuing Income Info Banner */}
      {continuingIncome > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">
                Continuing Income: {formatCurrency(continuingIncome)}/month
              </p>
              <p className="text-xs text-blue-600">
                Rental, Business, Investment, and Pension income will continue supporting your family even after you're gone.
                This is automatically considered in your Insurance calculator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100">Monthly Income</span>
            <TrendingUp size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalMonthlyIncome)}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100">Monthly Expenses</span>
            <TrendingDown size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalMonthlyExpenses)}</div>
        </div>

        <div className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg text-white ${
          monthlySavings >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={monthlySavings >= 0 ? 'text-blue-100' : 'text-orange-100'}>Monthly Savings</span>
            <DollarSign size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(monthlySavings)}</div>
        </div>

        <div className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg text-white ${
          savingsRate >= 20 ? 'from-green-500 to-green-600' : 
          savingsRate >= 10 ? 'from-yellow-500 to-yellow-600' : 'from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={savingsRate >= 20 ? 'text-green-100' : savingsRate >= 10 ? 'text-yellow-100' : 'text-gray-100'}>
              Savings Rate
            </span>
            <PieChart size={24} />
          </div>
          <div className="text-3xl font-bold">{savingsRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'income'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          Income Sources ({incomes.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'expenses'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          Expenses ({expenses.length})
        </button>
      </div>

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Income Sources</h2>
            <button
              onClick={addIncome}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Income
            </button>
          </div>

          {/* Category Breakdown */}
          {Object.keys(incomeByCategory).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Income by Category (Monthly)</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(incomeByCategory).map(([category, value]) => {
                  const isContinuing = category === 'Rental' || category === 'Business' || 
                                      category === 'Investments' || category === 'Pension';
                  return (
                    <div key={category} className={`rounded-lg p-4 ${isContinuing ? 'bg-green-50 border-2 border-green-200' : 'bg-emerald-50'}`}>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        {category}
                        {isContinuing && <span className="text-xs text-green-600 font-semibold">✓ Continues</span>}
                      </div>
                      <div className={`text-xl font-bold ${isContinuing ? 'text-green-600' : 'text-emerald-600'}`}>
                        {formatCurrency(value)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((value / totalMonthlyIncome) * 100).toFixed(1)}% of income
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Income List */}
          {incomes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <p className="text-gray-500 text-lg mb-4">No income sources added yet</p>
              <p className="text-gray-400 text-sm">Click "Add Income" to start tracking your earnings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomes.map((income) => (
                <div key={income.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="grid md:grid-cols-7 gap-4 items-center">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Source</label>
                      <input
                        type="text"
                        value={income.source}
                        onChange={(e) => updateIncome(income.id, 'source', e.target.value)}
                        placeholder="e.g., Salary"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={income.category}
                        onChange={(e) => updateIncome(income.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <optgroup label="Active Income (Stops)">
                          <option value="Salary">Salary</option>
                          <option value="Freelance">Freelance</option>
                        </optgroup>
                        <optgroup label="Passive Income (Continues ✓)">
                          <option value="Business">Business</option>
                          <option value="Investments">Investments / Dividends</option>
                          <option value="Rental">Rental Income</option>
                          <option value="Pension">Pension</option>
                        </optgroup>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={income.amount || ''}
                        onChange={(e) => updateIncome(income.id, 'amount', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                      <select
                        value={income.frequency}
                        onChange={(e) => updateIncome(income.id, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="One-time">One-time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={income.date}
                        onChange={(e) => updateIncome(income.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={income.notes}
                        onChange={(e) => updateIncome(income.id, 'notes', e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteIncome(income.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Income"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expenses Tab - SAME AS BEFORE */}
      {activeTab === 'expenses' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
            <button
              onClick={addExpense}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>

          {/* Category Breakdown */}
          {Object.keys(expensesByCategory).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category (Monthly)</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, value]) => (
                    <div key={category} className="bg-red-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">{category}</div>
                      <div className="text-xl font-bold text-red-600">{formatCurrency(value)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((value / totalMonthlyExpenses) * 100).toFixed(1)}% of expenses
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Expenses List */}
          {expenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <p className="text-gray-500 text-lg mb-4">No expenses added yet</p>
              <p className="text-gray-400 text-sm">Click "Add Expense" to start tracking your spending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="grid md:grid-cols-7 gap-4 items-center">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                        placeholder="e.g., Rent"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={expense.category}
                        onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Housing">Housing</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Food">Food</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Education">Education</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Insurance">Insurance</option>
                        <option value="EMI">EMI</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={expense.amount || ''}
                        onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                      <select
                        value={expense.frequency}
                        onChange={(e) => updateExpense(expense.id, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="One-time">One-time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={expense.date}
                        onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={expense.notes}
                        onChange={(e) => updateExpense(expense.id, 'notes', e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Expense"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Financial Insights */}
      {(incomes.length > 0 || expenses.length > 0) && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Financial Insights</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Savings Rate</div>
              <div className={`text-2xl font-bold ${
                savingsRate >= 20 ? 'text-green-600' : 
                savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {savingsRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {savingsRate >= 20 ? 'Excellent! Keep it up' : 
                 savingsRate >= 10 ? 'Good, aim for 20%+' : 'Try to save more'}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Annual Savings</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlySavings * 12)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Based on current rate</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Top Expense Category</div>
              <div className="text-2xl font-bold text-gray-800">
                {Object.keys(expensesByCategory).length > 0
                  ? Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)[0][0]
                  : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Object.keys(expensesByCategory).length > 0
                  ? formatCurrency(Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)[0][1])
                  : ''}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}