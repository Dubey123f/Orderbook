// lib/types.ts
export type Venue = "OKX" | "Bybit" | "Deribit"
export type OrderType = "Market" | "Limit"
export type Side = "Buy" | "Sell"
export type TimingDelay = "immediate" | "5s" | "10s" | "30s"

export interface OrderBookEntry {
  price: number
  quantity: number
}

export interface OrderBook {
  bids: OrderBookEntry[] // Sorted descending by price
  asks: OrderBookEntry[] // Sorted ascending by price
}

export interface SimulatedOrder {
  venue: Venue
  symbol: string
  orderType: OrderType
  side: Side
  price?: number // Required for Limit orders
  quantity: number
  timingDelay: TimingDelay
  isActive: boolean // To control visibility after delay
  id: string // Unique ID for the simulated order
}

export interface OrderImpactMetrics {
  estimatedFillPercentage: number
  marketImpact: number // Price change due to order
  slippageEstimation: number // Difference between expected and actual fill price
  timeToFill: string // Based on timingDelay
  averageFillPrice?: number // For market orders
}

// For tabular display
export interface OrderBookRow {
  bidPrice?: number
  bidQuantity?: number
  bidCumulative?: number
  askPrice?: number
  askQuantity?: number
  askCumulative?: number
  isSimulatedBid?: boolean
  isSimulatedAsk?: boolean
}
