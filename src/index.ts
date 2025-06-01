import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import {
  createBlockWithProperties,
  accountToBlockProperties,
  investmentAccountToBlockProperties,
  transactionToBlockProperties,
  holdingToBlockProperties,
} from "./utils/blocks";
import { Account, InvestmentAccount, Transaction } from "./models/finance";
import { formatCurrency, formatDate } from "./utils/converters";
import { getFinanceSummary } from "./utils/queries";

/**
 * Main entry point for the Logseq Finance Brain plugin
 */
async function main(): Promise<void> {
  console.log("Logseq Finance Brain plugin loaded!");

  // Show welcome message
  logseq.App.showMsg("💰 Logseq Finance Brain plugin initialized!", "success");

  // Register plugin settings
  const settings: SettingSchemaDesc[] = [
    {
      key: "currency",
      type: "string",
      default: "USD",
      title: "Currency",
      description: "Default currency for financial calculations",
    },
    {
      key: "dateFormat",
      type: "string",
      default: "YYYY-MM-DD",
      title: "Date Format",
      description: "Date format for transactions",
    },
  ];

  logseq.useSettingsSchema(settings);

  // Register toolbar icon
  logseq.App.registerUIItem("toolbar", {
    key: "finance-brain",
    template: `
      <a class="button" data-on-click="showFinanceDashboard" title="Finance Brain">
        <i class="ti ti-currency-dollar"></i>
      </a>
    `,
  });

  // Register slash commands
  logseq.Editor.registerSlashCommand("Finance: Initialize", async () => {
    await initializeFinanceStructure();
  });

  logseq.Editor.registerSlashCommand("Finance: Import Statement", async () => {
    logseq.App.showMsg("Statement import coming soon!", "info");
  });

  logseq.Editor.registerSlashCommand("Finance: Add Account", async () => {
    await showAddAccountDialog();
  });

  logseq.Editor.registerSlashCommand(
    "Finance: Add Investment Account",
    async () => {
      await showAddInvestmentAccountDialog();
    }
  );

  logseq.Editor.registerSlashCommand("expense", async () => {
    await showQuickExpenseDialog();
  });

  logseq.Editor.registerSlashCommand("income", async () => {
    await showQuickIncomeDialog();
  });

  logseq.Editor.registerSlashCommand("Finance: Summary", async () => {
    await showFinanceSummary();
  });

  // Register model handlers
  logseq.provideModel({
    showFinanceDashboard: async () => {
      const dashboardPage = await logseq.Editor.getPage("Finance/Dashboard");
      if (dashboardPage && dashboardPage.uuid) {
        await logseq.Editor.openInRightSidebar(dashboardPage.uuid);
        // Update dashboard with latest data
        await updateDashboard();
      } else {
        logseq.App.showMsg(
          "Finance Dashboard not found. Run /Finance: Initialize first",
          "warning"
        );
      }
    },
  });
}

/**
 * Show dialog to add a new account
 */
async function showAddAccountDialog(): Promise<void> {
  // For now, just create a sample account
  // In the future, this would show a modal dialog
  const accountsPage = await logseq.Editor.getPage("Finance/Accounts");
  if (!accountsPage) {
    logseq.App.showMsg(
      "Finance/Accounts page not found. Run /Finance: Initialize first",
      "error"
    );
    return;
  }

  const sampleAccount: Account = {
    name: "New Bank Account",
    type: "checking",
    balance: 1000,
    institution: "Sample Bank",
    lastUpdated: new Date(),
  };

  const accountBlock = await createBlockWithProperties(
    accountsPage.uuid,
    `${sampleAccount.name} - ${formatCurrency(sampleAccount.balance)}`,
    accountToBlockProperties(sampleAccount)
  );

  if (accountBlock) {
    logseq.App.showMsg("✅ Account created successfully!", "success");
  }
}

/**
 * Show dialog to add a new investment account
 */
async function showAddInvestmentAccountDialog(): Promise<void> {
  const investmentsPage = await logseq.Editor.getPage("Finance/Investments");
  if (!investmentsPage) {
    logseq.App.showMsg(
      "Finance/Investments page not found. Run /Finance: Initialize first",
      "error"
    );
    return;
  }

  const sampleAccount: InvestmentAccount = {
    name: "Sample Investment Account",
    type: "brokerage",
    totalValue: 10000,
    cashBalance: 500,
    investedValue: 9500,
    institution: "Sample Broker",
    lastUpdated: new Date(),
  };

  const accountBlock = await createBlockWithProperties(
    investmentsPage.uuid,
    `${sampleAccount.name} - ${formatCurrency(sampleAccount.totalValue)}`,
    investmentAccountToBlockProperties(sampleAccount)
  );

  if (accountBlock) {
    logseq.App.showMsg(
      "✅ Investment account created successfully!",
      "success"
    );
  }
}

/**
 * Show quick expense entry dialog
 */
async function showQuickExpenseDialog(): Promise<void> {
  const currentPage = await logseq.Editor.getCurrentPage();
  if (!currentPage) {
    logseq.App.showMsg("No current page found", "error");
    return;
  }

  const expense: Transaction = {
    date: new Date(),
    amount: 25.99,
    merchant: "Sample Merchant",
    category: "Shopping",
    account: "Finance/Accounts/Capital One Platinum CC",
    type: "expense",
  };

  const currentBlock = await logseq.Editor.getCurrentBlock();
  const parentUuid = currentBlock?.uuid || currentPage.uuid;

  const expenseBlock = await createBlockWithProperties(
    parentUuid,
    `Expense: ${expense.merchant} - ${formatCurrency(expense.amount)}`,
    transactionToBlockProperties(expense)
  );

  if (expenseBlock) {
    logseq.App.showMsg("✅ Expense recorded!", "success");
  }
}

/**
 * Show quick income entry dialog
 */
async function showQuickIncomeDialog(): Promise<void> {
  const currentPage = await logseq.Editor.getCurrentPage();
  if (!currentPage) {
    logseq.App.showMsg("No current page found", "error");
    return;
  }

  const income: Transaction = {
    date: new Date(),
    amount: 5000,
    merchant: "Employer",
    category: "Salary",
    account: "Finance/Accounts/Capital One Savings",
    type: "income",
  };

  const currentBlock = await logseq.Editor.getCurrentBlock();
  const parentUuid = currentBlock?.uuid || currentPage.uuid;

  const incomeBlock = await createBlockWithProperties(
    parentUuid,
    `Income: ${income.merchant} - ${formatCurrency(income.amount)}`,
    transactionToBlockProperties(income)
  );

  if (incomeBlock) {
    logseq.App.showMsg("✅ Income recorded!", "success");
  }
}

/**
 * Show financial summary
 */
async function showFinanceSummary(): Promise<void> {
  try {
    const summary = await getFinanceSummary();
    const currency = logseq.settings?.currency || "USD";

    const message = `
💰 Financial Summary:
• Net Worth: ${formatCurrency(summary.netWorth, currency)}
• Liquid Cash: ${formatCurrency(summary.liquidCash, currency)}
• Investments: ${formatCurrency(summary.totalInvestments, currency)}
• Monthly Burn Rate: ${formatCurrency(summary.monthlyBurnRate, currency)}
• 30-Day Cash Flow: ${formatCurrency(summary.cashFlow, currency)}
• Available Credit: ${formatCurrency(summary.availableCredit, currency)}
    `.trim();

    logseq.App.showMsg(message, "info");
  } catch (error) {
    console.error("Error getting financial summary:", error);
    logseq.App.showMsg("Error calculating financial summary", "error");
  }
}

/**
 * Update dashboard with latest financial data
 */
async function updateDashboard(): Promise<void> {
  try {
    const summary = await getFinanceSummary();
    console.log("Financial summary updated:", summary);
    // TODO: Update dashboard page with latest data
  } catch (error) {
    console.error("Error updating dashboard:", error);
  }
}

/**
 * Initialize the finance page structure
 */
async function initializeFinanceStructure(): Promise<void> {
  try {
    logseq.App.showMsg("Initializing Finance structure...", "info");

    // Check if Finance page already exists
    let financePage = await logseq.Editor.getPage("Finance");

    if (!financePage) {
      // Create main Finance page
      financePage = await logseq.Editor.createPage("Finance", {
        redirect: false,
      });

      if (!financePage) {
        throw new Error("Failed to create Finance page");
      }

      // Add initial content to Finance page
      const firstBlock = await logseq.Editor.insertBlock(
        financePage.uuid,
        "# 💰 Finance Brain",
        {
          isPageBlock: true,
        }
      );

      if (firstBlock) {
        await logseq.Editor.insertBlock(
          firstBlock.uuid,
          "Your personal finance management system powered by Logseq"
        );
      }
    }

    // Create sub-pages
    const subPages = [
      {
        name: "Finance/Dashboard",
        content:
          "# 📊 Finance Dashboard\n\nYour financial overview powered by queries.",
        populate: createDashboardContent,
      },
      {
        name: "Finance/Accounts",
        content: "# 🏦 Accounts\n\nAll your financial accounts.",
        populate: createSampleAccounts,
      },
      {
        name: "Finance/Investments",
        content: "# 📈 Investments\n\nYour investment portfolio.",
        populate: createSampleInvestments,
      },
      {
        name: "Finance/Statements",
        content: "# 📄 Statements\n\nImported statements organized by month.",
        populate: createSampleStatements,
      },
    ];

    let dashboardPageUuid: string | undefined;
    let createdCount = 0;
    let existingCount = 0;

    for (const pageInfo of subPages) {
      // Check if page already exists
      let page = await logseq.Editor.getPage(pageInfo.name);

      if (!page) {
        // Create page if it doesn't exist
        page = await logseq.Editor.createPage(pageInfo.name, {
          redirect: false,
        });

        if (page) {
          createdCount++;
          // Insert content as first block
          const firstBlock = await logseq.Editor.insertBlock(
            page.uuid,
            pageInfo.content,
            {
              isPageBlock: true,
            }
          );

          // Populate with sample data
          if (firstBlock && pageInfo.populate) {
            await pageInfo.populate(firstBlock.uuid);
          }
        }
      } else {
        existingCount++;
      }

      // Store dashboard UUID for later
      if (page && pageInfo.name === "Finance/Dashboard") {
        dashboardPageUuid = page.uuid;
      }
    }

    // Show appropriate message
    if (createdCount > 0) {
      logseq.App.showMsg(
        `✅ Finance structure initialized! Created ${createdCount} pages, ${existingCount} already existed.`,
        "success"
      );
    } else {
      logseq.App.showMsg("✅ Finance structure already exists!", "info");
    }

    // Navigate to the dashboard if we have its UUID
    if (dashboardPageUuid) {
      await logseq.Editor.openInRightSidebar(dashboardPageUuid);
    }
  } catch (error) {
    console.error("Error initializing finance structure:", error);
    logseq.App.showMsg("❌ Failed to initialize Finance structure", "error");
  }
}

/**
 * Create dashboard content with queries
 */
async function createDashboardContent(
  dashboardBlockUuid: string
): Promise<void> {
  // Add liquid cash query
  const liquidCashBlock = await logseq.Editor.insertBlock(
    dashboardBlockUuid,
    "## 💵 Liquid Cash"
  );

  if (liquidCashBlock) {
    await logseq.Editor.insertBlock(
      liquidCashBlock.uuid,
      `query-table:: false
#+BEGIN_QUERY
{:title "Liquid Cash (Checking + Savings)"
 :query [:find (sum ?balance)
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?account-type]
         (or [(= ?account-type "checking")]
             [(= ?account-type "savings")])
         [(get ?props :balance) ?balance]]}
#+END_QUERY`
    );
  }

  // Add credit card debt query
  const debtBlock = await logseq.Editor.insertBlock(
    dashboardBlockUuid,
    "## 💳 Credit Card Debt"
  );

  if (debtBlock) {
    await logseq.Editor.insertBlock(
      debtBlock.uuid,
      `query-table:: true
query-properties:: [:account-name :balance :credit-limit :institution]
#+BEGIN_QUERY
{:title "Credit Card Accounts"
 :query [:find (pull ?b [*])
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?account-type]
         [(= ?account-type "credit-card")]]}
#+END_QUERY`
    );
  }

  // Add investment summary query
  const investmentBlock = await logseq.Editor.insertBlock(
    dashboardBlockUuid,
    "## 📈 Investment Portfolio"
  );

  if (investmentBlock) {
    await logseq.Editor.insertBlock(
      investmentBlock.uuid,
      `query-table:: true
query-properties:: [:account-name :total-value :cash-balance :invested-value]
#+BEGIN_QUERY
{:title "Investment Accounts"
 :query [:find (pull ?b [*])
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "investment-account")]]}
#+END_QUERY`
    );
  }

  // Add recent transactions query
  const transactionsBlock = await logseq.Editor.insertBlock(
    dashboardBlockUuid,
    "## 📝 Recent Transactions"
  );

  if (transactionsBlock) {
    await logseq.Editor.insertBlock(
      transactionsBlock.uuid,
      `query-table:: true
query-properties:: [:date :merchant :amount :category :account]
query-sort-by:: date
query-sort-desc:: true
#+BEGIN_QUERY
{:title "Last 30 Days"
 :query [:find (pull ?b [*])
         :in $ ?start-date
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         (or [(= ?type "expense")]
             [(= ?type "income")])
         [(get ?props :date) ?date]
         [(>= ?date ?start-date)]]
 :inputs [:30d-before]}
#+END_QUERY`
    );
  }
}

/**
 * Create sample accounts with various types
 */
async function createSampleAccounts(accountsPageUuid: string): Promise<void> {
  const sampleAccounts: Account[] = [
    {
      name: "Chase Checking",
      type: "checking",
      balance: 3500.0,
      institution: "Chase Bank",
      lastUpdated: new Date(),
    },
    {
      name: "Capital One Savings",
      type: "savings",
      balance: 12000.0,
      institution: "Capital One",
      lastUpdated: new Date(),
    },
    {
      name: "Chase Freedom CC",
      type: "credit-card",
      balance: 1250.5,
      creditLimit: 5000,
      institution: "Chase Bank",
      lastUpdated: new Date(),
    },
    {
      name: "Capital One Platinum CC",
      type: "credit-card",
      balance: 2100.5,
      creditLimit: 3500,
      institution: "Capital One",
      lastUpdated: new Date(),
    },
  ];

  for (const account of sampleAccounts) {
    const accountType =
      account.type === "credit-card"
        ? "Credit Card"
        : account.type === "checking"
        ? "Checking"
        : "Savings";
    const balance =
      account.type === "credit-card"
        ? `${formatCurrency(account.balance)} / ${formatCurrency(
            account.creditLimit || 0
          )}`
        : formatCurrency(account.balance);

    const content = `${account.name} (${accountType}) - ${balance}`;
    const block = await logseq.Editor.insertBlock(accountsPageUuid, content);

    if (block) {
      const props = accountToBlockProperties(account);
      for (const [key, value] of Object.entries(props)) {
        await logseq.Editor.upsertBlockProperty(block.uuid, key, value);
      }
    }
  }
}

/**
 * Create sample investment accounts and holdings
 */
async function createSampleInvestments(
  investmentsPageUuid: string
): Promise<void> {
  // Create Roth IRA account
  const rothIraBlock = await logseq.Editor.insertBlock(
    investmentsPageUuid,
    "Robinhood Roth IRA - $17,980.28"
  );

  if (rothIraBlock) {
    const accountProps = investmentAccountToBlockProperties({
      name: "Robinhood Roth IRA",
      type: "roth-ira",
      totalValue: 17980.28,
      cashBalance: 480.28,
      investedValue: 17500.0,
      institution: "Robinhood",
      lastUpdated: new Date(),
    });

    for (const [key, value] of Object.entries(accountProps)) {
      await logseq.Editor.upsertBlockProperty(rothIraBlock.uuid, key, value);
    }

    // Add holdings
    const holdings = [
      {
        symbol: "VTI",
        name: "Vanguard Total Stock Market ETF",
        shares: 50,
        price: 220.5,
        basis: 10500,
      },
      {
        symbol: "VXUS",
        name: "Vanguard Total International Stock ETF",
        shares: 80,
        price: 55.25,
        basis: 4200,
      },
      {
        symbol: "BND",
        name: "Vanguard Total Bond Market ETF",
        shares: 30,
        price: 72.0,
        basis: 2200,
      },
    ];

    for (const holding of holdings) {
      const value = holding.shares * holding.price;
      const gainLoss = value - holding.basis;
      const gainLossPercent = (gainLoss / holding.basis) * 100;

      const holdingBlock = await logseq.Editor.insertBlock(
        rothIraBlock.uuid,
        `${holding.symbol} - ${holding.shares} shares @ ${formatCurrency(
          holding.price
        )} = ${formatCurrency(value)}`
      );

      if (holdingBlock) {
        const props = holdingToBlockProperties({
          account: "Finance/Investments/Robinhood Roth IRA",
          symbol: holding.symbol,
          name: holding.name,
          shares: holding.shares,
          currentPrice: holding.price,
          currentValue: value,
          costBasis: holding.basis,
          gainLoss: gainLoss,
          gainLossPercent: gainLossPercent,
          percentageOfPortfolio: (value / 17500) * 100,
        });
        for (const [key, value] of Object.entries(props)) {
          await logseq.Editor.upsertBlockProperty(
            holdingBlock.uuid,
            key,
            value
          );
        }
      }
    }
  }

  // Create Brokerage account
  const brokerageBlock = await logseq.Editor.insertBlock(
    investmentsPageUuid,
    "Fidelity Brokerage - $5,250.00"
  );

  if (brokerageBlock) {
    const accountProps = investmentAccountToBlockProperties({
      name: "Fidelity Brokerage",
      type: "brokerage",
      totalValue: 5250.0,
      cashBalance: 250.0,
      investedValue: 5000.0,
      institution: "Fidelity",
      lastUpdated: new Date(),
    });

    for (const [key, value] of Object.entries(accountProps)) {
      await logseq.Editor.upsertBlockProperty(brokerageBlock.uuid, key, value);
    }
  }
}

/**
 * Create sample statements with transactions
 */
async function createSampleStatements(
  statementsPageUuid: string
): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  // Create current month folder
  const monthBlock = await logseq.Editor.insertBlock(
    statementsPageUuid,
    `## ${currentMonth}`
  );

  if (monthBlock) {
    // Add sample transactions
    const transactions: Transaction[] = [
      {
        date: new Date(),
        amount: 125.5,
        merchant: "Whole Foods",
        category: "Groceries",
        account: "Finance/Accounts/Chase Freedom CC",
        type: "expense",
      },
      {
        date: new Date(Date.now() - 86400000), // Yesterday
        amount: 45.0,
        merchant: "Shell Gas Station",
        category: "Transportation",
        account: "Finance/Accounts/Chase Freedom CC",
        type: "expense",
      },
      {
        date: new Date(Date.now() - 172800000), // 2 days ago
        amount: 3500.0,
        merchant: "Employer Corp",
        category: "Salary",
        account: "Finance/Accounts/Chase Checking",
        type: "income",
      },
      {
        date: new Date(Date.now() - 259200000), // 3 days ago
        amount: 89.99,
        merchant: "Amazon",
        category: "Shopping",
        account: "Finance/Accounts/Capital One Platinum CC",
        type: "expense",
      },
    ];

    for (const transaction of transactions) {
      const icon = transaction.type === "expense" ? "💸" : "💰";
      const content = `${icon} ${transaction.merchant} - ${formatCurrency(
        transaction.amount
      )}`;
      const txBlock = await logseq.Editor.insertBlock(monthBlock.uuid, content);

      if (txBlock) {
        const props = transactionToBlockProperties(transaction);
        for (const [key, value] of Object.entries(props)) {
          await logseq.Editor.upsertBlockProperty(txBlock.uuid, key, value);
        }
      }
    }
  }
}

// Bootstrap the plugin
logseq.ready(main).catch(console.error);
