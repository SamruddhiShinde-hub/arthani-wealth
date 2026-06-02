import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { storage } from '../utils/storage';

type Investment = {
  id: string;
  name: string;
  type: 'SIP' | 'Lumpsum';
  category: string; // 'Equity', 'Debt', 'Hybrid', 'Gold', 'Real Estate', 'Other'
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  startDate: string;
  linkedToIncome?: string; // Which income source this comes from
};

const categories = [
  'Equity Mutual Fund',
  'Debt Mutual Fund',
  'Hybrid Fund',
  'Index Fund',
  'ELSS',
  'PPF',
  'NPS',
  'EPF',
  'Gold',
  'Stocks',
  'FD/RD',
  'Real Estate',
  'Cryptocurrency',
  'Other',
];

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInvestment, setNewInvestment] = useState<Partial<Investment>>({
    type: 'SIP',
    frequency: 'Monthly',
    category: 'Equity Mutual Fund',
  });

  // Load saved investments
  useEffect(() => {
    const saved = storage.get('investments', []);
    setInvestments(saved);
    setIsLoaded(true);
  }, []);

  // Save investments whenever they change
  useEffect(() => {
    if (isLoaded) {
      storage.set('investments', investments);
    }
  }, [investments, isLoaded]);

  const addInvestment = () => {
    if (!newInvestment.name || !newInvestment.amount) {
      alert('Please fill in investment name and amount');
      return;
    }

    const investment: Investment = {
      id: Date.now().toString(),
      name: newInvestment.name || '',
      type: newInvestment.type || 'SIP',
      category: newInvestment.category || 'Equity Mutual Fund',
      amount: Number(newInvestment.amount) || 0,
      frequency: newInvestment.frequency || 'Monthly',
      startDate: newInvestment.startDate || new Date().toISOString().split('T')[0],
      linkedToIncome: newInvestment.linkedToIncome,
    };

    setInvestments([...investments, investment]);
    setNewInvestment({
      type: 'SIP',
      frequency: 'Monthly',
      category: 'Equity Mutual Fund',
    });
  };

  const deleteInvestment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      setInvestments(investments.filter((inv) => inv.id !== id));
    }
  };

  const startEditing = (investment: Investment) => {
    setEditingId(investment.id);
  };

  const saveEdit = (id: string, field: keyof Investment, value: any) => {
    setInvestments(
      investments.map((inv) =>
        inv.id === id ? { ...inv, [field]: value } : inv
      )
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Calculate monthly investment amount
  const getMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'Monthly':
        return amount;
      case 'Quarterly':
        return amount / 3;
      case 'Half-Yearly':
        return amount / 6;
      case 'Yearly':
        return amount / 12;
      default:
        return 0;
    }
  };

  // Calculate totals
  const totalMonthlyInvestment = investments.reduce(
    (sum, inv) => sum + getMonthlyAmount(inv.amount, inv.frequency),
    0
  );

  const sipInvestments = investments.filter((inv) => inv.type === 'SIP');
  const lumpsumInvestments = investments.filter((inv) => inv.type === 'Lumpsum');

  const totalMonthlySIP = sipInvestments.reduce(
    (sum, inv) => sum + getMonthlyAmount(inv.amount, inv.frequency),
    0
  );

  const totalLumpsum = lumpsumInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  // Category-wise breakdown
  const categoryBreakdown = investments.reduce((acc, inv) => {
    const monthly = getMonthlyAmount(inv.amount, inv.frequency);
    acc[inv.category] = (acc[inv.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
          <TrendingUp className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Investments</h1>
        <p className="text-gray-600">Track your SIP and lumpsum investments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
          <p className="text-sm text-purple-600 font-semibold mb-1">Total Monthly Investment</p>
          <p className="text-3xl font-bold text-purple-700">{formatCurrency(totalMonthlyInvestment)}</p>
          <p className="text-xs text-purple-600 mt-2">{investments.length} active investments</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
          <p className="text-sm text-green-600 font-semibold mb-1">Monthly SIP</p>
          <p className="text-3xl font-bold text-green-700">{formatCurrency(totalMonthlySIP)}</p>
          <p className="text-xs text-green-600 mt-2">{sipInvestments.length} SIPs</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
          <p className="text-sm text-blue-600 font-semibold mb-1">Total Lumpsum</p>
          <p className="text-3xl font-bold text-blue-700">{formatCurrency(totalLumpsum)}</p>
          <p className="text-xs text-blue-600 mt-2">{lumpsumInvestments.length} lumpsum investments</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Investment by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div key={category} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                      style={{
                        width: `${(amount / totalMonthlyInvestment) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Investment Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Investment</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Type
            </label>
            <select
              value={newInvestment.type}
              onChange={(e) =>
                setNewInvestment({ ...newInvestment, type: e.target.value as 'SIP' | 'Lumpsum' })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="SIP">SIP (Recurring)</option>
              <option value="Lumpsum">Lumpsum (One-time)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Name
            </label>
            <input
              type="text"
              value={newInvestment.name || ''}
              onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
              placeholder="e.g., HDFC Index Fund"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={newInvestment.category}
              onChange={(e) => setNewInvestment({ ...newInvestment, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
            <input
              type="number"
              value={newInvestment.amount || ''}
              onChange={(e) =>
                setNewInvestment({ ...newInvestment, amount: Number(e.target.value) })
              }
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={newInvestment.frequency}
              onChange={(e) =>
                setNewInvestment({
                  ...newInvestment,
                  frequency: e.target.value as Investment['frequency'],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={newInvestment.startDate || ''}
              onChange={(e) => setNewInvestment({ ...newInvestment, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button
              onClick={addInvestment}
              className="w-full px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Investment
            </button>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Your Investments</h2>
        </div>

        {investments.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-500 text-lg mb-2">No investments added yet</p>
            <p className="text-gray-400 text-sm">
              Start by adding your SIP or lumpsum investments above
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Monthly Equiv.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          inv.type === 'SIP'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{inv.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{inv.category}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{inv.frequency}</td>
                    <td className="px-6 py-4 font-semibold text-purple-600">
                      {formatCurrency(getMonthlyAmount(inv.amount, inv.frequency))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(inv.startDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteInvestment(inv.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 rounded-xl p-6">
        <h3 className="font-bold text-purple-800 mb-2">💡 Investment Tracking Tips</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li>• Track all your SIPs and lumpsum investments in one place</li>
          <li>• Monthly equivalent helps you see the actual monthly commitment</li>
          <li>• Use this to ensure your investments don't exceed your income</li>
          <li>• Category breakdown helps maintain proper asset allocation</li>
        </ul>
      </div>
    </div>
  );
}