import React, { useState, useEffect } from 'react';
import { PiggyBank, TrendingUp, Calendar, Info, ArrowLeft } from 'lucide-react';
import { storage } from '../utils/storage';

interface PPFCalculatorPageProps {
  setCurrentPage?: (page: string) => void;
}

export default function PPFCalculatorPage({ setCurrentPage }: PPFCalculatorPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [yearlyInvestment, setYearlyInvestment] = useState(150000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [yearsCompleted, setYearsCompleted] = useState(0);
  const [interestRate, setInterestRate] = useState(7.1); // Current PPF rate
  const [extensionYears, setExtensionYears] = useState(0);

  useEffect(() => {
    const saved = storage.get('ppfCalculator');
    if (saved) {
      setYearlyInvestment(saved.yearlyInvestment || 150000);
      setCurrentBalance(saved.currentBalance || 0);
      setYearsCompleted(saved.yearsCompleted || 0);
      setInterestRate(saved.interestRate || 7.1);
      setExtensionYears(saved.extensionYears || 0);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set('ppfCalculator', {
        yearlyInvestment,
        currentBalance,
        yearsCompleted,
        interestRate,
        extensionYears,
      });
    }
  }, [isLoaded, yearlyInvestment, currentBalance, yearsCompleted, interestRate, extensionYears]);

  // Calculate PPF maturity
  const calculatePPF = () => {
    const totalYears = 15 - yearsCompleted;
    let balance = currentBalance;
    const rate = interestRate / 100;
    let totalInvested = currentBalance;

    // Calculate for remaining years to maturity
    for (let year = 1; year <= totalYears; year++) {
      balance += yearlyInvestment;
      totalInvested += yearlyInvestment;
      balance += balance * rate;
    }

    // Calculate for extension period
    let extendedBalance = balance;
    let extendedInvestment = totalInvested;
    
    for (let year = 1; year <= extensionYears; year++) {
      extendedBalance += yearlyInvestment;
      extendedInvestment += yearlyInvestment;
      extendedBalance += extendedBalance * rate;
    }

    const interest = balance - totalInvested;
    const extendedInterest = extendedBalance - extendedInvestment;

    return {
      maturityAmount: balance,
      totalInvested,
      interestEarned: interest,
      extendedMaturityAmount: extendedBalance,
      extendedTotalInvested: extendedInvestment,
      extendedInterestEarned: extendedInterest,
    };
  };

  const result = calculatePPF();

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
          <PiggyBank className="text-emerald-600" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">PPF Calculator</h1>
        </div>
        <p className="text-center text-gray-600 mb-8">
          Public Provident Fund - Tax-free returns with government backing
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">PPF Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Yearly Investment (Max ₹1.5 Lakhs)
                </label>
                <input
                  type="number"
                  value={yearlyInvestment || ''}
                  onChange={(e) => setYearlyInvestment(Math.min(Number(e.target.value), 150000))}
                  max={150000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: ₹500, Maximum: ₹1,50,000</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Current PPF Balance (if existing)
                </label>
                <input
                  type="number"
                  value={currentBalance || ''}
                  onChange={(e) => setCurrentBalance(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Years Already Completed
                </label>
                <input
                  type="number"
                  value={yearsCompleted || ''}
                  onChange={(e) => setYearsCompleted(Math.min(Number(e.target.value), 14))}
                  max={14}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">PPF matures in 15 years</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Interest Rate (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate || ''}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Current rate: 7.1% (Q4 FY24-25)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Extension Years (After Maturity)
                </label>
                <input
                  type="number"
                  value={extensionYears || ''}
                  onChange={(e) => setExtensionYears(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Can extend in blocks of 5 years</p>
              </div>
            </div>
          </div>

          {/* Maturity Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar size={20} />
                  At Maturity (15 Years)
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Invested:</span>
                  <span className="font-bold text-gray-800">{formatCurrency(result.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interest Earned:</span>
                  <span className="font-bold text-green-600">{formatCurrency(result.interestEarned)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300">
                  <span className="font-bold text-gray-800">Maturity Amount:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(result.maturityAmount)}
                  </span>
                </div>
              </div>
            </div>

            {extensionYears > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp size={20} />
                    After Extension ({15 + extensionYears} Years)
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Invested:</span>
                    <span className="font-bold text-gray-800">
                      {formatCurrency(result.extendedTotalInvested)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interest Earned:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(result.extendedInterestEarned)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
                    <span className="font-bold text-gray-800">Final Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.extendedMaturityAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Benefits Info */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Info size={20} />
                Tax Benefits
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <div>
                    <strong>Section 80C:</strong> Investment up to ₹1.5 lakhs deductible
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <div>
                    <strong>EEE Status:</strong> Interest and maturity both tax-free
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg mt-3">
                  <div className="text-xs text-gray-600 mb-1">Annual Tax Saving (30% bracket)</div>
                  <div className="text-xl font-bold text-emerald-600">
                    {formatCurrency(Math.min(yearlyInvestment, 150000) * 0.3)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PPF Features */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">✨ PPF Features & Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Tax Benefits (EEE)</h3>
                  <p className="text-sm text-gray-600">Investment, Interest & Maturity - all tax-free</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Government Backed</h3>
                  <p className="text-sm text-gray-600">Safest investment with sovereign guarantee</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Loan Facility</h3>
                  <p className="text-sm text-gray-600">Available from 3rd to 6th year (up to 25% of balance)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Nomination Facility</h3>
                  <p className="text-sm text-gray-600">Can nominate beneficiaries for account</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Partial Withdrawals</h3>
                  <p className="text-sm text-gray-600">Allowed from 7th year onwards (up to 50%)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Compound Interest</h3>
                  <p className="text-sm text-gray-600">Interest compounds annually on March 31st</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Flexible Extension</h3>
                  <p className="text-sm text-gray-600">Can extend in blocks of 5 years after maturity</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Joint Account</h3>
                  <p className="text-sm text-gray-600">Can open joint account with spouse</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Rules */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Important Rules</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Investment Limits</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Minimum: ₹500 per year</li>
                  <li>• Maximum: ₹1,50,000 per year</li>
                  <li>• Can make deposits in lump sum or installments</li>
                  <li>• Max 12 deposits per financial year</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Maturity & Extension</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Matures after 15 years from end of year of opening</li>
                  <li>• Can extend in blocks of 5 years indefinitely</li>
                  <li>• During extension, can continue or stop contributions</li>
                  <li>• Interest continues even without contributions</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Withdrawal Rules</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Partial withdrawal from 7th year (max 50% of balance)</li>
                  <li>• Only one withdrawal per year</li>
                  <li>• Complete withdrawal only at maturity</li>
                  <li>• Premature closure allowed after 5 years (with conditions)</li>
                </ul>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">Account Opening</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Can be opened by Indian resident</li>
                  <li>• Minor accounts allowed (parent/guardian operated)</li>
                  <li>• Only one account per person</li>
                  <li>• Transfer facility available across banks/post offices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
