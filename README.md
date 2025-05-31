# Logseq Finance Brain

A minimal Logseq plugin for managing personal finances using your local graph as a database. Track liquid cash, cash flow, burn rate, investments, and net worth without the complexity of traditional finance apps.

## 🎯 Philosophy

- **Local-first**: All data stays in your Logseq graph
- **Minimal complexity**: Focus on essential metrics only
- **Statement-based**: Import monthly statements instead of tracking every transaction
- **Graph-native**: Leverage Logseq's powerful query system

## 📊 Key Features

### Core Metrics

- **Net Worth**: Total assets minus liabilities
- **Liquid Cash**: Total of checking and savings accounts
- **Total Investments**: Track your portfolio value
- **Burn Rate**: Average monthly expenses
- **Cash Flow**: Income minus expenses over time periods
- **Available Credit**: Track credit utilization

### Smart Import

- Import CSV statements from Capital One (and other banks)
- Import investment statements from Robinhood
- Automatic categorization and duplicate detection
- Manual entry fallback for cash transactions

### Investment Tracking

- Track individual holdings (stocks, ETFs, mutual funds)
- Monitor gains/losses and portfolio performance
- Asset allocation analysis
- ROI calculations

### Dashboard View

- Real-time calculations using Datalog queries
- Net worth tracking over time
- Investment portfolio overview
- Monthly/quarterly/yearly views
- Account balance tracking
- Spending trends

## 🏗️ Architecture

The plugin uses Logseq's graph structure to organize financial data:

```
Finance/
├── Dashboard          # Main overview with calculated metrics
├── Accounts/          # Individual account pages
│   ├── Capital One Platinum CC
│   ├── Capital One Savings
│   └── Bank of America Checking
├── Investments/       # Investment accounts
│   └── Robinhood Roth IRA/
│       ├── Overview
│       └── Holdings
└── Statements/        # Monthly statement imports
    └── 2025-01/
        ├── Capital One Platinum
        └── Robinhood Roth IRA
```

### Data Model

Financial data is stored as blocks with properties:

**Account Block:**

```
type:: account
account-name:: Capital One Platinum CC
account-type:: credit-card
balance:: 2100.50
credit-limit:: 3500
```

**Investment Account:**

```
type:: investment-account
account-name:: Robinhood Roth IRA
total-value:: 10000
cash-balance:: 500.00
invested-value:: 9500
```

**Investment Holding:**

```
type:: holding
symbol:: VTI
name:: Vanguard Total Stock Market ETF
shares:: 100
current-value:: 2324
cost-basis:: 9500.00
gain-loss:: 1324
```

**Transaction Block:**

```
type:: expense
date:: 2025-01-15
amount:: 45.99
merchant:: Amazon
category:: Shopping
```

## 🚀 Getting Started

1. Enable Developer mode in Logseq settings
2. Download the latest release or build from source
3. Click "Load unpacked plugin" and select the `dist` folder
4. Click the 💰 icon in the toolbar
5. Run `/Finance: Initialize` to set up the structure

## 📖 Usage

### Importing Statements

1. Export CSV from your bank/broker (Capital One, Robinhood, etc.)
2. Click the Finance icon in toolbar
3. Select "Import Statement" (coming soon)
4. Review and confirm the import

### Quick Entry

Use slash commands for manual entries:

```
/expense 45.99 "Coffee Shop" category:Food
/update-investment "Robinhood Roth IRA" 18250.00
```

### Dashboard

The dashboard automatically updates with:

- Net worth calculation
- Current liquid cash position
- Total investment value
- 3-month average burn rate
- 30-day cash flow
- Credit utilization warnings
- Investment performance metrics

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- Logseq Desktop

### Setup

```bash
# Install dependencies
npm install

# Development mode with watch
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── index.ts          # Main plugin entry point
├── index.html        # HTML entry for Parcel
└── types/            # TypeScript type definitions
    └── logseq.d.ts   # Logseq global types
```

### Testing

Load the plugin in Logseq developer mode:

1. Enable Developer mode in Logseq settings
2. Run `npm run build` to compile the plugin
3. Click "Load unpacked plugin"
4. Select the project root directory (not the dist folder)

## 📝 Implementation Status

### Phase 1: Setup and Basic Structure ✅

- [x] TypeScript conversion
- [x] Build configuration with Parcel
- [x] Basic plugin structure
- [x] Toolbar icon and slash commands
- [x] Finance page structure initialization

### Phase 2: Data Models and Storage 🚧

- [ ] Core data models
- [ ] Block property utilities
- [ ] Query helpers

### Phase 3: Statement Import

- [ ] CSV parser
- [ ] Import UI
- [ ] Block creation from statements

### Phase 4: Dashboard and Analytics

- [ ] Dashboard queries
- [ ] Net worth calculations
- [ ] UI components

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed roadmap.

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Inspired by the simplicity of envelope budgeting
- Built for the Logseq community
- Thanks to all early testers and contributors
