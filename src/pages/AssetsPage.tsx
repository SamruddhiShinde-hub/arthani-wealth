import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { TrendingUp, TrendingDown, PieChart, Plus, Trash2 } from 'lucide-react';

type Asset = {
  id: string;
  name: string;
  category: 'Real Estate' | 'Stocks' | 'Mutual Funds' | 'Cash & Bank' | 'Vehicles' | 'Gold' | 'EPF' | 'NPS' | 'PPF' | 'Bonds' | 'FD' | 'Insurance' | 'Other';
  value: number;
  notes: string;
};

type Liability = {
  id: string;
  name: string;
  category: 'Home Loan' | 'Personal Loan' | 'Car Loan' | 'Credit Card' | 'Education Loan' | 'Other';
  amount: number;
  interestRate: number;
  notes: string;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');

  // Load saved data
  useEffect(() => {
    const savedAssets = storage.get('assets', []);
    const savedLiabilities = storage.get('liabilities', []);
    console.log('Loading assets & liabilities:', { savedAssets, savedLiabilities });
    setAssets(savedAssets);
    setLiabilities(savedLiabilities);
    setIsLoaded(true);
  }, []);

  // Save data (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving assets & liabilities');
      storage.set('assets', assets);
      storage.set('liabilities', liabilities);
    }
  }, [isLoaded, assets, liabilities]);

  // Calculate totals
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Assets by category
  const assetsByCategory = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + asset.value;
    return acc;
  }, {} as Record<string, number>);

  // Liabilities by category
  const liabilitiesByCategory = liabilities.reduce((acc, liability) => {
    acc[liability.category] = (acc[liability.category] || 0) + liability.amount;
    return acc;
  }, {} as Record<string, number>);

  // Add new asset
  const addAsset = () => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      name: '',
      category: 'Cash & Bank',
      value: 0,
      notes: ''
    };

    setAssets([newAsset, ...assets]);
  };

  // Add new liability
  const addLiability = () => {
    const newLiability: Liability = {
      id: Date.now().toString(),
      name: '',
      category: 'Personal Loan',
      amount: 0,
      interestRate: 0,
      notes: ''
    };

    setLiabilities([newLiability, ...liabilities]);
  };

  // Update asset
  const updateAsset = (id: string, field: keyof Asset, value: any) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  // Update liability
  const updateLiability = (id: string, field: keyof Liability, value: any) => {
    setLiabilities(liabilities.map(liability => 
      liability.id === id ? { ...liability, [field]: value } : liability
    ));
  };

  // Delete asset
  const deleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  // Delete liability
  const deleteLiability = (id: string) => {
    setLiabilities(liabilities.filter(liability => liability.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Assets & Liabilities Tracker</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100">Total Assets</span>
            <TrendingUp size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalAssets)}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100">Total Liabilities</span>
            <TrendingDown size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalLiabilities)}</div>
        </div>

        <div className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg text-white ${
          netWorth >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={netWorth >= 0 ? 'text-blue-100' : 'text-orange-100'}>Net Worth</span>
            <PieChart size={24} />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(netWorth)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'assets'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          Assets ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('liabilities')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'liabilities'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          Liabilities ({liabilities.length})
        </button>
      </div>

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Assets</h2>
            <button
              onClick={addAsset}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Asset
            </button>
          </div>

          {/* Category Breakdown */}
          {Object.keys(assetsByCategory).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assets by Category</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(assetsByCategory).map(([category, value]) => (
                  <div key={category} className="bg-emerald-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">{category}</div>
                    <div className="text-xl font-bold text-emerald-600">{formatCurrency(value)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((value / totalAssets) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assets List */}
          {assets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <p className="text-gray-500 text-lg mb-4">No assets added yet</p>
              <p className="text-gray-400 text-sm">Click "Add Asset" to start tracking your wealth</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={asset.name}
                        onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                        placeholder="e.g., EPF Account"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={asset.category}
                        onChange={(e) => updateAsset(asset.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <optgroup label="Retirement & Tax Saving">
                          <option value="EPF">EPF (Employees' Provident Fund)</option>
                          <option value="NPS">NPS (National Pension System)</option>
                          <option value="PPF">PPF (Public Provident Fund)</option>
                        </optgroup>
                        <optgroup label="Investments">
                          <option value="Stocks">Stocks / Equity</option>
                          <option value="Mutual Funds">Mutual Funds</option>
                          <option value="Bonds">Bonds / Debentures</option>
                          <option value="FD">Fixed Deposits</option>
                        </optgroup>
                        <optgroup label="Liquid Assets">
                          <option value="Cash & Bank">Cash & Bank Accounts</option>
                        </optgroup>
                        <optgroup label="Hard Assets">
                          <option value="Real Estate">Real Estate / Property</option>
                          <option value="Gold">Gold / Precious Metals</option>
                          <option value="Vehicles">Vehicles</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="Insurance">Insurance (Cash Value)</option>
                          <option value="Other">Other</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Current Value (₹)</label>
                      <input
                        type="number"
                        value={asset.value || ''}
                        onChange={(e) => updateAsset(asset.id, 'value', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={asset.notes}
                        onChange={(e) => updateAsset(asset.id, 'notes', e.target.value)}
                        placeholder="Optional notes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteAsset(asset.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Asset"
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

      {/* Liabilities Tab */}
      {activeTab === 'liabilities' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Liabilities</h2>
            <button
              onClick={addLiability}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Liability
            </button>
          </div>

          {/* Category Breakdown */}
          {Object.keys(liabilitiesByCategory).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Liabilities by Category</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(liabilitiesByCategory).map(([category, value]) => (
                  <div key={category} className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">{category}</div>
                    <div className="text-xl font-bold text-red-600">{formatCurrency(value)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((value / totalLiabilities) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liabilities List */}
          {liabilities.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <p className="text-gray-500 text-lg mb-4">No liabilities added yet</p>
              <p className="text-gray-400 text-sm">Click "Add Liability" to track your debts and loans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {liabilities.map((liability) => (
                <div key={liability.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={liability.name}
                        onChange={(e) => updateLiability(liability.id, 'name', e.target.value)}
                        placeholder="e.g., Home Loan"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={liability.category}
                        onChange={(e) => updateLiability(liability.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Home Loan">Home Loan</option>
                        <option value="Personal Loan">Personal Loan</option>
                        <option value="Car Loan">Car Loan</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Education Loan">Education Loan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={liability.amount || ''}
                        onChange={(e) => updateLiability(liability.id, 'amount', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={liability.interestRate || ''}
                        onChange={(e) => updateLiability(liability.id, 'interestRate', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={liability.notes}
                        onChange={(e) => updateLiability(liability.id, 'notes', e.target.value)}
                        placeholder="Optional notes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteLiability(liability.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Liability"
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

      {/* Financial Health Indicator */}
      {(assets.length > 0 || liabilities.length > 0) && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Financial Health Indicators</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Net Worth Ratio</div>
              <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalLiabilities > 0 ? ((netWorth / totalAssets) * 100).toFixed(1) : '100'}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {netWorth >= 0 ? 'Positive net worth' : 'Negative net worth'}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Debt-to-Asset Ratio</div>
              <div className={`text-2xl font-bold ${
                totalAssets > 0 && (totalLiabilities / totalAssets) < 0.3 ? 'text-green-600' : 
                totalAssets > 0 && (totalLiabilities / totalAssets) < 0.5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {totalAssets > 0 && (totalLiabilities / totalAssets) < 0.3 ? 'Healthy' : 
                 totalAssets > 0 && (totalLiabilities / totalAssets) < 0.5 ? 'Moderate' : 'High debt'}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Average Liability Rate</div>
              <div className="text-2xl font-bold text-gray-800">
                {liabilities.length > 0 
                  ? (liabilities.reduce((sum, l) => sum + l.interestRate, 0) / liabilities.length).toFixed(1)
                  : '0'}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Across all liabilities</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}