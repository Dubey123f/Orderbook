// components/OrderImpactDisplay.tsx
"use client"

import type React from "react"

import type { OrderImpactMetrics, SimulatedOrder } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge" // Assuming Badge is available from shadcn/ui
import { cn } from "@/lib/utils"

interface OrderImpactDisplayProps {
  simulatedOrder: SimulatedOrder | null
  impactMetrics: OrderImpactMetrics | null
}

export default function OrderImpactDisplay({ simulatedOrder, impactMetrics }: OrderImpactDisplayProps) {
  if (!simulatedOrder || !impactMetrics) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Order Impact</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground">Simulate an order to see its impact metrics.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Order Impact</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        <div className="grid gap-1">
          <p className="text-base font-semibold">Simulated Order Details:</p>
          <p className="text-sm text-muted-foreground">
            Venue: <span className="font-medium text-foreground">{simulatedOrder.venue}</span> | Symbol:{" "}
            <span className="font-medium text-foreground">{simulatedOrder.symbol}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Type: <span className="font-medium text-foreground">{simulatedOrder.orderType}</span> | Side:{" "}
            <Badge
              className={cn(
                "font-semibold",
                simulatedOrder.side === "Buy"
                  ? "bg-[hsl(var(--color-bid))] hover:bg-[hsl(var(--color-bid)_/_0.9)]"
                  : "bg-[hsl(var(--color-ask))] hover:bg-[hsl(var(--color-ask)_/_0.9)]",
              )}
            >
              {simulatedOrder.side}
            </Badge>
          </p>
          {simulatedOrder.price && (
            <p className="text-sm text-muted-foreground">
              Price:{" "}
              <span className="font-medium text-foreground tabular-nums">${simulatedOrder.price.toFixed(2)}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Quantity: <span className="font-medium text-foreground tabular-nums">{simulatedOrder.quantity}</span>
          </p>
        </div>
        <Separator />
        <div className="grid gap-1">
          <p className="text-base font-semibold">Estimated Metrics:</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Fill Percentage:</p>
            <p className="text-base font-bold text-[hsl(var(--color-bid))] tabular-nums">
              {impactMetrics.estimatedFillPercentage}%
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Market Impact:</p>
            <p className="text-base font-bold text-[hsl(var(--color-ask))] tabular-nums">
              {impactMetrics.marketImpact.toFixed(4)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Slippage Estimation:</p>
            <p className="text-base font-bold text-[hsl(var(--color-ask))] tabular-nums">
              {impactMetrics.slippageEstimation.toFixed(4)}
            </p>
          </div>
          {impactMetrics.averageFillPrice && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Average Fill Price:</p>
              <p className="text-base font-bold text-foreground tabular-nums">
                ${impactMetrics.averageFillPrice.toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Time to Fill:</p>
            <p className="text-base font-bold text-foreground">{impactMetrics.timeToFill}</p>
          </div>
        </div>
        {impactMetrics.slippageEstimation > 0.05 && ( // Adjusted warning threshold for better visibility
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-400 text-yellow-800 rounded-md text-sm font-medium flex items-center gap-2 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-300">
            <TriangleAlertIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span>Warning: This order might cause significant slippage!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TriangleAlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
