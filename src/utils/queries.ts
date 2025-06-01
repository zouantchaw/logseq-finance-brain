/**
 * Query helpers for Logseq financial data
 */

import {
  FinanceSummary,
  AssetAllocation,
  InvestmentPerformance,
} from "../models/finance";
import { parseAmount, parseDate, getDateRange } from "./converters";

/**
 * Get all blocks with a specific property type
 */
async function getBlocksByType(type: string): Promise<any[]> {
  try {
    // Simple datascript query to find blocks with a specific property type
    const query = `
      [:find (pull ?b [*])
       :where
       [?b :block/properties ?p]
       [(get ?p :type) ?type]
       [(= "${type}" ?type)]]
    `;

    const result = await logseq.DB.datascriptQuery(query);

    if (!result || !Array.isArray(result)) {
      console.log(`No results found for type: ${type}`);
      return [];
    }

    // Extract blocks from result tuples
    return result.map(([block]: [any]) => block).filter(Boolean);
  } catch (error) {
    console.error(`Error getting blocks of type ${type}:`, error);
    return [];
  }
}

/**
 * Get liquid cash (checking + savings)
 */
export async function getLiquidCash(): Promise<number> {
  try {
    const accounts = await getBlocksByType("account");
    let total = 0;

    for (const account of accounts) {
      const accountType = account.properties?.["account-type"];
      const balance = parseFloat(account.properties?.balance || "0");

      if (accountType === "checking" || accountType === "savings") {
        total += balance;
      }
    }

    return total;
  } catch (error) {
    console.error("Error getting liquid cash:", error);
    return 0;
  }
}

/**
 * Get total investments
 */
export async function getTotalInvestments(): Promise<number> {
  try {
    const investmentAccounts = await getBlocksByType("investment-account");
    let total = 0;

    for (const account of investmentAccounts) {
      const totalValue = parseFloat(account.properties?.["total-value"] || "0");
      total += totalValue;
    }

    return total;
  } catch (error) {
    console.error("Error getting total investments:", error);
    return 0;
  }
}

/**
 * Get credit card debt
 */
export async function getCreditCardDebt(): Promise<number> {
  try {
    const accounts = await getBlocksByType("account");
    let total = 0;

    for (const account of accounts) {
      const accountType = account.properties?.["account-type"];
      const balance = parseFloat(account.properties?.balance || "0");

      if (accountType === "credit-card") {
        total += balance;
      }
    }

    return total;
  } catch (error) {
    console.error("Error getting credit card debt:", error);
    return 0;
  }
}

/**
 * Get total loan debt
 */
export async function getLoanDebt(): Promise<number> {
  try {
    const accounts = await getBlocksByType("account");
    let total = 0;

    for (const account of accounts) {
      const accountType = account.properties?.["account-type"];
      const balance = parseFloat(account.properties?.balance || "0");

      if (accountType === "loan") {
        total += balance;
      }
    }

    return total;
  } catch (error) {
    console.error("Error getting loan debt:", error);
    return 0;
  }
}

/**
 * Get all loan accounts with details
 */
export async function getLoanAccounts(): Promise<any[]> {
  try {
    const accounts = await getBlocksByType("account");
    
    return accounts.filter(account => 
      account.properties?.["account-type"] === "loan"
    );
  } catch (error) {
    console.error("Error getting loan accounts:", error);
    return [];
  }
}

/**
 * Get total debt (credit cards + loans)
 */
export async function getTotalDebt(): Promise<number> {
  const [creditCardDebt, loanDebt] = await Promise.all([
    getCreditCardDebt(),
    getLoanDebt()
  ]);
  
  return creditCardDebt + loanDebt;
}

/**
 * Get available credit
 */
export async function getAvailableCredit(): Promise<number> {
  try {
    const accounts = await getBlocksByType("account");
    let totalAvailable = 0;

    for (const account of accounts) {
      const accountType = account.properties?.["account-type"];

      if (accountType === "credit-card") {
        const balance = parseFloat(account.properties?.balance || "0");
        const creditLimit = parseFloat(
          account.properties?.["credit-limit"] || "0"
        );

        if (creditLimit > 0) {
          totalAvailable += creditLimit - balance;
        }
      }
    }

    return totalAvailable;
  } catch (error) {
    console.error("Error getting available credit:", error);
    return 0;
  }
}

/**
 * Calculate net worth
 */
export async function getNetWorth(): Promise<number> {
  const liquidCash = await getLiquidCash();
  const investments = await getTotalInvestments();
  const creditCardDebt = await getCreditCardDebt();
  const loanDebt = await getLoanDebt();

  return liquidCash + investments - creditCardDebt - loanDebt;
}

/**
 * Get expenses from date
 */
export async function getExpensesFromDate(dateStr: string): Promise<number> {
  try {
    const expenses = await getBlocksByType("expense");
    let total = 0;

    for (const expense of expenses) {
      const date = expense.properties?.date;
      const amount = parseFloat(expense.properties?.amount || "0");

      if (date && date >= dateStr) {
        total += amount;
      }
    }

    return total;
  } catch (error) {
    console.error("Error getting expenses:", error);
    return 0;
  }
}

/**
 * Get income from date
 */
export async function getIncomeFromDate(dateStr: string): Promise<number> {
  try {
    const incomes = await getBlocksByType("income");
    let total = 0;

    for (const income of incomes) {
      const date = income.properties?.date;
      const amount = parseFloat(income.properties?.amount || "0");

      if (date && date >= dateStr) {
        total += amount;
      }
    }

    return total;
  } catch (error) {
    console.error("Error getting income:", error);
    return 0;
  }
}

/**
 * Get monthly expenses
 */
export async function getMonthlyExpenses(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  return getExpensesFromDate(dateStr);
}

/**
 * Get monthly income
 */
export async function getMonthlyIncome(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  return getIncomeFromDate(dateStr);
}

/**
 * Get complete financial summary
 */
export async function getFinanceSummary(): Promise<FinanceSummary> {
  console.log("Getting financial summary...");

  try {
    const [
      liquidCash,
      totalInvestments,
      netWorth,
      monthlyExpenses,
      monthlyIncome,
      availableCredit,
      creditCardDebt,
      loanDebt,
    ] = await Promise.all([
      getLiquidCash(),
      getTotalInvestments(),
      getNetWorth(),
      getMonthlyExpenses(),
      getMonthlyIncome(),
      getAvailableCredit(),
      getCreditCardDebt(),
      getLoanDebt(),
    ]);

    const cashFlow = monthlyIncome - monthlyExpenses;
    const monthlyBurnRate = monthlyExpenses;
    const totalDebt = creditCardDebt + loanDebt;

    console.log("Financial summary calculated:", {
      liquidCash,
      totalInvestments,
      netWorth,
      monthlyBurnRate,
      cashFlow,
      availableCredit,
      totalDebt,
      creditCardDebt,
      loanDebt,
    });

    return {
      liquidCash,
      totalInvestments,
      netWorth,
      monthlyBurnRate,
      cashFlow,
      availableCredit,
      totalDebt,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error getting financial summary:", error);
    // Return default values on error
    return {
      liquidCash: 0,
      totalInvestments: 0,
      netWorth: 0,
      monthlyBurnRate: 0,
      cashFlow: 0,
      availableCredit: 0,
      totalDebt: 0,
      lastUpdated: new Date(),
    };
  }
}

/**
 * Get all holdings
 */
export async function getAllHoldings(): Promise<any[]> {
  try {
    return await getBlocksByType("holding");
  } catch (error) {
    console.error("Error getting holdings:", error);
    return [];
  }
}

/**
 * Get asset allocation from holdings
 */
export async function getAssetAllocation(): Promise<AssetAllocation[]> {
  const holdings = await getAllHoldings();
  const categories = new Map<string, number>();
  let totalValue = 0;

  for (const holding of holdings) {
    const value = parseFloat(holding.properties?.["current-value"] || "0");
    const symbol = holding.properties?.symbol || "";
    totalValue += value;

    // Simple categorization based on symbol
    let category = "Other";
    if (["VTI", "VOO", "SPY"].includes(symbol)) {
      category = "US Stocks";
    } else if (["VXUS", "VEA", "VWO"].includes(symbol)) {
      category = "International Stocks";
    } else if (["BND", "AGG"].includes(symbol)) {
      category = "Bonds";
    } else if (["VNQ"].includes(symbol)) {
      category = "Real Estate";
    }

    categories.set(category, (categories.get(category) || 0) + value);
  }

  return Array.from(categories.entries()).map(([category, value]) => ({
    category,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
  }));
}

/**
 * Get spending by category for last 30 days
 */
export async function getSpendingByCategory(): Promise<Map<string, number>> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  try {
    const expenses = await getBlocksByType("expense");
    const categoryTotals = new Map<string, number>();

    for (const expense of expenses) {
      const date = expense.properties?.date;
      const category = expense.properties?.category || "Uncategorized";
      const amount = parseFloat(expense.properties?.amount || "0");

      if (date && date >= dateStr) {
        categoryTotals.set(
          category,
          (categoryTotals.get(category) || 0) + amount
        );
      }
    }

    return categoryTotals;
  } catch (error) {
    console.error("Error getting spending by category:", error);
    return new Map();
  }
}
