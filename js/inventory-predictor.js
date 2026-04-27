// ═══════════════════════════════════════════════════════════
// SMART INVENTORY PREDICTION MODULE
// ═══════════════════════════════════════════════════════════
const InventoryPredictor = {
    predictions: [],

    init() {
        this.refresh();
    },

    computePredictions() {
        const inv   = DB.getInventory();
        const sales = DB.getSales();
        const preds = [];

        inv.forEach(item => {
            // Aggregate daily sales for this product
            const itemSales = sales.filter(s => s.productId === item.id);
            const days = {};
            itemSales.forEach(s => {
                days[s.date] = (days[s.date] || 0) + s.quantity;
            });
            const dayKeys = Object.keys(days);
            const totalSold = Object.values(days).reduce((a, b) => a + b, 0);
            const avgDaily  = dayKeys.length > 0 ? totalSold / dayKeys.length : 0;
            const daysLeft  = avgDaily > 0 ? Math.ceil(item.stock / avgDaily) : null;
            const isSlow    = avgDaily > 0 && avgDaily < 0.5 && item.stock > 30;
            const isLow     = item.stock < 5 && item.stock > 0;
            const isOut     = item.stock === 0;

            let urgency = 'healthy';
            if (isOut)              urgency = 'critical';
            else if (isLow)         urgency = 'warning';
            else if (daysLeft !== null && daysLeft <= 7)  urgency = 'warning';
            else if (isSlow)        urgency = 'info';

            preds.push({
                id: item.id,
                name: item.name,
                stock: item.stock,
                avgDaily: avgDaily.toFixed(2),
                daysLeft,
                isSlow,
                isLow,
                isOut,
                urgency
            });
        });

        // Sort: critical first, then warning, then healthy
        const order = { critical: 0, warning: 1, info: 2, healthy: 3 };
        preds.sort((a, b) => order[a.urgency] - order[b.urgency]);
        this.predictions = preds;
        return preds;
    },

    savePredictions(preds) {
        const data = DB.getAllData();
        if (!data.inventoryPredictions) data.inventoryPredictions = {};
        preds.forEach(p => {
            data.inventoryPredictions[p.id] = {
                name: p.name,
                daysLeft: p.daysLeft,
                urgency: p.urgency,
                updatedAt: new Date().toISOString()
            };
        });
        DB.saveAllData(data);
    },

    refresh() {
        const preds = this.computePredictions();
        this.savePredictions(preds);

        const container = document.getElementById('inventoryPredGrid');
        if (!container) return;

        if (preds.length === 0) {
            container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem">
                <div style="font-size:3rem">📦</div>
                <p>No inventory data. Add products in the Inventory section first.</p>
            </div>`;
            return;
        }

        const colors = {
            critical: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', badge: '#EF4444', label: '🚨 Critical' },
            warning:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', badge: '#F59E0B', label: '⚠️ Warning' },
            info:     { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', badge: '#3B82F6', label: '💡 Slow Mover' },
            healthy:  { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', badge: '#10B981', label: '✅ Healthy' }
        };

        container.innerHTML = preds.map(p => {
            const c = colors[p.urgency];
            let suggText = '';
            if (p.isOut)       suggText = `<div class="inv-pred-suggestion">🤖 <strong>AI:</strong> "${p.name} is out of stock. Order immediately!"</div>`;
            else if (p.isLow)  suggText = `<div class="inv-pred-suggestion">🤖 <strong>AI:</strong> "Restock ${p.name} in ${p.daysLeft ?? '?'} days"</div>`;
            else if (p.daysLeft !== null && p.daysLeft <= 7) suggText = `<div class="inv-pred-suggestion">🤖 <strong>AI:</strong> "Restock ${p.name} in ${p.daysLeft} days"</div>`;
            else if (p.isSlow) suggText = `<div class="inv-pred-suggestion">🤖 <strong>AI:</strong> "Reduce stock of ${p.name} - slow moving item"</div>`;
            else               suggText = `<div class="inv-pred-suggestion" style="color:#10B981">🤖 <strong>AI:</strong> "${p.name} stock is well-managed"</div>`;

            return `<div class="glass inv-pred-card" style="background:${c.bg};border-color:${c.border}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
                    <div>
                        <div style="font-weight:700;font-size:1.05rem">${p.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">Avg daily sales: ${p.avgDaily} units</div>
                    </div>
                    <span style="background:${c.badge}22;color:${c.badge};border:1px solid ${c.badge}55;padding:0.2rem 0.6rem;border-radius:9999px;font-size:0.7rem;font-weight:700;white-space:nowrap">${c.label}</span>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">
                    <div style="background:rgba(255,255,255,0.04);padding:0.75rem;border-radius:0.5rem;text-align:center">
                        <div style="font-size:0.7rem;color:var(--text-muted)">CURRENT STOCK</div>
                        <div style="font-size:1.5rem;font-weight:800;color:${c.badge}">${p.stock}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted)">units</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04);padding:0.75rem;border-radius:0.5rem;text-align:center">
                        <div style="font-size:0.7rem;color:var(--text-muted)">DAYS REMAINING</div>
                        <div style="font-size:1.5rem;font-weight:800;color:${c.badge}">${p.isOut ? '0' : (p.daysLeft ?? '∞')}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted)">days</div>
                    </div>
                </div>

                ${p.daysLeft !== null && !p.isOut ? `
                <div style="background:rgba(255,255,255,0.04);border-radius:0.5rem;padding:0.5rem 0.75rem;margin-bottom:0.75rem;font-size:0.8rem;font-weight:600;color:${c.badge}">
                    📅 Restock in ${p.daysLeft} day${p.daysLeft !== 1 ? 's' : ''}
                </div>` : ''}

                ${suggText}
            </div>`;
        }).join('');

        // Trigger alerts for critical items
        preds.filter(p => p.urgency === 'critical' || (p.urgency === 'warning' && p.daysLeft !== null && p.daysLeft <= 3))
             .forEach(p => AlertSystem.trigger(
                 p.urgency === 'critical' ? 'red' : 'yellow',
                 `Low Stock: ${p.name}`,
                 p.isOut ? `${p.name} is OUT OF STOCK` : `${p.name} runs out in ${p.daysLeft} day(s)`,
                 'inventory'
             ));
    }
};

window.InventoryPredictor = InventoryPredictor;
