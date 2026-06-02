// AdvisoryWizardPage.tsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { storage } from '../utils/storage';

// Import existing components (we'll use them as sections)
import RiskProfilePage from './RiskProfilePage';
import IncomePage from './IncomePage';
import InvestmentsPage from './InvestmentsPage';
import AssetsPage from './AssetsPage';
import GoalsPage from './GoalsPage';
import InsurancePage from './InsurancePage';

type WizardStep = {
  id: number;
  title: string;
  shortTitle: string;
  component: React.ComponentType<any>;
  completed: boolean;
};

// ADD THIS INTERFACE
interface AdvisoryWizardPageProps {
  setCurrentPage: (page: string) => void;
}

// UPDATE THE COMPONENT DEFINITION
export default function AdvisoryWizardPage({ setCurrentPage }: AdvisoryWizardPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    riskProfileCompleted: false,
    incomeExpensesCompleted: false,
    investmentsCompleted: false,
    assetsLiabilitiesCompleted: false,
    goalsCompleted: false,
    insuranceCompleted: false,
  });

  // Helper function to validate insurance completion
  const isInsuranceComplete = (insuranceData: any) => {
    if (!insuranceData || Object.keys(insuranceData).length === 0) return false;
    
    // Check if loans have meaningful amounts (not just auto-imported with zero values)
    const hasValidLoans = insuranceData.loans && 
      insuranceData.loans.length > 0 && 
      insuranceData.loans.some((loan: any) => loan.amount > 0);
    
    // Check if goals have meaningful amounts
    const hasValidGoals = insuranceData.goals && 
      insuranceData.goals.length > 0 && 
      insuranceData.goals.some((goal: any) => goal.amount > 0);
    
    // Check if expenses are filled with valid spouse details
    const hasValidExpenses = insuranceData.monthlyExpenses > 0 &&
      insuranceData.spouseAge > 0 && 
      insuranceData.spouseLifeExpectancy > 0 &&
      insuranceData.spouseLifeExpectancy > insuranceData.spouseAge; // Life expectancy must be > current age
    
    // At least ONE section must have valid data
    return hasValidLoans || hasValidGoals || hasValidExpenses;
  };

  // Load wizard progress
  useEffect(() => {
    const savedProgress = storage.get('wizardProgress', {});
    const savedStep = storage.get('wizardCurrentStep', 1);
    
    // Check completion status from actual data
    const riskProfile = storage.get('riskProfile', null);
    const incomes = storage.get('incomes', []);
    const expenses = storage.get('expenses', []);
    const investments = storage.get('investments', []);
    const assets = storage.get('assets', []);
    const liabilities = storage.get('liabilities', []);
    const goals = storage.get('financialGoals', []);
    const insuranceData = storage.get('insuranceCalculator', null);
    
    setWizardData({
      riskProfileCompleted: !!riskProfile,
      incomeExpensesCompleted: incomes.length > 0 || expenses.length > 0,
      investmentsCompleted: investments.length > 0,
      assetsLiabilitiesCompleted: assets.length > 0 || liabilities.length > 0,
      goalsCompleted: goals.length > 0,
      insuranceCompleted: isInsuranceComplete(insuranceData),
    });
    
    // Only restore saved step if user has started the wizard
    // Otherwise, default to step 1 for first-time users
    const hasAnyData = !!riskProfile || incomes.length > 0 || expenses.length > 0 || 
                       investments.length > 0 || assets.length > 0 || liabilities.length > 0 || 
                       goals.length > 0;
    
    if (hasAnyData && savedStep > 1) {
      setCurrentStep(savedStep); // Resume where they left off
    } else {
      setCurrentStep(1); // Start fresh
      storage.set('wizardCurrentStep', 1); // Reset saved step
    }
  }, []);

  // Refresh completion status whenever current step changes
  useEffect(() => {
    const riskProfile = storage.get('riskProfile', null);
    const incomes = storage.get('incomes', []);
    const expenses = storage.get('expenses', []);
    const investments = storage.get('investments', []);
    const assets = storage.get('assets', []);
    const liabilities = storage.get('liabilities', []);
    const goals = storage.get('financialGoals', []);
    const insuranceData = storage.get('insuranceCalculator', null);
    
    setWizardData({
      riskProfileCompleted: !!riskProfile,
      incomeExpensesCompleted: incomes.length > 0 || expenses.length > 0,
      investmentsCompleted: investments.length > 0,
      assetsLiabilitiesCompleted: assets.length > 0 || liabilities.length > 0,
      goalsCompleted: goals.length > 0,
      insuranceCompleted: isInsuranceComplete(insuranceData),
    });
  }, [currentStep]); // Refresh when step changes

  // Save current step
  useEffect(() => {
    storage.set('wizardCurrentStep', currentStep);
  }, [currentStep]);

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Risk Profile Assessment',
      shortTitle: 'Risk Profile',
      component: RiskProfilePage,
      completed: wizardData.riskProfileCompleted,
    },
    {
      id: 2,
      title: 'Income & Expenses',
      shortTitle: 'Income/Expenses',
      component: IncomePage,
      completed: wizardData.incomeExpensesCompleted,
    },
    {
      id: 3,
      title: 'My Investments',
      shortTitle: 'Investments',
      component: InvestmentsPage,
      completed: wizardData.investmentsCompleted,
    },
    {
      id: 4,
      title: 'Assets & Liabilities',
      shortTitle: 'Assets',
      component: AssetsPage,
      completed: wizardData.assetsLiabilitiesCompleted,
    },
    {
      id: 5,
      title: 'Financial Goals',
      shortTitle: 'Goals',
      component: GoalsPage,
      completed: wizardData.goalsCompleted,
    },
    {
      id: 6,
      title: 'Insurance Planning',
      shortTitle: 'Insurance',
      component: InsurancePage,
      completed: wizardData.insuranceCompleted,
    },
  ];

  const currentStepData = steps.find(s => s.id === currentStep);
  const CurrentComponent = currentStepData?.component;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    window.scrollTo(0, 0);
  };

  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Financial Advisory Wizard
          </h1>
          <p className="text-gray-600">
            Complete your comprehensive financial profile in 6 simple steps
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Overall Progress</h3>
              <p className="text-sm text-gray-600">
                {completedSteps} of {steps.length} sections completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-emerald-600">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => handleStepClick(step.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step.id === currentStep
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-110 shadow-lg'
                        : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs md:text-sm font-medium text-center max-w-[80px] ${
                      step.id === currentStep
                        ? 'text-emerald-600'
                        : step.completed
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.shortTitle}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div
                      className={`h-1 rounded transition-all ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Step {currentStep}: {currentStepData?.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentStep === 1 && "Understand your risk tolerance and investment preferences"}
                  {currentStep === 2 && "Track your income sources and monthly expenses"}
                  {currentStep === 3 && "Document your assets and outstanding liabilities"}
                  {currentStep === 4 && "Define and plan your financial goals"}
                  {currentStep === 5 && "Calculate your insurance coverage requirements"}
                </p>
              </div>
              {currentStepData?.completed && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Render Current Component */}
          <div>
            {CurrentComponent && <CurrentComponent />}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === steps.length
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl shadow-lg'
            }`}
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Completion Message */}
        {completedSteps === steps.length && (
          <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-center text-white">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              Congratulations! Your Financial Profile is Complete
            </h3>
            <p className="text-green-50 mb-6">
              You've successfully completed all sections of the financial advisory wizard.
              View your comprehensive dashboard for insights and recommendations.
            </p>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all shadow-lg"
            >
              View Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}