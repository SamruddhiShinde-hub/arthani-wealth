import React, { useState, useEffect } from "react";
import { Heart, Users, MapPin, Activity, AlertCircle, CheckCircle } from "lucide-react";
import { storage } from "../utils/storage";

interface HealthInsuranceData {
  // Personal Details
  age: number;
  gender: string;
  city: string;
  maritalStatus: string;
  dependents: number;
  
  // Health & Lifestyle
  healthStatus: string;
  preExistingConditions: string[];
  familyHistory: string[];
  smoker: boolean;
  exerciseFrequency: string;
  
  // Financial Factors
  existingCoverage: number;
  employerCoverage: number;
  hospitalPreference: string;
  emergencyBudget: number;
  
  // Coverage Preferences
  roomType: string;
  maternityCoverage: boolean;
  criticalIllnessCoverage: boolean;
  opdCoverage: boolean;
}

export default function HealthInsuranceCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  
  const [formData, setFormData] = useState<HealthInsuranceData>({
    age: 30,
    gender: "Male",
    city: "Mumbai",
    maritalStatus: "Single",
    dependents: 0,
    healthStatus: "Good",
    preExistingConditions: [],
    familyHistory: [],
    smoker: false,
    exerciseFrequency: "Sometimes",
    existingCoverage: 0,
    employerCoverage: 0,
    hospitalPreference: "Private - Standard",
    emergencyBudget: 50000,
    roomType: "Private",
    maternityCoverage: false,
    criticalIllnessCoverage: true,
    opdCoverage: false,
  });

  // Load saved data
  useEffect(() => {
    const savedData = storage.get("healthInsuranceCalculator", {});
    if (Object.keys(savedData).length > 0) {
      setFormData(savedData);
    }
  }, []);

  // Save data on change
  useEffect(() => {
    storage.set("healthInsuranceCalculator", formData);
  }, [formData]);

  const updateField = (field: keyof HealthInsuranceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "preExistingConditions" | "familyHistory", item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  // City-wise base hospitalization costs (in lakhs)
  const cityBaseCost: { [key: string]: number } = {
    "Mumbai": 10,
    "Delhi": 9,
    "Bangalore": 8.5,
    "Chennai": 7.5,
    "Hyderabad": 7,
    "Pune": 7,
    "Kolkata": 6.5,
    "Ahmedabad": 6,
    "Tier-2 City": 5,
    "Tier-3 City": 4,
  };

  // Calculate recommended coverage
// Calculate recommended coverage
const calculateCoverage = () => {
  console.log('🔍 DEBUG - Form Data:', formData);
  console.log('🔍 Existing Coverage:', formData.existingCoverage, typeof formData.existingCoverage);
  console.log('🔍 Employer Coverage:', formData.employerCoverage, typeof formData.employerCoverage);
  
  let baseCoverage = cityBaseCost[formData.city] || 5;
  
  // Age factor
  if (formData.age > 45) baseCoverage *= 1.3;
  else if (formData.age > 35) baseCoverage *= 1.15;
  
  // Family size factor
  const familySize = 1 + formData.dependents;
  if (familySize > 1) baseCoverage *= (1 + (familySize - 1) * 0.4);
  
  // Health status factor
  const healthMultiplier: { [key: string]: number } = {
    "Excellent": 0.9,
    "Good": 1.0,
    "Fair": 1.2,
    "Poor": 1.5,
  };
  baseCoverage *= healthMultiplier[formData.healthStatus] || 1.0;
  
  // Pre-existing conditions
  baseCoverage += formData.preExistingConditions.length * 1.5;
  
  // Family history
  baseCoverage += formData.familyHistory.length * 1.0;
  
  // Lifestyle factors
  if (formData.smoker) baseCoverage *= 1.2;
  if (formData.exerciseFrequency === "Rarely" || formData.exerciseFrequency === "Never") {
    baseCoverage *= 1.1;
  }
  
  // Hospital preference
  if (formData.hospitalPreference === "Private - Premium") {
    baseCoverage *= 1.4;
  } else if (formData.hospitalPreference === "Private - Standard") {
    baseCoverage *= 1.2;
  }
  
  // Room type
  if (formData.roomType === "Deluxe") baseCoverage *= 1.2;
  
  // Critical illness coverage
  let criticalIllnessCover = 0;
  if (formData.criticalIllnessCoverage) {
    criticalIllnessCover = baseCoverage * 0.5; // 50% of base
  }
  
  // Maternity coverage
  let maternityCover = 0;
  if (formData.maternityCoverage) {
    maternityCover = 1.5; // Fixed 1.5 lakhs
  }
  
  // OPD coverage
  let opdCover = 0;
  if (formData.opdCoverage) {
    opdCover = 0.5; // Fixed 50k
  }
  
  // Total recommended coverage
  const totalRecommended = baseCoverage + criticalIllnessCover + maternityCover + opdCover;
  
  // Coverage gap - FIXED: Parse values explicitly
  const existingCoverageValue = parseFloat(String(formData.existingCoverage)) || 0;
  const employerCoverageValue = parseFloat(String(formData.employerCoverage)) || 0;
  const existingTotal = existingCoverageValue + employerCoverageValue;
  
  console.log('🔍 Parsed Existing:', existingCoverageValue);
  console.log('🔍 Parsed Employer:', employerCoverageValue);
  console.log('🔍 Existing Total:', existingTotal);
  console.log('🔍 Total Recommended:', totalRecommended);
  
  const coverageGap = Math.max(0, totalRecommended - existingTotal);
  
  console.log('🔍 Coverage Gap:', coverageGap);
  
  // Premium estimate (rough calculation: 2-4% of sum insured)
  const premiumRate = formData.age < 35 ? 0.02 : formData.age < 45 ? 0.03 : 0.04;
  const estimatedPremium = (totalRecommended * 100000 * premiumRate) / 12; // Monthly
  
  const result = {
    baseCoverage: Math.round(baseCoverage * 10) / 10,
    criticalIllnessCover: Math.round(criticalIllnessCover * 10) / 10,
    maternityCover,
    opdCover,
    totalRecommended: Math.round(totalRecommended * 10) / 10,
    existingTotal: Math.round(existingTotal * 10) / 10,
    coverageGap: Math.round(coverageGap * 10) / 10,
    coverageGapPercent: totalRecommended > 0
      ? Math.round((coverageGap / totalRecommended) * 100) 
      : 100,
    estimatedPremium: Math.round(estimatedPremium),
  };
  
  console.log('🔍 Final Result:', result);
  
  return result;
};



  const results = showResults ? calculateCoverage() : null;

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const calculateAndShow = () => {
    setShowResults(true);
  };

  const resetCalculator = () => {
    setFormData({
      age: 30,
      gender: "Male",
      city: "Mumbai",
      maritalStatus: "Single",
      dependents: 0,
      healthStatus: "Good",
      preExistingConditions: [],
      familyHistory: [],
      smoker: false,
      exerciseFrequency: "Sometimes",
      existingCoverage: 0,
      employerCoverage: 0,
      hospitalPreference: "Private - Standard",
      emergencyBudget: 50000,
      roomType: "Private",
      maternityCoverage: false,
      criticalIllnessCoverage: true,
      opdCoverage: false,
    });
    setCurrentStep(1);
    setShowResults(false);
    storage.set("healthInsuranceCalculator", {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Health Insurance Calculator</h1>
              <p className="text-gray-600 text-sm">Assess your health coverage needs</p>
            </div>
          </div>

          {!showResults && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex-1 flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`flex-1 h-2 rounded-full transition-all ${
                        step <= currentStep
                          ? "bg-gradient-to-r from-teal-500 to-teal-600"
                          : "bg-gray-200"
                      }`}
                    />
                  </React.Fragment>
                ))}
              </div>
              <span className="ml-4 text-sm font-semibold text-gray-600">
                Step {currentStep} of 4
              </span>
            </div>
          )}
        </div>

        {/* Form Steps */}
        {!showResults && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users size={24} className="text-teal-500" />
                  Personal Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => updateField("age", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      City
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option>Mumbai</option>
                      <option>Delhi</option>
                      <option>Bangalore</option>
                      <option>Chennai</option>
                      <option>Hyderabad</option>
                      <option>Pune</option>
                      <option>Kolkata</option>
                      <option>Ahmedabad</option>
                      <option>Tier-2 City</option>
                      <option>Tier-3 City</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marital Status
                    </label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => updateField("maritalStatus", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Dependents (spouse, children, parents)
                    </label>
                    <input
                      type="number"
                      value={formData.dependents}
                      onChange={(e) => updateField("dependents", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="0"
                      max="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total family members to cover: {1 + formData.dependents}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Health & Lifestyle */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Activity size={24} className="text-teal-500" />
                  Health & Lifestyle
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Health Status
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Excellent", "Good", "Fair", "Poor"].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateField("healthStatus", status)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          formData.healthStatus === status
                            ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-existing Conditions (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Diabetes", "Hypertension", "Heart Disease", "Asthma", "Thyroid", "None"].map((condition) => (
                      <button
                        key={condition}
                        onClick={() => {
                          if (condition === "None") {
                            updateField("preExistingConditions", []);
                          } else {
                            toggleArrayItem("preExistingConditions", condition);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                          formData.preExistingConditions.includes(condition) || 
                          (condition === "None" && formData.preExistingConditions.length === 0)
                            ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Medical History (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Diabetes", "Heart Disease", "Cancer", "Stroke", "None"].map((condition) => (
                      <button
                        key={condition}
                        onClick={() => {
                          if (condition === "None") {
                            updateField("familyHistory", []);
                          } else {
                            toggleArrayItem("familyHistory", condition);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                          formData.familyHistory.includes(condition) || 
                          (condition === "None" && formData.familyHistory.length === 0)
                            ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you smoke?
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateField("smoker", true)}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          formData.smoker
                            ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => updateField("smoker", false)}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          !formData.smoker
                            ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercise Frequency
                    </label>
                    <select
                      value={formData.exerciseFrequency}
                      onChange={(e) => updateField("exerciseFrequency", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option>Daily</option>
                      <option>Often (4-6 times/week)</option>
                      <option>Sometimes (2-3 times/week)</option>
                      <option>Rarely (once/week)</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Financial Factors */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle size={24} className="text-teal-500" />
                  Current Coverage & Preferences
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Existing Health Insurance (₹ Lakhs)
                    </label>
                    <input
                      type="number"
                      value={formData.existingCoverage}
                      onChange={(e) => updateField("existingCoverage", parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employer Coverage (₹ Lakhs)
                    </label>
                    <input
                      type="number"
                      value={formData.employerCoverage}
                      onChange={(e) => updateField("employerCoverage", parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Preference
                    </label>
                    <select
                      value={formData.hospitalPreference}
                      onChange={(e) => updateField("hospitalPreference", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option>Government</option>
                      <option>Private - Standard</option>
                      <option>Private - Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.emergencyBudget}
                      onChange={(e) => updateField("emergencyBudget", parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="0"
                      step="10000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Out-of-pocket funds for medical emergencies</p>
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Total Current Coverage:</strong> ₹{(formData.existingCoverage + formData.employerCoverage).toFixed(1)} Lakhs
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Coverage Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle size={24} className="text-teal-500" />
                  Coverage Preferences
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Room Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Shared", "Private", "Deluxe"].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateField("roomType", type)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          formData.roomType === type
                            ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-300 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={formData.maternityCoverage}
                      onChange={(e) => updateField("maternityCoverage", e.target.checked)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Maternity Coverage</p>
                      <p className="text-sm text-gray-600">Covers childbirth expenses (~₹1.5 Lakhs)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-300 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={formData.criticalIllnessCoverage}
                      onChange={(e) => updateField("criticalIllnessCoverage", e.target.checked)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Critical Illness Coverage</p>
                      <p className="text-sm text-gray-600">Covers cancer, heart attack, stroke (Recommended)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-300 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={formData.opdCoverage}
                      onChange={(e) => updateField("opdCoverage", e.target.checked)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">OPD Coverage</p>
                      <p className="text-sm text-gray-600">Covers doctor visits, diagnostics (~₹50k/year)</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={calculateAndShow}
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Calculate Coverage
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Recommended Coverage</p>
                <p className="text-3xl font-bold text-teal-600">
                  ₹{results.totalRecommended} L
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Current Coverage</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{results.existingTotal} L
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Coverage Gap</p>
                <p className="text-3xl font-bold text-red-600">
                  ₹{results.coverageGap} L
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {results.coverageGapPercent}% shortfall
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Coverage Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                  <span className="text-gray-700">Base Hospitalization Coverage</span>
                  <span className="font-semibold text-gray-800">₹{results.baseCoverage} Lakhs</span>
                </div>

                {results.criticalIllnessCover > 0 && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Critical Illness Cover</span>
                    <span className="font-semibold text-gray-800">₹{results.criticalIllnessCover} Lakhs</span>
                  </div>
                )}

                {results.maternityCover > 0 && (
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <span className="text-gray-700">Maternity Coverage</span>
                    <span className="font-semibold text-gray-800">₹{results.maternityCover} Lakhs</span>
                  </div>
                )}

                {results.opdCover > 0 && (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">OPD Coverage</span>
                    <span className="font-semibold text-gray-800">₹{results.opdCover} Lakhs</span>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-bold">
                  <span>Total Recommended</span>
                  <span>₹{results.totalRecommended} Lakhs</span>
                </div>
              </div>
            </div>

            {/* Premium Estimate */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Estimated Premium</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Monthly Premium (approx.)</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{results.estimatedPremium.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Annual: ₹{(results.estimatedPremium * 12).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  *Actual premium varies by insurer, age, and policy features
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {results.coverageGap > 0 && (
                  <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-red-800">Insufficient Coverage</p>
                      <p className="text-sm text-red-700">
                        You need an additional ₹{results.coverageGap} Lakhs coverage to adequately protect your family.
                      </p>
                    </div>
                  </div>
                )}

                {results.coverageGap === 0 && (
                  <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-green-800">Well Protected!</p>
                      <p className="text-sm text-green-700">
                        Your current coverage meets the recommended level.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="font-semibold text-blue-800 mb-2">Tips:</p>
                  <ul className="text-sm text-teal-700 space-y-1 list-disc list-inside">
                    <li>Consider family floater policy for better value</li>
                    <li>Top-up plans can provide extra coverage at lower cost</li>
                    <li>Review coverage every 2-3 years as medical costs increase</li>
                    <li>Check for pre-existing disease waiting periods</li>
                    <li>Look for policies with lifetime renewability</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowResults(false)}
                className="flex-1 px-6 py-3 border-2 border-teal-500 text-teal-600 rounded-lg hover:bg-blue-50 transition-all font-semibold"
              >
                Modify Inputs
              </button>
              <button
                onClick={resetCalculator}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Start Fresh
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
