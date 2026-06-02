import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import { storage } from '../utils/storage';

interface EmergencyFundPageProps {
  setCurrentPage?: (page: string) => void;
}

export default function EmergencyFundPage({ setCurrentPage }: EmergencyFundPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [employmentType, setEmploymentType] = useState<'salaried' | 'self-employed'>('salaried');
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlySaving, setMonthlySaving] = useState(0);

  useEffect(() => {
    const saved = storage.get('emergencyFund');
    if (saved) {
      setMonthlyExpenses(saved.monthlyExpenses || 0);
      setDependents(saved.dependents || 0);
      setEmploymentType(saved.employmentType || 'salaried');
      setCurrentSavings(saved.currentSavings || 0);
      setMonthlySaving(saved.monthlySaving || 0);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set('emergencyFund', {
        monthlyExpenses,
        dependents,
        employmentType,
        currentSavings,
        monthlySaving,
      });
    }
  }, [isLoaded, monthlyExpenses, dependents, employmentType, currentSavings, monthlySaving]);

  // Calculate recommended emergency fund
  const baseMonths = employmentType === 'salaried' ? 6 : 12;
  const additionalMonths = Math.floor(dependents / 2);
  const recommendedMonths = baseMonths + additionalMonths;
  const recommendedAmount = monthlyExpenses * recommendedMonths;
  const shortfall = Math.max(0, recommendedAmount - currentSavings);
  const monthsToGoal = monthlySaving > 0 ? Math.ceil(shortfall / monthlySaving) : 0;
  const coveragePercent = recommendedAmount > 0 ? (currentSavings / recommendedAmount) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const getStatus = () => {
    if (coveragePercent >= 100) return { text: 'Excellent!', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' };
    if (coveragePercent >= 75) return { text: 'Good Progress', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' };
    if (coveragePercent >= 50) return { text: 'Getting There', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300' };
    return { text: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' };
  };

  const status = getStatus();

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
    <div className="max-w-7xl mx-auto">
      
      
	{/* Back Button - Floating */}
		{setCurrentPage && (
		  <button
		    onClick={() => setCurrentPage('tools')}
		    className="fixed top-24 left-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
		  >
		    <ArrowLeft size={20} />
		    <span className="hidden md:inline">Back to Tools</span>
		  </button>
	)}

      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Shield className="text-emerald-600" size={40} />
        <h1 className="text-4xl font-bold text-gray-800">Emergency Fund Calculator</h1>
      </div>
      <p className="text-center text-gray-600 mb-8">
        Calculate how much you need to save for unexpected expenses
      </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Monthly Expenses
                </label>
                <input
                  type="number"
                  value={monthlyExpenses || ''}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="50000"
                />
                <p className="text-xs text-gray-500 mt-1">Include rent, bills, groceries, EMIs, etc.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as 'salaried' | 'self-employed')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed / Business</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {employmentType === 'salaried' 
                    ? 'Recommended: 6 months of expenses'
                    : 'Recommended: 12 months of expenses'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  value={dependents || ''}
                  onChange={(e) => setDependents(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Spouse, children, parents, etc.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Current Emergency Savings
                </label>
                <input
                  type="number"
                  value={currentSavings || ''}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Monthly Savings Capacity
                </label>
                <input
                  type="number"
                  value={monthlySaving || ''}
                  onChange={(e) => setMonthlySaving(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">How much can you save monthly?</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${status.border}`}>
              <div className={`${status.bg} px-6 py-4 border-b ${status.border}`}>
                <h2 className={`text-xl font-bold ${status.color} flex items-center gap-2`}>
                  {coveragePercent >= 100 ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                  {status.text}
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Emergency Fund Progress</span>
                    <span className="font-semibold text-gray-800">{coveragePercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-4 ${
                        coveragePercent >= 100 ? 'bg-green-500' :
                        coveragePercent >= 75 ? 'bg-blue-500' :
                        coveragePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      } transition-all duration-500`}
                      style={{ width: `${Math.min(coveragePercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Recommended Fund:</span>
                    <span className="font-bold text-lg text-gray-800">{formatCurrency(recommendedAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Savings:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(currentSavings)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-800 font-semibold">Shortfall:</span>
                    <span className={`font-bold text-lg ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {shortfall > 0 ? formatCurrency(shortfall) : '₹0 - Goal Achieved!'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            {shortfall > 0 && monthlySaving > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-600" />
                  Timeline to Goal
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Savings:</span>
                    <span className="font-bold text-gray-800">{formatCurrency(monthlySaving)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time to Reach Goal:</span>
                    <span className="font-bold text-emerald-600">
                      {monthsToGoal} months ({(monthsToGoal / 12).toFixed(1)} years)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">💡 Recommendation</h3>
              <p className="text-gray-700 mb-3">
                For {employmentType === 'salaried' ? 'a salaried person' : 'self-employed income'} with{' '}
                {dependents} dependent{dependents !== 1 ? 's' : ''}, you should maintain:
              </p>
              <div className="bg-white rounded-lg p-4 mb-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {recommendedMonths} Months
                  </div>
                  <div className="text-sm text-gray-600">of expenses</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This covers {baseMonths} months (base) + {additionalMonths} months (for dependents)
              </p>
            </div>
          </div>
        </div>

        {/* Where to Keep Emergency Fund */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🏦 Where to Keep Your Emergency Fund</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50">
              <h3 className="font-bold text-emerald-700 mb-2">✓ Recommended</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Savings Bank Account (40%)</li>
                <li>• Liquid Mutual Funds (40%)</li>
                <li>• Fixed Deposits (20%)</li>
              </ul>
            </div>
            <div className="border-2 border-yellow-200 rounded-xl p-4 bg-yellow-50">
              <h3 className="font-bold text-yellow-700 mb-2">⚠ Acceptable</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Sweep-in FD Accounts</li>
                <li>• Ultra Short-term Funds</li>
                <li>• Gold (limited portion)</li>
              </ul>
            </div>
            <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
              <h3 className="font-bold text-red-700 mb-2">✗ Not Recommended</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Equity/Stock Market</li>
                <li>• Long-term FDs (lock-in)</li>
                <li>• Real Estate</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Key Criteria:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ <strong>High Liquidity</strong> - Should be accessible within 1-2 days</li>
              <li>✓ <strong>Low/No Risk</strong> - Capital protection is priority, not returns</li>
              <li>✓ <strong>No Lock-in</strong> - Avoid investments with penalties for early withdrawal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
