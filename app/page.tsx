// app/page.tsx
"use client"

import { useState } from "react"
import type { Venue, SimulatedOrder, OrderImpactMetrics } from "@/lib/types"
import { useOrderbookWebSocket } from "@/hooks/use-orderbook-websocket"
import OrderbookChart from "@/components/OrderbookChart"
import OrderbookTable from "@/components/OrderbookTable"
import OrderSimulationForm from "@/components/OrderSimulationForm"
import OrderImpactDisplay from "@/components/OrderImpactDisplay"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle" // Import ThemeToggle

export default function HomePage() {
  const [selectedVenue, setSelectedVenue] = useState<Venue>("Bybit")
  const [simulatedOrder, setSimulatedOrder] = useState<SimulatedOrder | null>(null)
  const [impactMetrics, setImpactMetrics] = useState<OrderImpactMetrics | null>(null)

  const { orderbook, loading, error } = useOrderbookWebSocket(selectedVenue)

  const handleSimulateOrder = (order: SimulatedOrder, metrics: OrderImpactMetrics) => {
    setSimulatedOrder(order)
    setImpactMetrics(metrics)
  }

  const handleClearSimulation = () => {
    setSimulatedOrder(null)
    setImpactMetrics(null)
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-12">
      <header className="max-w-7xl mx-auto mb-12 text-center relative">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-4 leading-tight">
          Real-Time <span className="text-[hsl(var(--primary))]">Orderbook</span> Viewer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Visualize market depth and simulate order impact across multiple venues with live-like data.
        </p>
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Venue Selector */}
        <section className="lg:col-span-2 flex justify-center mb-8">
          <Card className="p-4">
            <Select
              value={selectedVenue}
              onValueChange={(value: Venue) => {
                setSelectedVenue(value)
                handleClearSimulation() // Clear simulation when venue changes
              }}
            >
              <SelectTrigger className="w-[240px] h-12 text-lg font-medium focus-ring">
                <SelectValue placeholder="Select Venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OKX">OKX</SelectItem>
                <SelectItem value="Bybit">Bybit</SelectItem>
                <SelectItem value="Deribit">Deribit</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </section>

        {loading && (
          <>
            {/* Skeletons for Order Simulation Form and Impact Display */}
            <Skeleton className="h-[450px] w-full rounded-xl" />
            <Skeleton className="h-[350px] w-full rounded-xl" />
            {/* Skeletons for Orderbook Table and Chart */}
            <Skeleton className="h-[600px] w-full rounded-xl" />
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </>
        )}

        {error && (
          <Card className="lg:col-span-2 w-full max-w-md mx-auto bg-red-100 border-red-400 text-red-700 shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="font-semibold text-lg mb-2">Error loading orderbook!</p>
              <p>{error}</p>
              <p className="text-sm mt-3">Please try again or select a different venue.</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && orderbook && (
          <>
            {/* Order Simulation Form */}
            <section>
              <OrderSimulationForm
                currentVenue={selectedVenue}
                orderbook={orderbook}
                onSimulateOrder={handleSimulateOrder}
                onClearSimulation={handleClearSimulation}
              />
            </section>

            {/* Order Impact Display */}
            <section>
              <OrderImpactDisplay simulatedOrder={simulatedOrder} impactMetrics={impactMetrics} />
            </section>

            {/* Orderbook Table */}
            <section>
              <OrderbookTable orderbook={orderbook} simulatedOrder={simulatedOrder} />
            </section>

            {/* Orderbook Chart */}
            <section>
              <OrderbookChart orderbook={orderbook} simulatedOrder={simulatedOrder} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
