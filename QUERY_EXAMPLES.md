# Logseq Finance Brain - Query Examples

These queries can be used directly in Logseq or are embedded in the Finance Dashboard.

## Dashboard Queries

### Liquid Cash (Checking + Savings)

```clojure
query-table:: false
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
#+END_QUERY
```

### Credit Card Accounts

```clojure
query-table:: true
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
#+END_QUERY
```

### Loan Accounts

```clojure
query-table:: true
query-properties:: [:account-name :balance :interest-rate :minimum-payment :loan-type :institution]
#+BEGIN_QUERY
{:title "Loan Accounts"
 :query [:find (pull ?b [*])
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?account-type]
         [(= ?account-type "loan")]]}
#+END_QUERY
```

### Investment Accounts Summary

```clojure
query-table:: true
query-properties:: [:account-name :total-value :cash-balance :invested-value]
#+BEGIN_QUERY
{:title "Investment Accounts"
 :query [:find (pull ?b [*])
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "investment-account")]]}
#+END_QUERY
```

### Recent Transactions (Last 30 Days)

```clojure
query-table:: true
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
#+END_QUERY
```

## Analysis Queries

### Monthly Expenses by Category

```clojure
query-table:: true
query-properties:: [:category :amount]
#+BEGIN_QUERY
{:title "Expenses by Category (30 days)"
 :query [:find ?category (sum ?amount)
         :in $ ?start-date
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "expense")]
         [(get ?props :date) ?date]
         [(>= ?date ?start-date)]
         [(get ?props :category) ?category]
         [(get ?props :amount) ?amount]]
 :inputs [:30d-before]
 :result-transform (fn [result]
                    (map (fn [[category total]]
                          {:category category
                           :amount total})
                         result))}
#+END_QUERY
```

### Investment Holdings

```clojure
query-table:: true
query-properties:: [:symbol :name :shares :current-value :gain-loss :gain-loss-percent]
#+BEGIN_QUERY
{:title "All Holdings"
 :query [:find (pull ?b [*])
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "holding")]]}
#+END_QUERY
```

### Net Worth Calculation

```clojure
#+BEGIN_QUERY
{:title "Net Worth Components"
 :query [:find ?type (sum ?value)
         :where
         [?b :block/properties ?props]
         (or-join [?props ?type ?value]
           (and [(get ?props :type) "account"]
                [(get ?props :account-type) ?account-type]
                (or [(= ?account-type "checking")]
                    [(= ?account-type "savings")])
                [(identity "assets") ?type]
                [(get ?props :balance) ?value])
           (and [(get ?props :type) "investment-account"]
                [(identity "investments") ?type]
                [(get ?props :total-value) ?value])
           (and [(get ?props :type) "account"]
                [(get ?props :account-type) "credit-card"]
                [(identity "credit-card-debt") ?type]
                [(get ?props :balance) ?value])
           (and [(get ?props :type) "account"]
                [(get ?props :account-type) "loan"]
                [(identity "loans") ?type]
                [(get ?props :balance) ?value]))]
 :result-transform (fn [result]
                    (let [totals (into {} result)
                          assets (or (get totals "assets") 0)
                          investments (or (get totals "investments") 0)
                          credit-debt (or (get totals "credit-card-debt") 0)
                          loans (or (get totals "loans") 0)
                          total-debt (+ credit-debt loans)]
                      {:assets assets
                       :investments investments
                       :credit-card-debt credit-debt
                       :loans loans
                       :total-debt total-debt
                       :net-worth (- (+ assets investments) total-debt)}))}
#+END_QUERY
```

### Available Credit

```clojure
#+BEGIN_QUERY
{:title "Available Credit"
 :query [:find (sum ?available)
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?account-type]
         [(= ?account-type "credit-card")]
         [(get ?props :balance) ?balance]
         [(get ?props :credit-limit) ?limit]
         [(- ?limit ?balance) ?available]]}
#+END_QUERY
```

## Usage Notes

1. **Block Properties**: All financial data is stored as block properties

   - Accounts: `type:: account`, `account-type::`, `balance::`, etc.
   - Transactions: `type:: expense` or `type:: income`, `amount::`, `date::`, etc.
   - Holdings: `type:: holding`, `symbol::`, `shares::`, `current-value::`, etc.
   - Loans: `type:: account`, `account-type:: loan`, `balance::`, `interest-rate::`, `loan-type::`, etc.

2. **Date Formats**: Use ISO date format (YYYY-MM-DD) for date properties

3. **Page References**: Account references use `[[Finance/Accounts/AccountName]]` format

4. **Query Results**:

   - `query-table:: true` displays results as a table
   - `query-properties::` specifies which properties to show in the table
   - `query-sort-by::` and `query-sort-desc::` control sorting

5. **Inputs**: `:30d-before` is a built-in input that provides the date 30 days ago

## Basic Queries

### Get Current Liquid Cash

```clojure
#+BEGIN_QUERY
{:title "💰 Liquid Cash"
 :query [:find (sum ?balance)
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?atype]
         (or [(= ?atype "checking")]
             [(= ?atype "savings")])
         [(get ?props :balance) ?balance]]}
#+END_QUERY
```

### Total Investment Value

```clojure
#+BEGIN_QUERY
{:title "📈 Total Investments"
 :query [:find (sum ?value)
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "investment-account")]
         [(get ?props :total-value) ?value]]}
#+END_QUERY
```

### Net Worth Calculation

```clojure
#+BEGIN_QUERY
{:title "💎 Net Worth"
 :query [:find ?assets ?liabilities ?net-worth
         :keys assets liabilities net-worth
         :where
         ;; Calculate total assets (liquid + investments)
         [(q '[:find (sum ?balance)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               (or [(= ?type "account")]
                   [(= ?type "investment-account")])
               (or [(get ?props :balance) ?balance]
                   [(get ?props :total-value) ?balance])
               [(get ?props :account-type) ?atype]
               [(not= ?atype "credit-card")]
               [(not= ?atype "loan")]]
             $) [[?assets]]]
         ;; Calculate total liabilities (credit card balances + loans)
         [(q '[:find (sum ?balance)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "account")]
               [(get ?props :account-type) ?atype]
               (or [(= ?atype "credit-card")]
                   [(= ?atype "loan")])
               [(get ?props :balance) ?balance]]
             $) [[?liabilities]]]
         ;; Calculate net worth
         [(- ?assets ?liabilities) ?net-worth]]
 :view (fn [rows]
         (let [r (first rows)]
           [:div.net-worth-summary
            [:h3 "Net Worth: $" (format "%.2f" (get r :net-worth))]
            [:p "Assets: $" (format "%.2f" (get r :assets))]
            [:p "Liabilities: $" (format "%.2f" (get r :liabilities))]]))}
#+END_QUERY
```

### Investment Holdings

```clojure
#+BEGIN_QUERY
{:title "🏦 Investment Portfolio"
 :query [:find ?symbol ?name ?shares ?value ?gain-loss ?percentage
         :keys symbol name shares value gain percentage
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "holding")]
         [(get ?props :symbol) ?symbol]
         [(get ?props :name) ?name]
         [(get ?props :shares) ?shares]
         [(get ?props :current-value) ?value]
         [(get ?props :gain-loss) ?gain-loss]
         [(get ?props :percentage) ?percentage]]
 :result-transform (fn [result]
                    (reverse (sort-by :value result)))
 :view (fn [rows]
         [:table
          [:thead
           [:tr
            [:th "Symbol"]
            [:th "Name"]
            [:th "Shares"]
            [:th "Value"]
            [:th "Gain/Loss"]
            [:th "% of Portfolio"]]]
          [:tbody
           (for [r rows]
             [:tr
              [:td (get r :symbol)]
              [:td (get r :name)]
              [:td (get r :shares)]
              [:td (str "$" (format "%.2f" (get r :value)))]
              [:td {:style {:color (if (pos? (get r :gain)) "green" "red")}}
               (str "$" (format "%.2f" (get r :gain)))]
              [:td (str (get r :percentage) "%")]])]])}
#+END_QUERY
```

### Monthly Expenses

```clojure
#+BEGIN_QUERY
{:title "📊 Current Month Expenses"
 :query [:find ?date ?merchant ?amount
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "expense")]
         [(get ?props :date) ?date]
         [(>= ?date "2025-01-01")]
         [(<= ?date "2025-01-31")]
         [(get ?props :merchant) ?merchant]
         [(get ?props :amount) ?amount]]
 :result-transform (fn [result]
                    (sort-by first result))}
#+END_QUERY
```

### Category Breakdown

```clojure
#+BEGIN_QUERY
{:title "🏷️ Spending by Category (Last 30 Days)"
 :query [:find ?category (sum ?amount)
         :keys category total
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "expense")]
         [(get ?props :date) ?date]
         [(get ?props :category) ?category]
         [(get ?props :amount) ?amount]
         ;; Date filter for last 30 days
         [(- (today) 30) ?start-date]
         [(>= ?date ?start-date)]]
 :result-transform (fn [result]
                    (reverse (sort-by :total result)))}
#+END_QUERY
```

### Account Balances Summary

```clojure
#+BEGIN_QUERY
{:title "🏦 All Account Balances"
 :query [:find ?name ?type ?balance ?limit
         :keys account type balance limit
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?ptype]
         (or [(= ?ptype "account")]
             [(= ?ptype "investment-account")])
         [(get ?props :account-name) ?name]
         (or [(get ?props :account-type) ?type]
             [(ground "investment") ?type])
         (or [(get ?props :balance) ?balance]
             [(get ?props :current-balance) ?balance]
             [(get ?props :total-value) ?balance])
         [(get ?props :credit-limit ?limit) ?limit]]
 :view (fn [rows]
         [:table
          [:thead
           [:tr
            [:th "Account"]
            [:th "Type"]
            [:th "Balance"]
            [:th "Available"]]]
          [:tbody
           (for [r rows]
             [:tr
              [:td (get r :account)]
              [:td (get r :type)]
              [:td (str "$" (get r :balance))]
              [:td (if (get r :limit)
                     (str "$" (- (get r :limit) (get r :balance)))
                     "N/A")]])]])}
#+END_QUERY
```

## Advanced Queries

### Asset Allocation

```clojure
#+BEGIN_QUERY
{:title "🎯 Asset Allocation"
 :query [:find ?category (sum ?value)
         :keys category value
         :where
         ;; Define asset categories based on symbols
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "holding")]
         [(get ?props :symbol) ?symbol]
         [(get ?props :current-value) ?value]
         ;; Map symbols to categories (customize as needed)
         [(cond
           (contains? #{"VTI" "VOO" "SPY"} ?symbol) "US Stocks"
           (contains? #{"VXUS" "VEA" "VWO"} ?symbol) "International Stocks"
           (contains? #{"BND" "AGG"} ?symbol) "Bonds"
           (contains? #{"VNQ"} ?symbol) "Real Estate"
           :else "Other") ?category]]
 :result-transform (fn [result]
                    (let [total (reduce + 0 (map :value result))]
                      (map #(assoc % :percentage
                                  (format "%.1f" (* 100 (/ (:value %) total))))
                          result)))}
#+END_QUERY
```

### Calculate Burn Rate (3-Month Average)

```clojure
#+BEGIN_QUERY
{:title "🔥 3-Month Burn Rate"
 :query [:find (avg ?monthly-total)
         :where
         ;; Subquery to get monthly totals
         [(q '[:find ?month (sum ?amount)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "expense")]
               [(get ?props :date) ?date]
               [(get ?props :amount) ?amount]
               ;; Extract month from date
               [(subs ?date 0 7) ?month]]
             $) ?monthly-data]
         [(map second ?monthly-data) ?monthly-totals]
         [(take 3 (reverse (sort ?monthly-totals))) ?last-3-months]
         [(map identity ?last-3-months) ?monthly-total]]}
#+END_QUERY
```

### Cash Flow Analysis

```clojure
#+BEGIN_QUERY
{:title "💸 30-Day Cash Flow"
 :query [:find ?income-total ?expense-total ?net-flow
         :keys income expenses net
         :where
         ;; Get income
         [(q '[:find (sum ?amount)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "income")]
               [(get ?props :date) ?date]
               [(- (today) 30) ?start-date]
               [(>= ?date ?start-date)]
               [(get ?props :amount) ?amount]]
             $) [?income-total]]
         ;; Get expenses
         [(q '[:find (sum ?amount)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "expense")]
               [(get ?props :date) ?date]
               [(- (today) 30) ?start-date]
               [(>= ?date ?start-date)]
               [(get ?props :amount) ?amount]]
             $) [?expense-total]]
         ;; Calculate net
         [(- ?income-total ?expense-total) ?net-flow]]
 :view (fn [rows]
         (let [r (first rows)]
           [:div
            [:p "Income: $" (get r :income)]
            [:p "Expenses: $" (get r :expenses)]
            [:p {:style {:font-weight "bold"
                        :color (if (pos? (get r :net)) "green" "red")}}
             "Net: $" (get r :net)]]))}
#+END_QUERY
```

### Credit Utilization Alert

```clojure
#+BEGIN_QUERY
{:title "⚠️ High Credit Utilization"
 :query [:find ?name ?balance ?limit ?utilization
         :keys account balance limit utilization
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?atype]
         [(= ?atype "credit-card")]
         [(get ?props :account-name) ?name]
         [(get ?props :balance) ?balance]
         [(get ?props :credit-limit) ?limit]
         [(/ ?balance ?limit) ?utilization]
         [(> ?utilization 0.3)]] ; Alert if > 30% utilized
 :result-transform (fn [result]
                    (map #(update % :utilization
                                 (fn [u] (str (int (* u 100)) "%")))
                         result))}
#+END_QUERY
```

### Investment Performance

```clojure
#+BEGIN_QUERY
{:title "📊 Investment Performance"
 :query [:find ?total-invested ?current-value ?total-gain ?roi
         :keys invested current gain roi
         :where
         ;; Get total cost basis
         [(q '[:find (sum ?cost)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "holding")]
               [(get ?props :cost-basis) ?cost]]
             $) [[?total-invested]]]
         ;; Get current value
         [(q '[:find (sum ?value)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "holding")]
               [(get ?props :current-value) ?value]]
             $) [[?current-value]]]
         ;; Calculate gains and ROI
         [(- ?current-value ?total-invested) ?total-gain]
         [(/ ?total-gain ?total-invested) ?roi-decimal]
         [(* 100 ?roi-decimal) ?roi]]
 :view (fn [rows]
         (let [r (first rows)]
           [:div.investment-performance
            [:p "Total Invested: $" (format "%.2f" (get r :invested))]
            [:p "Current Value: $" (format "%.2f" (get r :current))]
            [:p {:style {:color (if (pos? (get r :gain)) "green" "red")}}
             "Total Gain/Loss: $" (format "%.2f" (get r :gain))
             " (" (format "%.1f" (get r :roi)) "%)"]]))}
#+END_QUERY
```

## Usage Tips

1. **Add to Dashboard**: Copy these queries to your `[[Finance/Dashboard]]` page
2. **Customize Dates**: Replace hardcoded dates with dynamic date calculations
3. **Add Filters**: Add more `:where` clauses to filter by specific accounts or categories
4. **Create Views**: Use the `:view` function to create custom visualizations

## Query Building Blocks

### Common Patterns

**Filter by date range:**

```clojure
[(get ?props :date) ?date]
[(>= ?date "2025-01-01")]
[(<= ?date "2025-01-31")]
```

**Get properties from blocks:**

```clojure
[?b :block/properties ?props]
[(get ?props :property-name) ?value]
```

**Aggregate functions:**

- `(sum ?amount)` - Total of all values
- `(count ?item)` - Number of items
- `(avg ?value)` - Average value
- `(min ?value)` - Minimum value
- `(max ?value)` - Maximum value

**Date calculations:**

```clojure
[(today) ?today]
[(- ?today 30) ?thirty-days-ago]
```

### Performance Tips

1. Put most selective clauses first
2. Use indexes when available
3. Limit result sets with date ranges
4. Cache complex calculations in properties

### Total Loan Debt

```clojure
#+BEGIN_QUERY
{:title "🎓 Total Loan Debt"
 :query [:find (sum ?balance)
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?atype]
         [(= ?atype "loan")]
         [(get ?props :balance) ?balance]]}
#+END_QUERY
```

### Loan Details by Type

```clojure
#+BEGIN_QUERY
{:title "📋 Loans by Type"
 :query [:find ?loan-type (sum ?balance) (avg ?rate)
         :keys type total-balance avg-rate
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?atype]
         [(= ?atype "loan")]
         [(get ?props :loan-type) ?loan-type]
         [(get ?props :balance) ?balance]
         [(get ?props :interest-rate) ?rate]]
 :result-transform (fn [result]
                    (map #(update % :avg-rate
                                 (fn [r] (str (format "%.2f" r) "%")))
                         result))}
#+END_QUERY
```

### Total Monthly Debt Payments

```clojure
#+BEGIN_QUERY
{:title "💳 Monthly Debt Payments"
 :query [:find ?type (sum ?payment)
         :keys debt-type monthly-payment
         :where
         [?b :block/properties ?props]
         [(get ?props :type) ?type]
         [(= ?type "account")]
         [(get ?props :account-type) ?atype]
         (or [(= ?atype "credit-card")]
             [(= ?atype "loan")])
         [(get ?props :minimum-payment) ?payment]
         [(cond
           (= ?atype "credit-card") "Credit Cards"
           (= ?atype "loan") "Loans") ?type]]
 :result-transform (fn [result]
                    (conj result
                          {:debt-type "Total"
                           :monthly-payment (reduce + 0 (map :monthly-payment result))}))}
#+END_QUERY
```

### Debt-to-Income Ratio

```clojure
#+BEGIN_QUERY
{:title "📊 Debt-to-Income Ratio"
 :query [:find ?monthly-income ?monthly-debt ?ratio
         :keys income debt-payments ratio
         :where
         ;; Get monthly income
         [(q '[:find (sum ?amount)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "income")]
               [(get ?props :date) ?date]
               [(- (today) 30) ?start-date]
               [(>= ?date ?start-date)]
               [(get ?props :amount) ?amount]]
             $) [[?monthly-income]]]
         ;; Get monthly debt payments
         [(q '[:find (sum ?payment)
               :where
               [?b :block/properties ?props]
               [(get ?props :type) ?type]
               [(= ?type "account")]
               [(get ?props :account-type) ?atype]
               (or [(= ?atype "credit-card")]
                   [(= ?atype "loan")])
               [(get ?props :minimum-payment) ?payment]]
             $) [[?monthly-debt]]]
         ;; Calculate ratio
         [(/ ?monthly-debt ?monthly-income) ?ratio-decimal]
         [(* 100 ?ratio-decimal) ?ratio]]
 :view (fn [rows]
         (let [r (first rows)]
           [:div
            [:p "Monthly Income: $" (format "%.2f" (get r :income))]
            [:p "Monthly Debt Payments: $" (format "%.2f" (get r :debt-payments))]
            [:p {:style {:font-weight "bold"
                        :color (cond
                                 (< (get r :ratio) 28) "green"
                                 (< (get r :ratio) 36) "orange"
                                 :else "red")}}
             "Debt-to-Income Ratio: " (format "%.1f" (get r :ratio)) "%"]]))}
#+END_QUERY
```

## Example Loan Entry

Here's how to create a loan account entry in Logseq:

```markdown
- Student Loan - Federal Direct
  type:: account
  account-type:: loan
  loan-type:: student
  account-name:: Federal Direct Subsidized
  institution:: US Department of Education
  balance:: 25000
  interest-rate:: 4.99
  minimum-payment:: 250
  original-amount:: 30000
  [[Finance/Accounts/Student-Loan-Federal]]
```

```markdown
- Auto Loan - Toyota Financial
  type:: account
  account-type:: loan
  loan-type:: auto
  account-name:: 2022 Camry Loan
  institution:: Toyota Financial Services
  balance:: 18500
  interest-rate:: 3.49
  minimum-payment:: 425
  original-amount:: 25000
  [[Finance/Accounts/Auto-Loan-Toyota]]
```

```markdown
- Personal Loan - SoFi
  type:: account
  account-type:: loan
  loan-type:: personal
  account-name:: Debt Consolidation Loan
  institution:: SoFi
  balance:: 8000
  interest-rate:: 6.99
  minimum-payment:: 200
  original-amount:: 10000
  [[Finance/Accounts/Personal-Loan-SoFi]]
```
