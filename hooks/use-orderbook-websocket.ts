// hooks/use-orderbook-websocket.ts
"use client"

import { useEffect, useState, useCallback } from "react"
import type { OrderBook, Venue } from "@/lib/types"
import { getInitialMockOrderBook, updateMockOrderBook } from "@/lib/mock-data"

/**
 * Custom hook to simulate a real-time WebSocket connection for orderbook data.
 * In a real application, this would connect to a WebSocket API, likely via a server-side proxy.
 */
export function useOrderbookWebSocket(venue: Venue) {
  const [orderbook, setOrderbook] = useState<OrderBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInitialOrderbook = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let initialData: OrderBook
      let apiUrl: string | null = null

      if (venue === "Bybit") {
        apiUrl = "/api/bybit/orderbook"
      } else if (venue === "Deribit") {
        apiUrl = "/api/deribit/orderbook" // New API route for Deribit
      }

      if (apiUrl) {
        const res = await fetch(apiUrl)
        if (!res.ok) {
          throw new Error(`Failed to fetch ${venue} orderbook: ${res.statusText}`)
        }
        initialData = await res.json()
      } else {
        // For other venues (like OKX, if not using a specific API route), use mock data directly
        initialData = getInitialMockOrderBook(venue)
      }
      setOrderbook(initialData)
    } catch (err: any) {
      console.error("Error fetching initial orderbook:", err)
      setError(err.message || "Failed to load initial orderbook data.")
    } finally {
      setLoading(false)
    }
  }, [venue])

  useEffect(() => {
    fetchInitialOrderbook()

    // Simulate real-time updates via setInterval (mimicking WebSocket pushes from a backend)
    const interval = setInterval(() => {
      setOrderbook((prevOrderbook) => {
        if (!prevOrderbook) return null
        // In a real app, this update would come from a WebSocket event listener
        // e.g., `ws.onmessage = (event) => setOrderbook(parseWebSocketData(event.data));`
        return updateMockOrderBook(prevOrderbook, venue)
      })
    }, 1000) // Update every 1 second

    // Cleanup function for when the component unmounts or venue changes
    return () => {
      clearInterval(interval)
      setOrderbook(null) // Clear orderbook when venue changes or unmounts
    }
  }, [venue, fetchInitialOrderbook]) // Re-run effect when venue or fetch function changes

  return { orderbook, loading, error }
}
