import React, { useState, useEffect } from 'react';
import { TrendingUp, Menu, X, RotateCcw } from 'lucide-react';
import './css/App.css';

// Import pages
import HomePage from './pages/HomePage';
import CalculatorsPage from './pages/CalculatorsPage';
import ToolsPage from './pages/ToolsPage';
import RetirementPage from './pages/RetirementPage';
import GoalsPage from './pages/GoalsPage';
import RiskProfilePage from './pages/RiskProfilePage';
import AssetsPage from './pages/AssetsPage';
import IncomePage from './pages/IncomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import InsurancePage from './pages/InsurancePage';
import TaxCalculatorPage from './pages/TaxCalculatorPage';
import PPFCalculatorPage from './pages/PPFCalculatorPage';
import EmergencyFundPage from './pages/EmergencyFundPage';
import DebtPayoffPage from './pages/DebtPayoffPage';
import DashboardPage from './pages/DashboardPage';
import NPSCalculatorPage from './pages/NPSCalculatorPage';
import HRACalculatorPage from './pages/HRACalculatorPage';
import AdvisoryWizardPage from './pages/AdvisoryWizardPage';
import HealthInsuranceCalculator from './pages/HealthInsuranceCalculator';
import FinancialClarityPage from './pages/FinancialClarityPage';
import InvestmentsPage from './pages/InvestmentsPage';
import RentVsBuyPage from './pages/RentVsBuyPage';


// Import Chat Widget
import ChatWidget from './components/ChatWidget';

// Main App Component
export default function SamruddhiWealth() {
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
   // Scroll to top on page change - SMOOTH
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'dashboard': return <DashboardPage />;
      case 'advisory': return <AdvisoryWizardPage setCurrentPage={setCurrentPage} />;
      case 'retirement': return <RetirementPage />;
      case 'tools': return <ToolsPage setCurrentPage={setCurrentPage} />;
      case 'calculators': return <CalculatorsPage />;
      case 'risk': return <RiskProfilePage />;
      case 'income': return <IncomePage />;
      case 'investments': return <InvestmentsPage />;
      case 'assets': return <AssetsPage />;
      case 'goals': return <GoalsPage />;
      case 'insurance': return <InsurancePage />;
      case 'about': return <AboutPage setCurrentPage={setCurrentPage} />;
      case 'contact': return <ContactPage />;
      case 'tax': return <TaxCalculatorPage setCurrentPage={setCurrentPage} />;
      case 'ppf': return <PPFCalculatorPage setCurrentPage={setCurrentPage} />;
      case 'emergency': return <EmergencyFundPage setCurrentPage={setCurrentPage} />;
      case 'debt': return <DebtPayoffPage setCurrentPage={setCurrentPage} />;
      case 'nps': return <NPSCalculatorPage setCurrentPage={setCurrentPage} />;
      case 'hra': return <HRACalculatorPage setCurrentPage={setCurrentPage} />;
      case 'rent-vs-buy': return <RentVsBuyPage />;
      case 'health-insurance': return <HealthInsuranceCalculator />;
      case 'financial-clarity': return <FinancialClarityPage setCurrentPage={setCurrentPage} />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    setShowResetModal(false);
    setCurrentPage('home');
    window.location.reload();
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'financial-clarity', label: 'Financial Clarity' },
    { id: 'advisory', label: 'Get Started' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'retirement', label: 'Retirement' },
    { id: 'tools', label: 'Tools' }, 
    { id: 'calculators', label: 'Calculators' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo - Fixed Width */}
          <div className="flex items-center gap-2 cursor-pointer w-64 flex-shrink-0" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SamruddhiWealth
            </span>
          </div>
          
          
          {/* Desktop Navigation - Centered with tighter spacing */}
          <nav className="hidden lg:flex gap-2 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                  currentPage === item.id
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-gray-900 hover:bg-emerald-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Reset Button - Fixed Width */}
          <div className="hidden lg:flex w-64 justify-end flex-shrink-0">
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t">
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-left font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Reset Button */}
              <button
                onClick={() => { setShowResetModal(true); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all mt-2"
              >
                <RotateCcw size={18} />
                Reset Data
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-200px)]">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">SamruddhiWealth</p>
          <p className="text-emerald-200">Empowering Your Financial Future</p>
          <p className="text-sm text-emerald-300 mt-4">© 2024 SamruddhiWealth. All rights reserved.</p>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <RotateCcw className="text-red-600" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Reset All Data?
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              This will permanently delete all your financial data including:
            </p>
            
            <ul className="text-sm text-gray-700 mb-6 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Risk profile assessment
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Income and expenses
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Assets and liabilities
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Financial goals
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                All calculator data
              </li>
            </ul>
            
            <p className="text-sm text-red-600 font-semibold text-center mb-6">
              ⚠️ This action cannot be undone!
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
