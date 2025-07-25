// components/OrderbookTable.tsx
"use client"

import type { OrderBook, SimulatedOrder } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface OrderbookTableProps {
  orderbook: OrderBook
  simulatedOrder?: SimulatedOrder | null
}

export default function OrderbookTable({ orderbook, simulatedOrder }: OrderbookTableProps) {
  const { bids, asks } = orderbook

  // Sort asks from lowest price to highest for display (top of the table)
  const sortedAsks = asks.slice().sort((a, b) => a.price - b.price)
  // Sort bids from highest price to lowest for display (bottom of the table)
  const sortedBids = bids.slice().sort((a, b) => b.price - a.price)

  // Calculate cumulative quantities for asks (from top down)
  let cumulativeAsk = 0
  const asksWithCumulative = sortedAsks.map((ask) => {
    cumulativeAsk += ask.quantity
    return { ...ask, cumulative: cumulativeAsk }
  })

  // Calculate cumulative quantities for bids (from top down, for their section)
  let cumulativeBid = 0
  const bidsWithCumulative = sortedBids.map((bid) => {
    cumulativeBid += bid.quantity
    return { ...bid, cumulative: cumulativeBid }
  })

  const bestAskPrice = asksWithCumulative[0]?.price || 0
  const bestBidPrice = bidsWithCumulative[0]?.price || 0
  const spread = (bestAskPrice - bestBidPrice).toFixed(2)

  // Determine max quantity for depth bar scaling
  const allQuantities = [...bids.map((b) => b.quantity), ...asks.map((a) => a.quantity)]
  const maxQuantity = Math.max(...allQuantities, 1) // Ensure not zero for division

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Orderbook Levels</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto text-sm">
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="text-right w-1/4">Quantity</TableHead>
                <TableHead className="text-right w-1/4">Cumulative</TableHead>
                <TableHead className="text-center w-1/2">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Asks (displayed from highest price to lowest, so reverse the sorted array) */}
              {asksWithCumulative
                .slice()
                .reverse()
                .map((ask, index) => {
                  const isSimulated =
                    simulatedOrder?.isActive && simulatedOrder.side === "Sell" && simulatedOrder.price === ask.price
                  const depthWidth = (ask.quantity / maxQuantity) * 100
                  return (
                    <TableRow
                      key={`ask-${ask.price}-${index}`}
                      className={cn(
                        "group hover:bg-muted/50 transition-colors duration-150",
                        isSimulated && "font-semibold",
                      )}
                    >
                      <TableCell className="text-right tabular-nums relative overflow-hidden">
                        {/* Depth Bar - now inside TableCell */}
                        <div
                          className={cn(
                            "absolute inset-y-0 right-0 transition-all duration-100",
                            isSimulated
                              ? "bg-[hsl(var(--color-simulated)_/_0.3)] group-hover:bg-[hsl(var(--color-simulated)_/_0.4)]"
                              : "bg-[hsl(var(--color-ask)_/_0.2)] group-hover:bg-[hsl(var(--color-ask)_/_0.3)]",
                          )}
                          style={{ width: `${depthWidth}%` }}
                        />
                        <span className="relative z-10 text-[hsl(var(--color-ask))]">{ask.quantity.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[hsl(var(--color-ask))]">
                        {ask.cumulative.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-center font-medium tabular-nums text-[hsl(var(--color-ask))]",
                          isSimulated && "text-[hsl(var(--color-simulated))]",
                        )}
                      >
                        {ask.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                })}

              {/* Spread Indicator */}
              <TableRow className="bg-gray-100 dark:bg-gray-800 font-bold text-center border-y-2 border-gray-200 dark:border-gray-700">
                <TableCell colSpan={3} className="py-2 text-lg text-gray-800 dark:text-gray-200">
                  Spread: <span className="text-primary-foreground">{spread}</span>
                </TableCell>
              </TableRow>

              {/* Bids */}
              {bidsWithCumulative.map((bid, index) => {
                const isSimulated =
                  simulatedOrder?.isActive && simulatedOrder.side === "Buy" && simulatedOrder.price === bid.price
                const depthWidth = (bid.quantity / maxQuantity) * 100
                return (
                  <TableRow
                    key={`bid-${bid.price}-${index}`}
                    className={cn(
                      "group hover:bg-muted/50 transition-colors duration-150",
                      isSimulated && "font-semibold",
                    )}
                  >
                    <TableCell className="text-right tabular-nums relative overflow-hidden">
                      {/* Depth Bar - now inside TableCell */}
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 transition-all duration-100",
                          isSimulated
                            ? "bg-[hsl(var(--color-simulated)_/_0.3)] group-hover:bg-[hsl(var(--color-simulated)_/_0.4)]"
                            : "bg-[hsl(var(--color-bid)_/_0.2)] group-hover:bg-[hsl(var(--color-bid)_/_0.3)]",
                        )}
                        style={{ width: `${depthWidth}%` }}
                      />
                      <span className="relative z-10 text-[hsl(var(--color-bid))]">{bid.quantity.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[hsl(var(--color-bid))]">
                      {bid.cumulative.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center font-medium tabular-nums text-[hsl(var(--color-bid))]",
                        isSimulated && "text-[hsl(var(--color-simulated))]",
                      )}
                    >
                      {bid.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
