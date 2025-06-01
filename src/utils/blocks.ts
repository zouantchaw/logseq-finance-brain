/**
 * Utilities for working with Logseq block properties
 */

import {
  Account,
  InvestmentAccount,
  Holding,
  Transaction,
} from "../models/finance";

/**
 * Convert a Logseq block with properties to an Account object
 */
export async function blockToAccount(block: any): Promise<Account | null> {
  const props = block.properties;
  console.log("Block properties:", props);

  if (!props || props.type !== "account") {
    return null;
  }

  // Handle both kebab-case and camelCase property names
  const accountName = props["account-name"] || props.accountName || "";
  const accountType = props["account-type"] || props.accountType;
  const balance = parseFloat(props.balance || "0");
  const institution = props.institution || "";
  const creditLimit = props["credit-limit"] || props.creditLimit;
  const lastUpdated = props["last-updated"] || props.lastUpdated;

  return {
    name: accountName,
    type: accountType as Account["type"],
    balance: balance,
    institution: institution,
    creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
    lastUpdated: new Date(lastUpdated || Date.now()),
  };
}

/**
 * Convert an Account object to Logseq block properties
 */
export function accountToBlockProperties(
  account: Account
): Record<string, any> {
  const props: Record<string, any> = {
    type: "account",
    "account-name": account.name,
    "account-type": account.type,
    balance: account.balance,
    institution: account.institution,
    "last-updated": account.lastUpdated.toISOString().split("T")[0],
  };

  if (account.creditLimit !== undefined) {
    props["credit-limit"] = account.creditLimit;
  }

  return props;
}

/**
 * Convert a Logseq block to an InvestmentAccount object
 */
export async function blockToInvestmentAccount(
  block: any
): Promise<InvestmentAccount | null> {
  const props = block.properties;
  if (!props || props.type !== "investment-account") {
    return null;
  }

  return {
    name: props["account-name"] || "",
    type: props["account-type"] as InvestmentAccount["type"],
    totalValue: parseFloat(props["total-value"] || "0"),
    cashBalance: parseFloat(props["cash-balance"] || "0"),
    investedValue: parseFloat(props["invested-value"] || "0"),
    institution: props.institution || "",
    lastUpdated: new Date(props["last-updated"] || Date.now()),
  };
}

/**
 * Convert an InvestmentAccount to block properties
 */
export function investmentAccountToBlockProperties(
  account: InvestmentAccount
): Record<string, any> {
  return {
    type: "investment-account",
    "account-name": account.name,
    "account-type": account.type,
    "total-value": account.totalValue,
    "cash-balance": account.cashBalance,
    "invested-value": account.investedValue,
    institution: account.institution,
    "last-updated": account.lastUpdated.toISOString().split("T")[0],
  };
}

/**
 * Convert a Logseq block to a Holding object
 */
export async function blockToHolding(block: any): Promise<Holding | null> {
  const props = block.properties;
  if (!props || props.type !== "holding") {
    return null;
  }

  return {
    account: props.account || "",
    symbol: props.symbol || "",
    name: props.name || "",
    shares: parseFloat(props.shares || "0"),
    currentPrice: parseFloat(props["current-price"] || "0"),
    currentValue: parseFloat(props["current-value"] || "0"),
    costBasis: parseFloat(props["cost-basis"] || "0"),
    gainLoss: parseFloat(props["gain-loss"] || "0"),
    gainLossPercent: parseFloat(props["gain-loss-percent"] || "0"),
    percentageOfPortfolio: parseFloat(props.percentage || "0"),
  };
}

/**
 * Convert a Holding to block properties
 */
export function holdingToBlockProperties(
  holding: Holding
): Record<string, any> {
  return {
    type: "holding",
    account: `[[${holding.account}]]`,
    symbol: holding.symbol,
    name: holding.name,
    shares: holding.shares,
    "current-price": holding.currentPrice.toFixed(2),
    "current-value": holding.currentValue.toFixed(2),
    "cost-basis": holding.costBasis.toFixed(2),
    "gain-loss": holding.gainLoss.toFixed(2),
    "gain-loss-percent": holding.gainLossPercent.toFixed(2),
    percentage: holding.percentageOfPortfolio.toFixed(1),
  };
}

/**
 * Convert a block to a Transaction
 */
export async function blockToTransaction(
  block: any
): Promise<Transaction | null> {
  const props = block.properties;
  if (!props || !["expense", "income", "investment"].includes(props.type)) {
    return null;
  }

  return {
    date: new Date(props.date || Date.now()),
    amount: parseFloat(props.amount || "0"),
    merchant: props.merchant || props.source || "",
    category: props.category || "",
    account: props.account || "",
    type: props.type as Transaction["type"],
    description: props.description,
  };
}

/**
 * Convert a Transaction to block properties
 */
export function transactionToBlockProperties(
  transaction: Transaction
): Record<string, any> {
  const props: Record<string, any> = {
    type: transaction.type,
    date: transaction.date.toISOString().split("T")[0],
    amount: transaction.amount.toFixed(2),
    category: transaction.category,
    account: `[[${transaction.account}]]`,
  };

  if (transaction.type === "expense") {
    props.merchant = transaction.merchant;
  } else if (transaction.type === "income") {
    props.source = transaction.merchant;
  }

  if (transaction.description) {
    props.description = transaction.description;
  }

  return props;
}

/**
 * Update block properties
 */
export async function updateBlockProperties(
  blockUuid: string,
  properties: Record<string, any>
): Promise<void> {
  for (const [key, value] of Object.entries(properties)) {
    await logseq.Editor.upsertBlockProperty(blockUuid, key, value);
  }
}

/**
 * Create a new block with properties
 */
export async function createBlockWithProperties(
  parentBlockUuid: string,
  content: string,
  properties: Record<string, any>
): Promise<any> {
  const block = await logseq.Editor.insertBlock(parentBlockUuid, content);
  if (block) {
    await updateBlockProperties(block.uuid, properties);
  }
  return block;
}

/**
 * Get all blocks of a specific type from a page
 */
export async function getBlocksByType(
  pageNameOrUuid: string,
  blockType: string
): Promise<any[]> {
  const blocks = await logseq.Editor.getPageBlocksTree(pageNameOrUuid);
  return filterBlocksByType(blocks, blockType);
}

/**
 * Recursively filter blocks by type property
 */
function filterBlocksByType(blocks: any[], blockType: string): any[] {
  const results: any[] = [];

  for (const block of blocks) {
    if (block.properties?.type === blockType) {
      results.push(block);
    }
    if (block.children?.length > 0) {
      results.push(...filterBlocksByType(block.children, blockType));
    }
  }

  return results;
}
