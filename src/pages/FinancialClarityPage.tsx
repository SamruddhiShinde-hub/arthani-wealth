import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ArrowLeft, TrendingUp, AlertCircle, Shield, Target } from 'lucide-react';
import { storage } from '../utils/storage';

interface FinancialClarityPageProps {
  setCurrentPage?: (page: string) => void;
}

type Section = {
  sectionTitle: string;
  questions: Question[];
};

type Question = {
  id: number;
  question: string;
  options: Option[];
};

type Option = {
  text: string;
  score: number;
};

const assessmentData: {
  sections: Section[];
  maxScore: number;
  bands: { range: string; label: string; color: string; bg: string; border: string }[];
} = {
  sections: [
    {
      sectionTitle: 'Financial Clarity',
      questions: [
        {
          id: 1,
          question: 'Do you know your exact current net worth (all assets minus liabilities)?',
          options: [
            { text: 'Yes, updated within last 6 months', score: 7 },
            { text: 'Rough idea', score: 4 },
            { text: 'No clear view', score: 0 }
          ]
        },
        {
          id: 2,
          question: 'Do you know your annual savings rate (%)?',
          options: [
            { text: 'Yes clearly', score: 7 },
            { text: 'Approximate idea', score: 4 },
            { text: 'Not tracked', score: 0 }
          ]
        },
        {
          id: 3,
          question: 'Do you know the corpus required for financial independence?',
          options: [
            { text: 'Yes, calculated scientifically', score: 7 },
            { text: 'Rough guess', score: 4 },
            { text: 'No', score: 0 }
          ]
        }
      ]
    },
    {
      sectionTitle: 'Portfolio Structure',
      questions: [
        {
          id: 4,
          question: 'Your investments today are:',
          options: [
            { text: 'Structured with clear asset allocation', score: 7 },
            { text: 'Somewhat organised', score: 4 },
            { text: 'Scattered across products', score: 0 }
          ]
        },
        {
          id: 5,
          question: 'How many mutual funds/stocks do you hold?',
          options: [
            { text: 'Less than 12', score: 7 },
            { text: '12–25', score: 4 },
            { text: 'More than 25 / Not sure', score: 0 }
          ]
        },
        {
          id: 6,
          question: 'Do you hold legacy products like ULIPs or traditional insurance policies?',
          options: [
            { text: 'No', score: 7 },
            { text: 'Some', score: 4 },
            { text: 'Many / Unsure', score: 0 }
          ]
        }
      ]
    },
    {
      sectionTitle: 'Financial Freedom & Retirement',
      questions: [
        {
          id: 7,
          question: 'At what age can you comfortably stop working?',
          options: [
            { text: 'Clear number & plan', score: 7 },
            { text: 'Rough idea', score: 4 },
            { text: 'No clarity', score: 0 }
          ]
        },
        {
          id: 8,
          question: 'Passive income covers what % of monthly expenses?',
          options: [
            { text: 'More than 40%', score: 7 },
            { text: '10–40%', score: 4 },
            { text: 'Less than 10%', score: 0 }
          ]
        },
        {
          id: 9,
          question: 'Has your retirement corpus been stress-tested for inflation & longevity?',
          options: [
            { text: 'Yes', score: 7 },
            { text: 'Partially', score: 4 },
            { text: 'No', score: 0 }
          ]
        }
      ]
    },
    {
      sectionTitle: 'Risk & Protection',
      questions: [
        {
          id: 10,
          question: 'Do you have adequate term insurance (10–15x annual income)?',
          options: [
            { text: 'Yes', score: 7 },
            { text: 'Partial', score: 4 },
            { text: 'No', score: 0 }
          ]
        },
        {
          id: 11,
          question: 'Family health insurance coverage:',
          options: [
            { text: 'More than ₹25L', score: 7 },
            { text: 'Basic coverage', score: 4 },
            { text: 'Insufficient', score: 0 }
          ]
        },
        {
          id: 12,
          question: 'Emergency fund availability (6–12 months expenses):',
          options: [
            { text: 'Yes', score: 7 },
            { text: 'Partial', score: 4 },
            { text: 'No', score: 0 }
          ]
        }
      ]
    },
    {
      sectionTitle: 'Tax & Wealth Structuring',
      questions: [
        {
          id: 13,
          question: 'Do you actively optimise taxes beyond basic deductions?',
          options: [
            { text: 'Yes', score: 7 },
            { text: 'Somewhat', score: 4 },
            { text: 'No', score: 0 }
          ]
        },
        {
          id: 14,
          question: 'Do you have a will or estate plan?',
          options: [
            { text: 'Yes', score: 7 },
            { text: 'Planned', score: 4 },
            { text: 'No', score: 0 }
          ]
        },
        {
          id: 15,
          question: 'Do you have one integrated financial strategy across investments, insurance and retirement?',
          options: [
            { text: 'Yes', score: 7 },
            { text: 'Partial', score: 4 },
            { text: 'No', score: 0 }
          ]
        }
      ]
    }
  ],
  maxScore: 105,
  bands: [
    { 
      range: '90-105', 
      label: 'Highly Structured',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-300'
    },
    { 
      range: '70-89', 
      label: 'Doing well, optimisation possible',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300'
    },
    { 
      range: '50-69', 
      label: 'Needs structuring',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-300'
    },
    { 
      range: 'Below 50', 
      label: 'Financially unstructured',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-300'
    }
  ]
};

export default function FinancialClarityPage({ setCurrentPage }: FinancialClarityPageProps) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load saved answers (matching RiskProfilePage pattern)
  useEffect(() => {
    const saved = storage.get('financialClarityAnswers', {});
    console.log('Loading financial clarity:', saved); // Debug log
    setAnswers(saved);
    setIsLoaded(true);
    
    const totalQuestions = assessmentData.sections.reduce(
      (sum, section) => sum + section.questions.length, 
      0
    );
    setShowResults(Object.keys(saved).length === totalQuestions);
  }, []);

  // Save answers (only after initial load - matching RiskProfilePage pattern)
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving financial clarity:', answers); // Debug log
      storage.set('financialClarityAnswers', answers);
      
      // Calculate total questions
      const totalQuestions = assessmentData.sections.reduce(
        (sum, section) => sum + section.questions.length, 
        0
      );
      
      // Save summary for chat widget (only when complete)
      if (Object.keys(answers).length === totalQuestions) {
        const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
        
        let clarityLevel = '';
        let recommendations = [];
        
        if (totalScore >= 90) {
          clarityLevel = 'Highly Structured';
          recommendations = [
            'Focus on fine-tuning and optimization',
            'Consider advanced tax planning strategies',
            'Review portfolio annually and rebalance as needed'
          ];
        } else if (totalScore >= 70) {
          clarityLevel = 'Good - Optimization Possible';
          recommendations = [
            'Close gaps in insurance and retirement planning',
            'Streamline investment portfolio',
            'Update estate plan if not done'
          ];
        } else if (totalScore >= 50) {
          clarityLevel = 'Needs Structuring';
          recommendations = [
            'Ensure adequate term insurance and health cover',
            'Calculate retirement corpus requirement',
            'Consolidate scattered investments'
          ];
        } else {
          clarityLevel = 'Financially Unstructured - Urgent Action Needed';
          recommendations = [
            'Start with protection: term insurance and health cover',
            'Create 6-month emergency fund',
            'Develop written financial plan with clear goals'
          ];
        }
        
        const sectionScores = assessmentData.sections.map(section => {
          const sectionScore = section.questions.reduce(
            (sum, q) => sum + (answers[q.id] || 0), 
            0
          );
          const sectionMax = section.questions.length * 7;
          return {
            section: section.sectionTitle,
            score: sectionScore,
            maxScore: sectionMax,
            percentage: Math.round((sectionScore / sectionMax) * 100)
          };
        });
        
        const summary = {
          totalScore,
          maxScore: assessmentData.maxScore,
          percentage: Math.round((totalScore / assessmentData.maxScore) * 100),
          clarityLevel,
          recommendations,
          sectionScores,
          completedDate: new Date().toISOString(),
          weakestAreas: sectionScores
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 2)
            .map(s => s.section),
          strongestAreas: sectionScores
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 2)
            .map(s => s.section)
        };
        
        console.log('Saving financial clarity summary:', summary); // Debug log
        storage.set('financialClaritySummary', summary);
      }
    }
  }, [isLoaded, answers]);

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    
    const totalQuestions = assessmentData.sections.reduce(
      (sum, section) => sum + section.questions.length, 
      0
    );
    if (Object.keys({ ...answers, [questionId]: score }).length === totalQuestions) {
      setTimeout(() => {
        setShowResults(true);
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setShowResults(false);
    storage.set('financialClarityAnswers', {});
    storage.set('financialClaritySummary', null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessmentData.sections.reduce(
    (sum, section) => sum + section.questions.length, 
    0
  );
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  const getScoreBand = () => {
    if (totalScore >= 90) return assessmentData.bands[0];
    if (totalScore >= 70) return assessmentData.bands[1];
    if (totalScore >= 50) return assessmentData.bands[2];
    return assessmentData.bands[3];
  };

  const scoreBand = getScoreBand();

  const getRecommendations = () => {
    if (totalScore >= 90) {
      return [
        'Your financial structure is excellent. Focus on fine-tuning and optimisation.',
        'Consider advanced tax planning strategies and estate planning refinements.',
        'Review portfolio annually and rebalance as needed.'
      ];
    } else if (totalScore >= 70) {
      return [
        'You have a good foundation. Focus on closing gaps in insurance and retirement planning.',
        'Streamline your investment portfolio by consolidating redundant holdings.',
        'Work on increasing passive income streams.'
      ];
    } else if (totalScore >= 50) {
      return [
        'Your finances need significant structuring. Consider professional guidance.',
        'Start with basics: adequate term insurance, health cover, and emergency fund.',
        'Calculate your retirement corpus requirement scientifically.'
      ];
    } else {
      return [
        'Urgent action needed. Your financial situation requires immediate attention.',
        'Book a Financial Clarity Session to create a comprehensive plan.',
        'Start with protection: term insurance and health cover are critical.'
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        {setCurrentPage && (
          <button
            onClick={() => setCurrentPage('home')}
            className="fixed top-24 left-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">Back</span>
          </button>
        )}

        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Financial Clarity Assessment
          </h1>
          <p className="text-gray-600">
            15 questions • 7 minutes • Corporate leaders & professionals
          </p>
        </div>

        {/* Compact Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {answeredCount} of {totalQuestions} answered
            </span>
            <span className="text-lg font-bold text-emerald-600">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Compact Questions */}
        <div className="space-y-4 mb-6">
          {assessmentData.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    {sectionIndex + 1}
                  </span>
                  {section.sectionTitle}
                </h2>
              </div>
              
              <div className="p-4 space-y-3">
                {section.questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {answers[question.id] !== undefined ? (
                          <CheckCircle className="text-emerald-500" size={18} />
                        ) : (
                          <Circle className="text-gray-300" size={18} />
                        )}
                      </div>
                      <p className="font-medium text-gray-800 text-sm flex-1">
                        {question.question}
                      </p>
                    </div>
                    <div className="space-y-1.5 ml-6">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-all text-sm ${
                            answers[question.id] === option.score
                              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answers[question.id] === option.score}
                            onChange={() => handleAnswer(question.id, option.score)}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          <span className={`flex-1 ${
                            answers[question.id] === option.score ? 'font-semibold text-gray-800' : 'text-gray-700'
                          }`}>
                            {option.text}
                          </span>
                          <span className={`text-xs font-medium ${
                            answers[question.id] === option.score ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            {option.score}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results Section */}
        {showResults && (
          <div id="results-section" className="space-y-6">
            {/* Score Card */}
            <div className={`bg-white rounded-xl shadow-xl overflow-hidden border-2 ${scoreBand.border}`}>
              <div className={`${scoreBand.bg} px-6 py-3 border-b ${scoreBand.border}`}>
                <h2 className={`text-xl font-bold ${scoreBand.color} flex items-center gap-2`}>
                  {totalScore >= 70 ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                  Your Score: {totalScore}/{assessmentData.maxScore}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className={`px-6 py-3 rounded-xl ${scoreBand.bg} border-2 ${scoreBand.border}`}>
                    <p className={`text-xl font-bold ${scoreBand.color}`}>
                      {scoreBand.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {Math.round((totalScore / assessmentData.maxScore) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Compact Score Breakdown */}
                <div className="grid md:grid-cols-3 gap-3 mb-6">
                  {assessmentData.sections.map((section, idx) => {
                    const sectionScore = section.questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
                    const sectionMax = section.questions.length * 7;
                    const sectionPercent = (sectionScore / sectionMax) * 100;
                    
                    return (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-gray-700">
                            {section.sectionTitle}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            {sectionScore}/{sectionMax}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"
                            style={{ width: `${sectionPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendations */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600" size={20} />
                    Key Actions
                  </h3>
                  <ul className="space-y-2">
                    {getRecommendations().map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={resetAssessment}
                    className="flex-1 px-6 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
                  >
                    Retake Assessment
                  </button>
                  {setCurrentPage && (
                    <button
                      onClick={() => setCurrentPage('contact')}
                      className="flex-1 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Book Clarity Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box for Incomplete */}
        {!showResults && answeredCount > 0 && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Almost There!</h3>
                <p className="text-sm text-gray-700">
                  Complete all {totalQuestions} questions to see your score and recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
