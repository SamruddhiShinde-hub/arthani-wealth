import React from 'react';
import { Compass, Sparkles, BookOpen, Shield, Lock, Smartphone, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface AboutPageProps {
  setCurrentPage?: (page: string) => void;
}

export default function AboutPage({ setCurrentPage }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg">
            <Compass className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            About ArthaniWealth
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ArthaniWealth is a <span className="font-semibold text-emerald-600">free, AI-powered</span> personal finance learning platform built for India.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-12 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Sparkles className="mr-3" size={28} />
            Our Mission
          </h2>
          <p className="text-lg text-emerald-50 leading-relaxed">
            Make financial knowledge <span className="font-semibold">accessible, unbiased, and easy to understand</span> — with no paid courses, no commissions, and no hidden agenda.
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            What You'll Find on ArthaniWealth
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-teal rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-emerald-500">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Sparkles className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    AI-Powered Guidance
                  </h3>
                  <span className="text-sm text-emerald-600 font-semibold">(Designed for India)</span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ask anything about taxes, investing, insurance, loans, or planning - our India-trained financial AI gives clear, contextual explanations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-teal rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-emerald-500">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <BookOpen className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Simple, Actionable Learning
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Bite-sized explainers and step-by-step guides that demystify money.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-emerald-500">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <CheckCircle className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Tools That Build Confidence
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Checklists, calculators, templates, and AI-assisted help to support better decisions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-emerald-500">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Shield className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    100% Unbiased
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We don't sell products or earn commissions. Every insight comes with zero conflict of interest.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-teal rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-emerald-500">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Lock className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Private & Secure
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Your data stays with you. No tracking, no ads, no selling of information.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-teal rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-l-4 border-emerald-500">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Smartphone className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Mobile-First Design
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Optimized for your phone - and works smoothly on tablets and laptops too.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <Users className="text-emerald-600 mr-3" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Our Story</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            ArthaniWealth was created by finance and technology professionals who experienced firsthand how confusing and expensive good financial guidance can be in India.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            We built this platform so <span className="font-semibold text-emerald-600">every Indian can learn, plan, and make better money decisions</span> - without fear or complexity.
          </p>
        </div>

        {/* SEBI Compliance Notice */}
        <div className="bg-teal-50 border-l-4 border-green-500 rounded-xl shadow-lg p-8 mb-12">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="text-teal-600" size={32} />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Important Note (SEBI Compliance)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                ArthaniWealth is an <span className="font-semibold">educational platform</span>, not a SEBI-registered investment advisor.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Use our tools to learn and gain confidence - and always consult a qualified professional for personalised investment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Get Started CTA */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Get Started</h2>
          <p className="text-xl text-emerald-50 mb-6">
            Explore freely - no signup required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            
            <button
              onClick={() => setCurrentPage && setCurrentPage('advisory')}
              className="px-8 py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl"
            >
              Start Advisory Wizard
            </button>
            <button
		  onClick={() => setCurrentPage && setCurrentPage('dashboard')}
		  className="px-8 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl">
		  View Dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
