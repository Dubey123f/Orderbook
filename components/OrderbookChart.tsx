// components/OrderbookChart.tsx
"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import type { OrderBook, SimulatedOrder } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"

interface OrderbookChartProps {
  orderbook: OrderBook
  simulatedOrder?: SimulatedOrder | null
}

export default function OrderbookChart({ orderbook, simulatedOrder }: OrderbookChartProps) {
  const { bids, asks } = orderbook

  // Calculate cumulative quantities for bids (from highest price down)
  let cumulativeBid = 0
  const bidsWithCumulative = bids
    .slice()
    .sort((a, b) => a.price - b.price) // Sort ascending by price for cumulative calculation
    .map((bid) => {
      cumulativeBid += bid.quantity
      return { price: bid.price, bidQuantity: cumulativeBid }
    })

  // Calculate cumulative quantities for asks (from lowest price up)
  let cumulativeAsk = 0
  const asksWithCumulative = asks
    .slice()
    .sort((a, b) => a.price - b.price) // Sort ascending by price for cumulative calculation
    .map((ask) => {
      cumulativeAsk += ask.quantity
      return { price: ask.price, askQuantity: cumulativeAsk }
    })

  // Merge bids and asks into a single array, ensuring all price points are present
  const allPrices = new Set([...bidsWithCumulative.map((d) => d.price), ...asksWithCumulative.map((d) => d.price)])
  const mergedData = Array.from(allPrices)
    .map((price) => {
      const bidData = bidsWithCumulative.find((d) => d.price === price)
      const askData = asksWithCumulative.find((d) => d.price === price)
      return {
        price,
        bidQuantity: bidData ? bidData.bidQuantity : undefined,
        askQuantity: askData ? askData.askQuantity : undefined,
      }
    })
    .sort((a, b) => a.price - b.price)

  // Add simulated order if active and within current price range
  if (simulatedOrder && simulatedOrder.isActive && simulatedOrder.price) {
    const simulatedPrice = simulatedOrder.price
    const simulatedQty = simulatedOrder.quantity

    const newEntry = {
      price: simulatedPrice,
      simulatedQuantity: simulatedQty,
      ...(simulatedOrder.side === "Buy"
        ? { bidQuantity: (mergedData.find((d) => d.price === simulatedPrice)?.bidQuantity || 0) + simulatedQty }
        : { askQuantity: (mergedData.find((d) => d.price === simulatedPrice)?.askQuantity || 0) + simulatedQty }),
    }

    const existingIndex = mergedData.findIndex((d) => d.price === simulatedPrice)
    if (existingIndex !== -1) {
      mergedData[existingIndex] = { ...mergedData[existingIndex], ...newEntry }
    } else {
      mergedData.push(newEntry)
      mergedData.sort((a, b) => a.price - b.price)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Orderbook Depth Chart</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mergedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {/* Gradient for Bids */}
              <linearGradient id="gradientBid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-bid))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--color-bid))" stopOpacity={0.1} />
              </linearGradient>
              {/* Gradient for Asks */}
              <linearGradient id="gradientAsk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-ask))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--color-ask))" stopOpacity={0.1} />
              </linearGradient>
              {/* Gradient for Simulated Order */}
              <linearGradient id="gradientSimulated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-simulated))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--color-simulated))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />{" "}
            {/* Only horizontal grid lines */}
            <XAxis
              dataKey="price"
              type="number"
              domain={["dataMin", "dataMax"]}
              label={{ value: "Price", position: "insideBottom", offset: -5 }}
              tickFormatter={(value) => value.toFixed(2)}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis
              label={{ value: "Cumulative Quantity", angle: -90, position: "insideLeft" }}
              tickFormatter={(value) => value.toFixed(0)}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Price:</div>
                        <div className="font-semibold tabular-nums">{Number(label).toFixed(2)}</div>
                        {payload.map((entry, index) => (
                          <React.Fragment key={index}>
                            <div className="text-muted-foreground">{entry.name}:</div>
                            <div style={{ color: entry.color }} className="font-medium tabular-nums">
                              {Number(entry.value).toFixed(2)}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Area
              type="stepAfter"
              dataKey="bidQuantity"
              stackId="1"
              stroke="hsl(var(--color-bid))" // Green for bids
              fill="url(#gradientBid)" // Use gradient fill
              name="Cumulative Bids"
              isAnimationActive={true} // Enable animation
              animationDuration={500}
              fillOpacity={1}
              strokeWidth={2}
            />
            <Area
              type="stepBefore"
              dataKey="askQuantity"
              stackId="1"
              stroke="hsl(var(--color-ask))" // Red for asks
              fill="url(#gradientAsk)" // Use gradient fill
              name="Cumulative Asks"
              isAnimationActive={true} // Enable animation
              animationDuration={500}
              fillOpacity={1}
              strokeWidth={2}
            />
            {/* Highlight simulated order if it's a distinct level */}
            {simulatedOrder && simulatedOrder.isActive && simulatedOrder.price && (
              <Area
                type="step" // Use step for a clear vertical line at the simulated price
                dataKey="simulatedQuantity"
                stackId="1"
                stroke="hsl(var(--color-simulated))" // Purple for simulated
                fill="url(#gradientSimulated)" // Use gradient fill
                name="Simulated Order"
                isAnimationActive={true} // Enable animation
                animationDuration={500}
                fillOpacity={1}
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
