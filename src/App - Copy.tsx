import React, { useState } from 'react';
import { TrendingUp, Menu, X } from 'lucide-react';
import './css/App.css';

// Import pages
import HomePage from './pages/HomePage';
import CalculatorsPage from './pages/CalculatorsPage';
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

// Import Chat Widget
import ChatWidget from './components/ChatWidget';

// Main App Component
export default function SamruddhiWealth() {
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'risk': return <RiskProfilePage />;
      case 'income': return <IncomePage />;
      case 'assets': return <AssetsPage />;
      case 'goals': return <GoalsPage />;
      case 'retirement': return <RetirementPage />;
      case 'insurance': return <InsurancePage />;
      case 'calculators': return <CalculatorsPage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      case 'tax': return <TaxCalculatorPage />;
      case 'ppf': return <PPFCalculatorPage />;
      case 'emergency': return <EmergencyFundPage />;
      case 'debt': return <DebtPayoffPage />;
      case 'dashboard': return <DashboardPage />;
      case 'nps': return <NPSCalculatorPage />;
      case 'hra': return <HRACalculatorPage />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' }, // NEW
    { id: 'risk', label: 'Risk' },
    { id: 'income', label: 'Income' },
    { id: 'assets', label: 'Assets' },
    { id: 'goals', label: 'Goals' },
    { id: 'retirement', label: 'Retirement' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'calculators', label: 'Calculators' },
    { id: 'tax', label: 'Tax' }, // NEW
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SamruddhiWealth
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t">
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

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}