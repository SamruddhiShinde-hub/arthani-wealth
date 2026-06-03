import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Shield, AlertCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState({
    assets: [],
    liabilities: [],
    incomes: [],
    expenses: [],
    investments: [],
    goals: [],
    riskProfile: '',
  });

  useEffect(() => {
    // Load all financial data
    const assets = storage.get('assets', []);
    const liabilities = storage.get('liabilities', []);
    const incomes = storage.get('incomes', []);
    const expenses = storage.get('expenses', []);
    const investments = storage.get('investments', []);
    const goals = storage.get('financialGoals', []);
    const riskProfile = storage.get('riskProfile', '');

    setData({ assets, liabilities, incomes, expenses, investments, goals, riskProfile });
  }, []);

  // Calculate metrics
  const totalAssets = data.assets.reduce((sum: number, a: any) => sum + (a.value || 0), 0);
  const totalLiabilities = data.liabilities.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const getMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'Monthly': return amount;
      case 'Quarterly': return amount / 3;
      case 'Half-Yearly': return amount / 6;
      case 'Yearly': return amount / 12;
      default: return 0;
    }
  };

  const monthlyIncome = data.incomes.reduce(
    (sum: number, i: any) => sum + getMonthlyAmount(i.amount || 0, i.frequency),
    0
  );

  const monthlyExpenses = data.expenses.reduce(
    (sum: number, e: any) => sum + getMonthlyAmount(e.amount || 0, e.frequency),
    0
  );

  // Calculate monthly SIP investments (exclude EPF since it's already deducted from salary)
  const monthlySIPInvestments = data.investments
    .filter((inv: any) => inv.type === 'SIP' && inv.category !== 'EPF')
    .reduce(
      (sum: number, inv: any) => sum + getMonthlyAmount(inv.amount || 0, inv.frequency),
      0
    );

  // Separate EPF tracking (informational only, doesn't reduce net savings)
  const monthlyEPFInvestment = data.investments
    .filter((inv: any) => inv.category === 'EPF')
    .reduce(
      (sum: number, inv: any) => sum + getMonthlyAmount(inv.amount || 0, inv.frequency),
      0
    );



  // Net savings = Income - Expenses - SIP Investments (EPF excluded since already deducted)
  const monthlySavings = monthlyIncome - monthlyExpenses - monthlySIPInvestments;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Investment rate (% of income going to SIPs, excluding EPF)
  const investmentRate = monthlyIncome > 0 ? (monthlySIPInvestments / monthlyIncome) * 100 : 0;



  // Asset allocation data
  const assetsByCategory = data.assets.reduce((acc: any, asset: any) => {
    const category = asset.category || 'Other';
    acc[category] = (acc[category] || 0) + (asset.value || 0);
    return acc;
  }, {});

  const assetAllocationData = Object.entries(assetsByCategory).map(([name, value]) => ({
    name,
    value: value as number,
  }));





  // Investment breakdown by category
  const investmentsByCategory = data.investments.reduce((acc: any, inv: any) => {
    const category = inv.category || 'Other';
    const monthly = inv.type === 'SIP' ? getMonthlyAmount(inv.amount || 0, inv.frequency) : 0;
    acc[category] = (acc[category] || 0) + monthly;
    return acc;
  }, {});

  const investmentData = Object.entries(investmentsByCategory).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  // Goals progress
  const goalsProgress = data.goals.map((goal: any) => ({
    name: goal.description || 'Goal',
    progress: goal.futureValue > 0 ? (goal.finalCapital / goal.futureValue) * 100 : 0,
    target: goal.futureValue,
    current: goal.finalCapital,
  }));

  // Income vs Expense trend (mock data - in real app, this would come from historical data)
  const trendData = [
    { month: 'Jan', income: monthlyIncome * 0.95, expense: monthlyExpenses * 0.98, investment: monthlySIPInvestments * 0.9 },
    { month: 'Feb', income: monthlyIncome * 0.97, expense: monthlyExpenses * 1.02, investment: monthlySIPInvestments * 0.95 },
    { month: 'Mar', income: monthlyIncome * 1.00, expense: monthlyExpenses * 0.95, investment: monthlySIPInvestments * 0.98 },
    { month: 'Apr', income: monthlyIncome * 1.03, expense: monthlyExpenses * 1.01, investment: monthlySIPInvestments },
    { month: 'May', income: monthlyIncome * 1.05, expense: monthlyExpenses * 0.99, investment: monthlySIPInvestments },
    { month: 'Jun', income: monthlyIncome, expense: monthlyExpenses, investment: monthlySIPInvestments },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Financial Health Score
  const calculateHealthScore = () => {
    let score = 0;
    
    // Combined savings + investment rate (0-30 points)
    const totalSavingsInvestmentRate = savingsRate + investmentRate;
    if (totalSavingsInvestmentRate >= 40) score += 30;
    else if (totalSavingsInvestmentRate >= 30) score += 25;
    else if (totalSavingsInvestmentRate >= 20) score += 20;
    else if (totalSavingsInvestmentRate >= 10) score += 15;
    else if (totalSavingsInvestmentRate >= 5) score += 10;

    // Investment discipline (0-20 points)
    if (investmentRate >= 20) score += 20;
    else if (investmentRate >= 15) score += 15;
    else if (investmentRate >= 10) score += 10;
    else if (investmentRate >= 5) score += 5;

    // Debt to asset ratio (0-20 points)
    const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 1;
    if (debtRatio < 0.2) score += 20;
    else if (debtRatio < 0.4) score += 15;
    else if (debtRatio < 0.6) score += 10;
    else if (debtRatio < 0.8) score += 5;

    // Emergency fund (0-15 points)
    const emergencyFundNeeded = monthlyExpenses * 6;
    const emergencyFundRatio = emergencyFundNeeded > 0 ? totalAssets / emergencyFundNeeded : 0;
    if (emergencyFundRatio >= 1) score += 15;
    else if (emergencyFundRatio >= 0.75) score += 12;
    else if (emergencyFundRatio >= 0.5) score += 8;
    else if (emergencyFundRatio >= 0.25) score += 4;

    // Active goals (0-10 points)
    if (data.goals.length >= 3) score += 10;
    else if (data.goals.length >= 2) score += 7;
    else if (data.goals.length >= 1) score += 4;

    // Risk profile completed (0-5 points)
    if (data.riskProfile) score += 5;

    return score;
  };

  const healthScore = calculateHealthScore();

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 40) return { text: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const healthStatus = getHealthStatus(healthScore);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Financial Dashboard</h1>

      {/* Financial Health Score */}
      <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Financial Health Score</h2>
          <div className={`px-6 py-3 rounded-full ${healthStatus.bg}`}>
            <span className={`text-2xl font-bold ${healthStatus.color}`}>{healthScore}/100</span>
          </div>
        </div>
        <div className="relative">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-4 ${
                healthScore >= 80 ? 'bg-green-500' :
                healthScore >= 60 ? 'bg-blue-500' :
                healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              } transition-all duration-1000`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0</span>
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
            <span>100</span>
          </div>
        </div>
        <div className={`mt-6 p-4 ${healthStatus.bg} rounded-lg`}>
          <p className={`font-semibold ${healthStatus.color}`}>{healthStatus.text}</p>
          <p className="text-sm text-gray-600 mt-1">
            {healthScore >= 80 && "You're doing great! Keep up the excellent financial habits."}
            {healthScore >= 60 && healthScore < 80 && "You're on the right track. Consider increasing savings and investments."}
            {healthScore >= 40 && healthScore < 60 && "There's room for improvement. Focus on building emergency fund and investing regularly."}
            {healthScore < 40 && "Time to take action! Start by tracking expenses and setting up SIPs."}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100">Net Worth</span>
            <TrendingUp size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(netWorth)}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Net Savings</span>
            <DollarSign size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(monthlySavings)}</div>
          <div className="text-sm text-blue-100 mt-1">{savingsRate.toFixed(1)}% of income</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-100">SIP Investments</span>
            <TrendingUp size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(monthlySIPInvestments)}</div>
          <div className="text-sm text-indigo-100 mt-1">
            {investmentRate.toFixed(1)}% of income
            {monthlyEPFInvestment > 0 && (
              <span className="block text-xs mt-1">
                + EPF: {formatCurrency(monthlyEPFInvestment)}
              </span>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Active Goals</span>
            <Target size={24} />
          </div>
          <div className="text-3xl font-bold">{data.goals.length}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Risk Profile</span>
            <Shield size={24} />
          </div>
          <div className="text-2xl font-bold">{data.riskProfile || 'Not Set'}</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Asset Allocation */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Asset Allocation</h2>
          {assetAllocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={assetAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
		    const { name, percent } = props;
		    return `${name}: ${((percent as number) * 100).toFixed(0)}%`;
		  }}

                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No assets data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly SIP Investments by Category */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Monthly SIP Investments</h2>
          {investmentData.length > 0 && monthlySIPInvestments > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No SIP investments tracked yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expense vs Investment Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Cash Flow Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="investment" stroke="#6366f1" strokeWidth={2} name="SIP" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Goals Progress</h2>
          {goalsProgress.length > 0 ? (
            <div className="space-y-4">
              {goalsProgress.slice(0, 5).map((goal: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate">{goal.name}</span>
                    <span className="text-gray-600">{goal.progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatCurrency(goal.current)}</span>
                    <span>{formatCurrency(goal.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No goals set yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">💡 Recommendations</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(savingsRate + investmentRate) < 30 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="font-semibold text-yellow-800 mb-2">Increase Savings + Investment</div>
              <p className="text-sm text-gray-600">
                Combined rate is {(savingsRate + investmentRate).toFixed(1)}%. Aim for at least 30% of income.
              </p>
            </div>
          )}
          {investmentRate < 15 && (
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="font-semibold text-indigo-800 mb-2">Start or Increase SIPs</div>
              <p className="text-sm text-gray-600">
                You're investing {investmentRate.toFixed(1)}% of income. Target 15-20% for long-term wealth.
              </p>
            </div>
          )}
          {!data.riskProfile && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800 mb-2">Complete Risk Profile</div>
              <p className="text-sm text-gray-600">
                Take the risk assessment to get personalized investment recommendations.
              </p>
            </div>
          )}
          {data.goals.length === 0 && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-semibold text-purple-800 mb-2">Set Financial Goals</div>
              <p className="text-sm text-gray-600">
                Define your financial goals to stay motivated and track progress.
              </p>
            </div>
          )}
          {totalLiabilities / totalAssets > 0.5 && totalAssets > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="font-semibold text-red-800 mb-2">High Debt-to-Asset Ratio</div>
              <p className="text-sm text-gray-600">
                Your debt is {((totalLiabilities / totalAssets) * 100).toFixed(0)}% of assets. Consider debt reduction strategies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}