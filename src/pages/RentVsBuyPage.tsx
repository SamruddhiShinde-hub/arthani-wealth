import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import { storage } from '../utils/storage';

type Scenario = 'rent' | 'buy';

export default function RentVsBuyPage() {
  // Buy scenario inputs
  const [propertyPrice, setPropertyPrice] = useState(5000000); // ₹50 lakhs
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // 20%
  const [loanTenure, setLoanTenure] = useState(20); // years
  const [interestRate, setInterestRate] = useState(8.5); // %
  const [propertyAppreciation, setPropertyAppreciation] = useState(5); // % per year
  const [maintenanceCost, setMaintenanceCost] = useState(5000); // per month
  const [propertyTax, setPropertyTax] = useState(10000); // per year
  
  // Rent scenario inputs
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [rentIncrease, setRentIncrease] = useState(5); // % per year
  const [securityDeposit, setSecurityDeposit] = useState(50000);
  
  // Investment assumptions
  const [investmentReturn, setInvestmentReturn] = useState(12); // % per year on invested savings
  const [timeHorizon, setTimeHorizon] = useState(10); // years
  
  const [calculationDone, setCalculationDone] = useState(false);

  // Load saved data
  useEffect(() => {
    const saved = storage.get('rentVsBuyCalculation', null);
    if (saved) {
      setPropertyPrice(saved.propertyPrice || 5000000);
      setDownPaymentPercent(saved.downPayment || 20);
      setLoanTenure(saved.loanTenure || 20);
      setInterestRate(saved.interestRate || 8.5);
      setPropertyAppreciation(saved.propertyAppreciation || 5);
      setMaintenanceCost(saved.maintenanceCost || 5000);
      setPropertyTax(saved.propertyTax || 10000);
      setMonthlyRent(saved.monthlyRent || 25000);
      setRentIncrease(saved.rentIncrease || 5);
      setSecurityDeposit(saved.securityDeposit || 50000);
      setInvestmentReturn(saved.investmentReturn || 12);
      setTimeHorizon(saved.timeHorizon || 10);
      setCalculationDone(true);
    }
  }, []);

  const calculate = () => {
    // Save inputs
    storage.set('rentVsBuyCalculation', {
      propertyPrice,
      downPayment: downPaymentPercent,
      loanTenure,
      interestRate,
      propertyAppreciation,
      maintenanceCost,
      propertyTax,
      monthlyRent,
      rentIncrease,
      securityDeposit,
      investmentReturn,
      timeHorizon,
    });
    
    setCalculationDone(true);
  };

  const reset = () => {
    storage.set('rentVsBuyCalculation', null);
    setCalculationDone(false);
  };

  // Calculate EMI
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;
  const monthlyRate = interestRate / 12 / 100;
  const numPayments = loanTenure * 12;
  const emi =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Buy scenario calculations
  const calculateBuyScenario = () => {
    let totalCost = downPaymentAmount;
    let monthlyEMI = emi;
    let totalEMIPaid = 0;
    let totalMaintenance = 0;
    let totalPropertyTax = 0;

    for (let year = 1; year <= timeHorizon; year++) {
      const monthsInYear = Math.min(12, numPayments - (year - 1) * 12);
      if (monthsInYear > 0) {
        totalEMIPaid += monthlyEMI * monthsInYear;
      }
      totalMaintenance += maintenanceCost * 12;
      totalPropertyTax += propertyTax;
    }

    totalCost += totalEMIPaid + totalMaintenance + totalPropertyTax;

    // Property value after appreciation
    const futurePropertyValue = propertyPrice * Math.pow(1 + propertyAppreciation / 100, timeHorizon);
    
    // Remaining loan balance
    const monthsPaid = Math.min(timeHorizon * 12, numPayments);
    let remainingLoan = loanAmount;
    if (monthsPaid < numPayments) {
      remainingLoan = loanAmount * Math.pow(1 + monthlyRate, monthsPaid) - 
                      emi * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);
    } else {
      remainingLoan = 0;
    }

    const netWorth = futurePropertyValue - remainingLoan;

    return {
      totalCost,
      emi: monthlyEMI,
      totalEMIPaid,
      totalMaintenance,
      totalPropertyTax,
      futurePropertyValue,
      remainingLoan,
      netWorth,
    };
  };

  // Rent scenario calculations
  const calculateRentScenario = () => {
    let totalRentPaid = 0;
    let currentRent = monthlyRent;
    let investmentValue = downPaymentAmount + securityDeposit; // Invest down payment instead

    for (let year = 1; year <= timeHorizon; year++) {
      // Pay rent for the year
      totalRentPaid += currentRent * 12;
      
      // Invest the savings (difference between EMI+maintenance and rent)
      const monthlySavings = emi + maintenanceCost + propertyTax / 12 - currentRent;
      const yearlySavings = monthlySavings * 12;
      
      // Grow investments
      investmentValue = (investmentValue + yearlySavings) * (1 + investmentReturn / 100);
      
      // Increase rent
      currentRent = currentRent * (1 + rentIncrease / 100);
    }

    // Get back security deposit
    investmentValue += securityDeposit;

    return {
      totalRentPaid,
      investmentValue,
      netWorth: investmentValue,
      totalCost: totalRentPaid + securityDeposit,
    };
  };

  const buyScenario = calculateBuyScenario();
  const rentScenario = calculateRentScenario();

  const betterOption = rentScenario.netWorth > buyScenario.netWorth ? 'rent' : 'buy';
  const difference = Math.abs(rentScenario.netWorth - buyScenario.netWorth);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4">
          <Home className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Rent vs Buy Calculator</h1>
        <p className="text-gray-600">
          Make an informed decision about renting vs buying a house
        </p>
      </div>

      {/* Input Forms */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Buy Scenario */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Home className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Buy a House</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Price (₹)
              </label>
              <input
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment (%)
              </label>
              <input
                type="number"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount: {formatCurrency(downPaymentAmount)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Loan Tenure (years)
              </label>
              <input
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (% per annum)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Appreciation (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                value={propertyAppreciation}
                onChange={(e) => setPropertyAppreciation(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Maintenance (₹)
              </label>
              <input
                type="number"
                value={maintenanceCost}
                onChange={(e) => setMaintenanceCost(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Tax (₹ per year)
              </label>
              <input
                type="number"
                value={propertyTax}
                onChange={(e) => setPropertyTax(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rent Scenario */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Rent a House</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Rent Increase (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rentIncrease}
                onChange={(e) => setRentIncrease(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-800 mb-4">Investment Assumptions</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Return (% per year)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={investmentReturn}
                  onChange={(e) => setInvestmentReturn(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Return on savings invested in mutual funds/stocks
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Horizon (years)
                </label>
                <input
                  type="number"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="text-center mb-8">
        <button
          onClick={calculate}
          className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
        >
          <Calculator size={24} />
          Calculate & Compare
        </button>
      </div>

      {/* Results */}
      {calculationDone && (
        <>
          {/* Recommendation */}
          <div
            className={`bg-gradient-to-r ${
              betterOption === 'buy'
                ? 'from-green-500 to-emerald-600'
                : 'from-green-500 to-emerald-600'
            } rounded-2xl p-8 mb-8 text-white text-center`}
          >
            <h2 className="text-3xl font-bold mb-4">
              {betterOption === 'buy' ? '🏠 Buying' : '🏢 Renting'} is Better for You!
            </h2>
            <p className="text-xl mb-2">
              Net Wealth Difference: {formatCurrency(difference)}
            </p>
            <p className="text-emerald-100">
              Over {timeHorizon} years, {betterOption === 'buy' ? 'buying' : 'renting'} will leave
              you {formatCurrency(difference)} better off
            </p>
          </div>

          {/* Detailed Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Buy Results */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h3 className="text-2xl font-bold text-white">Buying Scenario</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Monthly EMI</span>
                  <span className="font-bold text-gray-800">{formatCurrency(buyScenario.emi)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Down Payment</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(downPaymentAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total EMI Paid</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(buyScenario.totalEMIPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Maintenance</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(buyScenario.totalMaintenance)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Property Tax</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(buyScenario.totalPropertyTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Property Value (after {timeHorizon}y)</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(buyScenario.futurePropertyValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Remaining Loan</span>
                  <span className="font-bold text-red-600">
                    -{formatCurrency(buyScenario.remainingLoan)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 bg-green-50 p-4 rounded-xl">
                  <span className="text-lg font-bold text-gray-800">Net Wealth</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(buyScenario.netWorth)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rent Results */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h3 className="text-2xl font-bold text-white">Renting Scenario</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Starting Monthly Rent</span>
                  <span className="font-bold text-gray-800">{formatCurrency(monthlyRent)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(securityDeposit)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Rent Paid ({timeHorizon}y)</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(rentScenario.totalRentPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Initial Investment</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(downPaymentAmount + securityDeposit)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Invested Savings Growth</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(
                      rentScenario.investmentValue - downPaymentAmount - securityDeposit
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Total Investment Value</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(rentScenario.investmentValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 bg-green-50 p-4 rounded-xl">
                  <span className="text-lg font-bold text-gray-800">Net Wealth</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(rentScenario.netWorth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Buying Pros:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Build equity and own an asset</li>
                  <li>✓ Property appreciation potential</li>
                  <li>✓ Stability and no landlord issues</li>
                  <li>✓ Tax benefits on home loan interest</li>
                  <li>✓ Freedom to modify property</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Renting Pros:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Flexibility to relocate</li>
                  <li>✓ No maintenance responsibilities</li>
                  <li>✓ Lower upfront costs</li>
                  <li>✓ Invest savings for potentially higher returns</li>
                  <li>✓ No property value risk</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={reset}
              className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              Reset Calculator
            </button>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-6">
        <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Disclaimer</h3>
        <p className="text-sm text-yellow-700">
          This calculator provides estimates based on your inputs. Actual results may vary. Consider
          factors like job stability, family needs, location flexibility, and emotional preferences.
          Consult with a financial advisor before making major decisions.
        </p>
      </div>
    </div>
  );
}