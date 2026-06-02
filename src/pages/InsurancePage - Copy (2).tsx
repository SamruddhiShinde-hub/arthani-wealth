import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Plus, Trash2 } from 'lucide-react';

type LoanEntry = {
  id: string;
  name: string;
  amount: number;
};

type GoalEntry = {
  id: string;
  name: string;
  amount: number;
};

export default function InsurancePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Step I: Outstanding Loans (Dynamic)
  const [loans, setLoans] = useState<LoanEntry[]>([]);

  // Step II: Goal Funding (Dynamic)
  const [goals, setGoals] = useState<GoalEntry[]>([]);

  // Step III: Future Expenses
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [discountingFactor, setDiscountingFactor] = useState(0);
  const [spouseAge, setSpouseAge] = useState(0);
  const [spouseLifeExpectancy, setSpouseLifeExpectancy] = useState(0);
  const [inflationRate, setInflationRate] = useState(0);
  const [postTaxReturns, setPostTaxReturns] = useState(0);

  // Step V: Existing Resources
  const [investmentAssets, setInvestmentAssets] = useState(0);
  const [existingInsurance, setExistingInsurance] = useState(0);

  // Load saved data
  useEffect(() => {
    const saved = storage.get('insuranceCalculator');
    if (saved) {
      setLoans(saved.loans || []);
      setGoals(saved.goals || []);
      setMonthlyExpenses(saved.monthlyExpenses || 0);
      setDiscountingFactor(saved.discountingFactor || 0);
      setSpouseAge(saved.spouseAge || 0);
      setSpouseLifeExpectancy(saved.spouseLifeExpectancy || 0);
      setInflationRate(saved.inflationRate || 0);
      setPostTaxReturns(saved.postTaxReturns || 0);
      setInvestmentAssets(saved.investmentAssets || 0);
      setExistingInsurance(saved.existingInsurance || 0);
    }
    setIsLoaded(true);
  }, []);

  // Save data
  useEffect(() => {
    if (isLoaded) {
      storage.set('insuranceCalculator', {
        loans,
        goals,
        monthlyExpenses,
        discountingFactor,
        spouseAge,
        spouseLifeExpectancy,
        inflationRate,
        postTaxReturns,
        investmentAssets,
        existingInsurance
      });
    }
  }, [isLoaded, loans, goals, monthlyExpenses, discountingFactor, spouseAge,
      spouseLifeExpectancy, inflationRate, postTaxReturns, investmentAssets, existingInsurance]);

  // Loan operations
  const addLoan = () => {
    const newLoan: LoanEntry = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    setLoans([newLoan, ...loans]);
  };

  const updateLoan = (id: string, field: keyof LoanEntry, value: string | number) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ));
  };

  const deleteLoan = (id: string) => {
    setLoans(loans.filter(loan => loan.id !== id));
  };

  // Goal operations
  const addGoal = () => {
    const newGoal: GoalEntry = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    setGoals([newGoal, ...goals]);
  };

  const updateGoal = (id: string, field: keyof GoalEntry, value: string | number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Calculations
  const totalOutstandingLiabilities = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalGoalFunding = goals.reduce((sum, goal) => sum + goal.amount, 0);
  
  const netMonthlyExpenses = monthlyExpenses * (1 - discountingFactor / 100);
  const currentAnnualExpenses = netMonthlyExpenses * 12;
  const remainingLifeOfSpouse = spouseLifeExpectancy - spouseAge;
  const netReturns = ((1 + postTaxReturns / 100) / (1 + inflationRate / 100) - 1) * 100;

  // Present Value of Annuity formula for corpus calculation
  const r = netReturns / 100;
  const n = remainingLifeOfSpouse > 0 ? remainingLifeOfSpouse : 0;
  const corpusForFutureExpenses = (r > 0 && n > 0)
    ? currentAnnualExpenses * ((1 - Math.pow(1 + r, -n)) / r)
    : currentAnnualExpenses * n;

  const totalInsuranceRequired = totalOutstandingLiabilities + totalGoalFunding + corpusForFutureExpenses;
  const totalResourcesAvailable = investmentAssets + existingInsurance;
  const additionalCoverRequired = Math.max(0, totalInsuranceRequired - totalResourcesAvailable);
  
  const coverageGap = totalInsuranceRequired > 0 ? ((additionalCoverRequired / totalInsuranceRequired) * 100).toFixed(1) : '0';

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const resetAllData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setLoans([]);
      setGoals([]);
      setMonthlyExpenses(0);
      setDiscountingFactor(0);
      setSpouseAge(0);
      setSpouseLifeExpectancy(0);
      setInflationRate(0);
      setPostTaxReturns(0);
      setInvestmentAssets(0);
      setExistingInsurance(0);
      storage.set('insuranceCalculator', {});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12 overflow-x-hidden w-full">
      {/* CSS fixes for mobile inputs */}
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
          max-width: 100%;
        }
        input {
          font-size: 16px !important; /* Prevents zoom on iOS */
        }
      `}</style>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">
        Life Insurance Calculator
      </h1>
      <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12">
        Calculate how much life insurance coverage you need to protect your family
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-blue-100">Total Insurance Needed</span>
            <Shield size={20} className="sm:hidden" />
            <Shield size={24} className="hidden sm:block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{formatCurrency(totalInsuranceRequired)}</div>
          <div className="text-xs sm:text-sm text-blue-100 mt-1">Based on your needs</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-emerald-100">Current Coverage</span>
            <CheckCircle size={20} className="sm:hidden" />
            <CheckCircle size={24} className="hidden sm:block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{formatCurrency(totalResourcesAvailable)}</div>
          <div className="text-xs sm:text-sm text-emerald-100 mt-1">Assets + Insurance</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white ${
          additionalCoverRequired > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'
        } sm:col-span-2 lg:col-span-1`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs sm:text-sm ${additionalCoverRequired > 0 ? 'text-red-100' : 'text-green-100'}`}>
              {additionalCoverRequired > 0 ? 'Coverage Gap' : 'Fully Covered'}
            </span>
            <AlertTriangle size={20} className="sm:hidden" />
            <AlertTriangle size={24} className="hidden sm:block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{formatCurrency(additionalCoverRequired)}</div>
          <div className="text-xs sm:text-sm mt-1">
            {additionalCoverRequired > 0 ? `${coverageGap}% shortfall` : 'Well protected!'}
          </div>
        </div>
      </div>

      {/* Input Sections */}
      <div className="space-y-4 sm:space-y-6">
        {/* Step I: Outstanding Loans - FIXED */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Step I: Outstanding Loans</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Debts that would burden your family</p>
            </div>
            <button
              onClick={addLoan}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              Add Loan
            </button>
          </div>
          
          {loans.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-sm sm:text-base">No loans added yet</p>
              <p className="text-xs sm:text-sm mt-2">Click "Add Loan" to add your outstanding liabilities</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4 sm:mt-6">
              {loans.map((loan) => (
                <div key={loan.id} className="flex flex-col gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={loan.name}
                    onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                    placeholder="e.g., Home Loan"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={loan.amount || ''}
                      onChange={(e) => updateLoan(loan.id, 'amount', Number(e.target.value))}
                      placeholder="Amount"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => deleteLoan(loan.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                      title="Delete Loan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-gray-700">Total Outstanding Liabilities:</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600 break-words">{formatCurrency(totalOutstandingLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Step II: Goal Funding - FIXED */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Step II: Goal Funding</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Present value if goals were due today</p>
            </div>
            <button
              onClick={addGoal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              Add Goal
            </button>
          </div>
          
          {goals.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-sm sm:text-base">No goals added yet</p>
              <p className="text-xs sm:text-sm mt-2">Click "Add Goal" to add your financial goals</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4 sm:mt-6">
              {goals.map((goal) => (
                <div key={goal.id} className="flex flex-col gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => updateGoal(goal.id, 'name', e.target.value)}
                    placeholder="e.g., Children's Education"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={goal.amount || ''}
                      onChange={(e) => updateGoal(goal.id, 'amount', Number(e.target.value))}
                      placeholder="Amount"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                      title="Delete Goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 p-3 sm:p-4 bg-green-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-gray-700">Total Goal Funding:</span>
              <span className="text-lg sm:text-xl font-bold text-green-600 break-words">{formatCurrency(totalGoalFunding)}</span>
            </div>
          </div>
        </div>

        {/* Step III: Future Expenses - FIXED */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step III: Corpus for Future Expenses</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Calculate corpus needed for family's lifestyle</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Monthly Expenses (Current)</label>
              <input
                type="number"
                value={monthlyExpenses || ''}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Discounting Factor (%)</label>
              <input
                type="number"
                value={discountingFactor || ''}
                onChange={(e) => setDiscountingFactor(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">% that won't apply without you</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Current Age of Spouse</label>
              <input
                type="number"
                value={spouseAge || ''}
                onChange={(e) => setSpouseAge(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Life Expectancy of Spouse</label>
              <input
                type="number"
                value={spouseLifeExpectancy || ''}
                onChange={(e) => setSpouseLifeExpectancy(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Inflation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inflationRate || ''}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Post-tax Returns (%)</label>
              <input
                type="number"
                step="0.1"
                value={postTaxReturns || ''}
                onChange={(e) => setPostTaxReturns(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 space-y-3">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm min-w-[280px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Monthly Expenses:</span>
                  <span className="font-semibold break-words text-right ml-2">{formatCurrency(netMonthlyExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Expenses:</span>
                  <span className="font-semibold break-words text-right ml-2">{formatCurrency(currentAnnualExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Life:</span>
                  <span className="font-semibold">{remainingLifeOfSpouse} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Real Returns:</span>
                  <span className="font-semibold">{netReturns.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-sm sm:text-base font-semibold text-gray-700">Corpus Required:</span>
                <span className="text-lg sm:text-xl font-bold text-purple-600 break-words">{formatCurrency(corpusForFutureExpenses)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step V: Existing Resources */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step V: Existing Resources</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Assets and insurance already available</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Investment Assets (liquidable)
              </label>
              <input
                type="number"
                value={investmentAssets || ''}
                onChange={(e) => setInvestmentAssets(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Mutual funds, stocks, FDs</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Existing Life Insurance
              </label>
              <input
                type="number"
                value={existingInsurance || ''}
                onChange={(e) => setExistingInsurance(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Sum assured of current policies</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 sm:p-4 bg-emerald-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-gray-700">Total Resources:</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-600 break-words">{formatCurrency(totalResourcesAvailable)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Summary */}
      <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mb-20">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Insurance Needs Summary</h2>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8">
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Outstanding Liabilities:</span>
              <span className="text-base sm:text-lg font-bold text-blue-600 break-words">{formatCurrency(totalOutstandingLiabilities)}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-green-50 rounded-lg">
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Goal Funding:</span>
              <span className="text-base sm:text-lg font-bold text-green-600 break-words">{formatCurrency(totalGoalFunding)}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-purple-50 rounded-lg">
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Future Expenses Corpus:</span>
              <span className="text-base sm:text-lg font-bold text-purple-600 break-words">{formatCurrency(corpusForFutureExpenses)}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg border-2 border-blue-300">
              <span className="text-sm sm:text-base md:text-lg text-gray-800 font-bold">Total Insurance Required:</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 break-words">{formatCurrency(totalInsuranceRequired)}</span>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-emerald-50 rounded-lg">
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Total Resources Available:</span>
              <span className="text-base sm:text-lg font-bold text-emerald-600 break-words">{formatCurrency(totalResourcesAvailable)}</span>
            </div>
            
            <div className={`flex flex-col justify-between items-start gap-3 p-4 sm:p-6 rounded-lg border-2 ${
              additionalCoverRequired > 0 
                ? 'bg-gradient-to-r from-red-100 to-red-200 border-red-300' 
                : 'bg-gradient-to-r from-green-100 to-green-200 border-green-300'
            }`}>
              <div className="w-full">
                <div className="text-base sm:text-lg md:text-xl text-gray-800 font-bold mb-1">
                  {additionalCoverRequired > 0 ? 'Additional Cover Required:' : 'Coverage Status:'}
                </div>
                {additionalCoverRequired > 0 && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    You need {coverageGap}% more coverage
                  </div>
                )}
              </div>
              <span className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                additionalCoverRequired > 0 ? 'text-red-700' : 'text-green-700'
              } break-words w-full text-right`}>
                {additionalCoverRequired > 0 ? formatCurrency(additionalCoverRequired) : '✓ Fully Covered'}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
            
            {additionalCoverRequired > 0 ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 sm:gap-3 bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Insurance Gap Identified</p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      You have a coverage shortfall of {formatCurrency(additionalCoverRequired)}. 
                      Consider additional term life insurance to protect your family.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3 bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Recommended Action</p>
                    <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                      <li>• Purchase term insurance of {formatCurrency(additionalCoverRequired)}</li>
                      <li>• Compare quotes from multiple insurers</li>
                      <li>• Choose policy term until spouse's life expectancy</li>
                      <li>• Add critical illness riders for better protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 sm:gap-3 bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Well Protected!</p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Your current resources and insurance are sufficient. Review this annually as your situation changes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
