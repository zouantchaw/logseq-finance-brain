/**
 * Core financial data models for Logseq Finance Brain
 */

/**
 * Base account interface for all account types
 */
export interface Account {
  name: string;
  type: "checking" | "savings" | "credit-card";
  balance: number;
  institution: string;
  creditLimit?: number;
  lastUpdated: Date;
}

/**
 * Investment account for tracking portfolios
 */
export interface InvestmentAccount {
  name: string;
  type: "brokerage" | "retirement" | "401k" | "roth-ira" | "traditional-ira";
  totalValue: number;
  cashBalance: number;
  investedValue: number;
  institution: string;
  lastUpdated: Date;
}

/**
 * Individual investment holding (stock, ETF, mutual fund)
 */
export interface Holding {
  account: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  percentageOfPortfolio: number;
}

/**
 * Financial transaction (expense, income, investment)
 */
export interface Transaction {
  date: Date;
  amount: number;
  merchant: string;
  category: string;
  account: string;
  type: "expense" | "income" | "investment";
  description?: string;
}

/**
 * Summary of overall financial position
 */
export interface FinanceSummary {
  liquidCash: number;
  totalInvestments: number;
  netWorth: number;
  monthlyBurnRate: number;
  cashFlow: number;
  availableCredit: number;
  totalDebt: number;
  lastUpdated: Date;
}

/**
 * Asset allocation breakdown
 */
export interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
}

/**
 * Investment performance metrics
 */
export interface InvestmentPerformance {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  realizedGains: number;
  unrealizedGains: number;
}
