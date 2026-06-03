import React from 'react';
import { Calculator, Target, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

export default function HomePage({ setCurrentPage }: HomePageProps) {
  return (
  
 
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Master Your Financial Future</h1>
          <p className="text-xl mb-8 text-emerald-100">
            AI-powered financial planning platform built for India - completely free
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setCurrentPage('advisory')}
              className="px-8 py-3 bg-white text-emerald-600 rounded-full font-semibold hover:shadow-xl transition-all"
            >
              Get Started
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className="px-8 py-3 bg-emerald-700 text-white rounded-full font-semibold hover:bg-emerald-800 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Core Features - 4 main features */}
      <section className="py-6 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Everything You Need for Financial Success
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Start with our guided advisory wizard, then explore powerful tools and calculators
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Advisory Wizard */}
            <div
              onClick={() => setCurrentPage('advisory')}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2 border-2 border-emerald-200"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Get Started</h3>
              <p className="text-gray-600 mb-4">Guided financial planning wizard</p>
              <div className="flex items-center text-emerald-600 font-semibold text-sm">
                Start now <ArrowRight size={16} className="ml-1" />
              </div>
            </div>

            {/* Dashboard */}
            <div
              onClick={() => setCurrentPage('dashboard')}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Dashboard</h3>
              <p className="text-gray-600 mb-4">Visualize your financial picture</p>
              <div className="flex items-center text-emerald-600 font-semibold text-sm">
                View <ArrowRight size={16} className="ml-1" />
              </div>
            </div>

            {/* Tools */}
            <div
              onClick={() => setCurrentPage('tools')}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Planning Tools</h3>
              <p className="text-gray-600 mb-4">Tax, PPF, NPS, HRA & more</p>
              <div className="flex items-center text-emerald-600 font-semibold text-sm">
                Explore <ArrowRight size={16} className="ml-1" />
              </div>
            </div>

            {/* Calculators */}
            <div
              onClick={() => setCurrentPage('calculators')}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Calculator className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Calculators</h3>
              <p className="text-gray-600 mb-4">Loans, SIP, EMI & investments</p>
              <div className="flex items-center text-emerald-600 font-semibold text-sm">
                Calculate <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why SamruddhiWealth?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
          
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">100% Free</h3>
              <p className="text-gray-600">No hidden charges, no commissions, completely free forever</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">AI-Powered</h3>
              <p className="text-gray-600">Smart recommendations trained specifically for Indian finances</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-emerald-600" size={32} />
              </div>
               <h3 className="text-xl font-bold mb-3 text-gray-800">Unbiased</h3>
              <p className="text-gray-600">Zero conflict of interest - we don't sell any products</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Control?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Start your financial journey today - no signup required
          </p>
          <button
            onClick={() => setCurrentPage('advisory')}
            className="px-10 py-4 bg-white text-emerald-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}
