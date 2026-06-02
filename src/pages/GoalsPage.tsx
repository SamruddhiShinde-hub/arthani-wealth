import React, { useState, useEffect } from "react";
import { storage } from "../utils/storage";

type Goal = {
  id: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  presentValue: number;
  timeHorizon: number;
  inflation: number;
  futureValue: number;
  initialAmount: number;
  monthlyAmount: number;
  yearlyIncrease: number;
  annualReturn: number;
  totalInvestment: number;
  finalCapital: number;
  shortfallSurplus: number;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved goals from storage on mount
  useEffect(() => {
    const savedGoals = storage.get("financialGoals", []);
    console.log("Loading goals:", savedGoals); // Debug log
    setGoals(savedGoals);
    setIsLoaded(true);
  }, []);

  // Persist goals whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log("Saving goals:", goals); // Debug log
      storage.set("financialGoals", goals);
    }
  }, [goals, isLoaded]);

  // Add a new goal
  const addGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      description: "",
      priority: "Medium",
      presentValue: 0,
      timeHorizon: 0,
      inflation: 0,
      futureValue: 0,
      initialAmount: 0,
      monthlyAmount: 0,
      yearlyIncrease: 0,
      annualReturn: 0,
      totalInvestment: 0,
      finalCapital: 0,
      shortfallSurplus: 0,
    };
    //setGoals([...goals, newGoal]);
    setGoals([newGoal, ...goals]);
  };

  // Calculate goal fields
  const calculateGoal = (g: Goal): Partial<Goal> => {
    const { presentValue, timeHorizon, inflation, initialAmount, monthlyAmount, yearlyIncrease, annualReturn } = g;

    // 1️⃣ Future Value (inflation-adjusted)
    const futureValue = presentValue * Math.pow(1 + inflation / 100, timeHorizon);

    // 2️⃣ Final Capital calculation with monthly compounding and yearly increase
    let capital = initialAmount;
    let monthly = monthlyAmount;
    for (let y = 0; y < timeHorizon; y++) {
      for (let m = 0; m < 12; m++) {
        capital = capital * (1 + annualReturn / 100 / 12) + monthly;
      }
      monthly = monthly * (1 + yearlyIncrease / 100);
    }

    // 3️⃣ Total Investment
    let totalInvestment = initialAmount;
    monthly = monthlyAmount;
    for (let y = 0; y < timeHorizon; y++) {
      totalInvestment += monthly * 12;
      monthly = monthly * (1 + yearlyIncrease / 100);
    }

    // 4️⃣ Shortfall/Surplus
    const shortfallSurplus = capital - futureValue;

    return {
      futureValue: Math.round(futureValue),
      finalCapital: Math.round(capital),
      totalInvestment: Math.round(totalInvestment),
      shortfallSurplus: Math.round(shortfallSurplus),
    };
  };

  // Update goal inline fields
  const updateGoal = (id: string, field: keyof Goal, value: string | number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, [field]: value, ...calculateGoal({ ...g, [field]: value }) } : g
      )
    );
  };

  // Delete goal
  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        🎯 Financial Goals
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={addGoal}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          ➕ Add New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No goals added yet</p>
          <p className="text-gray-400 text-sm">Click "Add New Goal" to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col space-y-3 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-center">
                <input
                  className="text-xl font-semibold text-gray-800 border-b border-gray-200 focus:outline-none focus:border-emerald-500 w-2/3"
                  placeholder="Goal description"
                  value={goal.description}
                  onChange={(e) => updateGoal(goal.id, "description", e.target.value)}
                />
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:border-emerald-500"
                  value={goal.priority}
                  onChange={(e) =>
                    updateGoal(goal.id, "priority", e.target.value as Goal["priority"])
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Present Value", "presentValue"],
                  ["Years", "timeHorizon"],
                  ["Inflation (%)", "inflation"],
                  ["Initial Amt", "initialAmount"],
                  ["Monthly Amt", "monthlyAmount"],
                  ["Yearly Inc (%)", "yearlyIncrease"],
                  ["Annual Return (%)", "annualReturn"],
                ].map(([label, field]) => (
                  <div key={field}>
                    <label className="text-gray-500 text-xs">{label}</label>
                    <input
                      type="number"
                      value={(goal as any)[field]}
                      onChange={(e) =>
                        updateGoal(goal.id, field as keyof Goal, parseFloat(e.target.value) || 0)
                      }
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 mt-1 text-gray-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 text-sm space-y-1">
                <p className="flex justify-between">
                  <span className="text-gray-500">Future Value:</span>
                  <span className="font-semibold text-gray-800">
                    Rs. {goal.futureValue.toLocaleString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Total Investment:</span>
                  <span className="font-semibold text-gray-800">
                    Rs. {goal.totalInvestment.toLocaleString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Final Capital:</span>
                  <span className="font-semibold text-gray-800">
                    Rs. {goal.finalCapital.toLocaleString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Shortfall/Surplus:</span>
                  <span
                    className={`font-semibold ${
                      goal.shortfallSurplus >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Rs. {goal.shortfallSurplus.toLocaleString()}
                  </span>
                </p>
              </div>

              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-red-500 text-sm hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg mt-2 self-end transition"
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}