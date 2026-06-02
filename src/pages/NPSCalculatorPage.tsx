import React, { useState, useEffect } from 'react';
import { TrendingUp, Shield, PiggyBank, DollarSign, ArrowLeft } from 'lucide-react';
import { storage } from '../utils/storage';

interface NPSCalculatorPageProps {
  setCurrentPage?: (page: string) => void;
}

export default function NPSCalculatorPage({ setCurrentPage }: NPSCalculatorPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [annualIncrease, setAnnualIncrease] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [currentCorpus, setCurrentCorpus] = useState(0);

  useEffect(() => {
    const saved = storage.get('npsCalculator');
    if (saved) {
      setCurrentAge(saved.currentAge || 30);
      setRetirementAge(saved.retirementAge || 60);
      setMonthlyContribution(saved.monthlyContribution || 5000);
      setAnnualIncrease(saved.annualIncrease || 10);
      setExpectedReturn(saved.expectedReturn || 10);
      setCurrentCorpus(saved.currentCorpus || 0);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set('npsCalculator', {
        currentAge,
        retirementAge,
        monthlyContribution,
        annualIncrease,
        expectedReturn,
        currentCorpus,
      });
    }
  }, [isLoaded, currentAge, retirementAge, monthlyContribution, annualIncrease, expectedReturn, currentCorpus]);

  // Calculate NPS returns
  const calculateNPS = () => {
    const years = retirementAge - currentAge;
    let corpus = currentCorpus;
    let monthly = monthlyContribution;
    let totalInvested = currentCorpus;
    const monthlyRate = expectedReturn / 100 / 12;

    for (let year = 0; year < years; year++) {
      for (let month = 0; month < 12; month++) {
        corpus = corpus * (1 + monthlyRate) + monthly;
        totalInvested += monthly;
      }
      monthly = monthly * (1 + annualIncrease / 100);
    }

    // At maturity, 60% must be used to buy annuity, 40% can be withdrawn
    const annuityAmount = corpus * 0.6;
    const lumpSum = corpus * 0.4;

    // Assume 6% annuity rate for monthly pension
    const monthlyPension = (annuityAmount * 0.06) / 12;

    return {
      totalCorpus: corpus,
      totalInvested,
      wealthGained: corpus - totalInvested,
      annuityAmount,
      lumpSum,
      monthlyPension,
    };
  };

  const result = calculateNPS();

  // Calculate tax benefit
  const additionalTaxBenefit = Math.min(monthlyContribution * 12, 50000);
  const taxSaved = additionalTaxBenefit * 0.3; // Assuming 30% tax bracket

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
          <Shield className="text-emerald-600" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">NPS Calculator</h1>
        </div>
        <p className="text-center text-gray-600 mb-8">
          National Pension System - Plan your retirement with government backing
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">NPS Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Current Age</label>
                <input
                  type="number"
                  value={currentAge || ''}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must be between 18-70 years</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Retirement Age</label>
                <input
                  type="number"
                  value={retirementAge || ''}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  max={75}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 75 years, but can exit from 60</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Monthly Contribution
                </label>
                <input
                  type="number"
                  value={monthlyContribution || ''}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum ₹500 per month</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Annual Step-up (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={annualIncrease || ''}
                  onChange={(e) => setAnnualIncrease(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Yearly increase in contribution</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Expected Return (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={expectedReturn || ''}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Typical: 8-12% based on asset allocation</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Current NPS Balance (if any)
                </label>
                <input
                  type="number"
                  value={currentCorpus || ''}
                  onChange={(e) => setCurrentCorpus(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Maturity Amount */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PiggyBank size={20} />
                  At Maturity (Age {retirementAge})
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Invested:</span>
                  <span className="font-bold text-gray-800">{formatCurrency(result.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wealth Gained:</span>
                  <span className="font-bold text-green-600">{formatCurrency(result.wealthGained)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300">
                  <span className="font-bold text-gray-800">Total Corpus:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(result.totalCorpus)}
                  </span>
                </div>
              </div>
            </div>

            {/* Withdrawal Options */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign size={20} />
                  Withdrawal Options
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Lumpsum Withdrawal (40%)</div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(result.lumpSum)}</div>
                  <p className="text-xs text-gray-500 mt-1">Tax-free up to 60% if no annuity is purchased</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Annuity Amount (60%)</div>
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(result.annuityAmount)}</div>
                  <p className="text-xs text-gray-500 mt-1">Must purchase annuity for pension</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                  <div className="text-sm text-gray-600 mb-1">Monthly Pension (Estimated)</div>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(result.monthlyPension)}</div>
                  <p className="text-xs text-gray-500 mt-1">Assuming 6% annuity rate</p>
                </div>
              </div>
            </div>

            {/* Tax Benefits */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-orange-600" />
                Annual Tax Benefits
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">80CCD(1B) Deduction:</span>
                  <span className="font-bold text-orange-600">{formatCurrency(additionalTaxBenefit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tax Saved (30% bracket):</span>
                  <span className="font-bold text-green-600">{formatCurrency(taxSaved)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Additional ₹50,000 tax deduction over and above ₹1.5L limit under Section 80C
              </p>
            </div>
          </div>
        </div>

        {/* NPS Features */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">✨ NPS Features & Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Low Cost</h3>
                  <p className="text-sm text-gray-600">Lowest expense ratio among all retirement products</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Tax Benefits</h3>
                  <p className="text-sm text-gray-600">Additional ₹50,000 deduction under 80CCD(1B)</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Portable</h3>
                  <p className="text-sm text-gray-600">Can continue even if you change jobs</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Flexibility</h3>
                  <p className="text-sm text-gray-600">Choose your asset allocation (Equity, Corporate Debt, Govt Securities)</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Partial Withdrawals</h3>
                  <p className="text-sm text-gray-600">Allowed after 3 years for specific needs (max 25%)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Government Regulated</h3>
                  <p className="text-sm text-gray-600">Regulated by PFRDA for safety and transparency</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Points:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Lock-in until age 60 (early exit allowed with penalties after 3 years)</li>
              <li>• 60% corpus must be used for annuity purchase (40% lumpsum withdrawal)</li>
              <li>• Taxable pension income (except lumpsum up to 60% is tax-free)</li>
              <li>• Choose between Tier I (tax benefits, lock-in) and Tier II (no lock-in, no tax benefits)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
