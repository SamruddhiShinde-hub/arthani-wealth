import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, RotateCcw } from "lucide-react";
import { storage, getSessionId } from "../utils/storage";
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const history = storage.session.get("chatHistory", []);
    setChatMessages(history);
  }, []);

  // Save chat history whenever it changes
  useEffect(() => {
    storage.session.set("chatHistory", chatMessages);
  }, [chatMessages]);

  // Auto-scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatMessages, chatOpen]);

  const resetConversation = () => {
    if (window.confirm("Are you sure you want to reset the conversation? This will clear all chat history.")) {
      setChatMessages([]);
      storage.session.set("chatHistory", []);
      
      const risk = storage.get("riskProfile");
      const goals = storage.get("financialGoals", []);

      let greeting = "👋 Hi there! I'm your SamruddhiWealth assistant. How can I help you today?";

      if (risk || goals.length > 0) {
        greeting = "👋 Welcome back! ";
        if (risk) {
          greeting += `I see your risk profile is ${risk}. `;
        }
        if (goals.length > 0) {
          greeting += `You're tracking ${goals.length} financial goal${goals.length > 1 ? "s" : ""}. `;
        }
        greeting += "How can I assist you with your financial planning?";
      }

      setChatMessages([
        { type: "bot", text: greeting, time: new Date().toLocaleTimeString() },
      ]);
    }
  };

  const openChat = () => {
    setChatOpen(true);
    if (chatMessages.length === 0) {
      const risk = storage.get("riskProfile");
      const goals = storage.get("financialGoals", []);

      let greeting = "👋 Hi there! I'm your SamruddhiWealth assistant. How can I help you today?";

      if (risk || goals.length > 0) {
        greeting = "👋 Welcome back! ";
        if (risk) {
          greeting += `I see your risk profile is ${risk}. `;
        }
        if (goals.length > 0) {
          greeting += `You're tracking ${goals.length} financial goal${goals.length > 1 ? "s" : ""}. `;
        }
        greeting += "How can I assist you with your financial planning?";
      }

      setChatMessages([
        { type: "bot", text: greeting, time: new Date().toLocaleTimeString() },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      type: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString(),
    };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");

    const loadingMsg = { type: "bot", text: "...", time: "" };
    setChatMessages([...newMessages, loadingMsg]);

    try {
      const sessionId = getSessionId();

      const conversationHistory = newMessages
        .filter(msg => msg.text !== "...")
        .slice(-10)
        .map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text,
        }));
      
      const getMonthlyAmount = (amount: number, frequency: string) => {
        switch (frequency) {
          case "Monthly": return amount;
          case "Quarterly": return amount / 3;
          case "Half-Yearly": return amount / 6;
          case "Yearly": return amount / 12;
          default: return 0;
        }
      };

      // ✅ GATHER INVESTMENTS DATA FIRST (before building financialContext)
      const rawInvestments = storage.get("investments", []);
      const investments = rawInvestments.map((inv: any) => ({
        id: inv.id || "",
        name: inv.name || "Unknown",
        type: inv.type || "SIP",
        amount: inv.amount || 0,
        frequency: inv.frequency || "Monthly",
        category: inv.category || "General",
        startDate: inv.startDate || "",
      }));

      const incomes = storage.get("incomes", []);
      const expenses = storage.get("expenses", []);

      const monthlyIncome = incomes.reduce(
        (sum: number, i: any) => sum + getMonthlyAmount(i.amount || 0, i.frequency),
        0
      );

      // Separate SIP and Lumpsum investments
      const sipInvestments = investments.filter((inv: any) => inv.type === "SIP");
      const lumpsumInvestments = investments.filter((inv: any) => inv.type === "Lumpsum");

      // Calculate SIP monthly commitments excluding EPF (EPF is already deducted from salary)
      const totalMonthlySIP = sipInvestments
        .filter((inv: any) => inv.category !== 'EPF')
        .reduce(
          (sum: number, inv: any) => sum + getMonthlyAmount(inv.amount || 0, inv.frequency),
          0
        );

      // Track EPF separately (informational, doesn't reduce net savings)
      const monthlyEPF = sipInvestments
        .filter((inv: any) => inv.category === 'EPF')
        .reduce(
          (sum: number, inv: any) => sum + getMonthlyAmount(inv.amount || 0, inv.frequency),
          0
        );

      // Calculate Lumpsum totals (actual one-time amounts, NOT monthly)
      const totalLumpsum = lumpsumInvestments.reduce(
        (sum: number, inv: any) => sum + (inv.amount || 0),
        0
      );

      // For ratio calculation, only use recurring SIP investments (exclude EPF)
      const investmentRatio =
        monthlyIncome > 0
          ? Number(((totalMonthlySIP / monthlyIncome) * 100).toFixed(1))
          : 0;

      // NOW build financialContext with all the data
      const financialContext = {
        riskProfile: storage.get("riskProfile"),
        riskProfileAnswers: storage.get("riskProfileAnswers", {}),
        financialClaritySummary: storage.get("financialClaritySummary", null),
        financialClarityAnswers: storage.get("financialClarityAnswers", {}),
        goals: storage.get("financialGoals", []),
        assets: storage.get("assets", []),
        liabilities: storage.get("liabilities", []),
        netWorth: (() => {
          const assets = storage.get("assets", []);
          const liabilities = storage.get("liabilities", []);
          const totalAssets = assets.reduce(
            (sum: number, a: any) => sum + (a.value || 0),
            0,
          );
          const totalLiabilities = liabilities.reduce(
            (sum: number, l: any) => sum + (l.amount || 0),
            0,
          );
          return totalAssets - totalLiabilities;
        })(),
        incomes: incomes,
        expenses: expenses,
        monthlyIncome: monthlyIncome,
        monthlyExpenses: expenses.reduce(
          (sum: number, e: any) => sum + getMonthlyAmount(e.amount || 0, e.frequency),
          0,
        ),
        
        // ⭐ INVESTMENTS DATA
        investments: investments,
        sipInvestments: sipInvestments,
        lumpsumInvestments: lumpsumInvestments,
        investmentInsights: {
          totalMonthlySIP: totalMonthlySIP,
          monthlyEPF: monthlyEPF,
          totalLumpsum: totalLumpsum,
          sipCount: sipInvestments.length,
          lumpsumCount: lumpsumInvestments.length,
          monthlyIncome: monthlyIncome,
          investmentRatio: investmentRatio, // % of income going to SIPs (excluding EPF)
        },
        
        retirementPlan: storage.get("retirementCalculator", {}),
        insurancePlan: (() => {
          const insuranceData = storage.get("insuranceCalculator", {});
          if (Object.keys(insuranceData).length === 0) return {};

          // ✅ PREFERRED: USE PRE-CALCULATED RESULTS FROM INSURANCE PAGE
          // This ensures 100% consistency between Insurance Page display and Chat responses
          if (insuranceData.calculated) {
            return {
              // Step I: Liabilities
              loans: insuranceData.loans || [],
              totalOutstandingLiabilities: insuranceData.calculated.totalOutstandingLiabilities || 0,
              
              // Step II: Goals
              goals: insuranceData.goals || [],
              totalGoalFunding: insuranceData.calculated.totalGoalFunding || 0,
              
              // Step III: Future Expenses
              monthlyExpenses: insuranceData.monthlyExpenses || 0,
              continuingMonthlyIncome: insuranceData.continuingMonthlyIncome || 0,
              netMonthlyExpenses: insuranceData.calculated.netMonthlyExpenses || 0,
              discountingFactor: insuranceData.discountingFactor || 0,
              spouseAge: insuranceData.spouseAge || 0,
              spouseLifeExpectancy: insuranceData.spouseLifeExpectancy || 0,
              remainingLifeOfSpouse: insuranceData.calculated.remainingLifeOfSpouse || 0,
              inflationRate: insuranceData.inflationRate || 6,
              postTaxReturns: insuranceData.postTaxReturns || 8,
              corpusForFutureExpenses: insuranceData.calculated.corpusForFutureExpenses || 0,
              continuingIncomeCorpus: insuranceData.calculated.continuingIncomeCorpus || 0,
              
              // Step IV: Continuing Assets
              liquidInvestments: insuranceData.liquidInvestments || 0,
              realEstateValue: insuranceData.realEstateValue || 0,
              monthlyRentalIncome: insuranceData.monthlyRentalIncome || 0,
              rentalIncomeCorpus: insuranceData.calculated.rentalIncomeCorpus || 0,
              goldValue: insuranceData.goldValue || 0,
              epfBalance: insuranceData.epfBalance || 0,
              otherAssets: insuranceData.otherAssets || 0,
              totalContinuingAssets: insuranceData.calculated.totalContinuingAssets || 0,
              
              // Step V: Existing Insurance
              existingInsurance: insuranceData.existingInsurance || 0,
              
              // ⭐ FINAL RESULTS (exactly as shown on Insurance Page)
              totalFamilyNeeds: insuranceData.calculated.totalFamilyNeeds || 0,
              totalInsuranceRequired: insuranceData.calculated.totalInsuranceRequired || 0,
              additionalCoverRequired: insuranceData.calculated.additionalCoverRequired || 0,
              isFullyCovered: insuranceData.calculated.isFullyCovered || false,
              coverageGapPercent: insuranceData.calculated.coverageGap || "0",
              usingCalculatedResults: true
            };
          }

          // ⚠️ FALLBACK: Recalculate using CORRECT logic matching InsurancePage
          console.warn("⚠️ Using old insurance data format - please visit Insurance page to update");
          
          const loans = insuranceData.loans || [];
          const goals = insuranceData.goals || [];
          const totalOutstandingLiabilities = loans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
          const totalGoalFunding = goals.reduce((sum: number, g: any) => sum + (g.amount || 0), 0);

          const monthlyExpenses = insuranceData.monthlyExpenses || 0;
          const continuingMonthlyIncome = insuranceData.continuingMonthlyIncome || 0;
          const discountingFactor = insuranceData.discountingFactor || 0;
          const spouseAge = insuranceData.spouseAge || 0;
          const spouseLifeExpectancy = insuranceData.spouseLifeExpectancy || 0;
          const inflationRate = insuranceData.inflationRate || 6;
          const postTaxReturns = insuranceData.postTaxReturns || 8;

          // ✅ CORRECTED CALCULATION (matches InsurancePage exactly)
          const netMonthlyExpenses = (monthlyExpenses - continuingMonthlyIncome) * (1 - discountingFactor / 100);
          const currentAnnualExpenses = Math.max(0, netMonthlyExpenses * 12);
          const remainingLifeOfSpouse = spouseLifeExpectancy > spouseAge ? spouseLifeExpectancy - spouseAge : 0;
          const netReturns = ((1 + postTaxReturns / 100) / (1 + inflationRate / 100) - 1) * 100;

          const r = netReturns / 100;
          const n = remainingLifeOfSpouse;
          const corpusForFutureExpenses = (r > 0 && n > 0 && currentAnnualExpenses > 0)
            ? currentAnnualExpenses * ((1 - Math.pow(1 + r, -n)) / r)
            : Math.max(0, currentAnnualExpenses * n);

          const annualContinuingIncome = continuingMonthlyIncome * 12;
          const continuingIncomeCorpus = (r > 0 && n > 0 && annualContinuingIncome > 0)
            ? annualContinuingIncome * ((1 - Math.pow(1 + r, -n)) / r)
            : annualContinuingIncome * n;

          const liquidInvestments = insuranceData.liquidInvestments || 0;
          const realEstateValue = insuranceData.realEstateValue || 0;
          const monthlyRentalIncome = insuranceData.monthlyRentalIncome || 0;
          const goldValue = insuranceData.goldValue || 0;
          const epfBalance = insuranceData.epfBalance || 0;
          const otherAssets = insuranceData.otherAssets || 0;

          const annualRentalIncome = monthlyRentalIncome * 12;
          const rentalIncomeCorpus = (r > 0 && n > 0 && annualRentalIncome > 0)
            ? annualRentalIncome * ((1 - Math.pow(1 + r, -n)) / r)
            : annualRentalIncome * n;

          // ✅ CORRECT: Total continuing assets includes ALL asset types + income streams
          const totalContinuingAssets = 
            liquidInvestments + 
            realEstateValue + 
            goldValue + 
            epfBalance + 
            otherAssets + 
            rentalIncomeCorpus +
            continuingIncomeCorpus;

          const existingInsurance = insuranceData.existingInsurance || 0;

          // ✅ CORRECT FORMULA (same as InsurancePage):
          // Insurance Required = Family Needs - Continuing Assets
          // Additional Cover = Insurance Required - Existing Insurance
          const totalFamilyNeeds = totalOutstandingLiabilities + totalGoalFunding + corpusForFutureExpenses;
          const totalInsuranceRequired = Math.max(0, totalFamilyNeeds - totalContinuingAssets);
          const additionalCoverRequired = Math.max(0, totalInsuranceRequired - existingInsurance);
          const isFullyCovered = additionalCoverRequired === 0;

          return {
            loans,
            totalOutstandingLiabilities,
            goals,
            totalGoalFunding,
            monthlyExpenses,
            continuingMonthlyIncome,
            netMonthlyExpenses,
            discountingFactor,
            spouseAge,
            spouseLifeExpectancy,
            remainingLifeOfSpouse,
            inflationRate,
            postTaxReturns,
            corpusForFutureExpenses,
            continuingIncomeCorpus,
            liquidInvestments,
            realEstateValue,
            monthlyRentalIncome,
            rentalIncomeCorpus,
            goldValue,
            epfBalance,
            otherAssets,
            totalContinuingAssets,
            existingInsurance,
            totalFamilyNeeds,
            totalInsuranceRequired,
            additionalCoverRequired,
            isFullyCovered,
            coverageGapPercent: totalFamilyNeeds > 0
              ? ((additionalCoverRequired / totalFamilyNeeds) * 100).toFixed(1)
              : "0",
            usingCalculatedResults: false,
            needsRefresh: true
          };
        })(),
        summary: {
          hasRiskProfile: !!storage.get("riskProfile"),
          hasClarityAssessment: !!storage.get("financialClaritySummary", null),
          hasInvestments: investments.length > 0,
          goalsCount: storage.get("financialGoals", []).length,
          assetsCount: storage.get("assets", []).length,
          liabilitiesCount: storage.get("liabilities", []).length,
          incomesCount: incomes.length,
          expensesCount: expenses.length,
          investmentsCount: investments.length,
          hasRetirementPlan: Object.keys(storage.get("retirementCalculator", {})).length > 0,
          hasInsurancePlan: Object.keys(storage.get("insuranceCalculator", {})).length > 0,
        },
      };

      console.log("=== Sending to n8n ===");
      console.log("Has Financial Clarity:", !!financialContext.financialClaritySummary);
      if (financialContext.financialClaritySummary) {
        console.log("  Score:", financialContext.financialClaritySummary.percentage + "%");
        console.log("  Level:", financialContext.financialClaritySummary.clarityLevel);
        console.log("  Weak Areas:", financialContext.financialClaritySummary.weakestAreas);
      }
      console.log("Total Investments:", financialContext.investments?.length || 0);
      console.log("  - SIPs:", financialContext.sipInvestments?.length || 0, "| Monthly (excl EPF):", financialContext.investmentInsights?.totalMonthlySIP || 0);
      if (financialContext.investmentInsights?.monthlyEPF > 0) {
        console.log("  - EPF:", financialContext.investmentInsights?.monthlyEPF, "(tracked separately, not deducted from savings)");
      }
      console.log("  - Lumpsum:", financialContext.lumpsumInvestments?.length || 0, "| Total Amount:", financialContext.investmentInsights?.totalLumpsum || 0);
      console.log("Investment Ratio (SIP/Income, excl EPF):", financialContext.investmentInsights?.investmentRatio + "%" || "0%");
      
      if (financialContext.insurancePlan && Object.keys(financialContext.insurancePlan).length > 0 && financialContext.insurancePlan.totalFamilyNeeds !== undefined) {
        console.log("Insurance Plan" + (financialContext.insurancePlan.usingCalculatedResults ? " (from Insurance Page ✓)" : " (recalculated ⚠️)") + ":");
        if (financialContext.insurancePlan.needsRefresh) {
          console.log("  ⚠️ PLEASE VISIT INSURANCE PAGE TO REFRESH DATA");
        }
        console.log("  - Total Family Needs:", financialContext.insurancePlan.totalFamilyNeeds || 0);
        console.log("    • Liabilities:", financialContext.insurancePlan.totalOutstandingLiabilities || 0);
        console.log("    • Goals:", financialContext.insurancePlan.totalGoalFunding || 0);
        console.log("    • Future Expenses Corpus:", financialContext.insurancePlan.corpusForFutureExpenses || 0);
        if (financialContext.insurancePlan.continuingMonthlyIncome > 0) {
          console.log("  - Continuing Income:", financialContext.insurancePlan.continuingMonthlyIncome, "/month");
          console.log("    • Income Corpus (PV):", financialContext.insurancePlan.continuingIncomeCorpus || 0);
        }
        console.log("  - Total Continuing Assets:", financialContext.insurancePlan.totalContinuingAssets || 0);
        console.log("  - Existing Insurance:", financialContext.insurancePlan.existingInsurance || 0);
        console.log("  - Insurance Required:", financialContext.insurancePlan.totalInsuranceRequired || 0);
        console.log("  - Additional Cover Needed:", financialContext.insurancePlan.additionalCoverRequired || 0);
        console.log("  - Fully Covered?", financialContext.insurancePlan.isFullyCovered ? "YES ✓" : "NO");
        console.log("  - Coverage Gap:", financialContext.insurancePlan.coverageGapPercent + "%");
      }
      console.log("====================");

      const response = await fetch(
        "https://salubrious-unmagnifying-latoyia.ngrok-free.dev/webhook/samruddhiwealth-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: chatInput,
            sessionId: sessionId,
            userId: sessionId,
            history: conversationHistory,
            financialData: financialContext,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const botResponse =
        data.reply ||
        data.output ||
        data.response ||
        data.message ||
        data.text ||
        "I couldn't process that. Please try again.";

      const botMsg = {
        type: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString(),
      };

      setChatMessages([...newMessages, botMsg]);
    } catch (error) {
      console.error("Error calling n8n:", error);
      const errorMsg = {
        type: "bot",
        text: "Sorry, I'm having trouble connecting. Please check your internet connection and try again.",
        time: new Date().toLocaleTimeString(),
      };
      setChatMessages([...newMessages, errorMsg]);
    }

    setChatInput("");
  };

  return (
    <>
      {!chatOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <MessageCircle className="text-white" size={28} />
        </button>
      )}

      {chatOpen && (
        <div
          className={`fixed bottom-6 right-1/2 translate-x-1/2 md:right-6 md:translate-x-0 
                ${isMaximized ? "w-[95vw] h-[90vh]" : "w-[90vw] sm:w-96 h-[500px]"}
                bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all duration-300`}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-white" size={20} />
              <span className="text-white font-semibold">
                SamruddhiWealth Assistant
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetConversation}
                className="text-white hover:bg-white/20 rounded-full p-1"
                title="Reset conversation"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="text-white hover:bg-white/20 rounded-full p-1"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8v16H8z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setChatOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.type === "user"
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.type === "user" ? (
                    <p className="text-sm">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${msg.type === "user" ? "text-emerald-100" : "text-gray-500"}`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:shadow-lg transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}