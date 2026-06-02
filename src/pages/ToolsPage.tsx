import React from 'react';
import { Calculator, Shield, CreditCard, PiggyBank, TrendingUp, Home, Wrench, Heart } from 'lucide-react';

interface ToolsPageProps {
  setCurrentPage: (page: string) => void;
}

export default function ToolsPage({ setCurrentPage }: ToolsPageProps) {
  const tools = [
    {
      icon: Home,
      title: 'Rent vs Buy Calculator',
      description: 'Should you rent or buy a house? Compare total costs and make an informed decision.',
      page: 'rent-vs-buy',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Heart,
      title: 'Health Insurance Calculator',
      description: 'Assess your health coverage needs based on age, family size, and medical costs.',
      page: 'health-insurance',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Calculator,
      title: 'Tax Calculator',
      description: 'Calculate income tax under old and new regime. Compare and optimize your tax savings.',
      page: 'tax',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Emergency Fund',
      description: 'Calculate how much emergency fund you need based on your monthly expenses and lifestyle.',
      page: 'emergency',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: CreditCard,
      title: 'Debt Payoff',
      description: 'Create a debt payoff strategy using snowball or avalanche method. Get debt-free faster.',
      page: 'debt',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: PiggyBank,
      title: 'PPF Calculator',
      description: 'Calculate Public Provident Fund returns, maturity value, and plan your long-term savings.',
      page: 'ppf',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: TrendingUp,
      title: 'NPS Calculator',
      description: 'Plan your National Pension System investments and estimate retirement corpus.',
      page: 'nps',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg">
            <Wrench className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Financial Planning Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful calculators and planning tools to help you make better financial decisions
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool, index) => (
            <div
              key={index}
              onClick={() => setCurrentPage(tool.page)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer p-8 hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-6 shadow-md`}>
                <tool.icon className="text-white" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {tool.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-4">
                {tool.description}
              </p>
              
              <button className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center group">
                Open Tool
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">
            Need More Calculators?
          </h2>
          <p className="text-emerald-50 mb-6 text-lg">
            Check out our comprehensive calculator suite for investment, loan, and savings planning.
          </p>
          <button
            onClick={() => setCurrentPage('calculators')}
            className="px-8 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg"
          >
            View All Calculators
          </button> 
        </div>

      </div>
    </div>
  );
}