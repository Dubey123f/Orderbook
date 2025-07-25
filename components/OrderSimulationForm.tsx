// components/OrderSimulationForm.tsx
"use client"

import { useState, type FormEvent } from "react"
import type { Venue, OrderType, Side, TimingDelay, SimulatedOrder, OrderBook, OrderImpactMetrics } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from "uuid" // For unique ID for simulated order

interface OrderSimulationFormProps {
  currentVenue: Venue
  orderbook: OrderBook | null
  onSimulateOrder: (order: SimulatedOrder, metrics: OrderImpactMetrics) => void
  onClearSimulation: () => void
}

export default function OrderSimulationForm({
  currentVenue,
  orderbook,
  onSimulateOrder,
  onClearSimulation,
}: OrderSimulationFormProps) {
  const [symbol, setSymbol] = useState("BTC-USD")
  const [orderType, setOrderType] = useState<OrderType>("Limit")
  const [side, setSide] = useState<Side>("Buy")
  const [price, setPrice] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [timingDelay, setTimingDelay] = useState<TimingDelay>("immediate")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!symbol.trim()) newErrors.symbol = "Symbol is required."
    if (!quantity || Number.parseFloat(quantity) <= 0) newErrors.quantity = "Quantity must be a positive number."
    if (orderType === "Limit" && (!price || Number.parseFloat(price) <= 0))
      newErrors.price = "Price must be a positive number for limit orders."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateOrderImpact = (simulatedOrder: SimulatedOrder, currentOrderbook: OrderBook): OrderImpactMetrics => {
    let estimatedFillPercentage = 0
    let marketImpact = 0
    let slippageEstimation = 0
    let averageFillPrice: number | undefined

    const { side, orderType, quantity, price: orderPrice } = simulatedOrder
    const targetQuantity = quantity
    let filledQuantity = 0
    let totalCostOrRevenue = 0

    if (orderType === "Limit" && orderPrice) {
      // For limit orders, assume 100% fill if price is competitive
      if (side === "Buy") {
        const bestAsk = currentOrderbook.asks[0]?.price
        if (bestAsk && orderPrice >= bestAsk) {
          estimatedFillPercentage = 100
        } else {
          estimatedFillPercentage = 0 // Order is not immediately fillable
        }
      } else {
        // Sell
        const bestBid = currentOrderbook.bids[0]?.price
        if (bestBid && orderPrice <= bestBid) {
          estimatedFillPercentage = 100
        } else {
          estimatedFillPercentage = 0 // Order is not immediately fillable
        }
      }
      marketImpact = 0 // Limit orders don't cause immediate market impact
      slippageEstimation = 0
      averageFillPrice = orderPrice
    } else if (orderType === "Market") {
      const levelsToConsume = side === "Buy" ? currentOrderbook.asks : currentOrderbook.bids
      const initialBestPrice = levelsToConsume[0]?.price

      for (const level of levelsToConsume) {
        const availableQuantity = level.quantity
        const quantityToTake = Math.min(targetQuantity - filledQuantity, availableQuantity)

        if (quantityToTake > 0) {
          filledQuantity += quantityToTake
          totalCostOrRevenue += quantityToTake * level.price
        }

        if (filledQuantity >= targetQuantity) {
          break
        }
      }

      estimatedFillPercentage = (filledQuantity / targetQuantity) * 100
      averageFillPrice = totalCostOrRevenue / filledQuantity

      if (initialBestPrice && averageFillPrice) {
        slippageEstimation = Math.abs(averageFillPrice - initialBestPrice)
        marketImpact = slippageEstimation // Simplified: market impact is the slippage
      }
    }

    const timeToFill = timingDelay === "immediate" ? "Immediate" : `${timingDelay} delay`

    return {
      estimatedFillPercentage: Number.parseFloat(estimatedFillPercentage.toFixed(2)),
      marketImpact: Number.parseFloat(marketImpact.toFixed(2)),
      slippageEstimation: Number.parseFloat(slippageEstimation.toFixed(2)),
      timeToFill,
      averageFillPrice: averageFillPrice ? Number.parseFloat(averageFillPrice.toFixed(2)) : undefined,
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !orderbook) return

    const simulatedOrder: SimulatedOrder = {
      id: uuidv4(), // Generate a unique ID
      venue: currentVenue,
      symbol,
      orderType,
      side,
      price: orderType === "Limit" ? Number.parseFloat(price) : undefined,
      quantity: Number.parseFloat(quantity),
      timingDelay,
      isActive: false, // Will be set to true after delay
    }

    const delayMs =
      timingDelay === "immediate" ? 0 : timingDelay === "5s" ? 5000 : timingDelay === "10s" ? 10000 : 30000

    // Calculate impact metrics immediately based on current orderbook
    const metrics = calculateOrderImpact(simulatedOrder, orderbook)

    // Trigger the simulation after the specified delay
    setTimeout(() => {
      onSimulateOrder({ ...simulatedOrder, isActive: true }, metrics)
    }, delayMs)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Order Simulation</CardTitle>
        <CardDescription>Simulate an order to see its potential market impact.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2 group">
            <Label htmlFor="venue">Venue</Label>
            <Select value={currentVenue} disabled>
              <SelectTrigger id="venue" className="focus-ring">
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OKX">OKX</SelectItem>
                <SelectItem value="Bybit">Bybit</SelectItem>
                <SelectItem value="Deribit">Deribit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 group">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., BTC-USD"
              className="focus-ring"
            />
            {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 group">
              <Label htmlFor="orderType">Order Type</Label>
              <Select value={orderType} onValueChange={(value: OrderType) => setOrderType(value)}>
                <SelectTrigger id="orderType" className="focus-ring">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 group">
              <Label htmlFor="side">Side</Label>
              <Select value={side} onValueChange={(value: Side) => setSide(value)}>
                <SelectTrigger id="side" className="focus-ring">
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {orderType === "Limit" && (
            <div className="grid gap-2 group">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 65000.00"
                className="focus-ring"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>
          )}

          <div className="grid gap-2 group">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 0.5"
              className="focus-ring"
            />
            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
          </div>

          <div className="grid gap-2 group">
            <Label htmlFor="timing">Timing Simulation</Label>
            <Select value={timingDelay} onValueChange={(value: TimingDelay) => setTimingDelay(value)}>
              <SelectTrigger id="timing" className="focus-ring">
                <SelectValue placeholder="Select delay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="5s">5 seconds delay</SelectItem>
                <SelectItem value="10s">10 seconds delay</SelectItem>
                <SelectItem value="30s">30 seconds delay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]">
            Simulate Order
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClearSimulation}
            className="w-full bg-transparent transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Clear Simulation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
