import React, { useState, useEffect } from "react";
import { storage } from "../utils/storage";

type Option = { label: string; score: number };
type Question = { id: number; question: string; options: Option[] };

const questions: Question[] = [
  { id: 1, question: "What is your age?", options: [{ label: "Under 30", score: 3 }, { label: "31-45", score: 2 }, { label: "Over 45", score: 1 }] },
  { id: 2, question: "What is your investment horizon?", options: [{ label: "More than 10 years", score: 3 }, { label: "5-10 years", score: 2 }, { label: "Less than 5 years", score: 1 }] },
  { id: 3, question: "How would you describe your investment knowledge?", options: [{ label: "Extensive", score: 3 }, { label: "Moderate", score: 2 }, { label: "Limited", score: 1 }] },
  { id: 4, question: "How would you react to a 20% drop in your investment value?", options: [{ label: "I would buy more", score: 3 }, { label: "I would stay invested", score: 2 }, { label: "I would sell", score: 1 }] },
  { id: 5, question: "What is your primary investment goal?", options: [{ label: "Wealth creation", score: 3 }, { label: "Balanced growth & safety", score: 2 }, { label: "Capital preservation", score: 1 }] },
  { id: 6, question: "How often do you review your investment portfolio?", options: [{ label: "Quarterly", score: 3 }, { label: "Annually", score: 2 }, { label: "Rarely/Never", score: 1 }] },
  { id: 7, question: "How much of your annual income do you invest?", options: [{ label: "> 20%", score: 3 }, { label: "10-20%", score: 2 }, { label: "< 10%", score: 1 }] },
  { id: 8, question: "How would you rate your ability to handle financial losses?", options: [{ label: "High tolerance", score: 3 }, { label: "Moderate tolerance", score: 2 }, { label: "Low tolerance", score: 1 }] },
  { id: 9, question: "What percentage of your investments are in high-risk assets?", options: [{ label: "> 50%", score: 3 }, { label: "20-50%", score: 2 }, { label: "< 20%", score: 1 }] },
  { id: 10, question: "What is your current financial situation?", options: [{ label: "Stable, surplus income", score: 3 }, { label: "Manageable, break-even", score: 2 }, { label: "Tight, limited savings", score: 1 }] },
];

export default function RiskProfilePage() {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved answers
  useEffect(() => {
    const saved = storage.get('riskProfileAnswers', {});
    console.log('Loading risk profile:', saved); // Debug log
    setAnswers(saved);
    setIsLoaded(true);
  }, []);

  // Save answers (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving risk profile:', answers); // Debug log
      storage.set('riskProfileAnswers', answers);
      
      // Also save the calculated risk profile for use in chat
      if (Object.keys(answers).length === questions.length) {
        const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
        let profile = "Conservative";
        if (totalScore >= 27) profile = "Aggressive";
        else if (totalScore >= 18) profile = "Moderate";
        storage.set('riskProfile', profile);
      }
    }
  }, [isLoaded, answers]);

  const handleOptionSelect = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const resetAnswers = () => {
    setAnswers({});
    storage.set('riskProfileAnswers', {});
    storage.set('riskProfile', null);
  };

  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Determine risk profile dynamically
  let riskProfile: string | null = null;
  let riskDescription = "";
  let assetAllocation = { equity: 0, debt: 0, gold: 0 };
  
  if (answeredCount === questions.length) {
    if (totalScore >= 27) {
      riskProfile = "Aggressive";
      riskDescription = "You have a high risk tolerance and are comfortable with significant market volatility for potentially higher returns.";
      assetAllocation = { equity: 80, debt: 15, gold: 5 };
    } else if (totalScore >= 18) {
      riskProfile = "Moderate";
      riskDescription = "You prefer a balanced approach with moderate risk and steady growth potential.";
      assetAllocation = { equity: 60, debt: 30, gold: 10 };
    } else {
      riskProfile = "Conservative";
      riskDescription = "You prioritize capital preservation and prefer low-risk investments with stable returns.";
      assetAllocation = { equity: 30, debt: 60, gold: 10 };
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">Investment Risk Profile Assessment</h1>
      <p className="text-center text-gray-600 mb-8">
        Answer all questions to determine your investment risk appetite and get personalized recommendations
      </p>

      {/* Progress Bar */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-emerald-600">{answeredCount}/{questions.length} questions</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-8">
        {questions.map((q) => (
          <div key={q.id} className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow">
            <p className="font-semibold text-gray-800 mb-4 text-lg">
              {q.id}. {q.question}
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <label
                  key={opt.label}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                    answers[q.id] === opt.score
                      ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={answers[q.id] === opt.score}
                    onChange={() => handleOptionSelect(q.id, opt.score)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className={`text-gray-700 ${answers[q.id] === opt.score ? 'font-semibold' : ''}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Risk Profile Result */}
      {riskProfile && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Your Risk Profile</h2>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 mb-2">Your Risk Appetite:</p>
              <p className={`text-4xl font-bold ${
                riskProfile === "Aggressive" ? "text-red-600" :
                riskProfile === "Moderate" ? "text-yellow-600" :
                "text-green-600"
              }`}>
                {riskProfile}
              </p>
              <p className="text-gray-700 mt-4 text-lg">{riskDescription}</p>
              <div className="mt-4 inline-block bg-gray-100 px-6 py-2 rounded-full">
                <span className="text-sm text-gray-600">Total Score: </span>
                <span className="text-lg font-bold text-emerald-600">{totalScore}/30</span>
              </div>
            </div>

            {/* Recommended Asset Allocation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Recommended Asset Allocation
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{assetAllocation.equity}%</div>
                  <div className="text-sm text-gray-700 mt-1">Equity</div>
                  <div className="text-xs text-gray-500 mt-1">Stocks, Mutual Funds</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{assetAllocation.debt}%</div>
                  <div className="text-sm text-gray-700 mt-1">Debt</div>
                  <div className="text-xs text-gray-500 mt-1">Bonds, Fixed Deposits</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{assetAllocation.gold}%</div>
                  <div className="text-sm text-gray-700 mt-1">Gold</div>
                  <div className="text-xs text-gray-500 mt-1">Gold ETFs, Sovereign Bonds</div>
                </div>
              </div>
            </div>

            {/* Key Recommendations */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Key Recommendations</h3>
              <ul className="space-y-2">
                {riskProfile === "Aggressive" && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Focus on growth-oriented equity investments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Consider sectoral and mid/small cap funds for higher returns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Stay invested for long term (10+ years) to ride out volatility</span>
                    </li>
                  </>
                )}
                {riskProfile === "Moderate" && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Maintain balanced portfolio with mix of equity and debt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Consider hybrid mutual funds for balanced growth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Review and rebalance portfolio annually</span>
                    </li>
                  </>
                )}
                {riskProfile === "Conservative" && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Prioritize capital preservation with stable debt instruments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Consider fixed deposits, bonds, and debt mutual funds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-gray-700">Maintain emergency fund covering 6-12 months expenses</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={resetAnswers}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                🔄 Retake Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button (shown when incomplete) */}
      {!riskProfile && answeredCount > 0 && (
        <div className="flex justify-center">
          <button
            onClick={resetAnswers}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            🔄 Reset Assessment
          </button>
        </div>
      )}
    </div>
  );
}