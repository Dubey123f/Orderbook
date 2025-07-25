# Real-Time Orderbook Viewer with Order Simulation

## 🚀 Project Overview

This project is a **Next.js** application that displays real-time orderbooks for three major crypto exchanges — **OKX**, **Bybit**, and **Deribit**. It includes a feature-rich **Order Simulation Tool** to help users understand where their orders would land in the orderbook, potential market impact, estimated fills, and more.

> 📈 Useful for traders, researchers, and developers wanting deep insight into orderbook dynamics and multi-venue comparisons.

---

## 🧩 Features

### 📊 Multi-Venue Orderbook Display
- Real-time Level 2 orderbook from:
  - [OKX API](https://www.okx.com/docs-v5/)
  - [Bybit API](https://bybit-exchange.github.io/docs/v5/intro)
  - [Deribit API](https://docs.deribit.com/)
- Seamless switching between venues
- Displays top **15 levels** of bids and asks
- Uses **WebSocket** for real-time updates (with fallback polling)

### 🧪 Order Simulation Form
- Venue selector (OKX / Bybit / Deribit)
- Symbol input (e.g., BTC-USD)
- Order type: Market / Limit
- Side: Buy / Sell
- Price (for Limit orders)
- Quantity
- Timing simulation (Immediate / 5s / 10s / 30s Delay)

### 🧠 Simulation Visualization & Metrics
- Visual highlight of order in the book
- Estimations:
  - Fill %
  - Slippage
  - Market impact
  - Time-to-fill (mock logic for demonstration)

### 📱 Responsive Design
- Built with **Tailwind CSS**
- Fully responsive on desktop, tablet, and mobile

### ⚙️ Tech Stack
- **Next.js 14**
- **Tailwind CSS**
- **Recharts** (for charts)
- **React Hook Form** + **Yup** (for form handling and validation)
- WebSocket API integration for real-time updates

---
## 🛠️ Tech Stack
```
| Tool            | Purpose                           |
|-----------------|-----------------------------------|
| Next.js         | React framework with App Router   |
| Tailwind CSS    | Styling                           |
| Recharts        | Orderbook and depth charting      |
| WebSocket       | Live market data                  |
| TypeScript      | Type safety                       |
| React Hook Form | Order simulation form             |
```
---

## 📂 Project Structure

```
.
├── app/ # App router pages
├── components/
│ ├── ui/ # UI components
│ │ ├── OrderbookChart.tsx
│ │ ├── OrderbookTable.tsx
│ │ ├── OrderImpactDisplay.tsx
│ │ ├── OrderSimulationForm.tsx
│ │ ├── theme-provider.tsx
│ │ └── theme-toggle.tsx
├── hooks/
│ ├── use-orderbook-websocket.ts # WebSocket logic per exchange
│ ├── use-mobile.ts # Responsive hook
│ └── use-toast.ts # Toast notifications
├── lib/
│ ├── mock-data.ts # Demo data if API fails
│ ├── types.ts # TypeScript interfaces/types
│ └── utils.ts # Fill %, slippage, etc.
├── styles/ # Tailwind + global CSS
├── public/
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```



---
### Clone the repository

```bash
git clone https://github.com/Dubey123f/Orderbook.git
cd Orderbook
```

## 🔧 Setup Instructions
```
npm install
# or
yarn install

```
## Run the application locally
```
npm run dev

```



