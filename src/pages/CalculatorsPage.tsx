import React, { useState } from 'react';
import { DollarSign, TrendingUp, Home as HomeIcon, PiggyBank, TrendingDown, Calendar, BarChart3, Trash2 } from 'lucide-react';
import { 
  calculateLoanEMI, 
  calculateSIP, 
  calculateMortgage, 
  calculateCompoundInterest,
  calculateStepUpSIP,
  calculatePresentValue,
  calculateXIRR,
  CashFlow
} from '../utils/calculatorUtils';

export default function CalculatorsPage() {
  const [activeCalc, setActiveCalc] = useState('loan');
  
  // Loan Calculator State
  const [loanData, setLoanData] = useState({ amount: 100000, rate: 10, tenure: 5 });
  
  // SIP Calculator State
  const [sipData, setSipData] = useState({ monthlyInvestment: 5000, expectedReturn: 12, tenure: 10 });
  
  // Step-up SIP Calculator State
  const [stepUpSIPData, setStepUpSIPData] = useState({ 
    initialMonthlyInvestment: 5000, 
    expectedReturn: 12, 
    tenure: 10,
    annualStepUp: 10 
  });
  
  // Mortgage Calculator State
  const [mortgageData, setMortgageData] = useState({ 
    loanAmount: 5000000, 
    interestRate: 8.5, 
    loanTenure: 20, 
    downPayment: 1000000 
  });
  
  // Investment Calculator State
  const [investmentData, setInvestmentData] = useState({ 
    principal: 100000, 
    rate: 10, 
    time: 5, 
    compoundFrequency: 12 
  });
  
  // Present Value Calculator State
  const [pvData, setPVData] = useState({
    futureValue: 100000,
    discountRate: 10,
    timePeriod: 5
  });
  
  // XIRR Calculator State
  const [xirrFlows, setXirrFlows] = useState<Array<{date: string, amount: number}>>([
    { date: '2024-01-01', amount: -10000 },
    { date: '2024-06-01', amount: -10000 },
    { date: '2025-01-01', amount: 25000 }
  ]);

  // Calculate results
  const loanResult = calculateLoanEMI(loanData);
  const sipResult = calculateSIP(sipData);
  const stepUpSIPResult = calculateStepUpSIP(stepUpSIPData);
  const mortgageResult = calculateMortgage(mortgageData);
  const investmentResult = calculateCompoundInterest(investmentData);
  const pvResult = calculatePresentValue(pvData);
  
  const xirrCashFlows: CashFlow[] = xirrFlows.map(f => ({
    date: new Date(f.date),
    amount: f.amount
  }));
  const xirrResult = calculateXIRR(xirrCashFlows);

  const calculators = [
    { id: 'loan', name: 'Loan EMI', Icon: DollarSign },
    { id: 'sip', name: 'SIP', Icon: TrendingUp },
    { id: 'stepupsip', name: 'Step-up SIP', Icon: TrendingUp },
    { id: 'mortgage', name: 'Home Loan', Icon: HomeIcon },
    { id: 'investment', name: 'Investment', Icon: PiggyBank },
    { id: 'pv', name: 'Present Value', Icon: TrendingDown },
    { id: 'xirr', name: 'XIRR/IRR', Icon: BarChart3 }
  ];
  
  const addXirrFlow = () => {
    setXirrFlows([...xirrFlows, { date: new Date().toISOString().split('T')[0], amount: 0 }]);
  };
  
  const updateXirrFlow = (index: number, field: 'date' | 'amount', value: string | number) => {
    const updated = [...xirrFlows];
    updated[index] = { ...updated[index], [field]: value };
    setXirrFlows(updated);
  };
  
  const removeXirrFlow = (index: number) => {
    setXirrFlows(xirrFlows.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Financial Calculators</h1>
      
      {/* Calculator Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {calculators.map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeCalc === calc.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <calc.Icon size={20} />
            {calc.name}
          </button>
        ))}
      </div>

      {/* Loan EMI Calculator */}
      {activeCalc === 'loan' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Loan EMI Calculator</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Loan Amount (Rs. )</label>
                <input
                  type="number"
                  value={loanData.amount}
                  onChange={(e) => setLoanData({...loanData, amount: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanData.rate}
                  onChange={(e) => setLoanData({...loanData, rate: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tenure (Years)</label>
                <input
                  type="number"
                  value={loanData.tenure}
                  onChange={(e) => setLoanData({...loanData, tenure: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly EMI:</span>
                  <span className="font-bold text-emerald-600">Rs. {loanResult.EMI}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payment:</span>
                  <span className="font-bold text-gray-800">Rs. {loanResult.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-bold text-teal-600">Rs. {loanResult.interest}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIP Calculator */}
      {activeCalc === 'sip' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">SIP Calculator</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Monthly Investment (Rs. )</label>
                <input
                  type="number"
                  value={sipData.monthlyInvestment}
                  onChange={(e) => setSipData({...sipData, monthlyInvestment: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Expected Return (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sipData.expectedReturn}
                  onChange={(e) => setSipData({...sipData, expectedReturn: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Investment Period (Years)</label>
                <input
                  type="number"
                  value={sipData.tenure}
                  onChange={(e) => setSipData({...sipData, tenure: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Invested:</span>
                  <span className="font-bold text-gray-800">Rs. {sipResult.totalInvested}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Returns:</span>
                  <span className="font-bold text-emerald-600">Rs. {sipResult.estimatedReturns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-bold text-teal-600 text-xl">Rs. {sipResult.totalValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step-up SIP Calculator */}
      {activeCalc === 'stepupsip' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Step-up SIP Calculator</h2>
          <p className="text-sm text-gray-600 mb-4">Increase your SIP investment by a fixed percentage every year</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Initial Monthly Investment (Rs. )</label>
                <input
                  type="number"
                  value={stepUpSIPData.initialMonthlyInvestment}
                  onChange={(e) => setStepUpSIPData({...stepUpSIPData, initialMonthlyInvestment: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Annual Step-up (%)</label>
                <input
                  type="number"
                  step="1"
                  value={stepUpSIPData.annualStepUp}
                  onChange={(e) => setStepUpSIPData({...stepUpSIPData, annualStepUp: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Expected Return (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={stepUpSIPData.expectedReturn}
                  onChange={(e) => setStepUpSIPData({...stepUpSIPData, expectedReturn: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Investment Period (Years)</label>
                <input
                  type="number"
                  value={stepUpSIPData.tenure}
                  onChange={(e) => setStepUpSIPData({...stepUpSIPData, tenure: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Invested:</span>
                  <span className="font-bold text-gray-800">Rs. {stepUpSIPResult.totalInvested}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Returns:</span>
                  <span className="font-bold text-emerald-600">Rs. {stepUpSIPResult.estimatedReturns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-bold text-teal-600 text-xl">Rs. {stepUpSIPResult.totalValue}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600">Final Monthly SIP:</span>
                  <span className="font-bold text-blue-600">Rs. {stepUpSIPResult.finalMonthlyInvestment}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mortgage/Home Loan Calculator */}
      {activeCalc === 'mortgage' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Home Loan Calculator</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Property Value (Rs. )</label>
                <input
                  type="number"
                  value={mortgageData.loanAmount}
                  onChange={(e) => setMortgageData({...mortgageData, loanAmount: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Down Payment (Rs. )</label>
                <input
                  type="number"
                  value={mortgageData.downPayment}
                  onChange={(e) => setMortgageData({...mortgageData, downPayment: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mortgageData.interestRate}
                  onChange={(e) => setMortgageData({...mortgageData, interestRate: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Loan Tenure (Years)</label>
                <input
                  type="number"
                  value={mortgageData.loanTenure}
                  onChange={(e) => setMortgageData({...mortgageData, loanTenure: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-bold text-gray-800">Rs. {mortgageResult.loanAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-bold text-emerald-600">Rs. {mortgageResult.monthlyPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payment:</span>
                  <span className="font-bold text-gray-800">Rs. {mortgageResult.totalPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-bold text-teal-600">Rs. {mortgageResult.totalInterest}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Calculator */}
      {activeCalc === 'investment' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Investment Calculator</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Principal Amount (Rs. )</label>
                <input
                  type="number"
                  value={investmentData.principal}
                  onChange={(e) => setInvestmentData({...investmentData, principal: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={investmentData.rate}
                  onChange={(e) => setInvestmentData({...investmentData, rate: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Time Period (Years)</label>
                <input
                  type="number"
                  value={investmentData.time}
                  onChange={(e) => setInvestmentData({...investmentData, time: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Compounding Frequency</label>
                <select
                  value={investmentData.compoundFrequency}
                  onChange={(e) => setInvestmentData({...investmentData, compoundFrequency: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>Yearly</option>
                  <option value={2}>Half-Yearly</option>
                  <option value={4}>Quarterly</option>
                  <option value={12}>Monthly</option>
                  <option value={365}>Daily</option>
                </select>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Future Value:</span>
                  <span className="font-bold text-emerald-600 text-xl">Rs. {investmentResult.futureValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-bold text-teal-600">Rs. {investmentResult.totalInterest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Effective Rate:</span>
                  <span className="font-bold text-gray-800">{investmentResult.effectiveRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Present Value Calculator */}
      {activeCalc === 'pv' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Present Value Calculator</h2>
          <p className="text-sm text-gray-600 mb-4">Calculate how much you need to invest today to reach a future goal</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Future Value Needed (Rs. )</label>
                <input
                  type="number"
                  value={pvData.futureValue}
                  onChange={(e) => setPVData({...pvData, futureValue: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Discount Rate / Expected Return (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pvData.discountRate}
                  onChange={(e) => setPVData({...pvData, discountRate: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Time Period (Years)</label>
                <input
                  type="number"
                  value={pvData.timePeriod}
                  onChange={(e) => setPVData({...pvData, timePeriod: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Present Value:</span>
                  <span className="font-bold text-emerald-600 text-xl">Rs. {pvResult.presentValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-bold text-gray-800">Rs. {pvResult.totalDiscount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Effective Rate:</span>
                  <span className="font-bold text-teal-600">{pvResult.effectiveDiscountRate}%</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">
                  You need to invest <span className="font-semibold text-emerald-600">Rs. {pvResult.presentValue}</span> today 
                  to reach Rs. {pvData.futureValue.toLocaleString()} in {pvData.timePeriod} years at {pvData.discountRate}% return.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XIRR/IRR Calculator */}
      {activeCalc === 'xirr' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">XIRR/IRR Calculator</h2>
          <p className="text-sm text-gray-600 mb-4">Calculate returns on irregular cash flows (investments and withdrawals)</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Cash Flows</h3>
                <button
                  onClick={addXirrFlow}
                  className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                >
                  + Add Flow
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {xirrFlows.map((flow, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded-lg">
                    <input
                      type="date"
                      value={flow.date}
                      onChange={(e) => updateXirrFlow(index, 'date', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      value={flow.amount}
                      onChange={(e) => updateXirrFlow(index, 'amount', Number(e.target.value))}
                      placeholder="Amount"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <button
		      onClick={() => removeXirrFlow(index)}
		      className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
		      title="Delete"
		    >
		      <Trash2 size={16} />
		</button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Use negative values for investments (money out) and positive values for returns (money in).
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">XIRR (Annual Return):</span>
                  <span className="font-bold text-emerald-600 text-xl">{xirrResult.xirr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Invested:</span>
                  <span className="font-bold text-gray-800">Rs. {xirrResult.totalInvested}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Returns:</span>
                  <span className="font-bold text-teal-600">Rs. {xirrResult.totalReturned}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600">Net Gain/Loss:</span>
                  <span className={`font-bold ${parseFloat(xirrResult.netGain) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rs. {xirrResult.netGain}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">
                  Your annualized return is <span className="font-semibold text-emerald-600">{xirrResult.xirr}%</span> based on irregular cash flows.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}