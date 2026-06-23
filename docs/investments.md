# Investments

Assets you hold (stocks, crypto, funds, bonds, commodities). Each tracks purchase vs current value and a price history sparkline.

## Entity: `Investment`

```ts
type InvestmentType = 'stock' | 'crypto' | 'fund' | 'bond' | 'commodity'

interface Investment {
  id: string
  name: string                       // e.g. "Apple", "Bitcoin"
  type: InvestmentType
  ticker?: string                    // e.g. "AAPL", "BTC" (optional)
  units: number                      // quantity held, > 0
  purchasePrice: number              // price per unit at purchase
  currentPrice: number               // current price per unit
  purchaseDate: string               // ISO date
  currency: 'USD' | 'CRC'
  history: number[]                  // 30-point price history for sparkline (most recent last)
}
```

## Actions

### `createInvestment`

```ts
input: Omit<Investment, 'id'>
response: Investment
```

**Validations**: `name` non-empty, `type` valid enum, `units > 0`, `purchasePrice > 0`, `currentPrice > 0`, `purchaseDate` valid ISO. `history` optional on input (defaults to `[purchasePrice, currentPrice]`).

### `updateInvestment`

```ts
input: { id: string, patch: Partial<Investment> }
response: Investment
```

Editable: all fields except `id`. Used to correct name, ticker, units, or purchase info.

### `deleteInvestment`

```ts
input: { id: string }
response: { success: boolean }
```

### `updateValue`

Custom action — updates the current price of an investment (market price refresh).

```ts
input: { id: string, currentPrice: number }
response: Investment   // with currentPrice updated and history shifted
```

**Validations**: `currentPrice > 0`.

**Behavior**: sets `currentPrice` and appends it to `history` (dropping the oldest point to keep the array at 30 entries). This drives the sparkline chart.

### `listInvestments`

```ts
input: { type?: InvestmentType }     // optional filter
response: Investment[]
```

## Derived fields (computed on read)

| Field | Formula |
|---|---|
| `amountInvested` | `units * purchasePrice` |
| `currentValue` | `units * currentPrice` |
| `returnValue` | `currentValue - amountInvested` |
| `returnPercent` | `returnValue / amountInvested` (0 if invested = 0) |
| `isProfitable` | `returnValue >= 0` |

## Notes for backend

- `history` is an array of ~30 price points for the sparkline visualization. The backend can maintain this as a rolling window: on `updateValue`, append the new price and trim to the last 30. Alternatively, store a separate `PriceHistory` time-series table and query the last 30 on read.
- For real-time price updates, a backend could add a cron/scheduler that fetches external market data and calls `updateValue` automatically. The UI would then just read the updated values.
- `ticker` is optional — some investments (local bonds, commodities) may not have a ticker symbol.
- Currency: most investments are in USD. If a user invests in CRC-denominated assets, the UI converts for display. The backend should preserve the original currency.