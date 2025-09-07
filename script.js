// NSE Options Chain Trading Platform - Professional JavaScript Implementation
// Author: TradePro Platform
// Version: 1.0.0

class NSEOptionsChain {
    constructor() {
        this.currentSymbol = 'NIFTY';
        this.currentExpiry = '2024-01-25';
        this.spotPrice = 21347.50;
        this.isAutoRefresh = true;
        this.refreshInterval = 5000; // 5 seconds
        this.refreshTimer = null;
        this.basket = [];
        this.orders = [];
        this.positions = [];
        this.tradeHistory = [];
        this.isTradeModalOpen = false;
        this.isStrikeModalOpen = false;
        this.marketData = {};
        this.greeks = {};
        this.currentTab = 'options';
        this.orderIdCounter = 1000;
        
        // Indian market parameters
        this.riskFreeRate = 0.065; // 6.5% RBI repo rate
        this.dividendYield = 0.012; // 1.2% average dividend yield
        
        // Market symbols configuration
        this.symbols = {
            'NIFTY': {
                lotSize: 50,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Index',
                underlyingPrice: 21347.50
            },
            'BANKNIFTY': {
                lotSize: 15,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Banking Index',
                underlyingPrice: 46284.70
            },
            'FINNIFTY': {
                lotSize: 40,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Financial Index',
                underlyingPrice: 19867.25
            },
            'RELIANCE': {
                lotSize: 250,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Oil & Gas',
                underlyingPrice: 2456.80
            },
            'TCS': {
                lotSize: 125,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'IT Services',
                underlyingPrice: 3789.45
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeTradingMode();
        this.generateOptionsData();
        this.startAutoRefresh();
        this.updateMarketTime();
        this.showLoadingOverlay();
        
        // Initialize portfolio data
        this.initializePortfolioData();
        
        // Simulate initial data load
        setTimeout(() => {
            this.hideLoadingOverlay();
            this.showToast('success', 'Market Data Loaded', 'Live NSE options data loaded successfully');
        }, 2000);
    }
    
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
        
        // Trading mode toggle
        const tradingModeToggle = document.getElementById('trading-mode');
        tradingModeToggle.addEventListener('change', (e) => {
            this.toggleTradingMode(e.target.checked);
        });
        
        // Symbol selection
        const symbolSelect = document.getElementById('symbol-select');
        symbolSelect.addEventListener('change', (e) => {
            this.changeSymbol(e.target.value);
        });
        
        // Expiry selection
        const expirySelect = document.getElementById('expiry-select');
        expirySelect.addEventListener('change', (e) => {
            this.changeExpiry(e.target.value);
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-data');
        refreshBtn.addEventListener('click', () => {
            this.toggleAutoRefresh();
        });
        
        // Search functionality
        const searchInput = document.getElementById('options-search');
        searchInput.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyFilter(e.target.getAttribute('data-filter'));
            });
        });
        
        // Basket sidebar
        const closeBasket = document.getElementById('close-basket');
        closeBasket.addEventListener('click', () => {
            this.closeBasket();
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });
        
        // Modal background clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });
        
        // Basket actions
        document.querySelector('.clear-basket').addEventListener('click', () => {
            this.clearBasket();
        });
        
        document.querySelector('.execute-all').addEventListener('click', () => {
            this.executeAllOrders();
        });
        
        // Trade form actions
        document.querySelector('.add-to-basket').addEventListener('click', () => {
            this.addToBasket();
        });
        
        document.querySelector('.place-order').addEventListener('click', () => {
            this.placeOrder();
        });
        
        // Order type change
        document.getElementById('order-type').addEventListener('change', (e) => {
            this.togglePriceInput(e.target.value);
        });
        
        // Quantity and price inputs
        document.getElementById('quantity').addEventListener('input', () => {
            this.updateRiskAnalysis();
        });
        
        document.getElementById('price').addEventListener('input', () => {
            this.updateRiskAnalysis();
        });
        
        // Table sorting
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', (e) => {
                this.sortTable(e.target.getAttribute('data-sort'));
            });
        });

        // Orders page tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchOrdersTab(tabName);
            });
        });

        // Order filters
        document.querySelectorAll('.order-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterOrders(e.target.getAttribute('data-filter'));
            });
        });

        // Portfolio filters  
        document.querySelectorAll('.holdings-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterHoldings(e.target.getAttribute('data-filter'));
            });
        });

        // Order validity change
        const orderValidity = document.getElementById('order-validity');
        if (orderValidity) {
            orderValidity.addEventListener('change', (e) => {
                this.toggleValidityDate(e.target.value);
            });
        }

        // Advanced order options
        this.setupAdvancedOrderListeners();
    }
    
    initializeTradingMode() {
        const tradingModeToggle = document.getElementById('trading-mode');
        const isProfessional = tradingModeToggle.checked;
        this.toggleTradingMode(isProfessional);
    }
    
    toggleTradingMode(isProfessional) {
        if (isProfessional) {
            document.body.classList.add('professional-mode');
            this.showToast('info', 'Professional Mode', 'Advanced trading features enabled');
        } else {
            document.body.classList.remove('professional-mode');
            this.showToast('info', 'Beginner Mode', 'Simplified view for beginners');
        }
        
        // Regenerate table to show/hide columns
        this.generateOptionsData();
    }
    
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show/hide pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        document.getElementById(`${tabName}-page`).classList.add('active');
        
        if (tabName === 'options') {
            this.generateOptionsData();
        } else if (tabName === 'orders') {
            this.loadOrdersData();
        } else if (tabName === 'portfolio') {
            this.loadHoldingsData();
        }
    }
    
    changeSymbol(symbol) {
        this.currentSymbol = symbol;
        this.spotPrice = this.symbols[symbol].underlyingPrice;
        
        // Update spot price display
        document.getElementById('spot-price').textContent = this.formatPrice(this.spotPrice);
        
        // Generate new options data
        this.generateOptionsData();
        
        this.showToast('info', 'Symbol Changed', `Switched to ${symbol} options chain`);
    }
    
    changeExpiry(expiry) {
        this.currentExpiry = expiry;
        this.generateOptionsData();
        
        const expiryDate = new Date(expiry);
        const daysToExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        this.showToast('info', 'Expiry Changed', `${daysToExpiry} days to expiration`);
    }
    
    generateOptionsData() {
        const tbody = document.getElementById('options-tbody');
        tbody.innerHTML = '';
        
        const currentSpot = this.spotPrice;
        const symbol = this.currentSymbol;
        const lotSize = this.symbols[symbol].lotSize;
        
        // Generate strike prices around current spot
        const strikes = this.generateStrikePrices(currentSpot);
        
        // Calculate time to expiry in years
        const expiryDate = new Date(this.currentExpiry);
        const timeToExpiry = (expiryDate - new Date()) / (1000 * 60 * 60 * 24 * 365);
        
        strikes.forEach(strike => {
            const row = this.createOptionRow(strike, currentSpot, timeToExpiry, symbol);
            tbody.appendChild(row);
        });
        
        // Add click event listeners as fallback
        setTimeout(() => {
            document.querySelectorAll('.ltp-cell').forEach(cell => {
                if (!cell.hasClickListener) {
                    cell.addEventListener('click', (e) => {
                        const optionType = cell.getAttribute('data-option-type');
                        const strike = cell.getAttribute('data-strike');
                        const price = cell.getAttribute('data-price');
                        console.log('Cell clicked:', symbol, strike, optionType, price);
                        if (window.optionsChain) {
                            window.optionsChain.openTradeModal(symbol, strike, optionType, price);
                        }
                    });
                    cell.hasClickListener = true;
                }
            });
            
            document.querySelectorAll('.strike-cell').forEach(cell => {
                if (!cell.hasClickListener) {
                    cell.addEventListener('click', (e) => {
                        const strike = cell.getAttribute('data-strike');
                        console.log('Strike clicked:', strike);
                        if (window.optionsChain) {
                            window.optionsChain.openStrikeModal(strike);
                        }
                    });
                    cell.hasClickListener = true;
                }
            });
        }, 100);
        
        this.marketData[symbol] = { strikes, timeToExpiry, spotPrice: currentSpot };
    }
    
    generateStrikePrices(spotPrice) {
        const strikes = [];
        const interval = this.getStrikeInterval(spotPrice);
        
        // Generate strikes from -20 to +20 intervals around spot
        for (let i = -20; i <= 20; i++) {
            const strike = Math.round((spotPrice + (i * interval)) / interval) * interval;
            if (strike > 0) {
                strikes.push(strike);
            }
        }
        
        return strikes.sort((a, b) => a - b);
    }
    
    getStrikeInterval(spotPrice) {
        if (spotPrice < 500) return 5;
        if (spotPrice < 1000) return 10;
        if (spotPrice < 5000) return 25;
        if (spotPrice < 10000) return 50;
        return 100;
    }
    
    createOptionRow(strike, spotPrice, timeToExpiry, symbol) {
        const row = document.createElement('tr');
        const isATM = Math.abs(strike - spotPrice) < this.getStrikeInterval(spotPrice);
        const isITM_Call = strike < spotPrice;
        const isITM_Put = strike > spotPrice;
        
        // Calculate option prices using Black-Scholes
        const callPrice = this.blackScholesCall(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        const putPrice = this.blackScholesPut(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        
        // Calculate Greeks
        const callDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, true);
        const putDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, false);
        const iv = this.calculateImpliedVolatility(strike, spotPrice, timeToExpiry);
        
        // Generate realistic volume and OI
        const callOI = this.generateOI(strike, spotPrice, true);
        const putOI = this.generateOI(strike, spotPrice, false);
        const callVol = Math.floor(callOI * (0.1 + Math.random() * 0.3));
        const putVol = Math.floor(putOI * (0.1 + Math.random() * 0.3));
        
        // Generate price changes
        const callChange = (Math.random() - 0.5) * 20;
        const putChange = (Math.random() - 0.5) * 20;
        
        const isProfessional = document.body.classList.contains('professional-mode');
        
        row.innerHTML = `
            <!-- Call Options -->
            <td class="oi-cell call-data">${this.formatNumber(callOI)}</td>
            <td class="vol-cell call-data">${this.formatNumber(callVol)}</td>
            <td class="ltp-cell call-ltp call-data" 
                onclick="window.openTradeModal('${symbol}', ${strike}, 'CALL', ${callPrice})"
                data-option-type="CALL" data-strike="${strike}" data-price="${callPrice}"
                style="cursor: pointer; background: rgba(0, 212, 170, 0.2); border: 2px solid #00d4aa; position: relative;"
                title="Click to BUY/SELL this CALL option">
                <div style="font-weight: bold; color: #00d4aa;">₹${this.formatPrice(callPrice)}</div>
                <div style="font-size: 10px; color: #00d4aa; font-weight: bold;">📈 TRADE</div>
            </td>
            <td class="change-cell call-data ${callChange >= 0 ? 'positive' : 'negative'}">
                ${callChange >= 0 ? '+' : ''}${callChange.toFixed(2)}%
            </td>
            ${isProfessional ? `<td class="iv-cell call-data">${iv.toFixed(2)}%</td>` : ''}
            ${isProfessional ? `<td class="delta-cell call-data">${callDelta.toFixed(3)}</td>` : ''}
            
            <!-- Strike Price -->
            <td class="strike-cell ${isATM ? 'atm' : ''}" 
                onclick="window.openStrikeModal(${strike})"
                data-strike="${strike}"
                style="cursor: pointer; background: rgba(255, 190, 11, 0.1);">
                ${this.formatPrice(strike)}
            </td>
            
            <!-- Put Options -->
            ${isProfessional ? `<td class="delta-cell put-data">${putDelta.toFixed(3)}</td>` : ''}
            ${isProfessional ? `<td class="iv-cell put-data">${iv.toFixed(2)}%</td>` : ''}
            <td class="change-cell put-data ${putChange >= 0 ? 'positive' : 'negative'}">
                ${putChange >= 0 ? '+' : ''}${putChange.toFixed(2)}%
            </td>
            <td class="ltp-cell put-ltp put-data" 
                onclick="window.openTradeModal('${symbol}', ${strike}, 'PUT', ${putPrice})"
                data-option-type="PUT" data-strike="${strike}" data-price="${putPrice}"
                style="cursor: pointer; background: rgba(255, 71, 87, 0.2); border: 2px solid #ff4757; position: relative;"
                title="Click to BUY/SELL this PUT option">
                <div style="font-weight: bold; color: #ff4757;">₹${this.formatPrice(putPrice)}</div>
                <div style="font-size: 10px; color: #ff4757; font-weight: bold;">📉 TRADE</div>
            </td>
            <td class="vol-cell put-data">${this.formatNumber(putVol)}</td>
            <td class="oi-cell put-data">${this.formatNumber(putOI)}</td>
        `;
        
        return row;
    }
    
    // Black-Scholes Option Pricing Model
    blackScholesCall(S, K, T, r, sigma) {
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        return S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
    }
    
    blackScholesPut(S, K, T, r, sigma) {
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        return K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
    }
    
    // Normal cumulative distribution function
    normalCDF(x) {
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    }
    
    // Error function approximation
    erf(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }
    
    calculateDelta(S, K, T, r, sigma, isCall) {
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        
        if (isCall) {
            return this.normalCDF(d1);
        } else {
            return this.normalCDF(d1) - 1;
        }
    }
    
    calculateImpliedVolatility(strike, spot, timeToExpiry) {
        const moneyness = strike / spot;
        let baseVol = 0.20; // Base volatility 20%
        
        // Volatility smile: higher volatility for OTM options
        if (moneyness < 0.95 || moneyness > 1.05) {
            baseVol += 0.05;
        }
        if (moneyness < 0.90 || moneyness > 1.10) {
            baseVol += 0.05;
        }
        
        // Term structure: higher volatility for shorter expiry
        if (timeToExpiry < 0.08) { // Less than 1 month
            baseVol += 0.03;
        }
        
        // Add some randomness
        baseVol += (Math.random() - 0.5) * 0.04;
        
        return Math.max(baseVol * 100, 10); // Minimum 10% IV
    }
    
    generateOI(strike, spot, isCall) {
        const moneyness = strike / spot;
        let baseOI = 10000;
        
        // Higher OI for ATM options
        if (Math.abs(moneyness - 1) < 0.02) {
            baseOI *= 5;
        } else if (Math.abs(moneyness - 1) < 0.05) {
            baseOI *= 3;
        }
        
        // Different patterns for calls vs puts
        if (isCall) {
            if (moneyness > 1.05) baseOI *= 0.7; // Lower OI for OTM calls
        } else {
            if (moneyness < 0.95) baseOI *= 0.7; // Lower OI for OTM puts
        }
        
        return Math.floor(baseOI * (0.5 + Math.random()));
    }
    
    openTradeModal(symbol, strike, optionType, price) {
        const modal = document.getElementById('trade-modal');
        const title = document.getElementById('trade-modal-title');
        const optionDetails = document.getElementById('option-details');
        
        title.textContent = `Trade ${symbol} ${strike} ${optionType}`;
        
        const expiryDate = new Date(this.currentExpiry);
        const daysToExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        const lotSize = this.symbols[symbol].lotSize;
        
        optionDetails.innerHTML = `
            <div class="option-summary">
                <h4>${symbol} ${this.formatPrice(strike)} ${optionType}</h4>
                <div class="option-meta">
                    <span>Expiry: ${expiryDate.toLocaleDateString()}</span>
                    <span>Days to Expiry: ${daysToExpiry}</span>
                    <span>Lot Size: ${lotSize}</span>
                    <span>LTP: ${this.formatPrice(price)}</span>
                </div>
            </div>
        `;
        
        // Set default price
        document.getElementById('price').value = price;
        
        // Store current option data
        this.currentOption = {
            symbol,
            strike,
            optionType,
            price,
            lotSize
        };
        
        this.updateRiskAnalysis();
        modal.classList.add('active');
        this.isTradeModalOpen = true;
    }
    
    openStrikeModal(strike) {
        const modal = document.getElementById('strike-modal');
        const title = document.getElementById('strike-modal-title');
        const content = document.getElementById('strike-analysis-content');
        
        title.textContent = `${this.currentSymbol} ${this.formatPrice(strike)} Strike Analysis`;
        
        const symbol = this.currentSymbol;
        const spotPrice = this.spotPrice;
        const timeToExpiry = (new Date(this.currentExpiry) - new Date()) / (1000 * 60 * 60 * 24 * 365);
        
        // Calculate comprehensive analytics
        const callPrice = this.blackScholesCall(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        const putPrice = this.blackScholesPut(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        const callDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, true);
        const putDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, false);
        const iv = this.calculateImpliedVolatility(strike, spotPrice, timeToExpiry);
        
        const isITM_Call = strike < spotPrice;
        const isITM_Put = strike > spotPrice;
        const moneyness = (spotPrice / strike - 1) * 100;
        
        content.innerHTML = `
            <div class="strike-analysis-grid">
                <div class="analysis-section">
                    <h4>Strike Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Strike Price:</span>
                            <span class="text-gold">${this.formatPrice(strike)}</span>
                        </div>
                        <div class="info-item">
                            <span>Spot Price:</span>
                            <span>${this.formatPrice(spotPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Moneyness:</span>
                            <span class="${moneyness >= 0 ? 'text-success' : 'text-danger'}">${moneyness.toFixed(2)}%</span>
                        </div>
                        <div class="info-item">
                            <span>Time to Expiry:</span>
                            <span>${Math.ceil(timeToExpiry * 365)} days</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Call Option (${isITM_Call ? 'ITM' : 'OTM'})</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Premium:</span>
                            <span class="text-success">${this.formatPrice(callPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Delta:</span>
                            <span>${callDelta.toFixed(3)}</span>
                        </div>
                        <div class="info-item">
                            <span>Breakeven:</span>
                            <span>${this.formatPrice(strike + callPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Max Profit:</span>
                            <span class="text-success">Unlimited</span>
                        </div>
                        <div class="info-item">
                            <span>Max Loss:</span>
                            <span class="text-danger">${this.formatPrice(callPrice)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Put Option (${isITM_Put ? 'ITM' : 'OTM'})</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Premium:</span>
                            <span class="text-danger">${this.formatPrice(putPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Delta:</span>
                            <span>${putDelta.toFixed(3)}</span>
                        </div>
                        <div class="info-item">
                            <span>Breakeven:</span>
                            <span>${this.formatPrice(strike - putPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Max Profit:</span>
                            <span class="text-success">${this.formatPrice(strike - putPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Max Loss:</span>
                            <span class="text-danger">${this.formatPrice(putPrice)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Market Data</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Implied Volatility:</span>
                            <span>${iv.toFixed(2)}%</span>
                        </div>
                        <div class="info-item">
                            <span>Time Decay (per day):</span>
                            <span class="text-warning">-${(callPrice * 0.05).toFixed(2)}</span>
                        </div>
                        <div class="info-item">
                            <span>Liquidity:</span>
                            <span class="text-info">${this.getLiquidityRating(strike, spotPrice)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section full-width">
                    <h4>Trading Strategies</h4>
                    <div class="strategies-grid">
                        <div class="strategy-card">
                            <h5>Long Call</h5>
                            <p>Bullish strategy. Buy call if expecting price to rise above ${this.formatPrice(strike + callPrice)}</p>
                        </div>
                        <div class="strategy-card">
                            <h5>Long Put</h5>
                            <p>Bearish strategy. Buy put if expecting price to fall below ${this.formatPrice(strike - putPrice)}</p>
                        </div>
                        <div class="strategy-card">
                            <h5>Short Straddle</h5>
                            <p>Neutral strategy. Sell both options if expecting low volatility</p>
                        </div>
                        <div class="strategy-card">
                            <h5>Iron Condor</h5>
                            <p>Use this strike as part of a range-bound strategy</p>
                        </div>
                    </div>
                </div>
                
                <!-- Trading Action Buttons -->
                <div class="analysis-section full-width" style="margin-top: 2rem; border-top: 2px solid var(--gold);">
                    <h4 style="text-align: center; color: var(--gold); margin-bottom: 1.5rem;">🎯 Trade This Strike</h4>
                    <div class="strike-trading-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1rem;">
                        
                        <!-- CALL Option Trading -->
                        <div class="option-trade-card" style="background: rgba(0, 212, 170, 0.1); border: 2px solid var(--success); border-radius: 12px; padding: 1.5rem; text-align: center;">
                            <h5 style="color: var(--success); margin-bottom: 1rem;">📈 CALL Option</h5>
                            <div style="font-size: 1.2rem; font-weight: bold; color: var(--success); margin-bottom: 1rem;">₹${this.formatPrice(callPrice)}</div>
                            <div style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--secondary-text);">
                                ${isITM_Call ? '✅ In-the-Money' : '🔒 Out-of-the-Money'}<br>
                                Breakeven: ₹${this.formatPrice(strike + callPrice)}
                            </div>
                            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                <button class="btn-primary" onclick="window.optionsChain.openTradeModalFromStrike('${symbol}', ${strike}, 'CALL', ${callPrice})" 
                                        style="background: var(--success); padding: 0.75rem 1rem; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold;">
                                    🛒 Place Order
                                </button>
                                <button class="btn-secondary" onclick="window.optionsChain.addToBasketFromStrike('${symbol}', ${strike}, 'CALL', ${callPrice})"
                                        style="background: transparent; border: 2px solid var(--success); color: var(--success); padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold;">
                                    🧺 Add to Basket
                                </button>
                            </div>
                        </div>
                        
                        <!-- PUT Option Trading -->
                        <div class="option-trade-card" style="background: rgba(255, 71, 87, 0.1); border: 2px solid var(--danger); border-radius: 12px; padding: 1.5rem; text-align: center;">
                            <h5 style="color: var(--danger); margin-bottom: 1rem;">📉 PUT Option</h5>
                            <div style="font-size: 1.2rem; font-weight: bold; color: var(--danger); margin-bottom: 1rem;">₹${this.formatPrice(putPrice)}</div>
                            <div style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--secondary-text);">
                                ${isITM_Put ? '✅ In-the-Money' : '🔒 Out-of-the-Money'}<br>
                                Breakeven: ₹${this.formatPrice(strike - putPrice)}
                            </div>
                            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                <button class="btn-primary" onclick="window.optionsChain.openTradeModalFromStrike('${symbol}', ${strike}, 'PUT', ${putPrice})"
                                        style="background: var(--danger); padding: 0.75rem 1rem; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold;">
                                    🛒 Place Order
                                </button>
                                <button class="btn-secondary" onclick="window.optionsChain.addToBasketFromStrike('${symbol}', ${strike}, 'PUT', ${putPrice})"
                                        style="background: transparent; border: 2px solid var(--danger); color: var(--danger); padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold;">
                                    🧺 Add to Basket
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 1rem; padding: 1rem; background: rgba(255, 190, 11, 0.1); border-radius: 8px;">
                        <p style="color: var(--gold); font-weight: bold; margin: 0;">
                            💡 Choose "Place Order" for immediate execution or "Add to Basket" to combine multiple options
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        this.isStrikeModalOpen = true;
    }

    // Method to open trade modal from strike modal
    openTradeModalFromStrike(symbol, strike, optionType, price) {
        // Close strike modal first
        this.closeModals();
        // Open trade modal
        setTimeout(() => {
            this.openTradeModal(symbol, strike, optionType, price);
        }, 300);
    }

    // Method to add to basket directly from strike modal
    addToBasketFromStrike(symbol, strike, optionType, price) {
        const lotSize = this.symbols[symbol].lotSize;
        
        // Create basket item with default values
        const basketItem = {
            id: Date.now(),
            symbol: symbol,
            strike: strike,
            optionType: optionType,
            action: 'BUY', // Default to BUY
            quantity: 1,   // Default quantity
            price: price,
            orderType: 'MARKET', // Default order type
            lotSize: lotSize,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.basket.push(basketItem);
        this.updateBasketDisplay();
        this.showBasket();
        
        this.showToast('success', 'Added to Basket', 
            `✅ BUY 1 lot of ${symbol} ${this.formatPrice(strike)} ${optionType} added to basket`);
        
        this.closeModals();
    }
    
    getLiquidityRating(strike, spotPrice) {
        const moneyness = Math.abs(strike / spotPrice - 1);
        if (moneyness < 0.02) return 'Excellent';
        if (moneyness < 0.05) return 'Good';
        if (moneyness < 0.10) return 'Moderate';
        return 'Low';
    }
    
    updateRiskAnalysis() {
        if (!this.currentOption) return;
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const price = parseFloat(document.getElementById('price').value) || this.currentOption.price;
        const action = document.querySelector('input[name="action"]:checked').value;
        const lotSize = this.currentOption.lotSize;
        
        const totalShares = quantity * lotSize;
        let totalCost = totalShares * price;
        let marginRequired = totalCost;
        
        // For selling options, calculate margin differently
        if (action === 'SELL') {
            marginRequired = this.calculateMarginRequirement(this.currentOption, quantity, price);
            totalCost = totalShares * price; // Premium received (negative cost)
        }
        
        const breakeven = this.calculateBreakeven(this.currentOption, price, action);
        
        document.getElementById('total-cost').textContent = 
            action === 'BUY' ? `₹${this.formatNumber(totalCost)}` : `₹${this.formatNumber(-totalCost)} (Credit)`;
        document.getElementById('margin-required').textContent = `₹${this.formatNumber(marginRequired)}`;
        document.getElementById('individual-breakeven').textContent = `₹${this.formatPrice(breakeven)}`;
    }
    
    calculateMarginRequirement(option, quantity, price) {
        const lotSize = option.lotSize;
        const totalShares = quantity * lotSize;
        const premium = totalShares * price;
        
        // SPAN margin calculation (simplified)
        const underlyingValue = this.spotPrice * totalShares;
        const spanMargin = underlyingValue * 0.15; // 15% of underlying value
        const exposureMargin = underlyingValue * 0.05; // 5% exposure margin
        
        return Math.max(spanMargin + exposureMargin - premium, underlyingValue * 0.05);
    }
    
    calculateBreakeven(option, price, action) {
        if (action === 'BUY') {
            return option.optionType === 'CALL' ? 
                option.strike + price : 
                option.strike - price;
        } else {
            return option.optionType === 'CALL' ? 
                option.strike + price : 
                option.strike - price;
        }
    }
    
    togglePriceInput(orderType) {
        const priceGroup = document.getElementById('price-group');
        const priceInput = document.getElementById('price');
        
        if (orderType === 'MARKET') {
            priceGroup.style.display = 'none';
        } else {
            priceGroup.style.display = 'block';
            if (orderType === 'LIMIT') {
                priceInput.placeholder = 'Enter limit price';
            } else if (orderType.startsWith('SL')) {
                priceInput.placeholder = 'Enter trigger price';
            }
        }
        
        this.updateRiskAnalysis();
    }
    
    addToBasket() {
        if (!this.currentOption) return;
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const price = parseFloat(document.getElementById('price').value) || this.currentOption.price;
        const action = document.querySelector('input[name="action"]:checked').value;
        const orderType = document.getElementById('order-type').value;
        
        const basketItem = {
            id: Date.now(),
            symbol: this.currentOption.symbol,
            strike: this.currentOption.strike,
            optionType: this.currentOption.optionType,
            action: action,
            quantity: quantity,
            price: price,
            orderType: orderType,
            lotSize: this.currentOption.lotSize,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.basket.push(basketItem);
        this.updateBasketDisplay();
        this.showBasket();
        
        this.showToast('success', 'Added to Basket', 
            `✅ ${action} ${quantity} lots of ${this.currentOption.symbol} ${this.formatPrice(this.currentOption.strike)} ${this.currentOption.optionType} added to basket`);
        
        this.closeModals();
    }
    
    placeOrder() {
        if (!this.currentOption) return;
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const price = parseFloat(document.getElementById('price').value) || this.currentOption.price;
        const action = document.querySelector('input[name="action"]:checked').value;
        const orderType = document.getElementById('order-type').value;
        
        // Simulate order placement
        this.showLoadingOverlay('Placing order...');
        
        setTimeout(() => {
            this.hideLoadingOverlay();
            
            const orderId = 'ORD' + Date.now().toString().slice(-6);
            
            this.showToast('success', 'Order Placed', 
                `Order ${orderId} placed successfully for ${action} ${quantity}x ${this.currentOption.symbol} ${this.currentOption.strike} ${this.currentOption.optionType}`);
            
            this.closeModals();
        }, 2000);
    }
    
    updateBasketDisplay() {
        const basketItems = document.getElementById('basket-items');
        const basketSummary = document.getElementById('basket-summary');
        
        if (this.basket.length === 0) {
            basketItems.innerHTML = `
                <div class="empty-basket">
                    <i class="fas fa-basket-shopping"></i>
                    <p>No options selected</p>
                    <small>Click on option prices to add to basket</small>
                </div>
            `;
            basketSummary.style.display = 'none';
            return;
        }
        
        basketItems.innerHTML = this.basket.map(item => this.createBasketItemHTML(item)).join('');
        basketSummary.style.display = 'block';
        
        this.updateBasketSummary();
    }
    
    createBasketItemHTML(item) {
        const totalCost = item.quantity * item.lotSize * item.price;
        const costDisplay = item.action === 'BUY' ? 
            `₹${this.formatNumber(totalCost)}` : 
            `₹${this.formatNumber(-totalCost)} (Credit)`;
        
        return `
            <div class="basket-item">
                <div class="basket-item-header">
                    <div class="basket-item-title">
                        ${item.symbol} ${this.formatPrice(item.strike)} ${item.optionType}
                    </div>
                    <button class="remove-item" onclick="this.removeFromBasket(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="basket-item-details">
                    <div class="basket-item-row">
                        <span>Action:</span>
                        <span class="${item.action === 'BUY' ? 'text-success' : 'text-danger'}">${item.action}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Quantity:</span>
                        <span>${item.quantity} lots (${item.quantity * item.lotSize} shares)</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Price:</span>
                        <span>${this.formatPrice(item.price)}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Order Type:</span>
                        <span>${item.orderType}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Cost:</span>
                        <span class="font-weight-bold">${costDisplay}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Time:</span>
                        <span class="text-muted">${item.timestamp}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    removeFromBasket(itemId) {
        this.basket = this.basket.filter(item => item.id !== itemId);
        this.updateBasketDisplay();
        
        this.showToast('info', 'Removed from Basket', 'Option removed from basket');
    }
    
    updateBasketSummary() {
        let netPremium = 0;
        let maxProfit = 0;
        let maxLoss = 0;
        
        this.basket.forEach(item => {
            const cost = item.quantity * item.lotSize * item.price;
            if (item.action === 'BUY') {
                netPremium -= cost;
                maxLoss += cost;
            } else {
                netPremium += cost;
                maxProfit += cost;
            }
        });
        
        document.getElementById('net-premium').textContent = 
            `₹${this.formatNumber(Math.abs(netPremium))} ${netPremium >= 0 ? '(Credit)' : '(Debit)'}`;
        document.getElementById('max-profit').textContent = 
            maxProfit === 0 ? 'Unlimited' : `₹${this.formatNumber(maxProfit)}`;
        document.getElementById('max-loss').textContent = 
            maxLoss === 0 ? '₹0' : `₹${this.formatNumber(maxLoss)}`;
        document.getElementById('breakeven').textContent = 'Multiple levels';
    }
    
    showBasket() {
        document.getElementById('basket-sidebar').classList.add('active');
    }
    
    closeBasket() {
        document.getElementById('basket-sidebar').classList.remove('active');
    }
    
    clearBasket() {
        this.basket = [];
        this.updateBasketDisplay();
        this.showToast('info', 'Basket Cleared', 'All options removed from basket');
    }
    
    executeAllOrders() {
        if (this.basket.length === 0) {
            this.showToast('warning', 'Empty Basket', 'No orders to execute');
            return;
        }
        
        // Calculate total cost
        let totalCost = 0;
        this.basket.forEach(item => {
            const cost = item.quantity * item.lotSize * item.price;
            totalCost += item.action === 'BUY' ? cost : -cost;
        });
        
        // Show confirmation
        const confirmMessage = `Execute All Orders in Basket?
        
${this.basket.length} orders
Net Cost: ${totalCost >= 0 ? '+' : ''}₹${this.formatNumber(Math.abs(totalCost))}${totalCost >= 0 ? '' : ' (Credit)'}

Proceed with execution?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        this.showLoadingOverlay('Executing basket orders...');
        
        setTimeout(() => {
            this.hideLoadingOverlay();
            
            const orderCount = this.basket.length;
            let successCount = 0;
            
            // Convert basket items to orders and execute them
            this.basket.forEach(basketItem => {
                const order = {
                    orderId: `ORD${++this.orderIdCounter}`,
                    symbol: basketItem.symbol,
                    strike: basketItem.strike,
                    optionType: basketItem.optionType,
                    action: basketItem.action,
                    quantity: basketItem.quantity,
                    price: basketItem.price,
                    orderType: basketItem.orderType,
                    status: Math.random() > 0.05 ? 'EXECUTED' : 'REJECTED',
                    time: new Date().toLocaleTimeString(),
                    timestamp: new Date()
                };
                
                this.orders.push(order);
                
                if (order.status === 'EXECUTED') {
                    successCount++;
                    this.createPosition(order);
                    this.addToTradeHistory(order);
                }
            });
            
            this.clearBasket();
            this.closeBasket();
            
            if (successCount === orderCount) {
                this.showToast('success', 'All Orders Executed', 
                    `🎉 All ${orderCount} orders executed successfully!`);
            } else {
                this.showToast('warning', 'Partial Execution', 
                    `⚠️ ${successCount}/${orderCount} orders executed. Check Orders tab for details.`);
            }
        }, 2000);
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.isTradeModalOpen = false;
        this.isStrikeModalOpen = false;
        this.currentOption = null;
    }
    
    filterOptions(searchTerm) {
        const rows = document.querySelectorAll('#options-tbody tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const strikeCell = row.querySelector('.strike-cell');
            const strike = strikeCell ? strikeCell.textContent : '';
            
            const shouldShow = strike.toLowerCase().includes(term) || 
                             term === '' ||
                             this.currentSymbol.toLowerCase().includes(term);
            
            row.style.display = shouldShow ? '' : 'none';
        });
    }
    
    applyFilter(filterType) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
        
        const rows = document.querySelectorAll('#options-tbody tr');
        const spotPrice = this.spotPrice;
        
        rows.forEach(row => {
            const strikeCell = row.querySelector('.strike-cell');
            if (!strikeCell) return;
            
            const strike = parseFloat(strikeCell.textContent.replace(/,/g, ''));
            let shouldShow = true;
            
            switch (filterType) {
                case 'itm':
                    shouldShow = strike < spotPrice; // ITM calls or OTM puts
                    break;
                case 'atm':
                    const interval = this.getStrikeInterval(spotPrice);
                    shouldShow = Math.abs(strike - spotPrice) < interval;
                    break;
                case 'otm':
                    shouldShow = strike > spotPrice; // OTM calls or ITM puts
                    break;
                case 'high-volume':
                    // Show options with higher volume (simulated)
                    const volCells = row.querySelectorAll('.vol-cell');
                    const hasHighVol = Array.from(volCells).some(cell => {
                        const vol = parseInt(cell.textContent.replace(/,/g, ''));
                        return vol > 5000;
                    });
                    shouldShow = hasHighVol;
                    break;
                case 'all':
                default:
                    shouldShow = true;
                    break;
            }
            
            row.style.display = shouldShow ? '' : 'none';
        });
    }
    
    sortTable(sortBy) {
        const tbody = document.getElementById('options-tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Determine sort direction
        const currentSort = tbody.getAttribute('data-sort');
        const currentDirection = tbody.getAttribute('data-direction') || 'asc';
        const newDirection = (currentSort === sortBy && currentDirection === 'asc') ? 'desc' : 'asc';
        
        tbody.setAttribute('data-sort', sortBy);
        tbody.setAttribute('data-direction', newDirection);
        
        // Sort rows
        rows.sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'call-oi':
                case 'put-oi':
                    const oiIndex = sortBy.includes('call') ? 0 : -1;
                    aVal = parseInt(a.querySelectorAll('.oi-cell')[oiIndex]?.textContent.replace(/,/g, '') || '0');
                    bVal = parseInt(b.querySelectorAll('.oi-cell')[oiIndex]?.textContent.replace(/,/g, '') || '0');
                    break;
                    
                case 'call-vol':
                case 'put-vol':
                    const volIndex = sortBy.includes('call') ? 0 : -1;
                    aVal = parseInt(a.querySelectorAll('.vol-cell')[volIndex]?.textContent.replace(/,/g, '') || '0');
                    bVal = parseInt(b.querySelectorAll('.vol-cell')[volIndex]?.textContent.replace(/,/g, '') || '0');
                    break;
                    
                case 'call-ltp':
                case 'put-ltp':
                    const ltpClass = sortBy.includes('call') ? '.call-ltp' : '.put-ltp';
                    aVal = parseFloat(a.querySelector(ltpClass)?.textContent || '0');
                    bVal = parseFloat(b.querySelector(ltpClass)?.textContent || '0');
                    break;
                    
                case 'call-chg':
                case 'put-chg':
                    const changeIndex = sortBy.includes('call') ? 0 : 1;
                    aVal = parseFloat(a.querySelectorAll('.change-cell')[changeIndex]?.textContent.replace('%', '') || '0');
                    bVal = parseFloat(b.querySelectorAll('.change-cell')[changeIndex]?.textContent.replace('%', '') || '0');
                    break;
                    
                default:
                    aVal = a.querySelector('.strike-cell')?.textContent || '';
                    bVal = b.querySelector('.strike-cell')?.textContent || '';
                    break;
            }
            
            if (newDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
        
        // Update sort indicators
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        const sortedHeader = document.querySelector(`[data-sort="${sortBy}"]`);
        if (sortedHeader) {
            sortedHeader.classList.add(newDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }
    
    toggleAutoRefresh() {
        this.isAutoRefresh = !this.isAutoRefresh;
        const refreshBtn = document.getElementById('refresh-data');
        
        if (this.isAutoRefresh) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Auto-refresh';
            refreshBtn.classList.add('active');
            this.startAutoRefresh();
            this.showToast('success', 'Auto-refresh On', 'Market data will refresh every 5 seconds');
        } else {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Manual';
            refreshBtn.classList.remove('active');
            this.stopAutoRefresh();
            this.showToast('info', 'Auto-refresh Off', 'Click to manually refresh data');
        }
    }
    
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            if (this.isAutoRefresh) {
                this.refreshMarketData();
            }
        }, this.refreshInterval);
    }
    
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    refreshMarketData() {
        // Update spot price with small random movement
        const change = (Math.random() - 0.5) * this.spotPrice * 0.002; // ±0.2% movement
        this.spotPrice += change;
        
        // Update spot price display
        const spotPriceEl = document.getElementById('spot-price');
        const spotChangeEl = document.getElementById('spot-change');
        
        spotPriceEl.textContent = this.formatPrice(this.spotPrice);
        
        const changePercent = (change / (this.spotPrice - change)) * 100;
        const changeText = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        spotChangeEl.textContent = changeText;
        spotChangeEl.className = `change ${change >= 0 ? 'positive' : 'negative'}`;
        
        // Regenerate options data with new prices
        this.generateOptionsData();
    }
    
    updateMarketTime() {
        const timeEl = document.getElementById('market-time');
        
        setInterval(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-IN', { 
                hour12: false,
                timeZone: 'Asia/Kolkata'
            });
            timeEl.textContent = timeStr;
        }, 1000);
    }
    
    switchToOptions(symbol) {
        // Change to options tab
        this.switchTab('options');
        
        // Change symbol
        document.getElementById('symbol-select').value = symbol;
        this.changeSymbol(symbol);
    }
    
    showLoadingOverlay(message = 'Loading market data...') {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = overlay.querySelector('span');
        messageEl.textContent = message;
        overlay.classList.add('active');
    }
    
    hideLoadingOverlay() {
        document.getElementById('loading-overlay').classList.remove('active');
    }
    
    showToast(type, title, message, duration = 5000) {
        const container = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">${title}</div>
                <button class="toast-close" onclick="this.removeToast('${toastId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toastId);
        }, duration);
    }
    
    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }

    // ============ NEW ENHANCED FUNCTIONALITY ============

    setupAdvancedOrderListeners() {
        // Target and stop loss price inputs
        ['target-price', 'stoploss-price', 'trailing-points'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateRiskAnalysis();
                });
            }
        });
    }

    switchOrdersTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load appropriate data
        switch(tabName) {
            case 'orders':
                this.loadOrdersData();
                break;
            case 'positions':
                this.loadPositionsData();
                break;
            case 'history':
                this.loadHistoryData();
                break;
        }
    }

    loadOrdersData() {
        const tbody = document.getElementById('orders-tbody');
        const emptyState = document.getElementById('orders-empty');
        
        if (this.orders.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        tbody.innerHTML = this.orders.map(order => this.createOrderRow(order)).join('');
    }

    createOrderRow(order) {
        const statusClass = {
            'PENDING': 'status-pending',
            'EXECUTED': 'status-executed',
            'CANCELLED': 'status-cancelled'
        }[order.status];

        return `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.time}</td>
                <td>${order.symbol}</td>
                <td>${this.formatPrice(order.strike)}</td>
                <td class="option-type ${order.optionType.toLowerCase()}">${order.optionType}</td>
                <td class="action-type ${order.action.toLowerCase()}">${order.action}</td>
                <td>${order.quantity}</td>
                <td>${this.formatPrice(order.price)}</td>
                <td>${order.orderType}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>
                    ${order.status === 'PENDING' ? 
                        `<button class="btn-sm btn-danger" onclick="window.optionsChain.cancelOrder('${order.orderId}')">Cancel</button>
                         <button class="btn-sm btn-secondary" onclick="window.optionsChain.modifyOrder('${order.orderId}')">Modify</button>` : 
                        `<button class="btn-sm btn-info" onclick="window.optionsChain.viewOrderDetails('${order.orderId}')">Details</button>`
                    }
                </td>
            </tr>
        `;
    }

    loadPositionsData() {
        const tbody = document.getElementById('positions-tbody');
        const emptyState = document.getElementById('positions-empty');
        
        if (this.positions.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            this.updatePositionsSummary();
            return;
        }
        
        emptyState.style.display = 'none';
        tbody.innerHTML = this.positions.map(position => this.createPositionRow(position)).join('');
        this.updatePositionsSummary();
    }

    createPositionRow(position) {
        const currentPrice = this.getCurrentOptionPrice(position.symbol, position.strike, position.optionType);
        const pnl = (currentPrice - position.avgPrice) * position.quantity * this.symbols[position.symbol].lotSize * (position.action === 'BUY' ? 1 : -1);
        const pnlClass = pnl >= 0 ? 'pnl-positive' : 'pnl-negative';

        return `
            <tr>
                <td>${position.symbol}</td>
                <td>${this.formatPrice(position.strike)}</td>
                <td class="option-type ${position.optionType.toLowerCase()}">${position.optionType}</td>
                <td class="action-type ${position.action.toLowerCase()}">${position.action} ${position.quantity}</td>
                <td>${this.formatPrice(position.avgPrice)}</td>
                <td>${this.formatPrice(currentPrice)}</td>
                <td class="${pnlClass}">${pnl >= 0 ? '+' : ''}₹${this.formatNumber(Math.abs(pnl))}</td>
                <td class="${pnlClass}">₹${this.formatNumber(Math.abs(pnl))}</td>
                <td>Δ:${position.delta?.toFixed(3) || '0.000'}</td>
                <td>
                    <button class="btn-sm btn-primary" onclick="window.optionsChain.squareOffPosition('${position.id}')">Square Off</button>
                </td>
            </tr>
        `;
    }

    updatePositionsSummary() {
        let totalPnl = 0;
        let dayPnl = 0;
        let marginUsed = 0;
        
        this.positions.forEach(position => {
            const currentPrice = this.getCurrentOptionPrice(position.symbol, position.strike, position.optionType);
            const pnl = (currentPrice - position.avgPrice) * position.quantity * this.symbols[position.symbol].lotSize * (position.action === 'BUY' ? 1 : -1);
            totalPnl += pnl;
            dayPnl += pnl; // Simplified - in real app would track daily changes
            
            if (position.action === 'SELL') {
                marginUsed += this.calculateMarginRequirement(position, position.quantity, position.avgPrice);
            }
        });

        document.getElementById('total-pnl').textContent = `${totalPnl >= 0 ? '+' : ''}₹${this.formatNumber(Math.abs(totalPnl))}`;
        document.getElementById('total-pnl').className = `pnl-amount ${totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}`;
        
        document.getElementById('day-pnl').textContent = `${dayPnl >= 0 ? '+' : ''}₹${this.formatNumber(Math.abs(dayPnl))}`;
        document.getElementById('day-pnl').className = `pnl-amount ${dayPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}`;
        
        document.getElementById('position-count').textContent = this.positions.length;
        document.getElementById('margin-used').textContent = `₹${this.formatNumber(marginUsed)}`;
    }

    loadHistoryData() {
        const tbody = document.getElementById('history-tbody');
        const emptyState = document.getElementById('history-empty');
        
        if (this.tradeHistory.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        tbody.innerHTML = this.tradeHistory.map(trade => this.createHistoryRow(trade)).join('');
    }

    createHistoryRow(trade) {
        const pnlClass = trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
        
        return `
            <tr>
                <td>${trade.date}</td>
                <td>${trade.orderId}</td>
                <td>${trade.symbol}</td>
                <td>${this.formatPrice(trade.strike)}</td>
                <td class="option-type ${trade.optionType.toLowerCase()}">${trade.optionType}</td>
                <td class="action-type ${trade.action.toLowerCase()}">${trade.action}</td>
                <td>${trade.quantity}</td>
                <td>${this.formatPrice(trade.price)}</td>
                <td class="${pnlClass}">${trade.pnl >= 0 ? '+' : ''}₹${this.formatNumber(Math.abs(trade.pnl))}</td>
            </tr>
        `;
    }

    getCurrentOptionPrice(symbol, strike, optionType) {
        // Simulate getting current price - in real app would fetch from market data
        const spot = this.symbols[symbol].underlyingPrice;
        const timeToExpiry = (new Date(this.currentExpiry) - new Date()) / (1000 * 60 * 60 * 24 * 365);
        
        if (optionType === 'CALL') {
            return this.blackScholesCall(spot, strike, timeToExpiry, this.riskFreeRate, 0.25);
        } else {
            return this.blackScholesPut(spot, strike, timeToExpiry, this.riskFreeRate, 0.25);
        }
    }

    filterOrders(filterType) {
        // Update active filter button
        document.querySelectorAll('.order-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.order-filters [data-filter="${filterType}"]`).classList.add('active');
        
        const rows = document.querySelectorAll('#orders-tbody tr');
        rows.forEach(row => {
            const status = row.querySelector('.status-badge').textContent;
            let shouldShow = true;
            
            switch(filterType) {
                case 'pending':
                    shouldShow = status === 'PENDING';
                    break;
                case 'executed':
                    shouldShow = status === 'EXECUTED';
                    break;
                case 'cancelled':
                    shouldShow = status === 'CANCELLED';
                    break;
                case 'all':
                default:
                    shouldShow = true;
                    break;
            }
            
            row.style.display = shouldShow ? '' : 'none';
        });
    }

    filterHoldings(filterType) {
        // Update active filter button
        document.querySelectorAll('.holdings-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.holdings-filters [data-filter="${filterType}"]`).classList.add('active');
        
        // Apply filter logic here
        this.loadHoldingsData();
    }

    togglePriceInput(orderType) {
        const priceGroup = document.getElementById('price-group');
        const priceInput = document.getElementById('price');
        const advancedOptions = document.getElementById('advanced-order-options');
        
        // Hide all advanced options first
        advancedOptions.style.display = 'none';
        document.querySelectorAll('.advanced-order-options .form-group').forEach(group => {
            group.style.display = 'none';
        });
        
        if (orderType === 'MARKET') {
            priceGroup.style.display = 'none';
        } else {
            priceGroup.style.display = 'block';
            if (orderType === 'LIMIT') {
                priceInput.placeholder = 'Enter limit price';
            } else if (orderType.startsWith('SL')) {
                priceInput.placeholder = 'Enter trigger price';
            }
        }
        
        // Show advanced options for specific order types
        if (['BRACKET', 'COVER', 'GTT', 'OCO'].includes(orderType)) {
            advancedOptions.style.display = 'block';
            
            if (orderType === 'BRACKET') {
                document.getElementById('target-group').style.display = 'block';
                document.getElementById('stoploss-group').style.display = 'block';
                document.getElementById('trailing-group').style.display = 'block';
            } else if (orderType === 'COVER') {
                document.getElementById('stoploss-group').style.display = 'block';
            } else if (orderType === 'GTT') {
                document.getElementById('validity-group').style.display = 'block';
            }
        }
        
        this.updateRiskAnalysis();
    }

    toggleValidityDate(validityType) {
        const validityDate = document.getElementById('validity-date');
        validityDate.style.display = validityType === 'GTD' ? 'block' : 'none';
    }

    placeOrder() {
        if (!this.currentOption) return;
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const price = parseFloat(document.getElementById('price').value) || this.currentOption.price;
        const action = document.querySelector('input[name="action"]:checked').value;
        const orderType = document.getElementById('order-type').value;
        
        // Show confirmation dialog
        const confirmMessage = `Confirm Order:
${action} ${quantity} lots of ${this.currentOption.symbol} ${this.formatPrice(this.currentOption.strike)} ${this.currentOption.optionType}
Price: ₹${this.formatPrice(price)}
Total Cost: ₹${this.formatNumber(quantity * this.currentOption.lotSize * price)}

Proceed with order?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Create order object
        const order = {
            orderId: `ORD${++this.orderIdCounter}`,
            symbol: this.currentOption.symbol,
            strike: this.currentOption.strike,
            optionType: this.currentOption.optionType,
            action: action,
            quantity: quantity,
            price: price,
            orderType: orderType,
            status: 'PENDING',
            time: new Date().toLocaleTimeString(),
            timestamp: new Date()
        };
        
        this.orders.push(order);
        
        // Simulate order execution
        this.showLoadingOverlay('Placing order...');
        
        setTimeout(() => {
            this.hideLoadingOverlay();
            
            // Simulate execution (95% success rate)
            if (Math.random() > 0.05) {
                order.status = 'EXECUTED';
                this.createPosition(order);
                this.addToTradeHistory(order);
                
                this.showToast('success', 'Order Executed', 
                    `✅ Order ${order.orderId} executed successfully!
${action} ${quantity} lots @ ₹${this.formatPrice(price)}`);
            } else {
                order.status = 'REJECTED';
                this.showToast('danger', 'Order Rejected', 
                    `❌ Order ${order.orderId} rejected - Market conditions`);
            }
            
            this.closeModals();
        }, 1500);
    }

    createPosition(order) {
        const existingPosition = this.positions.find(p => 
            p.symbol === order.symbol && 
            p.strike === order.strike && 
            p.optionType === order.optionType &&
            p.action === order.action
        );
        
        if (existingPosition) {
            // Average the positions
            const totalQty = existingPosition.quantity + order.quantity;
            const totalValue = (existingPosition.avgPrice * existingPosition.quantity) + (order.price * order.quantity);
            existingPosition.avgPrice = totalValue / totalQty;
            existingPosition.quantity = totalQty;
        } else {
            // Create new position
            this.positions.push({
                id: Date.now(),
                symbol: order.symbol,
                strike: order.strike,
                optionType: order.optionType,
                action: order.action,
                quantity: order.quantity,
                avgPrice: order.price,
                delta: this.calculateDelta(this.spotPrice, order.strike, 
                    (new Date(this.currentExpiry) - new Date()) / (1000 * 60 * 60 * 24 * 365),
                    this.riskFreeRate, 0.25, order.optionType === 'CALL')
            });
        }
    }

    addToTradeHistory(order) {
        this.tradeHistory.push({
            date: new Date().toLocaleDateString(),
            orderId: order.orderId,
            symbol: order.symbol,
            strike: order.strike,
            optionType: order.optionType,
            action: order.action,
            quantity: order.quantity,
            price: order.price,
            pnl: 0 // Will be calculated when position is closed
        });
    }

    cancelOrder(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (order && order.status === 'PENDING') {
            order.status = 'CANCELLED';
            this.loadOrdersData();
            this.showToast('info', 'Order Cancelled', `Order ${orderId} cancelled successfully`);
        }
    }

    squareOffPosition(positionId) {
        const position = this.positions.find(p => p.id == positionId);
        if (!position) return;
        
        // Create opposite order to square off
        const oppositeAction = position.action === 'BUY' ? 'SELL' : 'BUY';
        const currentPrice = this.getCurrentOptionPrice(position.symbol, position.strike, position.optionType);
        
        const squareOffOrder = {
            orderId: `ORD${++this.orderIdCounter}`,
            symbol: position.symbol,
            strike: position.strike,
            optionType: position.optionType,
            action: oppositeAction,
            quantity: position.quantity,
            price: currentPrice,
            orderType: 'MARKET',
            status: 'EXECUTED',
            time: new Date().toLocaleTimeString(),
            timestamp: new Date()
        };
        
        // Calculate P&L
        const pnl = (currentPrice - position.avgPrice) * position.quantity * 
                   this.symbols[position.symbol].lotSize * (position.action === 'BUY' ? 1 : -1);
        
        // Add to trade history
        this.tradeHistory.push({
            date: new Date().toLocaleDateString(),
            orderId: squareOffOrder.orderId,
            symbol: position.symbol,
            strike: position.strike,
            optionType: position.optionType,
            action: oppositeAction,
            quantity: position.quantity,
            price: currentPrice,
            pnl: pnl
        });
        
        // Remove position
        this.positions = this.positions.filter(p => p.id != positionId);
        
        this.orders.push(squareOffOrder);
        this.loadPositionsData();
        
        this.showToast('success', 'Position Squared Off', 
            `Position closed with P&L: ${pnl >= 0 ? '+' : ''}₹${this.formatNumber(Math.abs(pnl))}`);
    }

    loadHoldingsData() {
        // Simulate portfolio holdings data
        const tbody = document.getElementById('holdings-tbody');
        if (!tbody) return;
        
        const holdings = [
            {
                symbol: 'NIFTY',
                strike: '21400',
                type: 'CALL',
                quantity: 100,
                avgCost: 125.50,
                ltp: 145.25,
                pnl: 1975,
                change: 15.74
            },
            {
                symbol: 'BANKNIFTY',
                strike: '46300',
                type: 'PUT',
                quantity: -75,
                avgCost: 98.75,
                ltp: 87.50,
                pnl: 843.75,
                change: -11.39
            }
        ];
        
        tbody.innerHTML = holdings.map(holding => {
            const pnlClass = holding.pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
            const changeClass = holding.change >= 0 ? 'pnl-positive' : 'pnl-negative';
            
            return `
                <tr>
                    <td>${holding.symbol}</td>
                    <td>${holding.strike}</td>
                    <td class="option-type ${holding.type.toLowerCase()}">${holding.type}</td>
                    <td>${Math.abs(holding.quantity)} ${holding.quantity >= 0 ? 'LONG' : 'SHORT'}</td>
                    <td>₹${this.formatPrice(holding.avgCost)}</td>
                    <td>₹${this.formatPrice(holding.ltp)}</td>
                    <td>₹${this.formatNumber(Math.abs(holding.quantity * holding.ltp))}</td>
                    <td class="${pnlClass}">${holding.pnl >= 0 ? '+' : ''}₹${this.formatNumber(Math.abs(holding.pnl))}</td>
                    <td class="${changeClass}">${holding.change >= 0 ? '+' : ''}${holding.change.toFixed(2)}%</td>
                    <td>Δ:0.65 Γ:0.08</td>
                    <td>
                        <button class="btn-sm btn-danger" onclick="window.optionsChain.sellHolding('${holding.symbol}_${holding.strike}_${holding.type}')">Sell</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    initializePortfolioData() {
        // Initialize with some sample data
        setTimeout(() => {
            this.loadHoldingsData();
        }, 1000);
    }
}

// Global functions for event handlers
window.openTradeModal = function(symbol, strike, optionType, price) {
    console.log('openTradeModal called:', symbol, strike, optionType, price);
    if (window.optionsChain) {
        window.optionsChain.openTradeModal(symbol, strike, optionType, price);
    } else {
        console.error('window.optionsChain not found');
    }
};

window.openStrikeModal = function(strike) {
    if (window.optionsChain) {
        window.optionsChain.openStrikeModal(strike);
    }
};

window.removeFromBasket = function(itemId) {
    if (window.optionsChain) {
        window.optionsChain.removeFromBasket(itemId);
    }
};

window.removeToast = function(toastId) {
    if (window.optionsChain) {
        window.optionsChain.removeToast(toastId);
    }
};

window.switchToOptions = function(symbol) {
    if (window.optionsChain) {
        window.optionsChain.switchToOptions(symbol);
    }
};

// Additional CSS for toast animations
const additionalStyles = `
@keyframes toastSlideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

.strike-analysis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.analysis-section {
    background: var(--tertiary-bg);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
}

.analysis-section.full-width {
    grid-column: 1 / -1;
}

.info-grid {
    display: grid;
    gap: var(--spacing-sm);
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
    border-bottom: none;
}

.strategies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.strategy-card {
    background: var(--quaternary-bg);
    border-radius: var(--radius-sm);
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-fast);
}

.strategy-card:hover {
    border-color: var(--gold);
    transform: translateY(-2px);
}

.strategy-card h5 {
    color: var(--gold);
    margin-bottom: var(--spacing-sm);
}

.strategy-card p {
    font-size: 0.9rem;
    color: var(--secondary-text);
}

@media (max-width: 768px) {
    .strike-analysis-grid {
        grid-template-columns: 1fr;
    }
    
    .strategies-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.optionsChain = new NSEOptionsChain();
    
    // Set initial focus for accessibility
    document.querySelector('.nav-tab.active').focus();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+R for refresh
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            if (window.optionsChain) {
                window.optionsChain.refreshMarketData();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (window.optionsChain) {
                window.optionsChain.closeModals();
                window.optionsChain.closeBasket();
            }
        }
        
        // Space to toggle auto-refresh
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            if (window.optionsChain) {
                window.optionsChain.toggleAutoRefresh();
            }
        }
    });
    
    // Handle visibility change to pause/resume auto-refresh
    document.addEventListener('visibilitychange', () => {
        if (window.optionsChain) {
            if (document.hidden) {
                window.optionsChain.stopAutoRefresh();
            } else if (window.optionsChain.isAutoRefresh) {
                window.optionsChain.startAutoRefresh();
            }
        }
    });
});

// Service Worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NSEOptionsChain;
}