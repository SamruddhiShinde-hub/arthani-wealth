import React, { useState, useEffect } from 'react';
import { Home, Calculator, TrendingDown, ArrowLeft } from 'lucide-react'; // ADDED ArrowLeft
import { storage } from '../utils/storage';

// ADDED INTERFACE
interface HRACalculatorPageProps {
  setCurrentPage?: (page: string) => void;
}

// UPDATED FUNCTION SIGNATURE
export default function HRACalculatorPage({ setCurrentPage }: HRACalculatorPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [basicSalary, setBasicSalary] = useState(0);
  const [da, setDa] = useState(0);
  const [hra, setHra] = useState(0);
  const [rentPaid, setRentPaid] = useState(0);
  const [isMetroCity, setIsMetroCity] = useState(true);

  useEffect(() => {
    const saved = storage.get('hraCalculator');
    if (saved) {
      setBasicSalary(saved.basicSalary || 0);
      setDa(saved.da || 0);
      setHra(saved.hra || 0);
      setRentPaid(saved.rentPaid || 0);
      setIsMetroCity(saved.isMetroCity !== undefined ? saved.isMetroCity : true);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set('hraCalculator', {
        basicSalary,
        da,
        hra,
        rentPaid,
        isMetroCity,
      });
    }
  }, [isLoaded, basicSalary, da, hra, rentPaid, isMetroCity]);

  // HRA Exemption Calculation
  const calculateHRAExemption = () => {
    const salaryForHRA = basicSalary + da;
    
    // Three conditions for HRA exemption
    const actualHRA = hra;
    const percentOfSalary = salaryForHRA * (isMetroCity ? 0.5 : 0.4);
    const rentMinusTenPercent = Math.max(0, rentPaid - (salaryForHRA * 0.1));

    // Exemption is minimum of these three
    const exemption = Math.min(actualHRA, percentOfSalary, rentMinusTenPercent);
    const taxableHRA = hra - exemption;

    return {
      actualHRA,
      percentOfSalary,
      rentMinusTenPercent,
      exemption,
      taxableHRA,
      taxSaved: exemption * 0.3, // Assuming 30% tax bracket
    };
  };

  const result = calculateHRAExemption();

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
    
        <div className="flex items-center justify-center gap-3 mb-8">
          <Home className="text-emerald-600" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">HRA Calculator</h1>
        </div>
        <p className="text-center text-gray-600 mb-8">
          Calculate your House Rent Allowance tax exemption
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Salary Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Basic Salary (Monthly)
                </label>
                <input
                  type="number"
                  value={basicSalary || ''}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Dearness Allowance (DA) - Monthly
                </label>
                <input
                  type="number"
                  value={da || ''}
                  onChange={(e) => setDa(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Only if it forms part of retirement benefits</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  HRA Received (Monthly)
                </label>
                <input
                  type="number"
                  value={hra || ''}
                  onChange={(e) => setHra(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="20000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Rent Paid (Monthly)
                </label>
                <input
                  type="number"
                  value={rentPaid || ''}
                  onChange={(e) => setRentPaid(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  City Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsMetroCity(true)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isMetroCity
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Metro City</div>
                    <div className="text-xs text-gray-600">50% exemption</div>
                  </button>
                  <button
                    onClick={() => setIsMetroCity(false)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      !isMetroCity
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Non-Metro</div>
                    <div className="text-xs text-gray-600">40% exemption</div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Metro: Delhi, Mumbai, Kolkata, Chennai
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* HRA Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calculator size={20} />
                  HRA Exemption Calculation
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Exemption is the <strong>minimum</strong> of:
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">1. Actual HRA received</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(result.actualHRA)}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      2. {isMetroCity ? '50%' : '40%'} of (Basic + DA)
                    </span>
                    <span className="font-semibold text-gray-800">{formatCurrency(result.percentOfSalary)}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">3. Rent - 10% of (Basic + DA)</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(result.rentMinusTenPercent)}</span>
                  </div>
                </div>

                <div className="border-t-2 pt-4 mt-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300">
                    <span className="font-bold text-gray-800">HRA Exemption:</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(result.exemption)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Impact */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingDown size={20} />
                  Tax Impact (Monthly)
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">HRA Received:</span>
                  <span className="font-bold text-gray-800">{formatCurrency(hra)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Exempted Amount:</span>
                  <span className="font-bold text-green-600">- {formatCurrency(result.exemption)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-semibold text-gray-800">Taxable HRA:</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(result.taxableHRA)}</span>
                </div>
                <div className="p-4 bg-green-50 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Monthly Tax Saved (30% bracket):</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(result.taxSaved)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Annual Tax Saved:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(result.taxSaved * 12)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">💡 Tips to Maximize HRA</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Pay rent above 10% of (Basic + DA) to claim exemption</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Rent receipt required if annual rent exceeds ₹1 lakh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>PAN of landlord needed if annual rent exceeds ₹1 lakh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Cannot claim HRA if living in own house</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Can claim both HRA and home loan interest if living in different city</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Annual Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Annual Summary</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total HRA Received</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(hra * 12)}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Exemption</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(result.exemption * 12)}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Taxable HRA</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(result.taxableHRA * 12)}</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Annual Tax Saved</div>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(result.taxSaved * 12)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
