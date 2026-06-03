import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, RotateCcw, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { storage, getSessionId } from "../utils/storage";
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice assistant states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const handsFreeTimeoutRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (handsFreeTimeoutRef.current) {
        clearTimeout(handsFreeTimeoutRef.current);
      }
    };
  }, []);

  // Handle auto-send when chatInput changes
  useEffect(() => {
    if (chatInput && (autoSendEnabled || handsFreeMode) && !isListening) {
      const timer = setTimeout(() => {
        sendMessageWithInput(chatInput);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [chatInput, autoSendEnabled, handsFreeMode, isListening]);

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  // Speak text using text-to-speech
  const speak = (text: string) => {
    if (!synthRef.current || !voiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Remove markdown formatting for better speech
    const cleanText = text
      .replace(/[#*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      
      // In hands-free mode, start listening again after bot finishes speaking
      if (handsFreeMode) {
        handsFreeTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && !isListening) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              console.error('Error restarting recognition in hands-free mode:', error);
            }
          }
        }, 1000);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle voice output
  const toggleVoiceOutput = () => {
    if (!voiceEnabled && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Toggle auto-send
  const toggleAutoSend = () => {
    setAutoSendEnabled(!autoSendEnabled);
  };

  // Toggle hands-free mode
  const toggleHandsFreeMode = () => {
    const newHandsFreeMode = !handsFreeMode;
    setHandsFreeMode(newHandsFreeMode);
    
    if (!newHandsFreeMode) {
      // Disable hands-free mode
      if (handsFreeTimeoutRef.current) {
        clearTimeout(handsFreeTimeoutRef.current);
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      setAutoSendEnabled(false);
    } else {
      // Enable hands-free mode (also enables auto-send and voice output)
      setAutoSendEnabled(true);
      setVoiceEnabled(true);
      
      // Start listening immediately
      if (recognitionRef.current && !isListening && !isSpeaking) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error starting hands-free mode:', error);
        }
      }
    }
  };

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
      stopSpeaking();
      if (handsFreeTimeoutRef.current) {
        clearTimeout(handsFreeTimeoutRef.current);
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      setChatMessages([]);
      storage.session.set("chatHistory", []);
      
      const risk = storage.get("riskProfile");
      const goals = storage.get("financialGoals", []);

      let greeting =
        "👋 Hi there! I'm your SamruddhiWealth assistant. How can I help you today?";

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

      const newMessage = { type: "bot", text: greeting, time: new Date().toLocaleTimeString() };
      setChatMessages([newMessage]);
      
      if (voiceEnabled) {
        speak(greeting);
      }
      
      // Resume hands-free mode if it was active
      if (handsFreeMode && !isSpeaking) {
        handsFreeTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && !isListening) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              console.error('Error restarting hands-free after reset:', error);
            }
          }
        }, 2000);
      }
    }
  };

  const openChat = () => {
    setChatOpen(true);
    if (chatMessages.length === 0) {
      const risk = storage.get("riskProfile");
      const goals = storage.get("financialGoals", []);

      let greeting =
        "👋 Hi there! I'm your SamruddhiWealth assistant. How can I help you today?";

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

      const newMessage = { type: "bot", text: greeting, time: new Date().toLocaleTimeString() };
      setChatMessages([newMessage]);
      
      if (voiceEnabled) {
        speak(greeting);
      }
    }
  };

  const sendMessage = async () => {
    const messageToSend = chatInput.trim();
    if (!messageToSend) return;

    await sendMessageWithInput(messageToSend);
  };

  const sendMessageWithInput = async (inputText: string) => {
    if (!inputText.trim()) return;

    stopSpeaking();

    const userMsg = {
      type: "user",
      text: inputText,
      time: new Date().toLocaleTimeString(),
    };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");

    const loadingMsg = { type: "bot", text: "...", time: "" };
    setChatMessages([...newMessages, loadingMsg]);

    try {
      const sessionId = getSessionId();

      const conversationHistory = chatMessages.slice(-10).map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const financialContext = {
        riskProfile: storage.get("riskProfile"),
        riskProfileAnswers: storage.get("riskProfileAnswers", {}),
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
        incomes: storage.get("incomes", []),
        expenses: storage.get("expenses", []),
        monthlyIncome: (() => {
          const incomes = storage.get("incomes", []);
          const getMonthlyAmount = (amount: number, frequency: string) => {
            switch (frequency) {
              case "Monthly":
                return amount;
              case "Quarterly":
                return amount / 3;
              case "Yearly":
                return amount / 12;
              default:
                return 0;
            }
          };
          return incomes.reduce(
            (sum: number, i: any) =>
              sum + getMonthlyAmount(i.amount || 0, i.frequency),
            0,
          );
        })(),
        monthlyExpenses: (() => {
          const expenses = storage.get("expenses", []);
          const getMonthlyAmount = (amount: number, frequency: string) => {
            switch (frequency) {
              case "Monthly":
                return amount;
              case "Quarterly":
                return amount / 3;
              case "Yearly":
                return amount / 12;
              default:
                return 0;
            }
          };
          return expenses.reduce(
            (sum: number, e: any) =>
              sum + getMonthlyAmount(e.amount || 0, e.frequency),
            0,
          );
        })(),
        retirementPlan: storage.get("retirementCalculator", {}),
        insurancePlan: (() => {
          const insuranceData = storage.get("insuranceCalculator", {});
          if (Object.keys(insuranceData).length === 0) return {};

          const loans = insuranceData.loans || [];
          const goals = insuranceData.goals || [];
          const totalLoans = loans.reduce(
            (sum: number, l: any) => sum + (l.amount || 0),
            0,
          );
          const totalGoals = goals.reduce(
            (sum: number, g: any) => sum + (g.amount || 0),
            0,
          );

          const monthlyExpenses = insuranceData.monthlyExpenses || 0;
          const discountingFactor = insuranceData.discountingFactor || 0;
          const netMonthlyExpenses =
            monthlyExpenses * (1 - discountingFactor / 100);
          const currentAnnualExpenses = netMonthlyExpenses * 12;
          const spouseAge = insuranceData.spouseAge || 0;
          const spouseLifeExpectancy = insuranceData.spouseLifeExpectancy || 0;
          const remainingLife = spouseLifeExpectancy - spouseAge;
          const inflationRate = insuranceData.inflationRate || 0;
          const postTaxReturns = insuranceData.postTaxReturns || 0;
          const netReturns =
            ((1 + postTaxReturns / 100) / (1 + inflationRate / 100) - 1) * 100;
          const r = netReturns / 100;
          const n = remainingLife > 0 ? remainingLife : 0;
          const corpusForFutureExpenses =
            r > 0 && n > 0
              ? currentAnnualExpenses * ((1 - Math.pow(1 + r, -n)) / r)
              : currentAnnualExpenses * n;

          const totalInsuranceRequired =
            totalLoans + totalGoals + corpusForFutureExpenses;
          const investmentAssets = insuranceData.investmentAssets || 0;
          const existingInsurance = insuranceData.existingInsurance || 0;
          const totalResourcesAvailable = investmentAssets + existingInsurance;
          const additionalCoverRequired = Math.max(
            0,
            totalInsuranceRequired - totalResourcesAvailable,
          );
          const coverageGapPercent =
            totalInsuranceRequired > 0
              ? ((additionalCoverRequired / totalInsuranceRequired) * 100).toFixed(1)
              : "0";

          return {
            loans,
            goals,
            monthlyExpenses,
            spouseAge,
            spouseLifeExpectancy,
            corpusForFutureExpenses,
            totalInsuranceRequired,
            totalResourcesAvailable,
            additionalCoverRequired,
            coverageGapPercent,
          };
        })(),
        summary: {
          hasRiskProfile: !!storage.get("riskProfile"),
          goalsCount: storage.get("financialGoals", []).length,
          assetsCount: storage.get("assets", []).length,
          liabilitiesCount: storage.get("liabilities", []).length,
          incomesCount: storage.get("incomes", []).length,
          expensesCount: storage.get("expenses", []).length,
          hasRetirementPlan:
            Object.keys(storage.get("retirementCalculator", {})).length > 0,
          hasInsurancePlan:
            Object.keys(storage.get("insuranceCalculator", {})).length > 0,
        },
      };

      const response = await fetch(
        "https://salubrious-unmagnifying-latoyia.ngrok-free.dev/webhook/samruddhiwealth-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: inputText,
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
      
      if (voiceEnabled) {
        speak(botResponse);
      }
    } catch (error) {
      console.error("Error calling n8n:", error);
      const errorMsg = {
        type: "bot",
        text: "Sorry, I'm having trouble connecting. Please check your internet connection and try again.",
        time: new Date().toLocaleTimeString(),
      };
      setChatMessages([...newMessages, errorMsg]);
      
      if (voiceEnabled) {
        speak(errorMsg.text);
      }
    }
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
                onClick={toggleHandsFreeMode}
                className={`text-white hover:bg-white/20 rounded-full p-1 transition-all ${handsFreeMode ? 'bg-white/30 ring-2 ring-white' : ''}`}
                title={handsFreeMode ? "Disable hands-free mode" : "Enable hands-free mode"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              </button>

              <button
                onClick={toggleAutoSend}
                disabled={handsFreeMode}
                className={`text-white hover:bg-white/20 rounded-full p-1 transition-all ${autoSendEnabled ? 'bg-white/30' : ''} ${handsFreeMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={autoSendEnabled ? "Disable auto-send" : "Enable auto-send"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>

              <button
                onClick={toggleVoiceOutput}
                className={`text-white hover:bg-white/20 rounded-full p-1 ${!voiceEnabled ? 'opacity-50' : ''}`}
                title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 8h16M4 16h16"
                    />
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 4h8v16H8z"
                    />
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
            {handsFreeMode && (
              <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-700 font-medium">
                  Hands-free mode active
                </span>
              </div>
            )}
            
            {autoSendEnabled && !handsFreeMode && (
              <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                <span className="text-sm text-blue-700 font-medium">
                  Auto-send enabled
                </span>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={toggleVoiceInput}
                disabled={isSpeaking || handsFreeMode}
                className={`px-3 py-2 rounded-full transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : handsFreeMode
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={
                  handsFreeMode
                    ? "Disabled in hands-free mode"
                    : isListening
                    ? "Stop listening"
                    : "Start voice input"
                }
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={
                  handsFreeMode
                    ? "Hands-free mode active..."
                    : isListening
                    ? "Listening..."
                    : "Ask me anything..."
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-emerald-500"
                disabled={isListening || handsFreeMode}
              />

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-3 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all"
                  title="Stop speaking"
                >
                  <VolumeX size={20} />
                </button>
              )}

              <button
                onClick={sendMessage}
                disabled={isListening || isSpeaking || handsFreeMode}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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