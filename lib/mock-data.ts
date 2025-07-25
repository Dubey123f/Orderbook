// lib/mock-data.ts
import type { OrderBook, OrderBookEntry, Venue } from "./types"

const generateRandomOrderBook = (basePrice: number, levels: number): OrderBook => {
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  // Generate bids
  for (let i = 0; i < levels; i++) {
    const price = basePrice - i * 0.01 - Math.random() * 0.005
    const quantity = 10 + Math.floor(Math.random() * 90)
    bids.push({ price: Number.parseFloat(price.toFixed(2)), quantity })
  }

  // Generate asks
  for (let i = 0; i < levels; i++) {
    const price = basePrice + i * 0.01 + Math.random() * 0.005
    const quantity = 10 + Math.floor(Math.random() * 90)
    asks.push({ price: Number.parseFloat(price.toFixed(2)), quantity })
  }

  // Sort bids descending by price, asks ascending by price
  bids.sort((a, b) => b.price - a.price)
  asks.sort((a, b) => a.price - b.price)

  return { bids, asks }
}

const initialPrices: Record<Venue, number> = {
  OKX: 65000,
  Bybit: 65005,
  Deribit: 64995,
}

export const getInitialMockOrderBook = (venue: Venue): OrderBook => {
  return generateRandomOrderBook(initialPrices[venue], 15)
}

export const updateMockOrderBook = (currentOrderBook: OrderBook, venue: Venue): OrderBook => {
  const newBids = currentOrderBook.bids.map((bid) => ({
    price: Number.parseFloat((bid.price + (Math.random() - 0.5) * 0.02).toFixed(2)),
    quantity: Math.max(1, bid.quantity + Math.floor((Math.random() - 0.5) * 5)),
  }))
  const newAsks = currentOrderBook.asks.map((ask) => ({
    price: Number.parseFloat((ask.price + (Math.random() - 0.5) * 0.02).toFixed(2)),
    quantity: Math.max(1, ask.quantity + Math.floor((Math.random() - 0.5) * 5)),
  }))

  newBids.sort((a, b) => b.price - a.price)
  newAsks.sort((a, b) => a.price - b.price)

  // Ensure at least 15 levels
  const basePrice = (newBids[0].price + newAsks[0].price) / 2
  return generateRandomOrderBook(basePrice, 15)
}
