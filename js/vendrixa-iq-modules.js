// ═══════════════════════════════════════════════════════════════════════════
// VENDRIXA IQ — Complete AI Brain Module Suite v3.0
// 16 Intelligence Modules · Voice AI · Actionable Decisions · Indian Market
// ═══════════════════════════════════════════════════════════════════════════

// ─── Shared Utilities ───────────────────────────────────────────────────────
const VIQ = {
    fmt: (n) => '₹' + parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 }),
    pct: (n) => parseFloat(n || 0).toFixed(1) + '%',
    rand: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    uid: () => typeof Auth !== 'undefined' ? (Auth.getCurrentUser()?.id || 'guest') : 'guest',
    lsGet: (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } },
    lsGetObj: (k, def) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); } catch { return def; } },
    lsSet: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    lsPush: (k, item, max = 200) => {
        const arr = VIQ.lsGet(k);
        arr.unshift(item);
        VIQ.lsSet(k, arr.slice(0, max));
    },
    priority_badge: (p) => {
        const map = { 'High': '#EF4444', 'Medium': '#F59E0B', 'Low': '#10B981' };
        const c = map[p] || '#8B5CF6';
        return `<span style="padding:2px 8px;border-radius:9999px;font-size:0.7rem;font-weight:700;background:${c}22;color:${c};border:1px solid ${c}44">${p}</span>`;
    },
    card: (icon, title, body, borderColor = 'rgba(139,92,246,0.3)') =>
        `<div class="glass" style="padding:1.5rem;border:1px solid ${borderColor};border-radius:1rem;margin-bottom:1rem">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
                <span style="font-size:1.75rem">${icon}</span>
                <strong style="font-size:1rem">${title}</strong>
            </div>
            ${body}
        </div>`,
    showToast: (msg, type = 'info') => typeof showToast === 'function' ? showToast(msg, type) : console.log(msg)
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 1: CENTRAL AI COMMAND CENTER — Business Issue Detector & Action Engine
// ═══════════════════════════════════════════════════════════════════════════
const CommandCenter = {
    issues: [],
    actions: [],

    analyze() {
        const ctx = this.buildContext();
        this.issues = [];
        this.actions = [];

        // --- Sales Analysis ---
        if (ctx.revenue < 10000) {
            this.issues.push({ problem: 'Critically Low Sales Revenue', icon: '📉', detail: `Total revenue ${VIQ.fmt(ctx.revenue)} is below minimum threshold of ₹10,000`, priority: 'High' });
            this.actions.push({ action: 'Launch WhatsApp broadcast campaign with 10% flash sale', type: 'marketing_launch', priority: 'High', impact: '+15-25% sales within 48 hours', icon: '📢' });
        } else if (ctx.revenue < 50000) {
            this.issues.push({ problem: 'Below-Target Sales Performance', icon: '⚠️', detail: `Revenue at ${VIQ.fmt(ctx.revenue)} — below optimal ₹50K monthly target`, priority: 'Medium' });
            this.actions.push({ action: 'Activate bundle deals on top 3 products — target ₹500+ average order', type: 'pricing_update', priority: 'Medium', impact: '+10-15% average order value', icon: '🎁' });
        }

        // --- Inventory Analysis ---
        const outOfStock = ctx.inventory.filter(i => i.stock === 0);
        const lowStock = ctx.inventory.filter(i => i.stock > 0 && i.stock < 5);
        const overstock = ctx.inventory.filter(i => i.stock > 100);

        if (outOfStock.length > 0) {
            this.issues.push({ problem: `${outOfStock.length} Product(s) Out of Stock`, icon: '🚨', detail: `${outOfStock.map(i => i.name).join(', ')} — causing lost sales & ranking drop`, priority: 'High' });
            this.actions.push({ action: `Restock immediately: ${outOfStock.slice(0, 3).map(i => i.name).join(', ')}`, type: 'restock_inventory', priority: 'High', impact: 'Recover lost sales & listing rank', icon: '📦' });
        }

        if (overstock.length > 0) {
            this.issues.push({ problem: `Overstock — Capital Locked in ${overstock.length} Item(s)`, icon: '📦', detail: `${overstock.map(i => `${i.name} (${i.stock} units)`).join(', ')} holding excess capital`, priority: 'Medium' });
            this.actions.push({ action: `Run clearance offer on ${overstock[0].name} — 15% OFF for 7 days`, type: 'pricing_update', priority: 'Medium', impact: 'Free up ₹5,000-20,000 working capital', icon: '💸' });
        }

        // --- Profit Margin Analysis ---
        if (ctx.margin < 10) {
            this.issues.push({ problem: 'Dangerously Low Profit Margin', icon: '🔴', detail: `Margin at ${VIQ.pct(ctx.margin)} — barely surviving, no buffer for expenses`, priority: 'High' });
            this.actions.push({ action: 'Raise prices by 8-12% on high-demand products. Renegotiate top supplier.', type: 'pricing_update', priority: 'High', impact: '+5-8% margin improvement', icon: '💰' });
        } else if (ctx.margin < 20) {
            this.issues.push({ problem: 'Below-Average Profit Margin', icon: '🟡', detail: `Margin at ${VIQ.pct(ctx.margin)} — target is 25%+ for sustainable growth`, priority: 'Medium' });
            this.actions.push({ action: 'Audit top 5 expenses. Eliminate 1-2 unnecessary costs this week.', type: 'cost_reduction', priority: 'Medium', impact: '+3-5% margin recovery', icon: '✂️' });
        }

        // --- Conversion / Marketing ---
        if (ctx.revenue > 0 && ctx.expenses / ctx.revenue > 0.5) {
            this.issues.push({ problem: 'High Expense-to-Revenue Ratio', icon: '💸', detail: `Spending ${VIQ.pct((ctx.expenses / ctx.revenue) * 100)} of revenue on operations — unsustainable`, priority: 'High' });
            this.actions.push({ action: 'Conduct full expense audit. Cut 3 non-essential costs immediately.', type: 'cost_reduction', priority: 'High', impact: '₹2,000-10,000 monthly savings', icon: '🔪' });
        }

        // Sort by priority
        const order = { 'High': 0, 'Medium': 1, 'Low': 2 };
        this.issues.sort((a, b) => order[a.priority] - order[b.priority]);
        this.actions.sort((a, b) => order[a.priority] - order[b.priority]);

        return { issues: this.issues, actions: this.actions };
    },

    buildContext() {
        try {
            const kpis = typeof DB !== 'undefined' ? DB.getKPIs() : {};
            const inv = typeof DB !== 'undefined' ? DB.getInventory() : [];
            return {
                revenue: kpis.revenue || 0,
                expenses: kpis.expenses || 0,
                netProfit: kpis.netProfit || 0,
                margin: kpis.profitMargin || 0,
                inventory: inv
            };
        } catch { return { revenue: 0, expenses: 0, netProfit: 0, margin: 0, inventory: [] }; }
    },

    render() {
        const el = document.getElementById('commandCenterContent');
        if (!el) return;
        const { issues, actions } = this.analyze();
        const ctx = this.buildContext();

        const scoreColor = ctx.margin > 25 ? '#10B981' : ctx.margin > 15 ? '#F59E0B' : '#EF4444';
        const healthScore = Math.min(100, Math.max(0, Math.round(ctx.margin * 2 + (ctx.revenue > 0 ? 30 : 0) + (ctx.inventory.length > 0 ? 20 : 0))));

        el.innerHTML = `
        <!-- KPI Snapshot -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:2rem">
            <div class="glass kpi-card" style="border:1px solid rgba(16,185,129,0.3)">
                <h3>Revenue</h3><div class="value" style="color:#10B981">${VIQ.fmt(ctx.revenue)}</div>
            </div>
            <div class="glass kpi-card" style="border:1px solid rgba(239,68,68,0.3)">
                <h3>Expenses</h3><div class="value" style="color:#EF4444">${VIQ.fmt(ctx.expenses)}</div>
            </div>
            <div class="glass kpi-card" style="border:1px solid rgba(139,92,246,0.3)">
                <h3>Net Profit</h3><div class="value" style="color:#8B5CF6">${VIQ.fmt(ctx.netProfit)}</div>
            </div>
            <div class="glass kpi-card" style="border:1px solid ${scoreColor}44">
                <h3>IQ Score</h3><div class="value" style="color:${scoreColor}">${healthScore}/100</div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <!-- Issues -->
            <div>
                <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
                    🔍 Detected Issues <span style="font-size:0.75rem;background:rgba(239,68,68,0.2);color:#EF4444;padding:2px 8px;border-radius:9999px;margin-left:0.5rem">${issues.length}</span>
                </h3>
                ${issues.length ? issues.map(iss => `
                    <div class="glass" style="padding:1.25rem;margin-bottom:1rem;border-left:4px solid ${iss.priority === 'High' ? '#EF4444' : iss.priority === 'Medium' ? '#F59E0B' : '#10B981'}">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
                            <div style="font-weight:700;font-size:0.9rem">${iss.icon} ${iss.problem}</div>
                            ${VIQ.priority_badge(iss.priority)}
                        </div>
                        <div style="font-size:0.8rem;color:rgba(255,255,255,0.65)">${iss.detail}</div>
                    </div>
                `).join('') : `<div class="glass" style="padding:2rem;text-align:center;color:#10B981">
                    <div style="font-size:2.5rem">✅</div>
                    <p style="margin-top:0.5rem;font-weight:700">No Critical Issues Detected!</p>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem">Add more data for deeper analysis</p>
                </div>`}
            </div>

            <!-- Actions -->
            <div>
                <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
                    ⚡ Recommended Actions <span style="font-size:0.75rem;background:rgba(139,92,246,0.2);color:#A855F7;padding:2px 8px;border-radius:9999px;margin-left:0.5rem">${actions.length}</span>
                </h3>
                ${actions.length ? actions.map((act, i) => `
                    <div class="glass" style="padding:1.25rem;margin-bottom:1rem;border:1px solid rgba(139,92,246,0.2)">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
                            <div style="font-weight:700;font-size:0.9rem">${act.icon} ${act.action}</div>
                            ${VIQ.priority_badge(act.priority)}
                        </div>
                        <div style="font-size:0.78rem;color:#10B981;margin-top:0.4rem">📈 Expected: ${act.impact}</div>
                        <button onclick="CommandCenter.executeAction(${i})" class="btn btn-primary" style="margin-top:0.75rem;font-size:0.78rem;padding:0.35rem 0.85rem">
                            ✅ Mark as Done
                        </button>
                    </div>
                `).join('') : `<div class="glass" style="padding:2rem;text-align:center;color:var(--text-muted)">
                    <p>Add business data to generate actionable recommendations.</p>
                </div>`}
            </div>
        </div>`;
    },

    executeAction(i) {
        const act = this.actions[i];
        if (act) {
            VIQ.showToast(`✅ Action logged: ${act.action.substring(0, 50)}...`, 'success');
            VIQ.lsPush('viq_executed_actions_' + VIQ.uid(), { ...act, executedAt: new Date().toISOString() });
        }
    },

    init() { this.render(); }
};
window.CommandCenter = CommandCenter;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 2: PRODUCT INTELLIGENCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
const ProductIntelligence = {
    trendingProducts: [
        { name: 'Organic Ghee 500g', category: 'Food', trend: '+42%', reason: 'Health consciousness post-COVID', score: 95 },
        { name: 'USB-C Fast Charger 65W', category: 'Electronics', trend: '+38%', reason: 'New smartphone adoptions', score: 91 },
        { name: 'Bamboo Toothbrush Set', category: 'Eco Products', trend: '+55%', reason: 'Sustainability trend rising in Tier 1-2 cities', score: 88 },
        { name: 'Whey Protein 1kg', category: 'Health', trend: '+31%', reason: 'Fitness boom, gym culture growing', score: 85 },
        { name: 'LED Strip Lights RGB', category: 'Home Decor', trend: '+67%', reason: 'Social media aesthetics trend, Gen Z demand', score: 93 }
    ],

    analyze() {
        const sales = typeof DB !== 'undefined' ? DB.getSales() : [];
        const inv = typeof DB !== 'undefined' ? DB.getInventory() : [];

        const pMap = {};
        sales.forEach(s => {
            if (!pMap[s.productName]) pMap[s.productName] = { name: s.productName, revenue: 0, profit: 0, qty: 0, margin: 0 };
            pMap[s.productName].revenue += s.totalSales || 0;
            pMap[s.productName].profit += s.profit || 0;
            pMap[s.productName].qty += s.quantity || 0;
        });

        Object.values(pMap).forEach(p => {
            p.margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
        });

        const products = Object.values(pMap);
        const top = [...products].sort((a, b) => b.profit - a.profit).slice(0, 5);
        const weak = [...products].sort((a, b) => a.margin - b.margin).slice(0, 3);

        return { top, weak, products, inventory: inv };
    },

    render() {
        const el = document.getElementById('productIntelligenceContent');
        if (!el) return;
        const { top, weak } = this.analyze();

        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
            <!-- Top Products -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">⭐ Top Performers</h3>
                ${top.length ? top.map((p, i) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.85rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div>
                            <div style="font-weight:700">${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || ''} ${p.name}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted)">${p.qty} units · Margin: ${p.margin.toFixed(1)}%</div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-weight:800;color:#10B981">${VIQ.fmt(p.profit)}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted)">profit</div>
                        </div>
                    </div>
                `).join('') : '<p style="color:var(--text-muted)">Log sales to identify top products.</p>'}
            </div>

            <!-- Weak Products -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">📉 Underperformers</h3>
                ${weak.length ? weak.map(p => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.85rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div>
                            <div style="font-weight:700;color:${p.profit < 0 ? '#EF4444' : '#F59E0B'}">${p.profit < 0 ? '🔴' : '🟡'} ${p.name}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted)">Margin: ${p.margin.toFixed(1)}% · ${p.qty} units</div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-weight:700;color:${p.profit < 0 ? '#EF4444' : '#F59E0B'}">${VIQ.fmt(Math.abs(p.profit))}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted)">${p.profit < 0 ? 'loss' : 'low profit'}</div>
                        </div>
                    </div>
                `).join('') : '<p style="color:#10B981">✅ No underperforming products detected!</p>'}
            </div>
        </div>

        <!-- New Opportunities -->
        <div class="glass" style="padding:1.5rem">
            <h3 style="margin-bottom:1.25rem">🚀 5 New Trending Product Opportunities</h3>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1.25rem">Based on Indian market trends, social media signals & search demand:</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem">
                ${this.trendingProducts.map(p => `
                    <div class="glass" style="padding:1.25rem;border:1px solid rgba(139,92,246,0.25)">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
                            <div style="font-weight:700;font-size:0.9rem">${p.name}</div>
                            <span style="background:rgba(16,185,129,0.15);color:#10B981;font-size:0.7rem;font-weight:800;padding:2px 8px;border-radius:9999px">${p.trend}</span>
                        </div>
                        <div style="font-size:0.72rem;color:#A855F7;margin-bottom:0.4rem">📂 ${p.category}</div>
                        <div style="font-size:0.78rem;color:rgba(255,255,255,0.65)">💡 ${p.reason}</div>
                        <div style="margin-top:0.75rem;background:rgba(255,255,255,0.06);border-radius:9999px;height:6px">
                            <div style="height:6px;border-radius:9999px;background:linear-gradient(90deg,#8B5CF6,#10B981);width:${p.score}%"></div>
                        </div>
                        <div style="font-size:0.68rem;color:var(--text-muted);margin-top:0.2rem">AI Opportunity Score: ${p.score}/100</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    },

    init() { this.render(); }
};
window.ProductIntelligence = ProductIntelligence;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 3: PRICING OPTIMIZATION AI
// ═══════════════════════════════════════════════════════════════════════════
const PricingOptimizationAI = {
    strategies: {
        aggressive: { label: 'Aggressive 🔥', desc: 'Undercut competitors by 5-10% to capture market share fast', color: '#EF4444', multiplier: 0.93 },
        balanced: { label: 'Balanced ⚖️', desc: 'Match market price with slight value additions', color: '#F59E0B', multiplier: 1.0 },
        premium: { label: 'Premium 💎', desc: 'Price 15-25% above market with superior quality positioning', color: '#8B5CF6', multiplier: 1.20 }
    },

    calculate(cost, price, competitorPrice, demand, qty) {
        cost = parseFloat(cost) || 0;
        price = parseFloat(price) || 0;
        competitorPrice = parseFloat(competitorPrice) || price * 1.05;
        demand = demand || 'medium';
        qty = parseInt(qty) || 100;

        if (!cost || !price) return null;

        const demandMultiplier = { high: 1.15, medium: 1.0, low: 0.88 }[demand] || 1.0;
        const competitors = { competitive: competitorPrice, market_avg: competitorPrice * 1.05 };

        const suggestions = {};
        Object.entries(this.strategies).forEach(([key, strat]) => {
            const suggested = Math.round((competitorPrice * strat.multiplier * demandMultiplier) / 5) * 5;
            const margin = ((suggested - cost) / suggested * 100);
            const monthlyProfit = (suggested - cost) * qty;
            const vsCompetitor = ((suggested - competitorPrice) / competitorPrice * 100);
            suggestions[key] = { ...strat, suggested, margin, monthlyProfit, vsCompetitor };
        });

        const currentMargin = ((price - cost) / price * 100);
        const currentProfit = (price - cost) * qty;
        const bestKey = demand === 'high' ? 'premium' : demand === 'low' ? 'aggressive' : 'balanced';

        return { suggestions, currentMargin, currentProfit, currentPrice: price, cost, competitors, bestKey, qty };
    },

    render() {
        const el = document.getElementById('pricingOptAIContent');
        if (!el) return;
        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.5rem">⚙️ Price Optimizer Input</h3>
                <div class="form-group"><label>Product Name</label><input type="text" id="poProduct" class="form-control" placeholder="e.g. Basmati Rice 1kg"></div>
                <div class="form-group"><label>Cost Price (₹)</label><input type="number" id="poCost" class="form-control" placeholder="120" step="0.01"></div>
                <div class="form-group"><label>Current Price (₹)</label><input type="number" id="poPrice" class="form-control" placeholder="200" step="0.01"></div>
                <div class="form-group"><label>Competitor Price (₹)</label><input type="number" id="poCompPrice" class="form-control" placeholder="185" step="0.01"></div>
                <div class="form-group">
                    <label>Demand Level</label>
                    <select id="poDemand" class="form-control">
                        <option value="high">🔥 High Demand</option>
                        <option value="medium" selected>⚖️ Medium Demand</option>
                        <option value="low">📉 Low Demand</option>
                    </select>
                </div>
                <div class="form-group"><label>Monthly Units Sold</label><input type="number" id="poQty" class="form-control" value="100"></div>
                <button class="btn btn-primary w-full" onclick="PricingOptimizationAI.calculate_and_show()">🧠 Get AI Price Recommendation</button>
            </div>
            <div class="glass" style="padding:1.5rem" id="pricingOptResults">
                <h3 style="margin-bottom:1rem">📊 AI Pricing Analysis</h3>
                <p style="color:var(--text-muted)">Fill in product details and click the button to get your AI-powered price recommendation.</p>
                <div style="margin-top:2rem;padding:1.25rem;background:rgba(139,92,246,0.08);border-radius:0.75rem;border:1px solid rgba(139,92,246,0.2)">
                    <strong>💡 Quick Facts:</strong>
                    <ul style="margin-top:0.5rem;color:var(--text-muted);font-size:0.82rem;line-height:2">
                        <li>A 5% price increase on 20% margin = 25% more profit per unit</li>
                        <li>₹499 vs ₹500 — psychological pricing boosts conversion by 8-12%</li>
                        <li>Premium products: Focus on value, not cheapness</li>
                        <li>High demand periods: Raise prices 10-15% without losing buyers</li>
                    </ul>
                </div>
            </div>
        </div>`;
    },

    calculate_and_show() {
        const cost = document.getElementById('poCost')?.value;
        const price = document.getElementById('poPrice')?.value;
        const comp = document.getElementById('poCompPrice')?.value;
        const demand = document.getElementById('poDemand')?.value;
        const qty = document.getElementById('poQty')?.value;
        const name = document.getElementById('poProduct')?.value || 'Product';

        if (!cost || !price) { VIQ.showToast('Enter cost & current price', 'error'); return; }
        const result = this.calculate(cost, price, comp, demand, qty);
        if (!result) return;

        const best = result.suggestions[result.bestKey];
        const resultEl = document.getElementById('pricingOptResults');
        if (!resultEl) return;

        resultEl.innerHTML = `
        <h3 style="margin-bottom:1rem">📊 Pricing Analysis — <span style="color:#A855F7">${name}</span></h3>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.5rem">
            <div style="padding:0.85rem;background:rgba(255,255,255,0.05);border-radius:0.5rem">
                <div style="font-size:0.7rem;color:var(--text-muted)">CURRENT MARGIN</div>
                <div style="font-size:1.5rem;font-weight:800;color:${result.currentMargin > 20 ? '#10B981' : result.currentMargin > 10 ? '#F59E0B' : '#EF4444'}">${result.currentMargin.toFixed(1)}%</div>
            </div>
            <div style="padding:0.85rem;background:rgba(255,255,255,0.05);border-radius:0.5rem">
                <div style="font-size:0.7rem;color:var(--text-muted)">MONTHLY PROFIT</div>
                <div style="font-size:1.5rem;font-weight:800;color:#8B5CF6">${VIQ.fmt(result.currentProfit)}</div>
            </div>
        </div>

        <div style="padding:1.25rem;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:0.75rem;margin-bottom:1.25rem">
            <div style="font-size:0.7rem;color:#10B981;font-weight:700;margin-bottom:0.4rem">🏆 AI BEST RECOMMENDATION — ${best.label}</div>
            <div style="font-size:2rem;font-weight:900;color:#10B981">₹${best.suggested}</div>
            <div style="font-size:0.8rem;color:rgba(255,255,255,0.7);margin-top:0.25rem">${best.desc}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.75rem">
                <div style="font-size:0.8rem">Margin: <strong style="color:#10B981">${best.margin.toFixed(1)}%</strong></div>
                <div style="font-size:0.8rem">Monthly: <strong style="color:#10B981">${VIQ.fmt(best.monthlyProfit)}</strong></div>
                <div style="font-size:0.8rem">vs Competitor: <strong style="color:${best.vsCompetitor > 0 ? '#EF4444' : '#10B981'}">${best.vsCompetitor > 0 ? '+' : ''}${best.vsCompetitor.toFixed(1)}%</strong></div>
            </div>
        </div>

        <div style="display:grid;gap:0.6rem">
            ${Object.values(result.suggestions).map(s => `
                <div style="padding:0.85rem 1rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;border-left:3px solid ${s.color};display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:700;font-size:0.85rem">${s.label}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted)">${s.desc.substring(0, 50)}...</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:800;color:${s.color}">₹${s.suggested}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted)">${s.margin.toFixed(1)}% margin</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    },

    init() { this.render(); }
};
window.PricingOptimizationAI = PricingOptimizationAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 4: INVENTORY FORECASTING AI
// ═══════════════════════════════════════════════════════════════════════════
const InventoryForecastAI = {
    forecast(product) {
        const sales = typeof DB !== 'undefined' ? DB.getSales() : [];
        const prodSales = sales.filter(s => s.productId === product.id || s.productName === product.name);

        const totalQty = prodSales.reduce((s, x) => s + (x.quantity || 0), 0);
        const days = Math.max(1, prodSales.length * 2);
        const dailyRate = totalQty / days || 0.5;

        const lead = parseInt(product.leadTime || 7);
        const stock = parseInt(product.stock || 0);

        const f7 = Math.round(dailyRate * 7);
        const f30 = Math.round(dailyRate * 30);
        const f60 = Math.round(dailyRate * 60);

        const daysUntilOut = stock > 0 ? Math.floor(stock / (dailyRate || 0.1)) : 0;
        const reorderPoint = Math.round(dailyRate * lead + dailyRate * 7);
        const reorderQty = Math.round(dailyRate * 45);
        const needsRestock = stock <= reorderPoint;
        const risk = daysUntilOut <= 3 ? 'CRITICAL' : daysUntilOut <= 7 ? 'HIGH' : daysUntilOut <= 14 ? 'MEDIUM' : 'LOW';
        const riskColor = { CRITICAL: '#EF4444', HIGH: '#F59E0B', MEDIUM: '#06B6D4', LOW: '#10B981' }[risk];

        return { f7, f30, f60, dailyRate, daysUntilOut, reorderPoint, reorderQty, needsRestock, risk, riskColor, stock, lead };
    },

    render() {
        const el = document.getElementById('inventoryForecastContent');
        if (!el) return;
        const inv = typeof DB !== 'undefined' ? DB.getInventory() : [];

        if (!inv.length) {
            el.innerHTML = `<div class="glass" style="padding:3rem;text-align:center;color:var(--text-muted)">
                <div style="font-size:3rem">📦</div>
                <p style="margin-top:1rem">Add products in Inventory section to see AI forecasts.</p>
            </div>`;
            return;
        }

        el.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-bottom:2rem">
            ${inv.map(product => {
                const fc = this.forecast(product);
                return `
                <div class="glass" style="padding:1.5rem;border:1px solid ${fc.riskColor}44">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
                        <div>
                            <div style="font-weight:800;font-size:1rem">${product.name}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted)">Stock: ${fc.stock} units · ${fc.dailyRate.toFixed(1)}/day avg</div>
                        </div>
                        <span style="padding:3px 10px;border-radius:9999px;font-size:0.68rem;font-weight:800;background:${fc.riskColor}22;color:${fc.riskColor};border:1px solid ${fc.riskColor}44">${fc.risk} RISK</span>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;margin-bottom:1rem">
                        ${[['7 Days', fc.f7], ['30 Days', fc.f30], ['60 Days', fc.f60]].map(([label, val]) => `
                            <div style="padding:0.6rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;text-align:center">
                                <div style="font-size:0.65rem;color:var(--text-muted)">${label}</div>
                                <div style="font-weight:800;font-size:1.1rem">${val}</div>
                                <div style="font-size:0.6rem;color:var(--text-muted)">units</div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="font-size:0.8rem;margin-bottom:0.35rem">⏳ <strong>Days Until Stockout:</strong> <span style="color:${fc.riskColor}">${fc.daysUntilOut} days</span></div>
                    <div style="font-size:0.8rem;margin-bottom:0.35rem">🔄 <strong>Reorder Point:</strong> ${fc.reorderPoint} units</div>
                    <div style="font-size:0.8rem;margin-bottom:0.35rem">📦 <strong>Reorder Qty (45-day buffer):</strong> ${fc.reorderQty} units</div>

                    ${fc.needsRestock ? `<div style="margin-top:0.75rem;padding:0.6rem 0.85rem;background:${fc.riskColor}15;border-radius:0.5rem;border:1px solid ${fc.riskColor}33;font-size:0.8rem;color:${fc.riskColor};font-weight:700">⚠️ RESTOCK NOW — Below reorder threshold!</div>` : ''}
                </div>`;
            }).join('')}
        </div>

        <div class="glass" style="padding:1.5rem;border-left:4px solid #8B5CF6">
            <h3 style="margin-bottom:1rem">🤖 AI Reorder Plan</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
                ${inv.filter(p => {
                    const fc = this.forecast(p);
                    return fc.needsRestock;
                }).slice(0, 6).map(p => {
                    const fc = this.forecast(p);
                    return `<div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem">
                        <div style="font-weight:700;margin-bottom:0.25rem">${p.name}</div>
                        <div style="font-size:0.78rem;color:#F59E0B">Order ${fc.reorderQty} units</div>
                        <div style="font-size:0.72rem;color:var(--text-muted)">Lead time: ${fc.lead} days</div>
                    </div>`;
                }).join('') || `<p style="color:#10B981">✅ All products have healthy stock levels.</p>`}
            </div>
        </div>`;
    },

    init() { this.render(); }
};
window.InventoryForecastAI = InventoryForecastAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 5: COMPETITOR ANALYSIS AI
// ═══════════════════════════════════════════════════════════════════════════
const CompetitorAI = {
    getKey: () => 'viq_compai_' + VIQ.uid(),

    getComparisons() { return VIQ.lsGet(this.getKey()); },

    addComparison(data) {
        VIQ.lsPush(this.getKey(), { ...data, id: 'cai_' + Date.now(), addedAt: new Date().toISOString().split('T')[0] });
        this.render();
        VIQ.showToast('Competitor product added ✅', 'success');
    },

    generateStrategy(item) {
        const diff = ((item.yourPrice - item.compPrice) / item.compPrice * 100);
        if (diff > 15) return { verdict: 'Overpriced', action: 'Reduce price by 8-12% or bundle with free gift', color: '#EF4444', icon: '🚨' };
        if (diff > 5) return { verdict: 'Slightly High', action: 'Add value: free delivery / better packaging', color: '#F59E0B', icon: '⚠️' };
        if (diff < -10) return { verdict: 'Price War Risk', action: 'Raise price by 5% — avoid race to bottom', color: '#F59E0B', icon: '⚡' };
        return { verdict: 'Competitive', action: 'Maintain price. Improve product rating & listing', color: '#10B981', icon: '✅' };
    },

    render() {
        const el = document.getElementById('competitorAIContent');
        if (!el) return;
        const comps = this.getComparisons();

        el.innerHTML = `
        <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
            <h3 style="margin-bottom:1rem">➕ Add Competitor Product</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;align-items:end">
                <div class="form-group" style="margin:0"><label>Your Product</label><input type="text" id="caiProduct" class="form-control" placeholder="Cotton T-Shirt L"></div>
                <div class="form-group" style="margin:0"><label>Your Price (₹)</label><input type="number" id="caiYourPrice" class="form-control" placeholder="499"></div>
                <div class="form-group" style="margin:0"><label>Competitor Price (₹)</label><input type="number" id="caiCompPrice" class="form-control" placeholder="450"></div>
                <div class="form-group" style="margin:0"><label>Competitor Name</label><input type="text" id="caiCompName" class="form-control" placeholder="Myntra / Competitor"></div>
                <div class="form-group" style="margin:0"><label>Your Rating/10</label><input type="number" id="caiYourRating" class="form-control" placeholder="7.5" step="0.5" min="0" max="10"></div>
                <div class="form-group" style="margin:0"><label>Comp. Rating/10</label><input type="number" id="caiCompRating" class="form-control" placeholder="8.2" step="0.5" min="0" max="10"></div>
                <button class="btn btn-primary" onclick="CompetitorAI.submit()">🔍 Analyse</button>
            </div>
        </div>

        ${comps.length ? `
        <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
            <h3 style="margin-bottom:1rem">📊 Competitor Comparison Table</h3>
            <div class="table-container"><table>
                <thead><tr><th>Product</th><th>Your Price</th><th>Comp.</th><th>Comp. Price</th><th>Diff</th><th>Their Rating</th><th>Verdict</th><th>AI Strategy</th></tr></thead>
                <tbody>${comps.map(c => {
                    const diff = ((c.yourPrice - c.compPrice) / c.compPrice * 100);
                    const strat = this.generateStrategy(c);
                    return `<tr>
                        <td><strong>${c.product}</strong></td>
                        <td style="color:#8B5CF6;font-weight:700">₹${c.yourPrice}</td>
                        <td style="color:var(--text-muted)">${c.competitor}</td>
                        <td style="color:#F59E0B">₹${c.compPrice}</td>
                        <td style="color:${diff > 0 ? '#EF4444' : '#10B981'};font-weight:700">${diff > 0 ? '+' : ''}${diff.toFixed(1)}%</td>
                        <td>${c.compRating ? '⭐ ' + c.compRating + '/10' : '—'}</td>
                        <td><span style="padding:2px 8px;border-radius:9999px;font-size:0.7rem;font-weight:700;background:${strat.color}22;color:${strat.color}">${strat.icon} ${strat.verdict}</span></td>
                        <td style="font-size:0.78rem;color:rgba(255,255,255,0.7)">${strat.action}</td>
                    </tr>`;
                }).join('')}</tbody>
            </table></div>
        </div>

        <div class="glass" style="padding:1.5rem;border-left:4px solid #8B5CF6">
            <h3 style="margin-bottom:0.75rem">🧠 AI Outperform Strategy</h3>
            ${comps.slice(0, 3).map(c => {
                const strat = this.generateStrategy(c);
                const diff = ((c.yourPrice - c.compPrice) / c.compPrice * 100);
                return `<div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;margin-bottom:0.75rem">
                    <div style="font-weight:700;margin-bottom:0.25rem">${c.product} vs ${c.competitor}</div>
                    <div style="font-size:0.82rem;color:rgba(255,255,255,0.75)">
                        ${strat.icon} <strong>${strat.verdict}</strong> — ${strat.action}
                    </div>
                    ${diff > 5 ? `<div style="font-size:0.78rem;color:#F59E0B;margin-top:0.25rem">💡 Your product costs ${diff.toFixed(0)}% more — add value: better packaging, longer warranty, or free shipping</div>` : ''}
                </div>`;
            }).join('')}
        </div>` : `<div class="glass" style="padding:2rem;text-align:center;color:var(--text-muted)">
            <div style="font-size:3rem">🏆</div>
            <p style="margin-top:1rem">Add competitor products above to start AI comparison analysis.</p>
        </div>`}`;
    },

    submit() {
        const product = document.getElementById('caiProduct')?.value?.trim();
        const yourPrice = parseFloat(document.getElementById('caiYourPrice')?.value);
        const compPrice = parseFloat(document.getElementById('caiCompPrice')?.value);
        const competitor = document.getElementById('caiCompName')?.value?.trim();
        const yourRating = parseFloat(document.getElementById('caiYourRating')?.value) || 0;
        const compRating = parseFloat(document.getElementById('caiCompRating')?.value) || 0;
        if (!product || !yourPrice || !compPrice) { VIQ.showToast('Fill product name, your price & competitor price', 'error'); return; }
        this.addComparison({ product, yourPrice, compPrice, competitor: competitor || 'Competitor', yourRating, compRating });
    },

    init() { this.render(); }
};
window.CompetitorAI = CompetitorAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 6: MARKETING STRATEGIST AI
// ═══════════════════════════════════════════════════════════════════════════
const MarketingAI = {
    adTemplates: {
        awareness: [
            'Introducing {product} — The game-changer your daily life needed! 🚀 Premium quality at prices that make sense. Shop now!',
            'Say goodbye to {product} problems forever. Our {product} does what others promise. Limited stock — grab yours! 💫',
            "India's most loved {product} is NOW AVAILABLE! Join 10,000+ happy customers. Don't miss out! 🇮🇳"
        ],
        consideration: [
            '🔥 WHY {product}? → Top-rated quality → Fastest delivery → 30-day return guarantee → COD available. Which reason works for you?',
            'Before you buy {product} elsewhere — check this: ✅ Better quality ✅ Lower price ✅ Real customer reviews. Compare & decide!',
            '📊 {product} REVIEW: 4.8/5 stars from 2,000+ buyers. See why everyone is switching. Click to know more →'
        ],
        purchase: [
            '⏰ LAST CHANCE! {product} sale ends TONIGHT at midnight. Save 20% before it\'s gone! Order now → COD available!',
            '🎁 BUY {product} TODAY & GET FREE: [Gift]. Only 23 left in stock. Don\'t wait — order in 2 minutes!',
            '💸 {product} at ₹{price} (was ₹{original_price}). SAVE {savings} TODAY ONLY. 72 people bought this in the last hour!'
        ]
    },

    generateAds(product, audience, budget) {
        const ads = [];
        const stages = ['awareness', 'consideration', 'purchase'];
        stages.forEach(stage => {
            const templates = this.adTemplates[stage];
            const template = templates[Math.floor(Math.random() * templates.length)];
            const ad = template.replace(/{product}/g, product).replace(/{price}/g, budget ? Math.round(budget * 0.2) : 499).replace(/{original_price}/g, Math.round((budget || 500) * 0.25)).replace(/{savings}/g, Math.round((budget || 500) * 0.05));
            ads.push({ stage, ad });
        });
        return ads;
    },

    render() {
        const el = document.getElementById('marketingAIContent');
        if (!el) return;
        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.5rem">📋 Campaign Input</h3>
                <div class="form-group"><label>Product Name</label><input type="text" id="mktProduct" class="form-control" placeholder="e.g. Handmade Soap Set"></div>
                <div class="form-group">
                    <label>Target Audience</label>
                    <select id="mktAudience" class="form-control">
                        <option value="women_25_45">Women 25-45 (Homemakers)</option>
                        <option value="men_20_35">Men 20-35 (Young Professionals)</option>
                        <option value="students">Students 18-24</option>
                        <option value="parents">Parents with Kids</option>
                        <option value="seniors">Senior Citizens 50+</option>
                        <option value="business">Small Business Owners</option>
                    </select>
                </div>
                <div class="form-group"><label>Monthly Ad Budget (₹)</label><input type="number" id="mktBudget" class="form-control" placeholder="5000" value="5000"></div>
                <div class="form-group"><label>Platform Focus</label>
                    <select id="mktPlatform" class="form-control">
                        <option value="instagram">Instagram + Facebook</option>
                        <option value="whatsapp">WhatsApp Business</option>
                        <option value="google">Google Ads</option>
                        <option value="all">All Platforms</option>
                    </select>
                </div>
                <button class="btn btn-primary w-full" onclick="MarketingAI.generate()">🚀 Generate Campaign</button>
            </div>

            <div class="glass" style="padding:1.5rem" id="mktResults">
                <h3 style="margin-bottom:1rem">📢 Generated Campaign</h3>
                <p style="color:var(--text-muted)">Fill in campaign details and click Generate Campaign to see your AI-crafted strategy.</p>
                <div style="margin-top:1.5rem;padding:1rem;background:rgba(139,92,246,0.08);border-radius:0.75rem">
                    <strong>💡 Marketing Truth:</strong>
                    <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.5rem">Most sellers fail because they target everyone and reach no one. Niche targeting → better ROAS. A ₹200/day focused campaign beats a ₹2000/day scattered one.</div>
                </div>
            </div>
        </div>`;
    },

    generate() {
        const product = document.getElementById('mktProduct')?.value?.trim();
        const audience = document.getElementById('mktAudience')?.value;
        const budget = parseFloat(document.getElementById('mktBudget')?.value) || 5000;
        const platform = document.getElementById('mktPlatform')?.value;
        if (!product) { VIQ.showToast('Enter product name', 'error'); return; }

        const ads = this.generateAds(product, audience, budget);
        const audienceMap = { women_25_45: 'Women 25-45', men_20_35: 'Men 20-35', students: 'Students 18-24', parents: 'Parents with Kids', seniors: 'Senior Citizens 50+', business: 'Small Business Owners' };
        const platformBudget = { instagram: { TOF: 60, MOF: 25, BOF: 15 }, whatsapp: { TOF: 0, MOF: 40, BOF: 60 }, google: { TOF: 30, MOF: 40, BOF: 30 }, all: { TOF: 40, MOF: 35, BOF: 25 } }[platform] || {};
        const stageNames = { awareness: ['👀 Awareness (TOF)', '#8B5CF6'], consideration: ['🤔 Consideration (MOF)', '#F59E0B'], purchase: ['💰 Purchase (BOF)', '#10B981'] };
        const resultEl = document.getElementById('mktResults');
        if (!resultEl) return;

        resultEl.innerHTML = `
        <h3 style="margin-bottom:1rem">🚀 Campaign for <span style="color:#A855F7">${product}</span></h3>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;margin-bottom:1.25rem">
            <div style="padding:0.65rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;text-align:center">
                <div style="font-size:0.65rem;color:var(--text-muted)">BUDGET</div>
                <div style="font-weight:800;color:#8B5CF6">${VIQ.fmt(budget)}/mo</div>
            </div>
            <div style="padding:0.65rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;text-align:center">
                <div style="font-size:0.65rem;color:var(--text-muted)">AUDIENCE</div>
                <div style="font-weight:700;font-size:0.82rem">${audienceMap[audience] || audience}</div>
            </div>
            <div style="padding:0.65rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;text-align:center">
                <div style="font-size:0.65rem;color:var(--text-muted)">PLATFORM</div>
                <div style="font-weight:700;font-size:0.82rem">${platform}</div>
            </div>
        </div>

        <div style="margin-bottom:1.25rem">
            <strong style="font-size:0.9rem">📊 Funnel Budget Split:</strong>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;margin-top:0.5rem">
                ${Object.entries(platformBudget).map(([stage, pct]) => `
                    <div style="padding:0.5rem;background:rgba(255,255,255,0.04);border-radius:0.4rem;font-size:0.75rem;text-align:center">
                        <div style="color:var(--text-muted)">${stage.toUpperCase()}</div>
                        <div style="font-weight:800">${pct}%</div>
                        <div style="color:#A855F7">${VIQ.fmt(budget * pct / 100)}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <strong style="font-size:0.9rem">📝 5 AI-Generated Ad Copies:</strong>
        ${ads.map((a, i) => {
            const [stageName, stageColor] = stageNames[a.stage] || ['Ad', '#8B5CF6'];
            return `<div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;margin-top:0.6rem;border-left:3px solid ${stageColor}">
                <div style="font-size:0.7rem;color:${stageColor};font-weight:700;margin-bottom:0.35rem">${stageName}</div>
                <div style="font-size:0.82rem;line-height:1.6">${a.ad}</div>
            </div>`;
        }).join('')}
        <div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;margin-top:0.6rem;border-left:3px solid #06B6D4">
            <div style="font-size:0.7rem;color:#06B6D4;font-weight:700;margin-bottom:0.35rem">🪝 VIRAL HOOK</div>
            <div style="font-size:0.82rem">"You won't believe what ${product} does for your [benefit] — and it's affordable. Swipe to see →"</div>
        </div>`;
    },

    init() { this.render(); }
};
window.MarketingAI = MarketingAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 7: AI SALES CONVERSATION HANDLER
// ═══════════════════════════════════════════════════════════════════════════
const SalesAI = {
    getKey: () => 'viq_sales_convos_' + VIQ.uid(),
    conversations: [],

    objectionResponses: {
        price: ['I understand price matters! Here\'s the thing — our {product} saves you {benefit} worth 3X what you\'re paying. Plus, we offer EMI options. Shall I show you the calculation?',
            'That\'s completely fair! But consider this: cheaper alternatives cost you more in {pain_point}. Our {product} is an investment, not an expense. How about a trial?'],
        quality: ['Great question! Our {product} is backed by {guarantee}. 94% of our customers reorder within 30 days — that\'s the quality proof. Can I show you our reviews?',
            'I hear you! Quality concern is valid. Our {product} comes with {warranty} warranty and if you\'re not 100% satisfied, full refund — no questions asked. Fair enough?'],
        urgency: ['No rush at all! But I should mention — we have only {stock} pieces left at this price. After that, price goes up by 15%. I\'ll hold one for you till {date}?',
            'Of course, take your time! Just so you know, our current offer expires on {date}. I\'d hate for you to miss ₹{savings} in savings. Can I send you a reminder?']
    },

    generateResponse(productName, query) {
        const q = query.toLowerCase();
        let response = '';
        let upsell = '';

        if (q.includes('price') || q.includes('costly') || q.includes('expensive') || q.includes('mahanga') || q.includes('kitna')) {
            response = `Hey! Great question about ${productName}. 😊 The investment is **₹[price]**, and here's why it's worth every rupee:\n\n✅ **Quality guarantee** — lasts 2-3x longer than cheaper alternatives\n✅ **ROI in 30 days** — saves you time & money consistently\n✅ **Zero-risk** — full return if you're not satisfied\n\nRather than the cheapest option, wouldn't you prefer one that *works*? 💪`;
            upsell = `💡 **Upsell Opportunity:** Customers who buy ${productName} often add our [Premium Bundle] — saves ₹200 and gives double value. Want me to add it?`;
        } else if (q.includes('delivery') || q.includes('shipping') || q.includes('kitne din')) {
            response = `Super fast! 🚀 Here's our delivery schedule:\n\n📦 **Metro cities** (Mumbai, Delhi, Bangalore): **Next-day delivery**\n📦 **Other cities**: **2-3 working days**\n📦 **Free shipping** on orders above ₹499\n\nYour ${productName} will be packed with care and delivered safely. Any specific date you need it by?`;
            upsell = `💡 **Tip:** Order before 3PM today for same-day dispatch on ${productName}!`;
        } else if (q.includes('return') || q.includes('refund') || q.includes('wapas')) {
            response = `Absolutely no worries! 🤝 Our return policy is **seller-friendly**:\n\n✅ **30-day easy returns** — no questions asked\n✅ **Free reverse pickup** from your doorstep\n✅ **Instant refund** within 3-5 business days\n\nWe're confident you'll love ${productName}, but just in case — you're fully protected. Shall we proceed?`;
            upsell = `Plus, adding our **Protection Plan** (₹99 extra) extends coverage to 90 days! Interested?`;
        } else if (q.includes('discount') || q.includes('offer') || q.includes('deal') || q.includes('kam')) {
            response = `I love your negotiating skills! 😄 Here's the best I can do for ${productName}:\n\n🎁 **Buy 2 = Get 1 Free** (best value)\n💳 **₹50 off** with code VENDRIXA50\n🎯 **Free gift** worth ₹150 on orders above ₹500\n\nWhich offer works best for you? I genuinely want you to walk away happy!`;
            upsell = `🔥 **Hot Deal:** Grab the combo pack — ${productName} + [Complimentary Product] = save ₹300 total!`;
        } else {
            response = `Hey there! 👋 Thanks for your interest in **${productName}**!\n\nHere's what makes it special:\n\n⭐ **Premium quality** — tried and loved by 10,000+ customers\n🚀 **Fast results** — you'll notice the difference in 7 days\n💰 **Best value** — more features, lower price than competitors\n🛡️ **Safe purchase** — COD available + 30-day return\n\nWhat would you like to know more about? I'm here to help you make the best decision! 😊`;
            upsell = `💡 **Most Popular:** Customers also love our [Best Seller Bundle] with ${productName}. Shall I tell you about it?`;
        }

        return { response, upsell };
    },

    render() {
        const el = document.getElementById('salesAIContent');
        if (!el) return;
        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.5rem">💬 Query Simulator</h3>
                <div class="form-group"><label>Product Name</label><input type="text" id="salesProduct" class="form-control" placeholder="e.g. Organic Face Cream"></div>
                <div class="form-group">
                    <label>Customer Query</label>
                    <textarea id="salesQuery" class="form-control" rows="4" placeholder="e.g. Yeh itna mehnga kyun hai? / Why should I buy this? / What if I don't like it?" style="resize:vertical"></textarea>
                </div>
                <button class="btn btn-primary w-full" onclick="SalesAI.respond()">🤖 Generate AI Response</button>

                <div style="margin-top:1.5rem">
                    <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.5rem">Quick objection templates:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
                        ${['Too expensive!', 'Delivery kitne din?', 'Mujhe discount chahiye', 'Quality kaisi hai?', 'Return policy kya hai?'].map(q => 
                            `<button class="prompt-pill" style="font-size:0.72rem;padding:0.25rem 0.6rem;cursor:pointer" onclick="document.getElementById('salesQuery').value='${q}'">${q}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>

            <div class="glass" style="padding:1.5rem" id="salesAIResponse">
                <h3 style="margin-bottom:1rem">🤖 AI Sales Response</h3>
                <p style="color:var(--text-muted)">Enter a customer query to see how our AI would respond in a human-like, persuasive way.</p>
                <div style="margin-top:1.5rem;padding:1rem;background:rgba(16,185,129,0.08);border-radius:0.75rem;border:1px solid rgba(16,185,129,0.2)">
                    <strong>💡 Sales Principle:</strong>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem">"People don't buy products. They buy solutions to their problems and better versions of themselves." Always address the emotion, not just the feature.</div>
                </div>
            </div>
        </div>`;
    },

    respond() {
        const product = document.getElementById('salesProduct')?.value?.trim();
        const query = document.getElementById('salesQuery')?.value?.trim();
        if (!product || !query) { VIQ.showToast('Enter product name and customer query', 'error'); return; }

        const { response, upsell } = this.generateResponse(product, query);
        const respEl = document.getElementById('salesAIResponse');
        if (!respEl) return;

        // Simple markdown to HTML
        const toHtml = (text) => text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        respEl.innerHTML = `
        <h3 style="margin-bottom:1rem">🤖 Human-like Response for <span style="color:#A855F7">${product}</span></h3>

        <div style="padding:1.25rem;background:rgba(255,255,255,0.05);border-radius:0.75rem;margin-bottom:1rem;border-left:4px solid #8B5CF6;line-height:1.8;font-size:0.88rem">
            ${toHtml(response)}
        </div>

        <div style="padding:1.25rem;background:rgba(16,185,129,0.08);border-radius:0.75rem;border:1px solid rgba(16,185,129,0.25);font-size:0.85rem">
            ${toHtml(upsell)}
        </div>

        <div style="margin-top:1rem;padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;font-size:0.78rem;color:var(--text-muted)">
            📌 <strong>Handling Tips:</strong> Use the customer's name if known. Pause after each response. Ask a question to keep them engaged. Close with a clear CTA.
        </div>`;
    },

    init() { this.render(); }
};
window.SalesAI = SalesAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 8: LEAD GENERATION AI
// ═══════════════════════════════════════════════════════════════════════════
const LeadGenAI = {
    sources: {
        'grocery': ['Local WhatsApp groups', 'Society Facebook groups', 'Google Maps nearby searches', 'Justdial listings', 'Meesho reseller network'],
        'fashion': ['Instagram hashtags #IndianFashion', 'Pinterest Boards', 'College group chats', 'Myntra seller program', 'Nykaa Fashion'],
        'electronics': ['Amazon seller marketplace', 'Flipkart seller hub', 'Quora answer community', 'Reddit IndiaInvestments', 'Cashify resellers'],
        'food': ['Zomato/Swiggy merchant', 'Instagram food blogger outreach', 'Housing society WhatsApp', 'Google Business reviews', 'Tata Neu grocery'],
        'health': ['Doctor referral network', 'Gym & yoga studio partnerships', 'Health Facebook groups', 'Apollo hospital partners', 'Reddit HealthIndia'],
        'default': ['WhatsApp Business Broadcast', 'Instagram DM campaigns', 'Google Business Optimization', 'Local Facebook Groups', 'Referral programs']
    },

    templates: [
        `Hi {name}! 👋 I noticed you're interested in {niche} products. We just launched something you'd love — {product_hook}. No commitment needed. Want me to send you details? 🎁`,
        `Namaste {name}! I'm reaching out because {reason}. We help {audience} achieve {benefit} in just {timeframe}. Can I share our best offer with you? Takes only 2 minutes! 🚀`,
        `Hey {name}! Quick question — are you still looking for quality {niche} at reasonable prices? We just restocked and have a special early-customer discount. Interested? 😊`
    ],

    render() {
        const el = document.getElementById('leadGenContent');
        if (!el) return;
        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.5rem">🎯 Lead Strategy Input</h3>
                <div class="form-group">
                    <label>Product Niche</label>
                    <select id="lgNiche" class="form-control">
                        <option value="grocery">Grocery / Daily Essentials</option>
                        <option value="fashion">Fashion & Clothing</option>
                        <option value="electronics">Electronics & Gadgets</option>
                        <option value="food">Food & Beverages</option>
                        <option value="health">Health & Wellness</option>
                        <option value="default">Other</option>
                    </select>
                </div>
                <div class="form-group"><label>Target Audience Description</label><input type="text" id="lgAudience" class="form-control" placeholder="e.g. Working mothers in Mumbai 25-40"></div>
                <div class="form-group"><label>Product / Brand Name</label><input type="text" id="lgProduct" class="form-control" placeholder="e.g. Organic Masala Box"></div>
                <button class="btn btn-primary w-full" onclick="LeadGenAI.generate()">⚡ Generate Lead Strategy</button>
            </div>

            <div class="glass" style="padding:1.5rem" id="leadGenResults">
                <h3 style="margin-bottom:1rem">📋 Lead Generation Plan</h3>
                <p style="color:var(--text-muted)">Fill in your niche details to get a customized lead generation strategy.</p>
            </div>
        </div>`;
    },

    generate() {
        const niche = document.getElementById('lgNiche')?.value || 'default';
        const audience = document.getElementById('lgAudience')?.value?.trim() || 'target customers';
        const product = document.getElementById('lgProduct')?.value?.trim() || 'your product';
        const sources = this.sources[niche] || this.sources.default;
        const resultEl = document.getElementById('leadGenResults');
        if (!resultEl) return;

        resultEl.innerHTML = `
        <h3 style="margin-bottom:1rem">⚡ Lead Plan — <span style="color:#A855F7">${product}</span></h3>

        <div style="margin-bottom:1.25rem">
            <strong style="font-size:0.9rem">🎯 Top Lead Sources:</strong>
            <div style="display:grid;gap:0.5rem;margin-top:0.5rem">
                ${sources.map((src, i) => `
                    <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.85rem;background:rgba(139,92,246,0.08);border-radius:0.5rem">
                        <span style="font-size:1rem">${['🥇','🥈','🥉','4️⃣','5️⃣'][i] || '📌'}</span>
                        <span style="font-size:0.85rem">${src}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom:1.25rem">
            <strong style="font-size:0.9rem">📅 7-Day Outreach Plan:</strong>
            <div style="display:grid;gap:0.4rem;margin-top:0.5rem">
                ${['Mon: Join & engage in 3 local WhatsApp groups (no selling yet)', 'Tue: Post value content — tip/fact related to your niche', 'Wed: DM 20 warm leads with personalized opener', 'Thu: Follow up from Monday leads with product demo offer', 'Fri: Run "Weekend Special" offer announcement', 'Sat: Collect testimonials from buyers, share as social proof', 'Sun: Plan next week, analyze which source gave most leads'].map(day =>
                    `<div style="padding:0.5rem 0.75rem;background:rgba(255,255,255,0.04);border-radius:0.4rem;font-size:0.8rem">${day}</div>`
                ).join('')}
            </div>
        </div>

        <div>
            <strong style="font-size:0.9rem">💬 3 Sample Lead Messages:</strong>
            ${this.templates.map((t, i) => {
                const msg = t.replace(/{name}/g, 'Priya').replace(/{niche}/g, niche).replace(/{audience}/g, audience).replace(/{product_hook}/g, product).replace(/{reason}/g, 'you asked about similar products earlier').replace(/{benefit}/g, 'save money & time').replace(/{timeframe}/g, '7 days');
                return `<div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;margin-top:0.5rem;font-size:0.82rem;line-height:1.6;border-left:3px solid ${['#8B5CF6','#F59E0B','#10B981'][i]}">
                    <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.3rem">TEMPLATE ${i + 1}</div>
                    ${msg}
                </div>`;
            }).join('')}
        </div>`;
    },

    init() { this.render(); }
};
window.LeadGenAI = LeadGenAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 9: CRO (CONVERSION RATE OPTIMIZATION) EXPERT AI
// ═══════════════════════════════════════════════════════════════════════════
const CROExpert = {
    fixes: {
        image: { problem: 'Poor product images', fix: 'Use white background, 5 angles, zoom functionality, lifestyle shots — reduces returns by 22%', impact: '+18% conversion', effort: 'Low', icon: '📸' },
        speed: { problem: 'Slow page/app load time', fix: 'Compress images, use CDN, remove unused scripts — every 1s delay = 7% conversion drop', impact: '+12% conversion', effort: 'Medium', icon: '⚡' },
        cta: { problem: 'Weak Call-to-Action buttons', fix: 'Use action words: "Get Yours Now" instead of "Buy" — add urgency & scarcity signals', impact: '+9% conversion', effort: 'Low', icon: '🎯' },
        reviews: { problem: 'Insufficient social proof', fix: 'Display review count prominently, add video reviews, show recent purchases ("Rahul from Delhi just bought!")', impact: '+23% conversion', effort: 'Low', icon: '⭐' },
        checkout: { problem: 'Complex checkout process', fix: 'Reduce checkout steps to 2 max. Add COD, UPI, EMI options. Remove mandatory registration.', impact: '+31% conversion', effort: 'High', icon: '🛒' },
        mobile: { problem: 'Poor mobile experience', fix: 'Thumb-friendly buttons (min 44px), single column layout, fast tap response — 75% India shops on mobile', impact: '+28% mobile conversion', effort: 'Medium', icon: '📱' },
        trust: { problem: 'Low trust signals', fix: 'Add: SSL badge, Return policy button, WhatsApp support button, Payment logos, "X people viewing now"', impact: '+15% trust-to-purchase', effort: 'Low', icon: '🛡️' },
        description: { problem: 'Weak product description', fix: 'Lead with the biggest benefit. Use bullet points. Answer "Why THIS product?" Add comparison table.', impact: '+14% add-to-cart rate', effort: 'Low', icon: '📝' }
    },

    render() {
        const el = document.getElementById('croContent');
        if (!el) return;
        el.innerHTML = `
        <div style="margin-bottom:2rem;display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">📊 Conversion Rate Simulator</h3>
                <div class="form-group"><label>Current Website/Listing Visitors (monthly)</label><input type="number" id="croVisitors" class="form-control" value="1000"></div>
                <div class="form-group"><label>Current Orders (monthly)</label><input type="number" id="croOrders" class="form-control" value="25"></div>
                <div class="form-group"><label>Average Order Value (₹)</label><input type="number" id="croAOV" class="form-control" value="450"></div>
                <button class="btn btn-primary w-full" onclick="CROExpert.simulate()">📈 Simulate CRO Impact</button>
            </div>
            <div class="glass" style="padding:1.5rem" id="croSimResult">
                <h3 style="margin-bottom:1rem">💰 Revenue Impact</h3>
                <p style="color:var(--text-muted)">Enter your current metrics to see how CRO improvements would impact revenue.</p>
            </div>
        </div>

        <h3 style="margin-bottom:1.25rem">🔧 CRO Fix Playbook — All Issues Identified</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem">
            ${Object.entries(this.fixes).map(([key, fix]) => `
                <div class="glass" style="padding:1.25rem;border:1px solid rgba(255,255,255,0.08)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
                        <div style="font-weight:700;font-size:0.9rem">${fix.icon} ${fix.problem}</div>
                        <span style="padding:2px 8px;border-radius:9999px;font-size:0.65rem;font-weight:700;background:${fix.effort === 'Low' ? 'rgba(16,185,129,0.15)' : fix.effort === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'};color:${fix.effort === 'Low' ? '#10B981' : fix.effort === 'Medium' ? '#F59E0B' : '#EF4444'}">${fix.effort} Effort</span>
                    </div>
                    <div style="font-size:0.8rem;color:rgba(255,255,255,0.7);margin-bottom:0.5rem;line-height:1.5">${fix.fix}</div>
                    <div style="font-size:0.75rem;font-weight:700;color:#10B981">📈 Expected: ${fix.impact}</div>
                </div>
            `).join('')}
        </div>`;
    },

    simulate() {
        const visitors = parseInt(document.getElementById('croVisitors')?.value) || 1000;
        const orders = parseInt(document.getElementById('croOrders')?.value) || 25;
        const aov = parseFloat(document.getElementById('croAOV')?.value) || 450;
        const currentCR = (orders / visitors * 100);
        const currentRevenue = orders * aov;
        const improvedCR = currentCR * 1.40; // 40% CRO improvement
        const improvedOrders = Math.round(visitors * improvedCR / 100);
        const improvedRevenue = improvedOrders * aov;
        const gain = improvedRevenue - currentRevenue;
        const resultEl = document.getElementById('croSimResult');
        if (!resultEl) return;

        resultEl.innerHTML = `
        <h3 style="margin-bottom:1rem">💰 CRO Revenue Impact</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">
            <div style="padding:0.85rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;text-align:center">
                <div style="font-size:0.65rem;color:var(--text-muted)">CURRENT CR</div>
                <div style="font-size:1.5rem;font-weight:800;color:#F59E0B">${currentCR.toFixed(1)}%</div>
            </div>
            <div style="padding:0.85rem;background:rgba(16,185,129,0.1);border-radius:0.5rem;text-align:center">
                <div style="font-size:0.65rem;color:var(--text-muted)">AFTER CRO</div>
                <div style="font-size:1.5rem;font-weight:800;color:#10B981">${improvedCR.toFixed(1)}%</div>
            </div>
            <div style="padding:0.85rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;text-align:center">
                <div style="font-size:0.65rem;color:var(--text-muted)">CURRENT REVENUE</div>
                <div style="font-size:1.1rem;font-weight:800">${VIQ.fmt(currentRevenue)}</div>
            </div>
            <div style="padding:0.85rem;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:0.5rem;text-align:center">
                <div style="font-size:0.65rem;color:var(--text-muted)">AFTER CRO</div>
                <div style="font-size:1.1rem;font-weight:800;color:#10B981">${VIQ.fmt(improvedRevenue)}</div>
            </div>
        </div>
        <div style="padding:1rem;background:rgba(16,185,129,0.08);border-radius:0.75rem;border:1px solid rgba(16,185,129,0.3);text-align:center">
            <div style="font-size:0.75rem;color:#10B981;font-weight:700">POTENTIAL MONTHLY GAIN</div>
            <div style="font-size:2rem;font-weight:900;color:#10B981">${VIQ.fmt(gain)}</div>
            <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-top:0.25rem">Just from optimizing what you already have — same ad spend, same traffic!</div>
        </div>`;
    },

    init() { this.render(); }
};
window.CROExpert = CROExpert;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 10: CONTENT CREATION AI
// ═══════════════════════════════════════════════════════════════════════════
const ContentAI = {
    hooks: {
        instagram: ['Wait, you can get {product} for this price? 👀', 'POV: You discovered {product} and your life changed 🔥', 'This {product} hits different — and here\'s why 💫', 'The {product} review nobody asked for but everyone needed'],
        youtube: ['I tested {product} for 30 days — here\'s what happened', 'The TRUTH about {product} nobody tells you (honest review)', 'Why I switched to {product} and never looked back'],
        whatsapp: ['🚨 Last 10 left! {product} almost sold out 🚨', '⭐ JUST IN: {product} at never-before price — see pic below', '🎁 SURPRISE! Free {product} with every order today only!']
    },

    scriptTemplate: (product, platform) => `
📹 VIDEO SCRIPT — ${product} for ${platform}

⏱️ HOOK (0-3 seconds — CRITICAL)
"Have you been spending too much on {product alternatives}? STOP. Here's what I discovered..."

📖 STORY (3-15 seconds)
"I was struggling with [problem] just like you. Then I found ${product}. Within 7 days, [specific result]. No exaggeration."

🎯 BENEFIT BREAKDOWN (15-40 seconds)
• Benefit 1: [Main transformation]
• Benefit 2: [Secondary value]  
• Benefit 3: [Unique differentiator]
✅ "And the best part? [Price/offer/guarantee]"

📣 CALL TO ACTION (Last 5 seconds)
"Link in bio / Tap the button / DM me "${product}" NOW — limited stock!"

⚡ VIRAL INGREDIENTS:
• Show, don't tell (product demo)
• Use real before/after
• Add trending sound
• Caption first 2 words = "Stop Scrolling" or "Watch this"
• Post at 7-9AM or 7-9PM for best reach`,

    ideas: (product, platform) => [
        `"${product} in 60 seconds" — speed content always performs`,
        `"${product} vs. alternatives" — comparison content = high intent viewers`,
        `"Day in the life using ${product}" — relatability = shares`,
        `"Unboxing ${product} — ASMR style" — satisfying = high completion rate`,
        `"What customers say about ${product}" — testimonial compilation`,
        `"5 ways to use ${product} you didn't know" — value content = saves`
    ],

    render() {
        const el = document.getElementById('contentAIContent');
        if (!el) return;
        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.5rem">🎬 Content Strategy Input</h3>
                <div class="form-group"><label>Product / Brand</label><input type="text" id="cntProduct" class="form-control" placeholder="e.g. Handcrafted Wooden Toys"></div>
                <div class="form-group">
                    <label>Platform</label>
                    <select id="cntPlatform" class="form-control">
                        <option value="instagram">Instagram Reels</option>
                        <option value="youtube">YouTube Shorts</option>
                        <option value="whatsapp">WhatsApp Status</option>
                    </select>
                </div>
                <button class="btn btn-primary w-full" onclick="ContentAI.generate()">🎬 Generate Content Strategy</button>
            </div>

            <div class="glass" style="padding:1.5rem" id="contentAIResults">
                <h3 style="margin-bottom:1rem">💡 Content Output</h3>
                <p style="color:var(--text-muted)">Enter your product and platform to get viral content ideas, hooks, and a complete video script.</p>
            </div>
        </div>`;
    },

    generate() {
        const product = document.getElementById('cntProduct')?.value?.trim();
        const platform = document.getElementById('cntPlatform')?.value || 'instagram';
        if (!product) { VIQ.showToast('Enter product name', 'error'); return; }

        const hooks = this.hooks[platform] || this.hooks.instagram;
        const ideas = this.ideas(product, platform);
        const script = this.scriptTemplate(product, platform);
        const resultEl = document.getElementById('contentAIResults');
        if (!resultEl) return;

        resultEl.innerHTML = `
        <h3 style="margin-bottom:1rem">🎬 Content Plan — <span style="color:#A855F7">${product}</span></h3>

        <div style="margin-bottom:1.25rem">
            <strong>🪝 4 Viral Hooks:</strong>
            ${hooks.map(h => `<div style="padding:0.65rem 0.85rem;background:rgba(139,92,246,0.08);border-radius:0.45rem;margin-top:0.4rem;font-size:0.85rem;font-style:italic">"${h.replace(/{product}/g, product)}"</div>`).join('')}
        </div>

        <div style="margin-bottom:1.25rem">
            <strong>💡 6 Viral Content Ideas:</strong>
            ${ideas.map((idea, i) => `<div style="display:flex;gap:0.5rem;align-items:flex-start;padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.82rem"><span>${i + 1}.</span>${idea}</div>`).join('')}
        </div>

        <div>
            <strong>📹 Video Script:</strong>
            <div style="padding:1rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;margin-top:0.5rem;font-size:0.8rem;white-space:pre-line;line-height:1.7;max-height:320px;overflow-y:auto">${script}</div>
        </div>`;
    },

    init() { this.render(); }
};
window.ContentAI = ContentAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 11: BUSINESS ANALYST AI
// ═══════════════════════════════════════════════════════════════════════════
const BusinessAnalystAI = {
    analyze() {
        try {
            const kpis = typeof DB !== 'undefined' ? DB.getKPIs() : {};
            const sales = typeof DB !== 'undefined' ? DB.getSales() : [];
            const inv = typeof DB !== 'undefined' ? DB.getInventory() : [];

            const revenue = kpis.revenue || 0;
            const expenses = kpis.expenses || 0;
            const profit = kpis.netProfit || 0;
            const margin = kpis.profitMargin || 0;
            const orders = sales.length;
            const aov = orders > 0 ? revenue / orders : 0;
            const invCount = inv.length;
            const totalStock = inv.reduce((s, i) => s + (i.stock || 0), 0);
            const inventoryValue = inv.reduce((s, i) => s + ((i.costPrice || 0) * (i.stock || 0)), 0);

            const performance = margin > 25 ? 'Excellent' : margin > 15 ? 'Good' : margin > 8 ? 'Average' : 'Critical';
            const perfColor = { Excellent: '#10B981', Good: '#06B6D4', Average: '#F59E0B', Critical: '#EF4444' }[performance];

            const insights = [];
            if (margin < 15) insights.push({ type: 'critical', text: `Profit margin (${margin.toFixed(1)}%) is below healthy threshold of 15%. Immediate action needed on pricing or cost reduction.` });
            if (aov > 0 && aov < 300) insights.push({ type: 'warning', text: `Average Order Value of ${VIQ.fmt(aov)} is low. Bundling and upselling can push this to ₹500+, adding 40%+ to revenue.` });
            if (invCount > 0 && totalStock > 500) insights.push({ type: 'info', text: `You have ${totalStock} units (${VIQ.fmt(inventoryValue)} value) in stock. Excess inventory locks capital — identify slow movers.` });
            if (revenue > 0 && expenses / revenue > 0.4) insights.push({ type: 'critical', text: `Expenses are ${((expenses / revenue) * 100).toFixed(0)}% of revenue — too high! Target is below 35% for sustainable business.` });
            if (margin > 25) insights.push({ type: 'success', text: `Excellent margin at ${margin.toFixed(1)}%! Focus is now scaling — add new products, new channels, and team.` });

            const actions = [];
            if (aov < 400 && revenue > 0) actions.push({ action: 'Create 3 bundle packs at ₹499, ₹799, ₹1199 price points', impact: '+25-40% AOV', priority: 'High' });
            if (orders < 50) actions.push({ action: 'Launch Instagram + WhatsApp referral campaign this week', impact: '+30-50 new orders', priority: 'High' });
            if (margin < 20) actions.push({ action: 'Negotiate with top 2 suppliers for 5% bulk discount', impact: '+3-5% margin', priority: 'Medium' });

            return { revenue, expenses, profit, margin, orders, aov, invCount, totalStock, inventoryValue, performance, perfColor, insights, actions };
        } catch { return { revenue: 0, expenses: 0, profit: 0, margin: 0, orders: 0, aov: 0, invCount: 0, totalStock: 0, inventoryValue: 0, performance: 'N/A', perfColor: '#8B5CF6', insights: [], actions: [] }; }
    },

    render() {
        const el = document.getElementById('businessAnalystContent');
        if (!el) return;
        const d = this.analyze();
        const iconMap = { critical: ['🔴', '#EF4444'], warning: ['🟡', '#F59E0B'], info: ['🔵', '#3B82F6'], success: ['🟢', '#10B981'] };

        el.innerHTML = `
        <!-- Performance Summary -->
        <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem;border:1px solid ${d.perfColor}44">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                <h3>📊 Business Performance Summary</h3>
                <span style="padding:0.4rem 1rem;border-radius:9999px;font-weight:800;background:${d.perfColor}22;color:${d.perfColor};border:1px solid ${d.perfColor}44">${d.performance}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem">
                ${[
                    ['Revenue', VIQ.fmt(d.revenue), '#10B981'],
                    ['Expenses', VIQ.fmt(d.expenses), '#EF4444'],
                    ['Net Profit', VIQ.fmt(d.profit), '#8B5CF6'],
                    ['Margin', d.margin.toFixed(1) + '%', d.perfColor],
                    ['Total Orders', d.orders, '#06B6D4'],
                    ['Avg Order Value', VIQ.fmt(d.aov), '#F59E0B'],
                    ['Products', d.invCount, '#A855F7'],
                    ['Inventory Value', VIQ.fmt(d.inventoryValue), '#64748B']
                ].map(([label, val, color]) => `
                    <div style="padding:0.75rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;text-align:center">
                        <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase">${label}</div>
                        <div style="font-size:1.2rem;font-weight:800;color:${color};margin-top:0.15rem">${val}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <!-- AI Insights -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">🧠 AI Insights (${d.insights.length})</h3>
                ${d.insights.length ? d.insights.map(ins => {
                    const [icon, color] = iconMap[ins.type] || ['💡', '#8B5CF6'];
                    return `<div style="padding:0.85rem;background:${color}0D;border-radius:0.5rem;margin-bottom:0.75rem;border-left:3px solid ${color};font-size:0.82rem;line-height:1.5">
                        ${icon} ${ins.text}
                    </div>`;
                }).join('') : '<p style="color:#10B981">✅ Business looks healthy! Add more data for deeper insights.</p>'}
            </div>

            <!-- Action Plan -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">🎯 Action Plan</h3>
                ${d.actions.length ? d.actions.map(act => `
                    <div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;margin-bottom:0.75rem;border:1px solid rgba(139,92,246,0.2)">
                        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
                            <div style="font-weight:700;font-size:0.85rem">→ ${act.action}</div>
                            ${VIQ.priority_badge(act.priority)}
                        </div>
                        <div style="font-size:0.75rem;color:#10B981">Expected: ${act.impact}</div>
                    </div>
                `).join('') : '<p style="color:var(--text-muted)">Add sales and expense data for actionable recommendations.</p>'}
            </div>
        </div>`;
    },

    init() { this.render(); }
};
window.BusinessAnalystAI = BusinessAnalystAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 12: RETURNS ANALYSIS AI
// ═══════════════════════════════════════════════════════════════════════════
const ReturnsAI = {
    getKey: () => 'viq_returns_' + VIQ.uid(),

    fraudPatterns: [
        'Same customer, multiple return requests within 7 days',
        'Returns with no reason / vague reason (e.g. "not needed")',
        'Order placed at midnight, returned within hours',
        'High value item returned with replacement request',
        'Multiple accounts from same address/phone'
    ],

    render() {
        const el = document.getElementById('returnsAIContent');
        if (!el) return;
        const returns = VIQ.lsGet(this.getKey());
        const highRisk = returns.filter(r => r.reason === 'no_reason' || r.value > 2000);
        const totalLoss = returns.reduce((s, r) => s + (parseFloat(r.value) || 0), 0);

        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.5rem">📦 Log Return</h3>
                <div class="form-group"><label>Product Name</label><input type="text" id="retProduct" class="form-control" placeholder="Product returned"></div>
                <div class="form-group"><label>Order Value (₹)</label><input type="number" id="retValue" class="form-control" placeholder="500"></div>
                <div class="form-group">
                    <label>Return Reason</label>
                    <select id="retReason" class="form-control">
                        <option value="defective">Defective / Damaged</option>
                        <option value="wrong_item">Wrong item delivered</option>
                        <option value="not_as_described">Not as described</option>
                        <option value="size_fit">Size / Fit issue</option>
                        <option value="no_reason">No reason given ⚠️</option>
                        <option value="changed_mind">Changed mind</option>
                    </select>
                </div>
                <div class="form-group"><label>Customer Name</label><input type="text" id="retCustomer" class="form-control" placeholder="Optional"></div>
                <button class="btn btn-primary w-full" onclick="ReturnsAI.logReturn()">📋 Log Return</button>
            </div>

            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">📊 Return Statistics</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem">
                    <div style="padding:0.85rem;background:rgba(239,68,68,0.08);border-radius:0.5rem;text-align:center">
                        <div style="font-size:0.65rem;color:var(--text-muted)">TOTAL RETURNS</div>
                        <div style="font-size:1.5rem;font-weight:800;color:#EF4444">${returns.length}</div>
                    </div>
                    <div style="padding:0.85rem;background:rgba(245,158,11,0.08);border-radius:0.5rem;text-align:center">
                        <div style="font-size:0.65rem;color:var(--text-muted)">HIGH RISK</div>
                        <div style="font-size:1.5rem;font-weight:800;color:#F59E0B">${highRisk.length}</div>
                    </div>
                    <div style="padding:0.85rem;background:rgba(239,68,68,0.08);border-radius:0.5rem;text-align:center;grid-column:span 2">
                        <div style="font-size:0.65rem;color:var(--text-muted)">TOTAL RETURN VALUE LOSS</div>
                        <div style="font-size:1.5rem;font-weight:800;color:#EF4444">${VIQ.fmt(totalLoss)}</div>
                    </div>
                </div>

                <div style="margin-bottom:1rem">
                    <strong style="font-size:0.85rem">🚨 Fraud Pattern Checklist:</strong>
                    ${this.fraudPatterns.map(p => `<div style="display:flex;gap:0.5rem;align-items:center;padding:0.35rem 0;font-size:0.78rem;color:var(--text-muted)"><span style="color:#EF4444">⚠️</span>${p}</div>`).join('')}
                </div>
            </div>
        </div>

        ${returns.length ? `
        <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
            <h3 style="margin-bottom:1rem">📋 Return History</h3>
            <div class="table-container"><table>
                <thead><tr><th>Product</th><th>Value</th><th>Reason</th><th>Customer</th><th>Risk</th><th>Date</th></tr></thead>
                <tbody>${returns.slice(0, 20).map(r => {
                    const isHighRisk = r.reason === 'no_reason' || parseFloat(r.value) > 2000;
                    return `<tr>
                        <td><strong>${r.product}</strong></td>
                        <td style="color:#EF4444">₹${r.value}</td>
                        <td>${r.reason.replace(/_/g, ' ')}</td>
                        <td style="color:var(--text-muted)">${r.customer || '—'}</td>
                        <td><span style="padding:2px 8px;border-radius:9999px;font-size:0.7rem;font-weight:700;background:${isHighRisk ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'};color:${isHighRisk ? '#EF4444' : '#10B981'}">${isHighRisk ? '🚨 HIGH' : '✅ LOW'}</span></td>
                        <td style="font-size:0.78rem;color:var(--text-muted)">${r.date}</td>
                    </tr>`;
                }).join('')}</tbody>
            </table></div>
        </div>` : ''}

        <div class="glass" style="padding:1.5rem;border-left:4px solid #8B5CF6">
            <h3 style="margin-bottom:1rem">🛡️ Return Prevention Strategies</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem">
                ${[
                    ['📸 Better Photos', 'Add 360° views, size charts & real-use images. Reduces "not as described" returns by 35%.'],
                    ['📝 Accurate Description', 'List exact dimensions, materials & limitations. Set correct expectations upfront.'],
                    ['📦 Better Packaging', 'Double-pack fragile items. Use branded packaging — reduces damage returns by 40%.'],
                    ['💬 Pre-delivery Message', 'WhatsApp customers pre-delivery: "Your order ships today! Here\'s what to expect..." — builds trust.'],
                    ['⭐ Post-purchase Follow-up', 'Message after delivery: "Happy with your {product}?" Catch issues before they escalate to returns.'],
                    ['🚦 Return Policy Clarity', 'Clear, simple policy reduces disputes. Specify: what\'s returnable, timeline, condition.']
                ].map(([title, desc]) => `
                    <div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem">
                        <div style="font-weight:700;margin-bottom:0.25rem;font-size:0.85rem">${title}</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.5">${desc}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    },

    logReturn() {
        const product = document.getElementById('retProduct')?.value?.trim();
        const value = document.getElementById('retValue')?.value;
        const reason = document.getElementById('retReason')?.value;
        const customer = document.getElementById('retCustomer')?.value?.trim();
        if (!product) { VIQ.showToast('Enter product name', 'error'); return; }
        VIQ.lsPush(this.getKey(), { product, value: parseFloat(value) || 0, reason, customer, date: new Date().toISOString().split('T')[0], id: 'ret_' + Date.now() });
        this.render();
        VIQ.showToast('Return logged', 'info');
    },

    init() { this.render(); }
};
window.ReturnsAI = ReturnsAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 13: LOGISTICS AI
// ═══════════════════════════════════════════════════════════════════════════
const LogisticsAI = {
    carriers: [
        { name: 'Delhivery', surface500g: 45, air500g: 65, cod: 28, tracking: true, cod_applicable: true, strength: 'Best for bulk & small towns' },
        { name: 'Shiprocket', surface500g: 38, air500g: 55, cod: 25, tracking: true, cod_applicable: true, strength: 'Best automation & multi-carrier' },
        { name: 'Ekart', surface500g: 35, air500g: 50, cod: 22, tracking: true, cod_applicable: true, strength: 'Best for South India & Tier 2' },
        { name: 'DTDC', surface500g: 42, air500g: 60, cod: 27, tracking: true, cod_applicable: true, strength: 'Widest pin coverage in India' },
        { name: 'BlueDart', surface500g: 85, air500g: 120, cod: 40, tracking: true, cod_applicable: false, strength: 'Premium, fastest, B2B preferred' },
        { name: 'India Post', surface500g: 18, air500g: 35, cod: 0, tracking: false, cod_applicable: false, strength: 'Cheapest — best for prepaid to rural' }
    ],

    render() {
        const el = document.getElementById('logisticsContent');
        if (!el) return;
        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.5rem">📦 Shipping Calculator</h3>
                <div class="form-group"><label>Package Weight (grams)</label><input type="number" id="logWeight" class="form-control" value="500" min="1"></div>
                <div class="form-group">
                    <label>Shipping Mode</label>
                    <select id="logMode" class="form-control">
                        <option value="surface">Surface (2-5 days)</option>
                        <option value="air">Air (1-2 days)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Type</label>
                    <select id="logPayment" class="form-control">
                        <option value="prepaid">Prepaid (Online/UPI)</option>
                        <option value="cod">Cash on Delivery</option>
                    </select>
                </div>
                <div class="form-group"><label>Order Value (₹)</label><input type="number" id="logOrderValue" class="form-control" value="500"></div>
                <button class="btn btn-primary w-full" onclick="LogisticsAI.compareCarriers()">🚚 Compare All Carriers</button>
            </div>

            <div class="glass" style="padding:1.5rem" id="logisticsResults">
                <h3 style="margin-bottom:1rem">💰 Carrier Comparison</h3>
                <p style="color:var(--text-muted)">Configure shipping parameters to compare all major carriers.</p>
                <div style="margin-top:1.5rem;padding:1rem;background:rgba(16,185,129,0.08);border-radius:0.75rem;border:1px solid rgba(16,185,129,0.2)">
                    <strong>💡 Logistics Tip:</strong>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem">Negotiate monthly contracts with 2-3 carriers. At ₹50K+ monthly shipping spend, you can get 20-30% off standard rates. Always compare before committing.</div>
                </div>
            </div>
        </div>

        <div class="glass" style="padding:1.5rem">
            <h3 style="margin-bottom:1rem">⚡ Logistics Optimization Playbook</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem">
                ${[
                    ['📦 Right-Size Packaging', 'Match box size to product. Avoid 5kg DIM weight for 500g item. Saves ₹10-25 per order.', '#8B5CF6'],
                    ['🏙️ Zone-Based Routing', 'Use Ekart/Delhivery for local zones, India Post for rural — cuts cost by 30%.', '#10B981'],
                    ['💳 Push Prepaid Orders', 'Offer ₹20-50 cashback for UPI payment — eliminates ₹25-40 COD fees + reduces RTO.', '#F59E0B'],
                    ['🔄 Reduce RTO %', 'RTO (Return to Origin) costs ₹50-120 per order. Verify address via call before dispatch.', '#EF4444'],
                    ['📬 Batch Shipments', 'Ship daily 1 PM — get afternoon pickup slots and next-morning delivery times.', '#06B6D4'],
                    ['🌐 Warehouse Strategy', 'At 500+ orders/month: consider 3PL warehouse near your top customer city — cuts delivery time & cost.', '#A855F7']
                ].map(([title, desc, color]) => `
                    <div style="padding:1rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;border-left:3px solid ${color}">
                        <div style="font-weight:700;margin-bottom:0.35rem;font-size:0.88rem">${title}</div>
                        <div style="font-size:0.78rem;color:rgba(255,255,255,0.65);line-height:1.5">${desc}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    },

    compareCarriers() {
        const weight = parseInt(document.getElementById('logWeight')?.value) || 500;
        const mode = document.getElementById('logMode')?.value || 'surface';
        const isCOD = document.getElementById('logPayment')?.value === 'cod';
        const orderValue = parseFloat(document.getElementById('logOrderValue')?.value) || 500;
        const resultEl = document.getElementById('logisticsResults');
        if (!resultEl) return;

        const weightFactor = weight / 500;
        const comparisons = this.carriers.map(c => {
            const baseRate = mode === 'air' ? c.air500g : c.surface500g;
            const shipping = Math.round(baseRate * weightFactor);
            const codFee = (isCOD && c.cod_applicable) ? c.cod : (isCOD && !c.cod_applicable) ? null : 0;
            const total = codFee !== null ? shipping + codFee : null;
            const pctOfOrder = total ? ((total / orderValue) * 100).toFixed(1) : null;
            return { ...c, shipping, codFee, total, pctOfOrder };
        }).filter(c => c.total !== null).sort((a, b) => a.total - b.total);

        const cheapest = comparisons[0];

        resultEl.innerHTML = `
        <h3 style="margin-bottom:1rem">🚚 Carrier Comparison — ${weight}g ${mode} ${isCOD ? 'COD' : 'Prepaid'}</h3>
        <div style="display:grid;gap:0.6rem">
            ${comparisons.map((c, i) => `
                <div style="padding:0.85rem 1rem;background:${i === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)'};border-radius:0.5rem;border:${i === 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)'};display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:700;font-size:0.9rem">${i === 0 ? '🏆 ' : ''}${c.name} ${i === 0 ? '<span style="font-size:0.65rem;color:#10B981;margin-left:0.3rem">RECOMMENDED</span>' : ''}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted)">${c.strength}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:800;color:${i === 0 ? '#10B981' : 'white'}">₹${c.total}</div>
                        <div style="font-size:0.68rem;color:var(--text-muted)">${c.pctOfOrder}% of order value</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:1rem;padding:0.85rem;background:rgba(16,185,129,0.08);border-radius:0.5rem;font-size:0.82rem">
            💡 Use <strong>${cheapest.name}</strong> for maximum savings. At 100 orders/month, saves <strong>${VIQ.fmt((comparisons[comparisons.length - 1].total - cheapest.total) * 100)}</strong> vs most expensive option.
        </div>`;
    },

    init() { this.render(); }
};
window.LogisticsAI = LogisticsAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 14: FINANCE AI (Indian Seller — GST & Profit)
// ═══════════════════════════════════════════════════════════════════════════
const FinanceAI = {
    gstSlabs: [0, 5, 12, 18, 28],

    calculateGST(amount, rate) {
        const gst = (amount * rate) / (100 + rate);
        const base = amount - gst;
        const cgst = gst / 2;
        const sgst = gst / 2;
        return { base: base.toFixed(2), gst: gst.toFixed(2), cgst: cgst.toFixed(2), sgst: sgst.toFixed(2), total: amount.toFixed(2) };
    },

    render() {
        const el = document.getElementById('financeAIContent');
        if (!el) return;
        const kpis = typeof DB !== 'undefined' ? DB.getKPIs() : {};
        const revenue = kpis.revenue || 0;
        const expenses = kpis.expenses || 0;
        const profit = kpis.netProfit || 0;

        el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
            <!-- P&L Summary -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.25rem">📊 Profit & Loss Statement</h3>
                <div style="display:grid;gap:0.5rem">
                    ${[
                        ['Total Revenue (Gross)', VIQ.fmt(revenue), '#10B981', false],
                        ['Total Expenses (OPEX)', `- ${VIQ.fmt(expenses)}`, '#EF4444', false],
                        ['Net Profit', VIQ.fmt(profit), profit >= 0 ? '#10B981' : '#EF4444', true],
                        ['Profit Margin %', (kpis.profitMargin || 0).toFixed(1) + '%', '#8B5CF6', false],
                    ].map(([label, val, color, bold]) => `
                        <div style="display:flex;justify-content:space-between;padding:0.6rem 0.85rem;background:rgba(255,255,255,${bold ? '0.08' : '0.04'});border-radius:0.4rem${bold ? ';border:1px solid rgba(255,255,255,0.1)' : ''}">
                            <span style="font-size:0.85rem${bold ? ';font-weight:700' : ''}">${label}</span>
                            <span style="font-weight:800;color:${color}">${val}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top:1.25rem;padding:1rem;background:rgba(245,158,11,0.08);border-radius:0.5rem;border:1px solid rgba(245,158,11,0.2)">
                    <div style="font-size:0.7rem;color:#F59E0B;font-weight:700;margin-bottom:0.35rem">🤖 AI Financial Health</div>
                    <div style="font-size:0.82rem;color:rgba(255,255,255,0.75)">
                        ${profit > 0 ? `Your business is profitable! Margin is ${(kpis.profitMargin || 0).toFixed(1)}%. ${(kpis.profitMargin || 0) > 25 ? 'Excellent — focus on scaling.' : 'Work on reaching 25%+ for long-term sustainability.'}` : revenue === 0 ? 'Log your sales and expenses to see your P&L analysis here.' : '🚨 Business is in loss! Urgent need to either increase revenue or cut expenses.'}
                    </div>
                </div>
            </div>

            <!-- GST Calculator -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1.25rem">🧾 GST Calculator</h3>
                <div class="form-group"><label>Sale Amount (Inclusive of GST) ₹</label><input type="number" id="gstAmount" class="form-control" placeholder="1180" value="1180"></div>
                <div class="form-group">
                    <label>GST Rate</label>
                    <select id="gstRate" class="form-control">
                        ${this.gstSlabs.map(r => `<option value="${r}">${r}% GST</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary w-full" onclick="FinanceAI.calcGST()">Calculate GST Breakdown</button>
                <div id="gstResult" style="margin-top:1rem"></div>
            </div>
        </div>

        <!-- GST Period Summary from actual data -->
        <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
            <h3 style="margin-bottom:1rem">📋 Estimated GST Summary (from logged revenue)</h3>
            <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem">⚠️ This is an estimate only. Consult a CA for actual GST filing.</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
                ${[5, 12, 18].map(rate => {
                    const est_rev = revenue * 0.33;
                    const calc = this.calculateGST(est_rev, rate);
                    return `<div style="padding:1rem;background:rgba(255,255,255,0.05);border-radius:0.5rem;border:1px solid rgba(245,158,11,0.2)">
                        <div style="font-size:0.7rem;color:#F59E0B;font-weight:700;margin-bottom:0.5rem">IF ${rate}% GST SLAB</div>
                        <div style="font-size:0.8rem;margin-bottom:0.25rem">Base: <strong>${VIQ.fmt(parseFloat(calc.base))}</strong></div>
                        <div style="font-size:0.8rem;margin-bottom:0.25rem">CGST: <strong style="color:#F59E0B">${VIQ.fmt(parseFloat(calc.cgst))}</strong></div>
                        <div style="font-size:0.8rem">SGST: <strong style="color:#F59E0B">${VIQ.fmt(parseFloat(calc.sgst))}</strong></div>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <div class="glass" style="padding:1.5rem;border-left:4px solid #F59E0B">
            <h3 style="margin-bottom:1rem">💡 Tax Tips for Indian Sellers</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem">
                ${[
                    ['Under ₹40L/year?', 'No GST registration needed. If below threshold, avoid unnecessary compliance cost.'],
                    ['File GSTR-1 monthly', 'For outward supplies. Late filing = ₹50/day penalty. Set calendar reminder!'],
                    ['ITC (Input Tax Credit)', 'Claim back GST paid on purchases like packaging, machinery, raw material.'],
                    ['Composition Scheme', 'If turnover < ₹1.5 Cr, pay 1% flat GST (traders). Simpler filing, lower tax burden.'],
                    ['Business Bank Account', 'Separate business account = easier GST tracking + bank loan eligibility.'],
                    ['Hire a CA for ₹500/mo', 'A good CA saves 5-10X their fee in tax savings and compliance avoidance.']
                ].map(([title, desc]) => `
                    <div style="padding:0.85rem;background:rgba(245,158,11,0.06);border-radius:0.5rem">
                        <div style="font-weight:700;font-size:0.82rem;color:#F59E0B;margin-bottom:0.25rem">${title}</div>
                        <div style="font-size:0.77rem;color:rgba(255,255,255,0.65);line-height:1.5">${desc}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    },

    calcGST() {
        const amount = parseFloat(document.getElementById('gstAmount')?.value) || 0;
        const rate = parseFloat(document.getElementById('gstRate')?.value) || 18;
        if (!amount) { VIQ.showToast('Enter sale amount', 'error'); return; }
        const calc = this.calculateGST(amount, rate);
        const resultEl = document.getElementById('gstResult');
        if (!resultEl) return;
        resultEl.innerHTML = `
        <div style="padding:1rem;background:rgba(245,158,11,0.08);border-radius:0.5rem;border:1px solid rgba(245,158,11,0.25)">
            <div style="font-size:0.7rem;color:#F59E0B;font-weight:700;margin-bottom:0.5rem">GST BREAKDOWN — ${rate}% SLAB</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem">
                ${[['Base Amount (Taxable)', VIQ.fmt(parseFloat(calc.base))], ['GST Amount Total', VIQ.fmt(parseFloat(calc.gst))], ['CGST (Central)', VIQ.fmt(parseFloat(calc.cgst))], ['SGST (State)', VIQ.fmt(parseFloat(calc.sgst))], ['Invoice Total', VIQ.fmt(parseFloat(calc.total))]].map(([l, v]) => `
                    <div style="font-size:0.8rem;color:var(--text-muted)">${l}</div>
                    <div style="font-size:0.8rem;font-weight:700;text-align:right">${v}</div>
                `).join('')}
            </div>
        </div>`;
    },

    init() { this.render(); }
};
window.FinanceAI = FinanceAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 15: GROWTH STRATEGIST AI
// ═══════════════════════════════════════════════════════════════════════════
const GrowthAI = {
    phases: [
        { label: 'Phase 1: Survive', range: '₹0–₹1L/mo', icon: '🌱', desc: 'Build core offering, get first 50 customers, prove product-market fit', color: '#10B981' },
        { label: 'Phase 2: Stabilize', range: '₹1L–₹5L/mo', icon: '🚀', desc: 'Build repeatable sales process, hire 1st staff, automate reordering', color: '#06B6D4' },
        { label: 'Phase 3: Scale', range: '₹5L–₹20L/mo', icon: '⚡', desc: 'Multiple channels active, team of 3-5, consider 2nd product line', color: '#F59E0B' },
        { label: 'Phase 4: Dominate', range: '₹20L+/mo', icon: '🏆', desc: 'Brand building, private label, franchise model or D2C website', color: '#8B5CF6' }
    ],

    render() {
        const el = document.getElementById('growthAIContent');
        if (!el) return;
        const kpis = typeof DB !== 'undefined' ? DB.getKPIs() : {};
        const revenue = kpis.revenue || 0;
        const margin = kpis.profitMargin || 0;

        // Current phase detection
        const currentPhase = revenue < 100000 ? 0 : revenue < 500000 ? 1 : revenue < 2000000 ? 2 : 3;

        // Revenue forecast (simple linear growth simulation)
        const monthlyRevenue = revenue;
        const growthRate = margin > 25 ? 0.15 : margin > 15 ? 0.10 : 0.06;
        const forecasts = [1, 3, 6, 12].map(m => ({ month: m, revenue: Math.round(monthlyRevenue * Math.pow(1 + growthRate, m)) }));

        el.innerHTML = `
        <!-- Growth Phase Chart -->
        <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
            <h3 style="margin-bottom:1.25rem">🗺️ Your Business Growth Roadmap</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem">
                ${this.phases.map((phase, i) => `
                    <div style="padding:1.25rem;background:rgba(255,255,255,${i === currentPhase ? '0.08' : '0.03'});border-radius:0.75rem;border:${i === currentPhase ? `2px solid ${phase.color}` : '1px solid rgba(255,255,255,0.06)'}">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
                            <span style="font-size:1.5rem">${phase.icon}</span>
                            ${i === currentPhase ? `<span style="font-size:0.65rem;background:${phase.color};color:white;padding:2px 8px;border-radius:9999px;font-weight:800">YOU ARE HERE</span>` : ''}
                        </div>
                        <div style="font-weight:700;margin-bottom:0.25rem;color:${phase.color}">${phase.label}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:0.5rem">${phase.range}</div>
                        <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);line-height:1.5">${phase.desc}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem">
            <!-- Revenue Forecast -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">📈 Revenue Forecast</h3>
                <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:1rem">Based on current performance at ${growthRate * 100}% monthly growth rate:</p>
                <div style="display:grid;gap:0.5rem">
                    <div style="display:flex;justify-content:space-between;padding:0.5rem 0.75rem;background:rgba(255,255,255,0.05);border-radius:0.4rem;font-size:0.8rem">
                        <span>Now</span><strong>${VIQ.fmt(monthlyRevenue)}</strong>
                    </div>
                    ${forecasts.map(f => `
                        <div style="display:flex;justify-content:space-between;padding:0.5rem 0.75rem;background:rgba(255,255,255,0.04);border-radius:0.4rem;font-size:0.8rem">
                            <span>+${f.month} Month${f.month > 1 ? 's' : ''}</span>
                            <strong style="color:#10B981">${VIQ.fmt(f.revenue)}</strong>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top:1rem;padding:0.75rem;background:rgba(139,92,246,0.08);border-radius:0.5rem;font-size:0.78rem;color:var(--text-muted)">
                    ⚡ Growth accelerates when you hit ₹1L/month — more capital = more marketing = exponential curves
                </div>
            </div>

            <!-- Growth Targets & Strategy -->
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">🎯 90-Day Growth Targets</h3>
                <div style="display:grid;gap:0.6rem">
                    ${[
                        ['Revenue Target', VIQ.fmt(Math.round(revenue * 1.3)), 'Grow by 30% via new channel expansion'],
                        ['Margin Target', margin > 25 ? '30%+' : '25%+', 'Reduce 1 major cost category this month'],
                        ['New Products', '2-3 SKUs', 'Test trending products from market analysis'],
                        ['Customer Base', '+50 new buyers', 'WhatsApp referral + Instagram campaign'],
                        ['Average Order Value', VIQ.fmt(Math.round((revenue / Math.max(1, typeof DB !== 'undefined' ? DB.getSales().length : 1)) * 1.25)), 'Bundle + upsell strategy implementation']
                    ].map(([label, target, action]) => `
                        <div style="padding:0.65rem 0.85rem;background:rgba(255,255,255,0.04);border-radius:0.4rem">
                            <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem">
                                <span style="font-size:0.8rem">${label}</span>
                                <strong style="font-size:0.85rem;color:#10B981">${target}</strong>
                            </div>
                            <div style="font-size:0.72rem;color:var(--text-muted)">${action}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Growth Playbook -->
        <div class="glass" style="padding:1.5rem;border-left:4px solid #8B5CF6">
            <h3 style="margin-bottom:1rem">📖 Phase ${currentPhase + 1} Growth Playbook — ${this.phases[currentPhase].label}</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem">
                ${[
                    ['Week 1-2', 'Audit all products. Kill bottom 20% by margin. Double down on top 3.', '#8B5CF6'],
                    ['Week 3-4', 'Launch 1 new marketing channel. Set up tracking. Run ₹300/day test campaign.', '#F59E0B'],
                    ['Month 2', 'Supplier renegotiation. Target 5% COGS reduction. Test 2 new product ideas.', '#10B981'],
                    ['Month 3', 'Hire 1 part-time helper. Systematize top 5 operations. Set growth target for Q2.', '#06B6D4']
                ].map(([period, plan, color]) => `
                    <div style="padding:0.85rem;background:rgba(255,255,255,0.04);border-radius:0.5rem;border-top:3px solid ${color}">
                        <div style="font-weight:700;font-size:0.78rem;color:${color};margin-bottom:0.35rem">📅 ${period}</div>
                        <div style="font-size:0.8rem;line-height:1.5;color:rgba(255,255,255,0.75)">${plan}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    },

    init() { this.render(); }
};
window.GrowthAI = GrowthAI;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 16: VENDRIXA IQ VOICE AI CO-FOUNDER
// ═══════════════════════════════════════════════════════════════════════════
const VoiceAICofounder = {
    conversations: [],
    isProcessing: false,

    intents: {
        sales_drop: ['low sales', 'sales drop', 'bikri kam', 'revenue down', 'no orders', 'orders nahi', 'sales kyu giri'],
        pricing: ['price', 'kitna price', 'optimal price', 'competitor price', 'pricing strategy'],
        inventory: ['stock', 'restock', 'inventory', 'out of stock', 'overclock', 'overstock', 'maal', 'saman'],
        marketing: ['marketing', 'advertise', 'ad', 'campaign', 'instagram', 'facebook', 'promo'],
        profit: ['profit', 'margin', 'loss', 'earning', 'income', 'munafa', 'ghata'],
        growth: ['grow', 'scale', 'expand', 'next level', 'business grow'],
        gst: ['gst', 'tax', 'invoice', 'filing'],
        action: ['what should i do', 'kya karu', 'help me', 'suggestion', 'next step'],
        competitor: ['competitor', 'competition', 'market', 'rival']
    },

    detectIntent(text) {
        const q = text.toLowerCase();
        for (const [intent, keywords] of Object.entries(this.intents)) {
            if (keywords.some(k => q.includes(k))) return intent;
        }
        return 'general';
    },

    buildResponse(text) {
        const intent = this.detectIntent(text);
        const ctx = this.buildCtx();

        const handlers = {
            sales_drop: () => {
                const reasons = [];
                if (ctx.margin < 15) reasons.push('your margins are low, which may indicate pricing issues');
                if (ctx.outOfStock > 0) reasons.push(`${ctx.outOfStock} products are out of stock — that's direct lost sales`);
                reasons.push('marketing reach may need boost');
                return {
                    text: `Your sales may be dropping because: ${reasons.slice(0, 2).join(' and ')}. Here's what I recommend: 1) Check your top 3 products' stock levels RIGHT NOW, 2) Launch a 24-hour flash sale with 10% discount on WhatsApp, 3) If margin allows, run ₹200/day Instagram ad on your best seller.`,
                    actions: [{ type: 'marketing_launch', details: 'Flash sale campaign — 24 hours, 10% off' }, { type: 'inventory_check', details: 'Verify stock of top 5 products' }]
                };
            },
            pricing: () => ({
                text: `For optimal pricing: 1) Your cost + 30-40% margin = minimum price. 2) Check competitor prices weekly. 3) Use ₹X99 psychological pricing (₹499 not ₹500). 4) During festivals, raise by 10-15% — demand is inelastic. Want me to calculate for a specific product?`,
                actions: [{ type: 'pricing_review', details: 'Review all product prices vs competitor benchmark' }]
            }),
            inventory: () => {
                const msg = ctx.outOfStock > 0
                    ? `🚨 URGENT: ${ctx.outOfStock} products are out of stock right now! This is losing you sales every minute. Restock immediately. Also, ${ctx.lowStock} items are below 5 units — reorder today.`
                    : 'Your inventory looks manageable, but keep checking weekly. Set reorder alerts at 10 units for fast-moving products.';
                return { text: msg, actions: [{ type: 'restock', details: `Restock ${ctx.outOfStock} out-of-stock products` }] };
            },
            marketing: () => ({
                text: `Top 3 marketing moves right now: 1) WhatsApp broadcast to your contact list — FREE and 60% open rate. 2) Instagram Reel showing your product in 30 seconds — post 3x per week. 3) Google Business profile — add photos and collect reviews. Which would you like to start with today?`,
                actions: [{ type: 'marketing_launch', details: 'WhatsApp broadcast campaign' }]
            }),
            profit: () => ({
                text: ctx.revenue > 0
                    ? `Your current margin is ${ctx.margin.toFixed(1)}%. ${ctx.margin > 25 ? 'Excellent! Now focus on scaling.' : ctx.margin > 15 ? 'Decent, but target 25%+. Raise prices by 5% on top sellers and cut 1 expense category.' : '🚨 Critical! You need to either raise prices by 10% or negotiate with suppliers for 8% better rates. Do BOTH if possible.'}`
                    : 'Log your sales and expenses to get profit analysis.',
                actions: [{ type: 'pricing_update', details: `Raise prices on low-margin products` }]
            }),
            growth: () => ({
                text: `Growth playbook for sellers: MONTH 1 — Kill weak products, double down on winners. MONTH 2 — Add 1 new platform (if only Amazon → add Meesho). MONTH 3 — Build WhatsApp customer list. YEAR 1 GOAL: ₹5L/month revenue with 25%+ margin. Which phase are you in?`,
                actions: [{ type: 'growth_plan', details: 'Expand to new sales channels' }]
            }),
            gst: () => ({
                text: `For Indian sellers: 1) Below ₹40L/year = no GST registration needed. 2) Above that = register and file GSTR-1 monthly. 3) Claim Input Tax Credit on your purchases. 4) Composition scheme available for <₹1.5Cr turnover at 1% flat. Use the Finance AI module for calculations!`,
                actions: [{ type: 'finance_review', details: 'Check GST liability in Finance section' }]
            }),
            action: () => {
                const topActions = [];
                if (ctx.outOfStock > 0) topActions.push('Restock out-of-stock products immediately');
                if (ctx.margin < 20) topActions.push('Raise prices by 8-10% on top 2 products');
                if (ctx.revenue < 50000) topActions.push('Launch WhatsApp + Instagram campaign today');
                topActions.push('Review this week\'s expense report and cut 1 cost');
                return {
                    text: `Based on your business data, here are your TOP ${topActions.length} actions RIGHT NOW: ${topActions.map((a, i) => `${i + 1}) ${a}`).join('. ')}`,
                    actions: topActions.map(a => ({ type: 'priority_action', details: a }))
                };
            },
            competitor: () => ({
                text: `To beat competitors: 1) Don't compete on price alone — add value (better packaging, faster shipping, COD). 2) Get more reviews than competitors. 3) Stock what they're frequently out of. 4) Target their unhappy customers via reviews. Use the Competitor Analysis module to track specific products!`,
                actions: [{ type: 'competitor_analysis', details: 'Add competitor products for comparison' }]
            }),
            general: () => ({
                text: `I'm Vendrixa IQ — your AI co-founder! I can help with: sales drop analysis, pricing strategy, inventory management, marketing campaigns, GST queries, competitor strategy, and growth planning. What's your biggest business challenge right now? Be specific — I give specific answers!`,
                actions: []
            })
        };

        const handler = handlers[intent] || handlers.general;
        return { ...handler(), intent };
    },

    buildCtx() {
        try {
            const kpis = typeof DB !== 'undefined' ? DB.getKPIs() : {};
            const inv = typeof DB !== 'undefined' ? DB.getInventory() : [];
            return {
                revenue: kpis.revenue || 0,
                margin: kpis.profitMargin || 0,
                outOfStock: inv.filter(i => i.stock === 0).length,
                lowStock: inv.filter(i => i.stock > 0 && i.stock < 5).length
            };
        } catch { return { revenue: 0, margin: 0, outOfStock: 0, lowStock: 0 }; }
    },

    addMessage(text, role, actions = []) {
        const msg = { text, role, actions, timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
        this.conversations.push(msg);
        this.renderMessages();
    },

    sendMessage(text) {
        if (!text?.trim() || this.isProcessing) return;
        this.isProcessing = true;
        this.clearInput();
        this.addMessage(text, 'user');
        this.showTyping();

        setTimeout(() => {
            const result = this.buildResponse(text);
            this.hideTyping();
            this.addMessage(result.text, 'ai', result.actions || []);
            this.isProcessing = false;

            // Speak via voice assistant if available
            if (typeof VoiceAssistant !== 'undefined' && !VoiceAssistant.isMuted) {
                VoiceAssistant.speak(result.text.substring(0, 300));
            }
        }, 1200 + Math.random() * 800);
    },

    clearInput() {
        const inp = document.getElementById('viqChatInput');
        if (inp) inp.value = '';
    },

    showTyping() {
        const area = document.getElementById('viqMessages');
        if (!area) return;
        const t = document.createElement('div');
        t.id = 'viqTyping';
        t.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.75rem;margin-bottom:0.5rem;opacity:0.7';
        t.innerHTML = '<span style="font-size:1.2rem">🤖</span><div style="background:rgba(139,92,246,0.15);padding:0.6rem 0.85rem;border-radius:0.75rem"><span class="typing-dots">●●●</span></div>';
        area.appendChild(t);
        area.scrollTop = area.scrollHeight;
    },

    hideTyping() {
        document.getElementById('viqTyping')?.remove();
    },

    renderMessages() {
        const area = document.getElementById('viqMessages');
        if (!area) return;
        area.innerHTML = this.conversations.map(msg => `
            <div style="display:flex;${msg.role === 'user' ? 'flex-direction:row-reverse;' : ''}align-items:flex-start;gap:0.6rem;margin-bottom:1rem">
                <div style="width:32px;height:32px;border-radius:50%;background:${msg.role === 'user' ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.2)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem">${msg.role === 'user' ? '👤' : '🤖'}</div>
                <div style="max-width:75%">
                    <div style="padding:0.85rem 1rem;border-radius:${msg.role === 'user' ? '1rem 0.25rem 1rem 1rem' : '0.25rem 1rem 1rem 1rem'};background:${msg.role === 'user' ? 'rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1)'};font-size:0.85rem;line-height:1.65">
                        ${msg.text}
                    </div>
                    ${msg.actions && msg.actions.length ? `
                    <div style="margin-top:0.4rem;display:flex;flex-wrap:wrap;gap:0.35rem">
                        ${msg.actions.map(a => `<span style="padding:2px 8px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:9999px;font-size:0.68rem;color:#10B981">⚡ ${a.details?.substring(0, 35) || a.type}</span>`).join('')}
                    </div>` : ''}
                    <div style="font-size:0.65rem;color:var(--text-muted);margin-top:0.2rem;${msg.role === 'user' ? 'text-align:right' : ''}">${msg.timestamp}</div>
                </div>
            </div>
        `).join('');
        area.scrollTop = area.scrollHeight;
    },

    render() {
        const el = document.getElementById('viqVoiceAIContent');
        if (!el) return;
        el.innerHTML = `
        <div class="glass" style="padding:0;border-radius:1rem;overflow:hidden;display:flex;flex-direction:column;height:600px">
            <!-- Header -->
            <div style="padding:1.25rem 1.5rem;background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(16,185,129,0.15));border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:1rem">
                <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#10B981);display:flex;align-items:center;justify-content:center;font-size:1.4rem">🤖</div>
                <div>
                    <div style="font-weight:800;font-size:1rem">Vendrixa IQ Voice AI Co-Founder</div>
                    <div style="display:flex;align-items:center;gap:0.4rem;margin-top:2px">
                        <div style="width:7px;height:7px;background:#10B981;border-radius:50%;animation:pulse 2s infinite"></div>
                        <span style="font-size:0.72rem;color:var(--text-muted)">Online · AI-powered · Business Expert</span>
                    </div>
                </div>
                <button onclick="VoiceAICofounder.conversations=[];VoiceAICofounder.renderMessages()" style="margin-left:auto;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:var(--text-muted);padding:0.35rem 0.75rem;border-radius:0.5rem;cursor:pointer;font-size:0.75rem">🗑️ Clear</button>
            </div>

            <!-- Messages -->
            <div id="viqMessages" style="flex:1;overflow-y:auto;padding:1.25rem;scroll-behavior:smooth">
                <div style="display:flex;align-items:flex-start;gap:0.6rem;margin-bottom:1rem">
                    <div style="width:32px;height:32px;border-radius:50%;background:rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">🤖</div>
                    <div style="max-width:80%">
                        <div style="padding:0.85rem 1rem;border-radius:0.25rem 1rem 1rem 1rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);font-size:0.85rem;line-height:1.65">
                            Namaste! 🙏 I'm your <strong>Vendrixa IQ AI Co-Founder</strong> — think of me as your smartest business partner who's always available.<br><br>
                            I can help you with: <strong>sales drops, pricing, inventory, marketing campaigns, GST, competitor strategy, and growth planning</strong>.<br><br>
                            What's your biggest business challenge right now? Or ask me anything!
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.5rem">
                            ${['Why are my sales dropping?', 'What should I do now?', 'How to beat competitors?', 'Help with pricing', 'Marketing ideas'].map(q => `<button onclick="VoiceAICofounder.sendMessage('${q}')" style="padding:0.3rem 0.7rem;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);color:#A855F7;border-radius:9999px;font-size:0.72rem;cursor:pointer">${q}</button>`).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div style="padding:1rem 1.25rem;border-top:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.2)">
                <div style="display:flex;gap:0.5rem;align-items:center">
                    <button id="viqMicBtn" onclick="VoiceAICofounder.startVoice()" title="Voice Input" style="width:40px;height:40px;border-radius:50%;background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.4);color:#A855F7;cursor:pointer;font-size:1rem;flex-shrink:0;display:flex;align-items:center;justify-content:center">🎤</button>
                    <input id="viqChatInput" type="text" placeholder="Ask anything about your business... (in English or Hindi)" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:0.75rem;padding:0.6rem 1rem;color:white;font-size:0.88rem;outline:none" maxlength="500" onkeydown="if(event.key==='Enter')VoiceAICofounder.sendMessage(this.value)">
                    <button onclick="VoiceAICofounder.sendMessage(document.getElementById('viqChatInput').value)" style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#10B981);border:none;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                <div style="text-align:center;font-size:0.65rem;color:var(--text-muted);margin-top:0.4rem">Vendrixa IQ Voice AI · Powered by business intelligence · Always improving</div>
            </div>
        </div>`;
    },

    startVoice() {
        if (typeof VoiceAssistant !== 'undefined') {
            document.getElementById('viqMicBtn').style.background = 'rgba(239,68,68,0.3)';
            document.getElementById('viqMicBtn').style.borderColor = '#EF4444';
            if (!VoiceAssistant.recognition) { VIQ.showToast('Voice not supported in this browser', 'error'); return; }
            VoiceAssistant._unlockAudio();
            const origSend = VoiceAssistant.sendBtn;
            // Temporarily override to route to VIQ chat
            const sr = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!sr) return;
            const rec = new sr();
            rec.lang = 'en-IN';
            rec.interimResults = false;
            rec.onresult = (e) => {
                const t = e.results[0][0].transcript;
                const inp = document.getElementById('viqChatInput');
                if (inp) inp.value = t;
                this.sendMessage(t);
            };
            rec.onerror = () => VIQ.showToast('Voice error — try again', 'error');
            rec.onend = () => {
                const btn = document.getElementById('viqMicBtn');
                if (btn) { btn.style.background = 'rgba(139,92,246,0.2)'; btn.style.borderColor = 'rgba(139,92,246,0.4)'; }
            };
            try { rec.start(); } catch (e) {}
        } else {
            VIQ.showToast('Voice assistant not initialized', 'error');
        }
    },

    init() { this.render(); }
};
window.VoiceAICofounder = VoiceAICofounder;

// ═══════════════════════════════════════════════════════════════════════════
// BOOT — Initialize all modules when DOM is ready
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Auto-init only when section is present in DOM
        const modules = [
            ['commandCenterContent', CommandCenter],
            ['productIntelligenceContent', ProductIntelligence],
            ['pricingOptAIContent', PricingOptimizationAI],
            ['inventoryForecastContent', InventoryForecastAI],
            ['competitorAIContent', CompetitorAI],
            ['marketingAIContent', MarketingAI],
            ['salesAIContent', SalesAI],
            ['leadGenContent', LeadGenAI],
            ['croContent', CROExpert],
            ['contentAIContent', ContentAI],
            ['businessAnalystContent', BusinessAnalystAI],
            ['returnsAIContent', ReturnsAI],
            ['logisticsContent', LogisticsAI],
            ['financeAIContent', FinanceAI],
            ['growthAIContent', GrowthAI],
            ['viqVoiceAIContent', VoiceAICofounder]
        ];
        modules.forEach(([id, mod]) => {
            if (document.getElementById(id)) {
                try { mod.init(); } catch (e) { console.warn(`VIQ Module init error [${id}]:`, e); }
            }
        });
    }, 600);
});
