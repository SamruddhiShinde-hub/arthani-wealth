import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, FileText, DollarSign, ArrowLeft } from 'lucide-react';
import { storage } from '../utils/storage';

type TaxRegime = 'old' | 'new';

type Deduction80C = {
  ppf: number;
  elss: number;
  lifeInsurance: number;
  nsc: number;
  others: number;
};

interface TaxCalculatorPageProps {
  setCurrentPage?: (page: string) => void;
}

export default function TaxCalculatorPage({ setCurrentPage }: TaxCalculatorPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [regime, setRegime] = useState<TaxRegime>('new');
  const [income, setIncome] = useState({
    salary: 0,
    houseProperty: 0,
    capitalGains: 0,
    otherIncome: 0,
  });
  
  const [deductions, setDeductions] = useState<Deduction80C>({
    ppf: 0,
    elss: 0,
    lifeInsurance: 0,
    nsc: 0,
    others: 0,
  });
  
  const [otherDeductions, setOtherDeductions] = useState({
    section80D: 0, // Health insurance
    section80G: 0, // Donations
    section80E: 0, // Education loan interest
    homeLoanInterest: 0,
    hra: 0,
    lta: 0,
    standardDeduction: 50000,
  });

  // Load saved data
  useEffect(() => {
    const saved = storage.get('taxCalculator');
    if (saved) {
      setRegime(saved.regime || 'new');
      setIncome(saved.income || income);
      setDeductions(saved.deductions || deductions);
      setOtherDeductions(saved.otherDeductions || otherDeductions);
    }
    setIsLoaded(true);
  }, []);

  // Save data
  useEffect(() => {
    if (isLoaded) {
      storage.set('taxCalculator', {
        regime,
        income,
        deductions,
        otherDeductions,
      });
    }
  }, [isLoaded, regime, income, deductions, otherDeductions]);

  // Tax calculation
  const grossIncome = income.salary + income.houseProperty + income.capitalGains + income.otherIncome;
  
  const total80C = Object.values(deductions).reduce((sum, val) => sum + val, 0);
  const capped80C = Math.min(total80C, 150000);
  
  const totalOldRegimeDeductions = regime === 'old' 
    ? capped80C + otherDeductions.section80D + otherDeductions.section80G + 
      otherDeductions.section80E + otherDeductions.homeLoanInterest + 
      otherDeductions.hra + otherDeductions.lta + otherDeductions.standardDeduction
    : otherDeductions.standardDeduction;
  
  const taxableIncome = Math.max(0, grossIncome - totalOldRegimeDeductions);

  // Old regime tax slabs (FY 2024-25)
  const calculateOldRegimeTax = (income: number) => {
    let tax = 0;
    if (income <= 250000) tax = 0;
    else if (income <= 500000) tax = (income - 250000) * 0.05;
    else if (income <= 1000000) tax = 12500 + (income - 500000) * 0.2;
    else tax = 112500 + (income - 1000000) * 0.3;
    return tax;
  };

  // New regime tax slabs (FY 2024-25)
  const calculateNewRegimeTax = (income: number) => {
    let tax = 0;
    if (income <= 300000) tax = 0;
    else if (income <= 600000) tax = (income - 300000) * 0.05;
    else if (income <= 900000) tax = 15000 + (income - 600000) * 0.1;
    else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
    else if (income <= 1500000) tax = 90000 + (income - 1200000) * 0.2;
    else tax = 150000 + (income - 1500000) * 0.3;
    return tax;
  };

  const taxBeforeRebate = regime === 'old' 
    ? calculateOldRegimeTax(taxableIncome)
    : calculateNewRegimeTax(taxableIncome);

  // Rebate under section 87A
  const rebate = taxableIncome <= 500000 ? Math.min(taxBeforeRebate, 12500) : 0;
  const taxAfterRebate = taxBeforeRebate - rebate;

  // Cess
  const cess = taxAfterRebate * 0.04;
  const totalTax = taxAfterRebate + cess;

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
          <Calculator className="text-emerald-600" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">Income Tax Calculator</h1>
        </div>
        <p className="text-center text-gray-600 mb-8">Calculate your income tax for FY 2024-25</p>

        {/* Regime Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Select Tax Regime</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setRegime('old')}
              className={`p-4 rounded-xl border-2 transition-all ${
                regime === 'old'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">Old Tax Regime</h3>
              <p className="text-sm text-gray-600">With deductions under 80C, 80D, HRA, etc.</p>
            </button>
            <button
              onClick={() => setRegime('new')}
              className={`p-4 rounded-xl border-2 transition-all ${
                regime === 'new'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">New Tax Regime</h3>
              <p className="text-sm text-gray-600">Lower rates, limited deductions</p>
            </button>
          </div>
        </div>

        {/* Income Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <DollarSign size={24} className="text-emerald-600" />
            Income Details
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Salary Income</label>
              <input
                type="number"
                value={income.salary || ''}
                onChange={(e) => setIncome({ ...income, salary: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">House Property Income</label>
              <input
                type="number"
                value={income.houseProperty || ''}
                onChange={(e) => setIncome({ ...income, houseProperty: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Capital Gains</label>
              <input
                type="number"
                value={income.capitalGains || ''}
                onChange={(e) => setIncome({ ...income, capitalGains: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Other Income</label>
              <input
                type="number"
                value={income.otherIncome || ''}
                onChange={(e) => setIncome({ ...income, otherIncome: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Gross Total Income:</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(grossIncome)}</span>
            </div>
          </div>
        </div>

        {/* Deductions Section (Only for Old Regime) */}
        {regime === 'old' && (
          <>
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <TrendingDown size={24} className="text-emerald-600" />
                Section 80C Deductions (Max ₹1.5 Lakhs)
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">PPF</label>
                  <input
                    type="number"
                    value={deductions.ppf || ''}
                    onChange={(e) => setDeductions({ ...deductions, ppf: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">ELSS Mutual Funds</label>
                  <input
                    type="number"
                    value={deductions.elss || ''}
                    onChange={(e) => setDeductions({ ...deductions, elss: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Life Insurance Premium</label>
                  <input
                    type="number"
                    value={deductions.lifeInsurance || ''}
                    onChange={(e) => setDeductions({ ...deductions, lifeInsurance: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">NSC</label>
                  <input
                    type="number"
                    value={deductions.nsc || ''}
                    onChange={(e) => setDeductions({ ...deductions, nsc: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Others (Tuition Fees, FD, etc.)</label>
                  <input
                    type="number"
                    value={deductions.others || ''}
                    onChange={(e) => setDeductions({ ...deductions, others: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total 80C (Claimed):</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(capped80C)}</span>
                </div>
                {total80C > 150000 && (
                  <p className="text-xs text-orange-600 mt-2">
                    Note: You've entered ₹{total80C.toLocaleString()}, but max deduction is ₹1,50,000
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Other Deductions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">80D (Health Insurance)</label>
                  <input
                    type="number"
                    value={otherDeductions.section80D || ''}
                    onChange={(e) => setOtherDeductions({ ...otherDeductions, section80D: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="Max ₹25,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">80G (Donations)</label>
                  <input
                    type="number"
                    value={otherDeductions.section80G || ''}
                    onChange={(e) => setOtherDeductions({ ...otherDeductions, section80G: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">80E (Education Loan Interest)</label>
                  <input
                    type="number"
                    value={otherDeductions.section80E || ''}
                    onChange={(e) => setOtherDeductions({ ...otherDeductions, section80E: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Home Loan Interest (24B)</label>
                  <input
                    type="number"
                    value={otherDeductions.homeLoanInterest || ''}
                    onChange={(e) => setOtherDeductions({ ...otherDeductions, homeLoanInterest: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="Max ₹2,00,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">HRA Exemption</label>
                  <input
                    type="number"
                    value={otherDeductions.hra || ''}
                    onChange={(e) => setOtherDeductions({ ...otherDeductions, hra: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">LTA (Leave Travel Allowance)</label>
                  <input
                    type="number"
                    value={otherDeductions.lta || ''}
                    onChange={(e) => setOtherDeductions({ ...otherDeductions, lta: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tax Summary */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText size={24} />
              Tax Summary
            </h2>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Gross Total Income:</span>
                <span className="text-lg font-bold text-gray-800">{formatCurrency(grossIncome)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Deductions:</span>
                <span className="text-lg font-bold text-green-600">
                  - {formatCurrency(totalOldRegimeDeductions)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <span className="text-gray-800 font-bold text-lg">Taxable Income:</span>
                <span className="text-2xl font-bold text-blue-700">{formatCurrency(taxableIncome)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-gray-700 font-medium">Tax Before Rebate:</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(taxBeforeRebate)}</span>
              </div>
              {rebate > 0 && (
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Rebate u/s 87A:</span>
                  <span className="text-lg font-bold text-green-600">- {formatCurrency(rebate)}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700 font-medium">Health & Education Cess (4%):</span>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(cess)}</span>
              </div>
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-red-100 to-red-200 rounded-lg border-2 border-red-300">
                <span className="text-gray-800 font-bold text-xl">Total Tax Payable:</span>
                <span className="text-3xl font-bold text-red-700">{formatCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg">
                <span className="text-gray-700 font-medium">Net Income (After Tax):</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(grossIncome - totalTax)}
                </span>
              </div>
            </div>

            {/* Tax Saving Tips */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Tax Saving Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {regime === 'old' && total80C < 150000 && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>You can save up to ₹{(150000 - total80C).toLocaleString()} more under Section 80C</span>
                  </li>
                )}
                {regime === 'new' && totalTax > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>Consider switching to old regime if you have significant deductions</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Max out your NPS contribution for additional ₹50,000 deduction under 80CCD(1B)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Health insurance premiums can save up to ₹25,000 (₹50,000 for senior citizens)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
