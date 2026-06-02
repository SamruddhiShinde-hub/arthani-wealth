// Calculator utility functions and types

export interface LoanData {
  amount: number;
  rate: number;
  tenure: number;
}

export interface LoanResult {
  EMI: string;
  total: string;
  interest: string;
  principal: number;
  monthlyRate: number;
  totalMonths: number;
}

export interface SIPData {
  monthlyInvestment: number;
  expectedReturn: number;
  tenure: number;
}

export interface SIPResult {
  totalInvested: string;
  estimatedReturns: string;
  totalValue: string;
}

export interface MortgageData {
  loanAmount: number;
  interestRate: number;
  loanTenure: number;
  downPayment: number;
}

export interface MortgageResult {
  monthlyPayment: string;
  totalPayment: string;
  totalInterest: string;
  loanAmount: number;
}

export interface InvestmentData {
  principal: number;
  rate: number;
  time: number;
  compoundFrequency: number; // times per year (1=yearly, 4=quarterly, 12=monthly)
}

export interface InvestmentResult {
  futureValue: string;
  totalInterest: string;
  effectiveRate: string;
}

/**
 * Calculate Loan EMI (Equated Monthly Installment)
 * Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
 * Where P = Principal, R = Monthly Rate, N = Number of months
 */
export const calculateLoanEMI = (data: LoanData): LoanResult => {
  const P = data.amount;
  const r = data.rate / 12 / 100; // Monthly rate
  const n = data.tenure * 12; // Total months
  
  if (r === 0) {
    // If interest rate is 0, simple division
    const EMI = P / n;
    return {
      EMI: EMI.toFixed(2),
      total: P.toFixed(2),
      interest: '0.00',
      principal: P,
      monthlyRate: 0,
      totalMonths: n
    };
  }
  
  const EMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = EMI * n;
  const interest = total - P;
  
  return {
    EMI: EMI.toFixed(2),
    total: total.toFixed(2),
    interest: interest.toFixed(2),
    principal: P,
    monthlyRate: r,
    totalMonths: n
  };
};

/**
 * Calculate SIP (Systematic Investment Plan) returns
 * Formula: FV = P × [(1 + r)^n - 1] / r × (1 + r)
 * Where P = Monthly investment, r = monthly rate, n = number of months
 */
export const calculateSIP = (data: SIPData): SIPResult => {
  const P = data.monthlyInvestment;
  const annualRate = data.expectedReturn / 100;
  const r = annualRate / 12; // Monthly rate
  const n = data.tenure * 12; // Total months
  
  const futureValue = P * (Math.pow(1 + r, n) - 1) / r * (1 + r);
  const totalInvested = P * n;
  const returns = futureValue - totalInvested;
  
  return {
    totalInvested: totalInvested.toFixed(2),
    estimatedReturns: returns.toFixed(2),
    totalValue: futureValue.toFixed(2)
  };
};

/**
 * Calculate Mortgage/Home Loan details
 */
export const calculateMortgage = (data: MortgageData): MortgageResult => {
  const loanAmount = data.loanAmount - data.downPayment;
  const r = data.interestRate / 12 / 100;
  const n = data.loanTenure * 12;
  
  const monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - loanAmount;
  
  return {
    monthlyPayment: monthlyPayment.toFixed(2),
    totalPayment: totalPayment.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    loanAmount: loanAmount
  };
};

/**
 * Calculate compound interest investment
 * Formula: A = P(1 + r/n)^(nt)
 * Where A = Amount, P = Principal, r = rate, n = compound frequency, t = time
 */
export const calculateCompoundInterest = (data: InvestmentData): InvestmentResult => {
  const { principal, rate, time, compoundFrequency } = data;
  const r = rate / 100;
  const n = compoundFrequency;
  const t = time;
  
  const futureValue = principal * Math.pow(1 + r / n, n * t);
  const totalInterest = futureValue - principal;
  const effectiveRate = (Math.pow(1 + r / n, n) - 1) * 100;
  
  return {
    futureValue: futureValue.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    effectiveRate: effectiveRate.toFixed(2)
  };
};

/**
 * Calculate simple interest
 * Formula: SI = (P × R × T) / 100
 */
export const calculateSimpleInterest = (principal: number, rate: number, time: number): number => {
  return (principal * rate * time) / 100;
};

/**
 * Calculate retirement corpus needed
 * Takes into account inflation and expected returns
 */
export const calculateRetirementCorpus = (
  currentAge: number,
  retirementAge: number,
  currentExpenses: number,
  inflationRate: number,
  lifeExpectancy: number
): number => {
  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  
  // Future expenses at retirement
  const futureExpenses = currentExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  
  // Total corpus needed (simplified calculation)
  const corpusNeeded = futureExpenses * retirementYears * 12;
  
  return corpusNeeded;
};

/**
 * Calculate emergency fund requirement
 * Typically 6-12 months of expenses
 */
export const calculateEmergencyFund = (monthlyExpenses: number, monthsOfCoverage: number = 6): number => {
  return monthlyExpenses * monthsOfCoverage;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = '?'): string => {
  return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part: number, whole: number): string => {
  if (whole === 0) return '0.00';
  return ((part / whole) * 100).toFixed(2);
};

/**
 * Calculate loan amortization schedule
 */
export const calculateAmortizationSchedule = (data: LoanData): Array<{
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}> => {
  const result = calculateLoanEMI(data);
  const EMI = parseFloat(result.EMI);
  const monthlyRate = result.monthlyRate;
  let balance = data.amount;
  
  const schedule = [];
  
  for (let month = 1; month <= result.totalMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = EMI - interest;
    balance -= principal;
    
    schedule.push({
      month,
      emi: EMI,
      principal,
      interest,
      balance: Math.max(0, balance) // Ensure balance doesn't go negative due to rounding
    });
  }
  
  return schedule;
};

/**
 * Calculate investment growth over time (year by year)
 */
export const calculateInvestmentGrowth = (
  initialAmount: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number
): Array<{
  year: number;
  invested: number;
  value: number;
  gains: number;
}> => {
  const monthlyRate = annualReturn / 100 / 12;
  const growth = [];
  
  let totalInvested = initialAmount;
  let currentValue = initialAmount;
  
  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
      totalInvested += monthlyContribution;
    }
    
    growth.push({
      year,
      invested: totalInvested,
      value: currentValue,
      gains: currentValue - totalInvested
    });
  }
  
  return growth;
};

// NEW CALCULATORS

export interface StepUpSIPData {
  initialMonthlyInvestment: number;
  expectedReturn: number;
  tenure: number;
  annualStepUp: number; // percentage increase per year
}

export interface StepUpSIPResult {
  totalInvested: string;
  estimatedReturns: string;
  totalValue: string;
  finalMonthlyInvestment: string;
}

/**
 * Calculate Step-up SIP (SIP with annual increment)
 * Step-up SIP allows you to increase your monthly investment by a fixed percentage each year
 */
export const calculateStepUpSIP = (data: StepUpSIPData): StepUpSIPResult => {
  const annualRate = data.expectedReturn / 100;
  const monthlyRate = annualRate / 12;
  const stepUpRate = data.annualStepUp / 100;
  
  let totalInvested = 0;
  let currentValue = 0;
  let monthlyInvestment = data.initialMonthlyInvestment;
  
  for (let year = 1; year <= data.tenure; year++) {
    // Calculate for 12 months with current monthly investment
    for (let month = 1; month <= 12; month++) {
      currentValue = (currentValue + monthlyInvestment) * (1 + monthlyRate);
      totalInvested += monthlyInvestment;
    }
    
    // Increase monthly investment for next year (except last year)
    if (year < data.tenure) {
      monthlyInvestment = monthlyInvestment * (1 + stepUpRate);
    }
  }
  
  const returns = currentValue - totalInvested;
  
  return {
    totalInvested: totalInvested.toFixed(2),
    estimatedReturns: returns.toFixed(2),
    totalValue: currentValue.toFixed(2),
    finalMonthlyInvestment: monthlyInvestment.toFixed(2)
  };
};

export interface PresentValueData {
  futureValue: number;
  discountRate: number; // annual percentage
  timePeriod: number; // years
}

export interface PresentValueResult {
  presentValue: string;
  totalDiscount: string;
  effectiveDiscountRate: string;
}

/**
 * Calculate Present Value from Future Value
 * Formula: PV = FV / (1 + r)^n
 * Where PV = Present Value, FV = Future Value, r = discount rate, n = periods
 */
export const calculatePresentValue = (data: PresentValueData): PresentValueResult => {
  const r = data.discountRate / 100;
  const n = data.timePeriod;
  const FV = data.futureValue;
  
  const PV = FV / Math.pow(1 + r, n);
  const totalDiscount = FV - PV;
  const effectiveRate = (Math.pow(FV / PV, 1 / n) - 1) * 100;
  
  return {
    presentValue: PV.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    effectiveDiscountRate: effectiveRate.toFixed(2)
  };
};

export interface CashFlow {
  date: Date;
  amount: number;
}

export interface XIRRResult {
  xirr: string; // percentage
  totalInvested: string;
  totalReturned: string;
  netGain: string;
}

/**
 * Calculate XIRR (Extended Internal Rate of Return)
 * XIRR considers irregular cash flows with specific dates
 * Uses Newton-Raphson method for calculation
 */
export const calculateXIRR = (cashFlows: CashFlow[]): XIRRResult => {
  if (cashFlows.length < 2) {
    return {
      xirr: '0.00',
      totalInvested: '0.00',
      totalReturned: '0.00',
      netGain: '0.00'
    };
  }

  // Sort cash flows by date
  const sortedFlows = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sortedFlows[0].date;
  
  // Calculate days from first date for each cash flow
  const flows = sortedFlows.map(cf => ({
    days: Math.floor((cf.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)),
    amount: cf.amount
  }));

  // Newton-Raphson method to find XIRR
  let guess = 0.1; // Initial guess: 10%
  const maxIterations = 100;
  const tolerance = 0.000001;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    
    for (const flow of flows) {
      const years = flow.days / 365;
      const factor = Math.pow(1 + guess, years);
      npv += flow.amount / factor;
      dnpv -= flow.amount * years / (factor * (1 + guess));
    }
    
    const newGuess = guess - npv / dnpv;
    
    if (Math.abs(newGuess - guess) < tolerance) {
      guess = newGuess;
      break;
    }
    
    guess = newGuess;
  }
  
  // Calculate totals
  const totalInvested = sortedFlows
    .filter(cf => cf.amount < 0)
    .reduce((sum, cf) => sum + Math.abs(cf.amount), 0);
  
  const totalReturned = sortedFlows
    .filter(cf => cf.amount > 0)
    .reduce((sum, cf) => sum + cf.amount, 0);
  
  const netGain = totalReturned - totalInvested;
  
  return {
    xirr: (guess * 100).toFixed(2),
    totalInvested: totalInvested.toFixed(2),
    totalReturned: totalReturned.toFixed(2),
    netGain: netGain.toFixed(2)
  };
};

/**
 * Calculate IRR (Internal Rate of Return)
 * IRR is XIRR with regular periodic intervals (assumed yearly or as specified)
 */
export const calculateIRR = (cashFlows: number[], periodInYears: number = 1): string => {
  // Convert regular cash flows to dated cash flows
  const today = new Date();
  const datedFlows: CashFlow[] = cashFlows.map((amount, index) => ({
    date: new Date(today.getFullYear() + index * periodInYears, today.getMonth(), today.getDate()),
    amount
  }));
  
  const result = calculateXIRR(datedFlows);
  return result.xirr;
};