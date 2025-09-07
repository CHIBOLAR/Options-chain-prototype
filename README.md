# 📈 NSE Options Chain Trading Platform

A comprehensive options trading platform prototype that simulates the complete NSE options trading experience. Built with vanilla HTML, CSS, and JavaScript - no frameworks needed!

## 🚀 Live Demo

**GitHub Pages**: [https://chibolar.github.io/Options-chain-prototype/](https://chibolar.github.io/Options-chain-prototype/)

## 🎯 Perfect Trading Flow

**Exactly like real options trading:** Select Underlying → Choose Expiry → Pick Strike → Buy Contract → Pay Premium

## ✨ Features

### 🎯 Options Chain Display
- Real-time NSE options data simulation
- Strike price analysis with Greeks (Delta, Gamma, Theta, Vega)
- ITM/OTM/ATM filtering and sorting
- Professional dark theme interface

### 📋 Order Management System
- **Advanced Order Types**: Market, Limit, Stop Loss, Bracket Orders, Cover Orders, GTT, OCO
- **Order Tracking**: Real-time status updates (Pending/Executed/Cancelled)
- **Order Actions**: Modify, cancel, and view order details
- **Risk Analysis**: Live margin calculation and breakeven analysis

### 💼 Position Management
- **Live P&L Tracking**: Real-time profit/loss calculations
- **Greeks Monitoring**: Position-level risk metrics
- **Square-off**: One-click position closing
- **Portfolio Summary**: Total P&L, day P&L, margin utilization

### 📊 Portfolio Analytics
- **Portfolio Overview**: Complete portfolio value tracking
- **Risk Metrics**: Portfolio Greeks and exposure analysis
- **Holdings Management**: Detailed holdings with performance metrics
- **Exposure Charts**: Visual representation of portfolio distribution

### 📈 Trading History
- **Complete Audit Trail**: All trades with P&L tracking
- **Advanced Filtering**: Date range, symbol-based filters
- **Export Functionality**: Download trading records
- **Performance Analysis**: Trade-by-trade P&L breakdown

## 🛠️ Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Professional dark theme with CSS Grid/Flexbox
- **Mathematical Models**: Black-Scholes option pricing
- **Data Simulation**: Real-time market data simulation
- **Responsive Design**: Mobile-optimized interface

## 🎮 How to Use

1. **Browse Options Chain**: Select symbol (NIFTY/BANKNIFTY) and expiry
2. **Place Orders**: Click on option prices to open trading modal
3. **Manage Positions**: Monitor live P&L in the Positions tab
4. **Track Performance**: View complete trading history and analytics
5. **Risk Management**: Use advanced order types for automated risk control

## 📱 Supported Instruments

- **NIFTY**: 50 lot size
- **BANKNIFTY**: 15 lot size  
- **FINNIFTY**: 40 lot size
- **RELIANCE**: 250 lot size
- **TCS**: 125 lot size

## 🔧 Local Development

1. Clone the repository:
```bash
git clone https://github.com/CHIBOLAR/Options-chain-prototype.git
cd Options-chain-prototype
```

2. Serve locally:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or simply open index.html in your browser
```

3. Navigate to `http://localhost:8000`

## 📦 File Structure

```
Options-chain-prototype/
├── index.html          # Main HTML file
├── script.js           # Core JavaScript functionality  
├── styles.css          # Professional styling
├── .nojekyll          # GitHub Pages configuration
└── README.md          # Project documentation
```

## 🎨 Features Showcase

### Order Types Supported:
- **Market Orders**: Immediate execution at current market price
- **Limit Orders**: Execute at specified price or better
- **Stop Loss**: Risk management orders
- **Bracket Orders**: Entry + Target + Stop Loss in single order
- **Cover Orders**: Buy/Sell with mandatory stop loss
- **GTT**: Good Till Triggered orders
- **OCO**: One-Cancels-Other orders

### Advanced Functionality:
- **Real-time Greeks**: Delta, Gamma, Theta, Vega calculations
- **Black-Scholes Pricing**: Professional option pricing model
- **Risk Analytics**: Margin calculation and exposure tracking
- **Position Aggregation**: Automatic position averaging
- **P&L Tracking**: Real-time profit/loss monitoring

## 🔐 Security & Disclaimer

⚠️ **Important**: This is a prototype/simulation platform for educational purposes only. It does not:
- Connect to real brokers or exchanges
- Handle real money or actual trades  
- Provide real market data
- Constitute financial advice

For actual trading, use licensed brokers and platforms.

## 🤝 Contributing

This is a prototype project. Feel free to fork and enhance!

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Claude Code**  
🤖 *AI-powered development for modern trading platforms*