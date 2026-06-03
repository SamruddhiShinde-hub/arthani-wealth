import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Plus, Trash2, Download, RefreshCw, Home, Coins } from 'lucide-react';

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

  // Step I: Outstanding Loans (Auto-populated from liabilities)
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [loansImported, setLoansImported] = useState(false);

  // Step II: Goal Funding (Auto-populated from goals)
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [goalsImported, setGoalsImported] = useState(false);

  // Step III: Future Expenses
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [expensesImported, setExpensesImported] = useState(false);
  const [continuingMonthlyIncome, setContinuingMonthlyIncome] = useState(0); // NEW: Rental, business, dividends
  const [incomeImported, setIncomeImported] = useState(false);
  const [discountingFactor, setDiscountingFactor] = useState(0);
  const [spouseAge, setSpouseAge] = useState(0);
  const [spouseLifeExpectancy, setSpouseLifeExpectancy] = useState(0);
  const [inflationRate, setInflationRate] = useState(6);
  const [postTaxReturns, setPostTaxReturns] = useState(8);

  // Step IV: Continuing Assets (What remains after you're gone)
  const [liquidInvestments, setLiquidInvestments] = useState(0); // Stocks, MFs, FDs
  const [realEstateValue, setRealEstateValue] = useState(0);
  const [monthlyRentalIncome, setMonthlyRentalIncome] = useState(0);
  const [goldValue, setGoldValue] = useState(0);
  const [epfBalance, setEpfBalance] = useState(0);
  const [otherAssets, setOtherAssets] = useState(0);
  const [assetsImported, setAssetsImported] = useState(false);

  // Step V: Existing Insurance
  const [existingInsurance, setExistingInsurance] = useState(0);

  // 🔄 AUTO-LOAD ALL DATA ON MOUNT
  useEffect(() => {
    const saved = storage.get('insuranceCalculator');
    if (saved) {
      // Load manually entered data
      setDiscountingFactor(saved.discountingFactor || 0);
      setSpouseAge(saved.spouseAge || 0);
      setSpouseLifeExpectancy(saved.spouseLifeExpectancy || 0);
      setInflationRate(saved.inflationRate || 6);
      setPostTaxReturns(saved.postTaxReturns || 8);
      setExistingInsurance(saved.existingInsurance || 0);
      setMonthlyRentalIncome(saved.monthlyRentalIncome || 0);
      
      // Check if user has manually modified data
      if (saved.loans && saved.loans.length > 0) {
        setLoans(saved.loans);
        setLoansImported(true);
      }
      if (saved.goals && saved.goals.length > 0) {
        setGoals(saved.goals);
        setGoalsImported(true);
      }
      if (saved.monthlyExpenses) {
        setMonthlyExpenses(saved.monthlyExpenses);
        setExpensesImported(true);
      }
      if (saved.continuingMonthlyIncome !== undefined) {
        setContinuingMonthlyIncome(saved.continuingMonthlyIncome);
        setIncomeImported(true);
      }
      if (saved.liquidInvestments !== undefined) {
        setLiquidInvestments(saved.liquidInvestments);
        setRealEstateValue(saved.realEstateValue || 0);
        setGoldValue(saved.goldValue || 0);
        setEpfBalance(saved.epfBalance || 0);
        setOtherAssets(saved.otherAssets || 0);
        setAssetsImported(true);
      }
    }

    // AUTO-IMPORT DATA FROM OTHER PAGES
    autoImportData();
    setIsLoaded(true);
  }, []);

  // 🔄 AUTO-IMPORT FUNCTION
  const autoImportData = () => {
    // 1️⃣ Import Outstanding Loans from Liabilities
    const liabilities = storage.get('liabilities') || [];
    if (liabilities.length > 0) {
      const importedLoans: LoanEntry[] = liabilities.map((liability: any, index: number) => ({
        id: `loan-import-${Date.now()}-${index}`,
        name: liability.name || `${liability.category} - Loan ${index + 1}`,
        amount: liability.amount || 0
      }));
      setLoans(importedLoans);
      setLoansImported(true);
    }

    // 2️⃣ Import Goals from Goals Page
    const financialGoals = storage.get('financialGoals') || [];
    if (financialGoals.length > 0) {
      const importedGoals: GoalEntry[] = financialGoals.map((goal: any, index: number) => ({
        id: `goal-import-${Date.now()}-${index}`,
        name: goal.description || goal.name || `Goal ${index + 1}`,
        amount: goal.futureValue || goal.targetAmount || goal.amount || 0
      }));
      setGoals(importedGoals);
      setGoalsImported(true);
    }

    // 3️⃣ Import Monthly Expenses from Expenses Page
    const expenses = storage.get('expenses') || [];
    if (expenses.length > 0) {
      const getMonthlyAmount = (amount: number, frequency: string) => {
        switch (frequency) {
          case 'Monthly': return amount;
          case 'Quarterly': return amount / 3;
          case 'Yearly': return amount / 12;
          case 'One-time': return 0;
          default: return amount;
        }
      };

      const totalMonthlyExpenses = expenses.reduce((sum: number, expense: any) => 
        sum + getMonthlyAmount(expense.amount || 0, expense.frequency), 0
      );
      
      setMonthlyExpenses(totalMonthlyExpenses);
      setExpensesImported(true);
    }

    // 3B️⃣ Import Continuing Income Sources (Rental, Business, Dividends, etc.)
    const incomes = storage.get('incomes') || [];
    if (incomes.length > 0) {
      const getMonthlyAmount = (amount: number, frequency: string) => {
        switch (frequency) {
          case 'Monthly': return amount;
          case 'Quarterly': return amount / 3;
          case 'Yearly': return amount / 12;
          case 'One-time': return 0;
          default: return amount;
        }
      };

      // Only count passive/continuing income sources (NOT salary/freelance which stops)
      const continuingIncomes = incomes.filter((income: any) => 
        income.category === 'Rental' || 
        income.category === 'Business' || 
        income.category === 'Investments' || // Dividends, interest
        income.category === 'Pension' ||
        income.category === 'Other' // Could be passive
      );

      const totalContinuingIncome = continuingIncomes.reduce((sum: number, income: any) => 
        sum + getMonthlyAmount(income.amount || 0, income.frequency), 0
      );
      
      setContinuingMonthlyIncome(totalContinuingIncome);
      setIncomeImported(true);
    }

    // 4️⃣ Import ALL Assets (categorized properly)
    const assets = storage.get('assets') || [];
    if (assets.length > 0) {
      let liquidInv = 0;
      let realEstate = 0;
      let gold = 0;
      let epf = 0;
      let other = 0;

      assets.forEach((asset: any) => {
        const value = asset.value || 0;
        
        switch (asset.category) {
          case 'Investments': // Mutual funds, stocks, bonds
          case 'Cash & Bank':  // FDs, savings accounts
            liquidInv += value;
            break;
          
          case 'Real Estate': // Property value
            realEstate += value;
            break;
          
          case 'Gold': // Gold, silver, precious metals
          case 'Precious Metals':
            gold += value;
            break;
          
          case 'EPF':
          case 'Provident Fund':
            epf += value;
            break;
          
          case 'Vehicle': // Vehicles (can be sold but depreciate)
          case 'Other':
          default:
            other += value;
            break;
        }
      });

      setLiquidInvestments(liquidInv);
      setRealEstateValue(realEstate);
      setGoldValue(gold);
      setEpfBalance(epf);
      setOtherAssets(other);
      setAssetsImported(true);
    }

    // 5️⃣ Import Investment Portfolio Value
    const investments = storage.get('investments') || [];
    if (investments.length > 0) {
      // Add current investment portfolio value to liquid investments
      const currentInvestmentValue = investments.reduce((sum: number, inv: any) => {
        if (inv.type === 'Lumpsum') {
          return sum + (inv.amount || 0);
        }
        // For SIPs, we'd need to calculate current value, but for simplicity use initial amount
        // In reality, you'd track the current NAV/value
        return sum;
      }, 0);
      
      // Add to liquid investments (don't overwrite, add to existing)
      setLiquidInvestments(prev => prev + currentInvestmentValue);
    }
  };

  // 🔄 MANUAL REFRESH BUTTON
  const refreshAllData = () => {
    autoImportData();
    alert('✅ Data refreshed from all pages!');
  };

  // Loan operations
  const addLoan = () => {
    const newLoan: LoanEntry = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    setLoans([newLoan, ...loans]);
    setLoansImported(false);
  };

  const updateLoan = (id: string, field: keyof LoanEntry, value: string | number) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ));
    setLoansImported(false);
  };

  const deleteLoan = (id: string) => {
    setLoans(loans.filter(loan => loan.id !== id));
    setLoansImported(false);
  };

  // Goal operations
  const addGoal = () => {
    const newGoal: GoalEntry = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    setGoals([newGoal, ...goals]);
    setGoalsImported(false);
  };

  const updateGoal = (id: string, field: keyof GoalEntry, value: string | number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
    setGoalsImported(false);
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    setGoalsImported(false);
  };

  // ============================================
  // CORRECTED INSURANCE CALCULATION LOGIC
  // ============================================
  
  // STEP 1: Calculate Family's Needs
  const totalOutstandingLiabilities = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalGoalFunding = goals.reduce((sum, goal) => sum + goal.amount, 0);
  
  // Net expenses = Expenses - Continuing Income (rental, business, dividends)
  const netMonthlyExpenses = (monthlyExpenses - continuingMonthlyIncome) * (1 - discountingFactor / 100);
  const currentAnnualExpenses = netMonthlyExpenses * 12;
  const remainingLifeOfSpouse = spouseLifeExpectancy > spouseAge ? spouseLifeExpectancy - spouseAge : 0;
  const netReturns = ((1 + postTaxReturns / 100) / (1 + inflationRate / 100) - 1) * 100;

  // Present Value of Annuity formula for corpus calculation
  const r = netReturns / 100;
  const n = remainingLifeOfSpouse;
  const corpusForFutureExpenses = (r > 0 && n > 0 && currentAnnualExpenses > 0)
    ? currentAnnualExpenses * ((1 - Math.pow(1 + r, -n)) / r)
    : Math.max(0, currentAnnualExpenses * n); // Only if net expenses are positive

  // Capitalize continuing income stream (PV of income family will receive)
  const annualContinuingIncome = continuingMonthlyIncome * 12;
  const continuingIncomeCorpus = (r > 0 && n > 0 && annualContinuingIncome > 0)
    ? annualContinuingIncome * ((1 - Math.pow(1 + r, -n)) / r)
    : annualContinuingIncome * n;

  // Rental income capitalization (convert monthly rental to corpus value)
  const annualRentalIncome = monthlyRentalIncome * 12;
  const rentalIncomeCorpus = (r > 0 && n > 0)
    ? annualRentalIncome * ((1 - Math.pow(1 + r, -n)) / r)
    : annualRentalIncome * n;

  // Total family needs
  const totalFamilyNeeds = totalOutstandingLiabilities + totalGoalFunding + corpusForFutureExpenses;

  // STEP 2: Calculate Continuing Assets (what remains after you're gone)
  const totalContinuingAssets = 
    liquidInvestments +        // Mutual funds, stocks, FDs (will continue to grow)
    realEstateValue +          // Property (can be sold or generate rental income)
    goldValue +                // Gold (holds value)
    epfBalance +               // EPF balance (will be paid out)
    otherAssets +              // Other liquidable assets
    rentalIncomeCorpus +       // PV of rental income stream (if property is rented)
    continuingIncomeCorpus;    // PV of business/dividend/pension income (NEW!)

  // STEP 3: Add existing insurance

  // STEP 4: Calculate insurance gap
  const totalInsuranceRequired = Math.max(0, totalFamilyNeeds - totalContinuingAssets);
  const additionalCoverRequired = Math.max(0, totalInsuranceRequired - existingInsurance);
  
  const coverageGap = totalInsuranceRequired > 0 
    ? ((additionalCoverRequired / totalInsuranceRequired) * 100).toFixed(1) 
    : '0';

  // Save data to storage (AFTER all calculations)
  useEffect(() => {
    if (isLoaded) {
      storage.set('insuranceCalculator', {
        // Raw inputs
        loans,
        goals,
        monthlyExpenses,
        continuingMonthlyIncome,
        discountingFactor,
        spouseAge,
        spouseLifeExpectancy,
        inflationRate,
        postTaxReturns,
        liquidInvestments,
        realEstateValue,
        monthlyRentalIncome,
        goldValue,
        epfBalance,
        otherAssets,
        existingInsurance,
        
        // ✅ CALCULATED RESULTS (so ChatWidget doesn't need to recalculate)
        calculated: {
          totalOutstandingLiabilities,
          totalGoalFunding,
          netMonthlyExpenses,
          remainingLifeOfSpouse,
          corpusForFutureExpenses,
          continuingIncomeCorpus,
          rentalIncomeCorpus,
          totalFamilyNeeds,
          totalContinuingAssets,
          totalInsuranceRequired,
          additionalCoverRequired,
          coverageGap,
          isFullyCovered: additionalCoverRequired === 0
        }
      });
    }
  }, [isLoaded, loans, goals, monthlyExpenses, continuingMonthlyIncome, discountingFactor, spouseAge,
      spouseLifeExpectancy, inflationRate, postTaxReturns, liquidInvestments,
      realEstateValue, monthlyRentalIncome, goldValue, epfBalance, otherAssets, existingInsurance,
      // Calculated values are now available as they're declared above
      totalOutstandingLiabilities, totalGoalFunding, netMonthlyExpenses, remainingLifeOfSpouse,
      corpusForFutureExpenses, continuingIncomeCorpus, rentalIncomeCorpus, totalFamilyNeeds,
      totalContinuingAssets, totalInsuranceRequired, additionalCoverRequired, coverageGap]);

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const resetAllData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setLoans([]);
      setGoals([]);
      setGoalsImported(false);
      setLoansImported(false);
      setExpensesImported(false);
      setIncomeImported(false);
      setAssetsImported(false);
      setMonthlyExpenses(0);
      setContinuingMonthlyIncome(0);
      setDiscountingFactor(0);
      setSpouseAge(0);
      setSpouseLifeExpectancy(0);
      setInflationRate(6);
      setPostTaxReturns(8);
      setLiquidInvestments(0);
      setRealEstateValue(0);
      setMonthlyRentalIncome(0);
      setGoldValue(0);
      setEpfBalance(0);
      setOtherAssets(0);
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
          font-size: 16px !important;
        }
      `}</style>

      {/* Header with Refresh Button */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Life Insurance Calculator
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Calculate how much life insurance coverage you need to protect your family
        </p>
        <button
          onClick={refreshAllData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
        >
          <RefreshCw size={16} />
          Refresh Data from All Pages
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-blue-100">Family Needs</span>
            <Shield size={20} className="sm:hidden" />
            <Shield size={24} className="hidden sm:block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{formatCurrency(totalFamilyNeeds)}</div>
          <div className="text-xs sm:text-sm text-blue-100 mt-1">Loans + Goals + Expenses</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-emerald-100">Continuing Assets</span>
            <Coins size={20} className="sm:hidden" />
            <Coins size={24} className="hidden sm:block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{formatCurrency(totalContinuingAssets)}</div>
          <div className="text-xs sm:text-sm text-emerald-100 mt-1">Assets that remain</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-purple-100">Insurance Needed</span>
            <Shield size={20} className="sm:hidden" />
            <Shield size={24} className="hidden sm:block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{formatCurrency(totalInsuranceRequired)}</div>
          <div className="text-xs sm:text-sm text-purple-100 mt-1">To cover the gap</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white ${
          additionalCoverRequired > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs sm:text-sm ${additionalCoverRequired > 0 ? 'text-red-100' : 'text-green-100'}`}>
              {additionalCoverRequired > 0 ? 'More Needed' : 'Fully Covered'}
            </span>
            <AlertTriangle size={20} className="sm:hidden" />
            <AlertTriangle size={24} className="hidden sm:block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{formatCurrency(additionalCoverRequired)}</div>
          <div className="text-xs sm:text-sm mt-1">
            {additionalCoverRequired > 0 ? `Beyond existing ₹${(existingInsurance/100000).toFixed(1)}L` : 'Well protected!'}
          </div>
        </div>
      </div>

      {/* Input Sections */}
      <div className="space-y-4 sm:space-y-6">
        {/* Step I: Outstanding Loans */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">
                {loansImported ? `✅ ${loans.length} loans auto-loaded from Assets & Liabilities` : 'No liabilities found'}
              </p>
            </div>
            <p className="text-xs text-blue-600">
              Liabilities page is the primary source. Changes there will auto-sync here.
            </p>
          </div>

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
              <p className="text-xs sm:text-sm mt-2">Click "Add Loan" or add liabilities on Assets page</p>
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

        {/* Step II: Goal Funding */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">
                {goalsImported ? `✅ ${goals.length} goals auto-loaded from Goals page` : 'No goals found on Goals page'}
              </p>
            </div>
            <p className="text-xs text-blue-600">
              Goals page is the primary source. Changes there will auto-sync here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Step II: Goal Funding</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Future value of goals if due today</p>
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
              <p className="text-xs sm:text-sm mt-2">Click "Add Goal" or add goals on Goals page</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4 sm:mt-6">
              {goals.map((goal) => (
                <div key={goal.id} className="flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl">
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => updateGoal(goal.id, 'name', e.target.value)}
                    placeholder="e.g., Children's Education"
                    className="w-full px-3 py-2 text-sm border border-indigo-300 bg-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={goal.amount || ''}
                      onChange={(e) => updateGoal(goal.id, 'amount', Number(e.target.value))}
                      placeholder="Amount"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-indigo-300 bg-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
          
          <div className="mt-4 p-3 sm:p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-gray-700">
                Total Goal Funding: {goalsImported && <span className="text-xs text-blue-600 font-normal">(Imported)</span>}
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-600 break-words">{formatCurrency(totalGoalFunding)}</span>
            </div>
          </div>
        </div>

        {/* Step III: Future Expenses */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">
                {expensesImported ? `✅ Monthly expenses (${formatCurrency(monthlyExpenses)}) auto-loaded` : 'No expenses found'}
                {incomeImported && continuingMonthlyIncome > 0 && (
                  <span className="block mt-1">✅ Continuing income (${formatCurrency(continuingMonthlyIncome)}) auto-loaded from Income page</span>
                )}
              </p>
            </div>
            <p className="text-xs text-blue-600">
              Expenses auto-sync from Income & Expenses page. Continuing income (rental, business, dividends) will offset expenses.
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step III: Corpus for Future Expenses</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Calculate corpus needed for family's lifestyle</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Monthly Expenses (Current)
                {expensesImported && <span className="text-blue-600 text-xs ml-1">(Auto-filled)</span>}
              </label>
              <input
                type="number"
                value={monthlyExpenses || ''}
                onChange={(e) => {
                  setMonthlyExpenses(Number(e.target.value));
                  setExpensesImported(false);
                }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Continuing Monthly Income
                {incomeImported && <span className="text-blue-600 text-xs ml-1">(Auto-filled)</span>}
              </label>
              <input
                type="number"
                value={continuingMonthlyIncome || ''}
                onChange={(e) => {
                  setContinuingMonthlyIncome(Number(e.target.value));
                  setIncomeImported(false);
                }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Rental, business, dividends, pension</p>
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
                placeholder="6"
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
                placeholder="8"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 space-y-3">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm min-w-[280px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Expenses:</span>
                  <span className="font-semibold break-words text-right ml-2">{formatCurrency(monthlyExpenses)}</span>
                </div>
                {continuingMonthlyIncome > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Continuing Income:</span>
                      <span className="font-semibold text-green-600 break-words text-right ml-2">-{formatCurrency(continuingMonthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Net Monthly Expenses:</span>
                      <span className="font-semibold break-words text-right ml-2">{formatCurrency(Math.max(0, monthlyExpenses - continuingMonthlyIncome))}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">After Discounting:</span>
                  <span className="font-semibold break-words text-right ml-2">{formatCurrency(Math.max(0, netMonthlyExpenses))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Expenses:</span>
                  <span className="font-semibold break-words text-right ml-2">{formatCurrency(Math.max(0, currentAnnualExpenses))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Life:</span>
                  <span className="font-semibold">{remainingLifeOfSpouse} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Real Returns:</span>
                  <span className="font-semibold">{netReturns.toFixed(2)}%</span>
                </div>
                {continuingIncomeCorpus > 0 && (
                  <div className="flex justify-between col-span-2 bg-green-50 -mx-3 -mb-3 px-3 py-2 mt-2">
                    <span className="text-gray-600">Continuing Income (PV):</span>
                    <span className="font-semibold text-green-600 break-words text-right ml-2">{formatCurrency(continuingIncomeCorpus)}</span>
                  </div>
                )}
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

        {/* Step IV: Continuing Assets (COMPLETELY REWRITTEN) */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">
                {assetsImported ? `✅ Assets auto-loaded from Assets page` : 'No assets found'}
              </p>
            </div>
            <p className="text-xs text-blue-600">
              Assets page is the primary source. All asset types are considered.
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step IV: Continuing Assets</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Assets that will remain after you're gone</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Liquid Investments
                {assetsImported && <span className="text-blue-600 text-xs ml-1">(Auto-filled)</span>}
              </label>
              <input
                type="number"
                value={liquidInvestments || ''}
                onChange={(e) => {
                  setLiquidInvestments(Number(e.target.value));
                  setAssetsImported(false);
                }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Mutual funds, stocks, FDs, SIPs</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Real Estate Value
                {assetsImported && <span className="text-blue-600 text-xs ml-1">(Auto-filled)</span>}
              </label>
              <input
                type="number"
                value={realEstateValue || ''}
                onChange={(e) => {
                  setRealEstateValue(Number(e.target.value));
                  setAssetsImported(false);
                }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Property, land (can be sold)</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 flex items-center gap-1">
                <Home size={14} />
                Monthly Rental Income
              </label>
              <input
                type="number"
                value={monthlyRentalIncome || ''}
                onChange={(e) => setMonthlyRentalIncome(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">From properties (if any)</p>
              {monthlyRentalIncome > 0 && (
                <p className="text-xs text-emerald-600 mt-1 font-semibold">
                  PV: {formatCurrency(rentalIncomeCorpus)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Gold & Precious Metals
                {assetsImported && <span className="text-blue-600 text-xs ml-1">(Auto-filled)</span>}
              </label>
              <input
                type="number"
                value={goldValue || ''}
                onChange={(e) => {
                  setGoldValue(Number(e.target.value));
                  setAssetsImported(false);
                }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Current market value</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                EPF/PF Balance
                {assetsImported && <span className="text-blue-600 text-xs ml-1">(Auto-filled)</span>}
              </label>
              <input
                type="number"
                value={epfBalance || ''}
                onChange={(e) => {
                  setEpfBalance(Number(e.target.value));
                  setAssetsImported(false);
                }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Will be paid to nominee</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
                Other Assets
                {assetsImported && <span className="text-blue-600 text-xs ml-1">(Auto-filled)</span>}
              </label>
              <input
                type="number"
                value={otherAssets || ''}
                onChange={(e) => {
                  setOtherAssets(Number(e.target.value));
                  setAssetsImported(false);
                }}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Vehicles, other valuables</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 sm:p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Liquid Investments:</span>
                <span className="font-semibold">{formatCurrency(liquidInvestments)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Real Estate:</span>
                <span className="font-semibold">{formatCurrency(realEstateValue)}</span>
              </div>
              {monthlyRentalIncome > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Income (PV):</span>
                  <span className="font-semibold">{formatCurrency(rentalIncomeCorpus)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Gold:</span>
                <span className="font-semibold">{formatCurrency(goldValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EPF Balance:</span>
                <span className="font-semibold">{formatCurrency(epfBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Other Assets:</span>
                <span className="font-semibold">{formatCurrency(otherAssets)}</span>
              </div>
              <div className="border-t-2 border-emerald-300 pt-2 flex justify-between">
                <span className="font-bold text-gray-800">Total Continuing Assets:</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalContinuingAssets)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step V: Existing Insurance */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step V: Existing Insurance</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Life insurance policies you already have</p>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">
              Sum Assured of Existing Policies
            </label>
            <input
              type="number"
              value={existingInsurance || ''}
              onChange={(e) => setExistingInsurance(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Total cover from all term/life policies</p>
          </div>
        </div>
      </div>

      {/* Final Summary */}
      <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mb-20">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Insurance Needs Analysis</h2>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8">
          {/* Calculation Breakdown */}
          <div className="space-y-3 sm:space-y-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">Family's Total Needs:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding Loans:</span>
                  <span className="font-semibold">{formatCurrency(totalOutstandingLiabilities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal Funding:</span>
                  <span className="font-semibold">{formatCurrency(totalGoalFunding)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Future Expenses Corpus:</span>
                  <span className="font-semibold">{formatCurrency(corpusForFutureExpenses)}</span>
                </div>
                <div className="border-t-2 border-blue-300 pt-2 flex justify-between">
                  <span className="font-bold text-gray-800">Total Needs:</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(totalFamilyNeeds)}</span>
                </div>
              </div>
            </div>

            <div className="text-center text-2xl font-bold text-gray-400">−</div>

            <div className="p-4 bg-emerald-50 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">Assets That Continue:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Continuing Assets:</span>
                  <span className="font-semibold">{formatCurrency(totalContinuingAssets)}</span>
                </div>
              </div>
            </div>

            <div className="text-center text-2xl font-bold text-gray-400">=</div>

            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">Insurance Required:</span>
                <span className="text-xl font-bold text-purple-600">{formatCurrency(totalInsuranceRequired)}</span>
              </div>
            </div>

            <div className="text-center text-2xl font-bold text-gray-400">−</div>

            <div className="p-4 bg-teal-50 rounded-lg">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">Existing Insurance:</span>
                <span className="text-lg font-bold text-teal-600">{formatCurrency(existingInsurance)}</span>
              </div>
            </div>

            <div className="text-center text-2xl font-bold text-gray-400">=</div>

            <div className={`p-6 rounded-lg border-2 ${
              additionalCoverRequired > 0 
                ? 'bg-gradient-to-r from-red-100 to-red-200 border-red-300' 
                : 'bg-gradient-to-r from-green-100 to-green-200 border-green-300'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">
                  {additionalCoverRequired > 0 ? 'Additional Cover Needed:' : 'Status:'}
                </span>
                <span className={`text-2xl font-bold ${
                  additionalCoverRequired > 0 ? 'text-red-700' : 'text-green-700'
                }`}>
                  {additionalCoverRequired > 0 ? formatCurrency(additionalCoverRequired) : '✓ Fully Covered'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
            
            {additionalCoverRequired > 0 ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-base font-semibold text-gray-800 mb-2">Insurance Gap Identified</p>
                    <p className="text-sm text-gray-700">
                      You need {formatCurrency(additionalCoverRequired)} additional term insurance to fully protect your family.
                      Even with your assets of {formatCurrency(totalContinuingAssets)}, there's still a shortfall.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                  <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-base font-semibold text-gray-800 mb-2">Recommended Actions</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Purchase term insurance of {formatCurrency(additionalCoverRequired)}</li>
                      <li>• Choose policy term: {remainingLifeOfSpouse} years (spouse's remaining life)</li>
                      <li>• Consider critical illness and accidental death riders</li>
                      <li>• Review annually as assets and liabilities change</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-base font-semibold text-gray-800 mb-2">Excellent Protection!</p>
                  <p className="text-sm text-gray-700">
                    Your existing insurance ({formatCurrency(existingInsurance)}) plus continuing assets ({formatCurrency(totalContinuingAssets)}) 
                    fully cover your family's needs of {formatCurrency(totalFamilyNeeds)}. Review this annually as your situation evolves.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={resetAllData}
              className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
            >
              <span>Reset All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}