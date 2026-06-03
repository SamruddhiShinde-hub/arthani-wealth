import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Target, ArrowLeft } from 'lucide-react';
import { storage } from '../utils/storage';

type Debt = {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
};

type PayoffStrategy = 'snowball' | 'avalanche';

interface DebtPayoffPageProps {
  setCurrentPage?: (page: string) => void;
}

export default function DebtPayoffPage({ setCurrentPage }: DebtPayoffPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [extraPayment, setExtraPayment] = useState(0);

  useEffect(() => {
    const saved = storage.get('debtPayoff');
    if (saved) {
      setDebts(saved.debts || []);
      setStrategy(saved.strategy || 'avalanche');
      setExtraPayment(saved.extraPayment || 0);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set('debtPayoff', { debts, strategy, extraPayment });
    }
  }, [isLoaded, debts, strategy, extraPayment]);

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: '',
      balance: 0,
      interestRate: 0,
      minPayment: 0,
    };
    setDebts([newDebt, ...debts]);
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(debt => (debt.id === id ? { ...debt, [field]: value } : debt)));
  };

  const deleteDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  // Calculate debt payoff
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const totalMonthlyPayment = totalMinPayment + extraPayment;
  const avgInterestRate = debts.length > 0 
    ? debts.reduce((sum, d) => sum + (d.balance / totalDebt) * d.interestRate, 0)
    : 0;

  // Sort debts by strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') {
      return a.balance - b.balance; // Smallest balance first
    } else {
      return b.interestRate - a.interestRate; // Highest interest first
    }
  });

  // Calculate payoff timeline
  const calculatePayoff = () => {
    const debtsCopy = sortedDebts.map(d => ({ ...d }));
    let monthlyBudget = totalMonthlyPayment;
    let month = 0;
    const timeline: Array<{ month: number; debtPaid: string; remaining: number }> = [];
    
    while (debtsCopy.some(d => d.balance > 0) && month < 600) { // Max 50 years
      month++;
      let budgetRemaining = monthlyBudget;
      
      for (const debt of debtsCopy) {
        if (debt.balance <= 0) continue;
        
        // Add interest
        const monthlyInterest = (debt.balance * debt.interestRate) / 1200;
        debt.balance += monthlyInterest;
        
        // Make payment
        const payment = Math.min(debt.minPayment + budgetRemaining, debt.balance);
        debt.balance -= payment;
        budgetRemaining -= (payment - debt.minPayment);
        
        if (debt.balance <= 0) {
          timeline.push({
            month,
            debtPaid: debt.name,
            remaining: debtsCopy.filter(d => d.balance > 0).reduce((sum, d) => sum + d.balance, 0),
          });
        }
      }
    }
    
    const totalInterestPaid = (monthlyBudget * month) - totalDebt;
    return { months: month, timeline, totalInterestPaid };
  };

  const payoffResult = debts.length > 0 ? calculatePayoff() : null;

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

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
          <CreditCard className="text-emerald-600" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">Debt Payoff Calculator</h1>
        </div>
        <p className="text-center text-gray-600 mb-8">
          Plan your debt-free journey with proven strategies
        </p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-red-100 text-sm mb-1">Total Debt</div>
            <div className="text-3xl font-bold">{formatCurrency(totalDebt)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-blue-100 text-sm mb-1">Monthly Payment</div>
            <div className="text-3xl font-bold">{formatCurrency(totalMonthlyPayment)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-purple-100 text-sm mb-1">Avg Interest Rate</div>
            <div className="text-3xl font-bold">{avgInterestRate.toFixed(1)}%</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-emerald-100 text-sm mb-1">Debt-Free In</div>
            <div className="text-3xl font-bold">
              {payoffResult ? `${payoffResult.months}m` : '-'}
            </div>
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Payoff Strategy</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setStrategy('avalanche')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                strategy === 'avalanche'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">Avalanche Method</h3>
              <p className="text-sm text-gray-600">Pay off highest interest rate first</p>
              <p className="text-xs text-emerald-600 mt-1">✓ Saves more on interest</p>
            </button>
            <button
              onClick={() => setStrategy('snowball')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                strategy === 'snowball'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">Snowball Method</h3>
              <p className="text-sm text-gray-600">Pay off smallest balance first</p>
              <p className="text-xs text-blue-600 mt-1">✓ Motivational quick wins</p>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Extra Monthly Payment (Beyond Minimums)
            </label>
            <input
              type="number"
              value={extraPayment || ''}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Debt List */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Debts</h2>
            <button
              onClick={addDebt}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Debt
            </button>
          </div>

          {debts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No debts added yet</p>
              <p className="text-sm mt-2">Click "Add Debt" to start planning your payoff</p>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                      placeholder="e.g., Credit Card"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      value={debt.balance || ''}
                      onChange={(e) => updateDebt(debt.id, 'balance', Number(e.target.value))}
                      placeholder="Balance"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={debt.interestRate || ''}
                      onChange={(e) => updateDebt(debt.id, 'interestRate', Number(e.target.value))}
                      placeholder="Interest %"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      value={debt.minPayment || ''}
                      onChange={(e) => updateDebt(debt.id, 'minPayment', Number(e.target.value))}
                      placeholder="Min Payment"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payoff Results */}
        {payoffResult && debts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Target size={24} />
                Payoff Plan
              </h2>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Time to Debt Freedom</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {Math.floor(payoffResult.months / 12)}y {payoffResult.months % 12}m
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalMonthlyPayment * payoffResult.months)}
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Interest</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(payoffResult.totalInterestPaid)}
                  </div>
                </div>
              </div>

              {/* Payoff Order */}
              <h3 className="text-xl font-bold mb-4 text-gray-800">Payoff Order ({strategy === 'avalanche' ? 'Highest Interest First' : 'Smallest Balance First'})</h3>
              <div className="space-y-2">
                {sortedDebts.map((debt, index) => (
                  <div key={debt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{debt.name || 'Unnamed Debt'}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(debt.balance)} @ {debt.interestRate}% interest
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
