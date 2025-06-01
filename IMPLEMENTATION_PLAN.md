# Logseq Finance Brain - Implementation Plan v0

## Phase 1: Setup and Basic Structure (Week 1) ✅

### 1.1 Project Setup

- [x] Convert existing hello world plugin to TypeScript
- [x] Set up build configuration with proper TypeScript support
- [ ] Configure development environment with hot reload
- [x] Add basic plugin metadata and icons

### 1.2 Core Plugin Structure

```typescript
// index.ts structure
- main(): Plugin initialization ✅
- registerCommands(): Register slash commands ✅
- registerUIElements(): Add toolbar buttons ✅
- setupEventListeners(): Handle Logseq events ✅
```

### 1.3 Page Structure Creation

- [x] Create template for Finance pages hierarchy
- [x] Implement page creation utilities
- [x] Add initialization command to set up Finance structure
- [x] Include Investment pages structure

**Deliverable**: Plugin that creates basic Finance page structure when activated ✅

## Phase 2: Data Models and Storage (Week 2) 🚧

### 2.1 Define TypeScript Interfaces

```typescript
interface Account {
  name: string;
  type: "checking" | "savings" | "credit-card" | "loan";
  balance: number;
  institution: string;
  creditLimit?: number;
  interestRate?: number;
  minimumPayment?: number;
  loanType?: "student" | "auto" | "mortgage" | "personal" | "other";
  originalAmount?: number;
  lastUpdated: Date;
}

interface InvestmentAccount {
  name: string;
  type: "brokerage" | "retirement" | "401k";
  totalValue: number;
  cashBalance: number;
  investedValue: number;
  institution: string;
  lastUpdated: Date;
}

interface Holding {
  account: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  gainLoss: number;
  percentageOfPortfolio: number;
}

interface Transaction {
  date: Date;
  amount: number;
  merchant: string;
  category: string;
  account: string;
  type: "expense" | "income" | "investment";
}

interface FinanceSummary {
  liquidCash: number;
  totalInvestments: number;
  netWorth: number;
  monthlyBurnRate: number;
  cashFlow: number;
  availableCredit: number;
  totalDebt: number;
  creditCardDebt?: number;
  loanDebt?: number;
}
```

### 2.2 Block Property Utilities

- [x] Create helpers to read/write block properties
- [x] Implement property validation
- [x] Add type conversion utilities (string to number, date parsing)
- [x] Handle investment-specific properties

### 2.3 Query Helpers

- [x] Implement basic Datalog query wrapper
- [x] Create query builders for common operations
- [x] Add query result parsing utilities
- [x] Create investment-specific query helpers
- [x] Add loan account query helpers

**Deliverable**: Working data layer with type-safe operations ✅

## Phase 3: Statement Import (Week 3)

### 3.1 CSV Parser

- [ ] Implement CSV parsing for Capital One format
- [ ] Add Robinhood investment statement parser
- [ ] Add format detection and validation
- [ ] Create mapping configuration for different banks/brokers

### 3.2 Import UI

- [ ] Create modal for file selection
- [ ] Add preview of parsed data
- [ ] Implement conflict resolution (duplicates)
- [ ] Support investment transaction types (buy/sell/dividend)

### 3.3 Block Creation

- [ ] Convert CSV rows to Logseq blocks
- [ ] Add proper property formatting
- [ ] Create statement pages with proper hierarchy
- [ ] Create/update holding blocks from investment transactions

**Deliverable**: Working CSV import for both banking and investment statements

## Phase 4: Dashboard and Analytics (Week 4)

### 4.1 Dashboard Page

- [ ] Create dashboard template
- [ ] Implement real-time query execution
- [ ] Add summary statistics display
- [ ] Include net worth widget

### 4.2 Core Calculations

```typescript
// Liquid Cash: Sum of checking + savings balances
const getLiquidCash = async (): Promise<number> => {
  const query = `
    [:find (sum ?balance)
     :where
     [?b :block/properties ?props]
     [(get ?props :type) ?type]
     [(= ?type "account")]
     [(get ?props :account-type) ?atype]
     [(or (= ?atype "checking") (= ?atype "savings"))]
     [(get ?props :balance) ?balance]]
  `;
  return executeQuery(query);
};

// Total Investments: Sum of all investment account values
const getTotalInvestments = async (): Promise<number> => {
  const query = `
    [:find (sum ?value)
     :where
     [?b :block/properties ?props]
     [(get ?props :type) ?type]
     [(= ?type "investment-account")]
     [(get ?props :total-value) ?value]]
  `;
  return executeQuery(query);
};

// Total Loan Debt: Sum of all loan balances
const getLoanDebt = async (): Promise<number> => {
  const query = `
    [:find (sum ?balance)
     :where
     [?b :block/properties ?props]
     [(get ?props :type) ?type]
     [(= ?type "account")]
     [(get ?props :account-type) ?atype]
     [(= ?atype "loan")]
     [(get ?props :balance) ?balance]]
  `;
  return executeQuery(query);
};

// Net Worth: Assets - Liabilities
const getNetWorth = async (): Promise<number> => {
  const liquidCash = await getLiquidCash();
  const investments = await getTotalInvestments();
  const creditCardDebt = await getCreditCardDebt();
  const loanDebt = await getLoanDebt();
  return liquidCash + investments - creditCardDebt - loanDebt;
};

// Asset Allocation
const getAssetAllocation = async (): Promise<AssetAllocation[]> => {
  // Query holdings and calculate percentages
};

// Burn Rate: Average monthly expenses
const getBurnRate = async (months: number = 3): Promise<number> => {
  // Query last N months of expenses
  // Calculate average
};

// Cash Flow: Income - Expenses for period
const getCashFlow = async (startDate: Date, endDate: Date): Promise<number> => {
  // Query income and expenses in date range
  // Return difference
};
```

### 4.3 Dashboard UI Components

- [ ] Summary cards with key metrics
- [ ] Net worth tracking chart (text-based)
- [ ] Asset allocation breakdown
- [ ] Account balance list (including investments)
- [ ] Monthly trend visualization

**Deliverable**: Working dashboard with real-time calculations including net worth and loan tracking ✅

## Phase 5: User Experience (Week 5)

### 5.1 Quick Actions

- [ ] Add slash command for quick expense entry
- [ ] Add command to update investment values
- [ ] Implement keyboard shortcuts
- [ ] Create context menu items

### 5.2 Notifications and Alerts

- [ ] Low balance warnings
- [ ] High burn rate alerts
- [ ] Statement import reminders
- [ ] Portfolio rebalancing suggestions

### 5.3 Settings Panel

- [ ] Currency configuration
- [ ] Category customization
- [ ] Import mappings editor
- [ ] Investment tracking preferences

**Deliverable**: Polished user experience with convenient workflows

## Phase 6: Testing and Documentation (Week 6)

### 6.1 Testing

- [ ] Unit tests for calculations
- [ ] Integration tests for queries
- [ ] Test net worth calculations
- [ ] Manual testing checklist

### 6.2 Documentation

- [ ] User guide with screenshots
- [ ] Query examples for power users
- [ ] Investment tracking guide
- [ ] Troubleshooting guide

### 6.3 Release Preparation

- [ ] Build optimization
- [ ] Error handling improvements
- [ ] Performance profiling

**Deliverable**: Production-ready v0 release

## Technical Implementation Notes

### Query Examples

**Get all expenses for current month:**

```clojure
[:find ?date ?amount ?merchant
 :where
 [?b :block/properties ?props]
 [(get ?props :type) ?type]
 [(= ?type "expense")]
 [(get ?props :date) ?date]
 [(>= ?date "2025-01-01")]
 [(<= ?date "2025-01-31")]
 [(get ?props :amount) ?amount]
 [(get ?props :merchant) ?merchant]]
```

**Get investment holdings:**

```clojure
[:find ?symbol ?shares ?value ?gain-loss
 :where
 [?b :block/properties ?props]
 [(get ?props :type) ?type]
 [(= ?type "holding")]
 [(get ?props :symbol) ?symbol]
 [(get ?props :shares) ?shares]
 [(get ?props :current-value) ?value]
 [(get ?props :gain-loss) ?gain-loss]]
```

**Update account balance:**

```typescript
async function updateAccountBalance(accountName: string, newBalance: number) {
  const page = await logseq.Editor.getPage(`Finance/Accounts/${accountName}`);
  if (page) {
    const blocks = await logseq.Editor.getPageBlocksTree(page.uuid);
    // Find account block and update balance property
  }
}
```

### UI Patterns

**Dashboard Widget with Net Worth:**

```typescript
const DashboardWidget = () => {
  return `
    <div class="finance-summary">
      <div class="metric-card highlight">
        <h3>Net Worth</h3>
        <p class="amount">$${netWorth.toFixed(2)}</p>
        <small>${liquidCash.toFixed(2)} liquid + ${investments.toFixed(
    2
  )} invested</small>
      </div>
      <div class="metric-card">
        <h3>Liquid Cash</h3>
        <p class="amount">$${liquidCash.toFixed(2)}</p>
      </div>
      <div class="metric-card">
        <h3>Total Investments</h3>
        <p class="amount">$${totalInvestments.toFixed(2)}</p>
      </div>
      <div class="metric-card">
        <h3>Monthly Burn Rate</h3>
        <p class="amount">$${burnRate.toFixed(2)}</p>
      </div>
      <div class="metric-card">
        <h3>Cash Flow (30d)</h3>
        <p class="amount ${cashFlow >= 0 ? "positive" : "negative"}">
          $${Math.abs(cashFlow).toFixed(2)}
        </p>
      </div>
    </div>
  `;
};
```

## Success Metrics

1. **Performance**: Dashboard loads in < 500ms
2. **Accuracy**: Calculations match manual spreadsheet within $0.01
3. **Usability**: Import process takes < 2 minutes per statement
4. **Reliability**: No data loss or corruption
5. **Completeness**: Net worth tracking includes all assets and liabilities

## Future Enhancements (Post v0)

- Multi-currency support
- Budget tracking and goals
- Recurring transaction detection
- Export to spreadsheet
- Mobile-friendly views
- Advanced investment analytics (IRR, XIRR)
- Tax lot tracking
- Dividend tracking
- Bill reminders
- Category spending analysis
- Portfolio rebalancing tools
- Investment goal tracking

## Phase 7: Enhanced Features (Added)

### 7.1 Loan Account Tracking ✅

- [x] Add loan account type to data models
- [x] Support multiple loan types (student, auto, mortgage, personal)
- [x] Track interest rates and minimum payments
- [x] Include loans in net worth calculations
- [x] Add debt-to-income ratio calculations
- [x] Create loan-specific query examples

### 7.2 Debt Management Features ✅

- [x] Separate tracking for credit card vs loan debt
- [x] Monthly debt payment calculations
- [x] Total debt aggregation
- [x] Loan balance queries by type

**Deliverable**: Comprehensive debt tracking including loans
