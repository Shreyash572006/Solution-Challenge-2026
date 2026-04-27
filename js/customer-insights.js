// ═══════════════════════════════════════════════════════════
// CUSTOMER INSIGHTS MODULE
// ═══════════════════════════════════════════════════════════
const CustomerInsights = {
    KEY: null,
    custChart: null,

    init() {
        this.KEY = 'viq_customers_' + (Auth.getCurrentUser()?.id || 'guest');
        this.refresh();
    },

    getCustomers() {
        return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    },

    buildFromSales() {
        const sales = DB.getSales();
        const udhaarRecords = JSON.parse(localStorage.getItem('viq_udhaar_' + (Auth.getCurrentUser()?.id || 'guest')) || '[]');
        const map = {};
        // Aggregate from udhaar (real customer names)
        udhaarRecords.forEach(r => {
            if (!map[r.customer_name]) map[r.customer_name] = { name: r.customer_name, phone: r.phone, total_spent: 0, visits: 0, last_visit: r.created_at, products: [] };
            if (r.status === 'paid') map[r.customer_name].total_spent += r.amount;
            map[r.customer_name].visits++;
        });
        // Also aggregate from sales data if product names identifiable
        const customers = Object.values(map);
        localStorage.setItem(this.KEY, JSON.stringify(customers));
        return customers;
    },

    getAIInsights(customers) {
        const insights = [];
        if (!customers.length) return insights;
        const top = [...customers].sort((a, b) => b.total_spent - a.total_spent).slice(0, 3);
        top.forEach(c => {
            if (c.total_spent > 5000) insights.push(`&#x1F929; ${c.name} is a VIP buyer with &#x20B9;${c.total_spent.toLocaleString('en-IN')} total spend — Offer loyalty discount`);
        });
        const freq = [...customers].sort((a, b) => b.visits - a.visits).slice(0, 3);
        freq.forEach(c => {
            if (c.visits >= 3) insights.push(`&#x1F501; ${c.name} visits frequently (${c.visits}x) — Great retention candidate`);
        });
        customers.forEach(c => {
            if (c.visits >= 2) {
                insights.push(`&#x1F4C5; ${c.name} visits every ~${Math.round(14 / c.visits * 7)} days — Consider targeted offer`);
            }
        });
        return insights.slice(0, 5);
    },

    refresh() {
        const customers = this.buildFromSales();
        const sorted = [...customers].sort((a, b) => b.total_spent - a.total_spent);
        const insights = this.getAIInsights(customers);

        const container = document.getElementById('customerInsightsContent');
        if (!container) return;

        if (!customers.length) {
            container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:3rem"><div style="font-size:3rem">&#x1F465;</div><p>No customer data yet. Add Udhaar entries to see customer insights.</p></div>`;
            return;
        }

        const topBySpend  = sorted.slice(0, 5);
        const topByVisits = [...customers].sort((a, b) => b.visits - a.visits).slice(0, 5);

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-bottom:2rem">
                <div class="glass" style="padding:1.5rem">
                    <h3 style="margin-bottom:1rem">&#x1F3C6; Top Customers (by spend)</h3>
                    ${topBySpend.map((c, i) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div>
                            <span style="font-size:0.7rem;background:linear-gradient(90deg,#7C3AED,#3B82F6);padding:2px 6px;border-radius:4px;margin-right:0.5rem">#${i + 1}</span>
                            <strong>${c.name}</strong>
                        </div>
                        <div style="color:#10B981;font-weight:700">&#x20B9;${c.total_spent.toLocaleString('en-IN')}</div>
                    </div>`).join('')}
                </div>
                <div class="glass" style="padding:1.5rem">
                    <h3 style="margin-bottom:1rem">&#x1F501; Frequent Buyers</h3>
                    ${topByVisits.map(c => `
                    <div style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div style="display:flex;justify-content:space-between">
                            <strong>${c.name}</strong>
                            <span style="color:var(--primary-light)">${c.visits} visits</span>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:9999px;height:4px;margin-top:0.4rem">
                            <div style="height:4px;border-radius:9999px;background:linear-gradient(90deg,#7C3AED,#3B82F6);width:${Math.min(100,(c.visits/Math.max(1,topByVisits[0].visits))*100)}%"></div>
                        </div>
                    </div>`).join('')}
                </div>
                <div class="glass" style="padding:1.5rem">
                    <h3 style="margin-bottom:1rem">&#x1F4A1; AI Insights</h3>
                    ${insights.length ? insights.map(i => `<p style="font-size:0.85rem;margin-bottom:0.75rem;padding:0.6rem 0.8rem;background:rgba(139,92,246,0.08);border-radius:0.5rem;border-left:3px solid #7C3AED">${i}</p>`).join('')
                    : '<p style="color:var(--text-muted)">Add more customer data to generate insights.</p>'}
                </div>
            </div>

            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">&#x1F4CB; Full Customer List</h3>
                <div class="table-container"><table>
                    <thead><tr><th>Customer</th><th>Phone</th><th>Total Spent</th><th>Visits</th><th>Last Visit</th></tr></thead>
                    <tbody>${sorted.map(c => `<tr>
                        <td><strong>${c.name}</strong></td>
                        <td style="color:var(--text-muted)">${c.phone || '—'}</td>
                        <td style="color:#10B981;font-weight:700">&#x20B9;${c.total_spent.toLocaleString('en-IN')}</td>
                        <td>${c.visits}</td>
                        <td style="color:var(--text-muted);font-size:0.8rem">${c.last_visit || '—'}</td>
                    </tr>`).join('')}</tbody>
                </table></div>
            </div>`;
    }
};
window.CustomerInsights = CustomerInsights;

// ═══════════════════════════════════════════════════════════
// DEMAND FORECASTING MODULE
// ═══════════════════════════════════════════════════════════
const DemandForecast = {
    chart: null,

    init() { this.refresh(); },

    movingAvg(data, window = 3) {
        return data.map((_, i) => {
            if (i < window - 1) return null;
            const slice = data.slice(i - window + 1, i + 1);
            return slice.reduce((a, b) => a + b, 0) / window;
        });
    },

    predictNext(values, days = 7) {
        if (values.length < 3) return [];
        const avg = values.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, values.length);
        const trend = values.length >= 2 ? (values[values.length - 1] - values[0]) / values.length : 0;
        return Array.from({ length: days }, (_, i) => Math.max(0, avg + trend * (i + 1)));
    },

    getInsights(productData) {
        const insights = [];
        productData.forEach(p => {
            const weekend = ['Sat', 'Sun'];
            const weekendSales = p.dailySales.filter((_, i) => weekend.includes(new Date(Date.now() - (p.dailySales.length - i - 1) * 86400000).toLocaleDateString('en-IN', { weekday: 'short' }))).reduce((a, b) => a + b, 0);
            const weekdaySales = p.dailySales.reduce((a, b) => a + b, 0) - weekendSales;
            if (weekendSales > weekdaySales * 0.4 && p.dailySales.length > 0) {
                insights.push(`&#x1F4C5; <strong>${p.name}</strong> demand increases on weekends — Stock 20% more before Sunday`);
            }
            const pred = this.predictNext(p.dailySales, 3);
            if (pred.length && pred[0] > (p.dailySales.slice(-3).reduce((a, b) => a + b, 0) / 3) * 1.1) {
                insights.push(`&#x1F4C8; <strong>${p.name}</strong> demand trending UP — Prepare ${Math.ceil(pred[0])} units for next 3 days`);
            }
        });
        return insights.slice(0, 5);
    },

    refresh() {
        const sales   = DB.getSales();
        const inv     = DB.getInventory();
        const container = document.getElementById('demandForecastContent');
        if (!container) return;

        if (!sales.length || !inv.length) {
            container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:3rem"><div style="font-size:3rem">&#x1F4C8;</div><p>Add sales and inventory data to see demand forecasts.</p></div>`;
            return;
        }

        // Group sales by product and day
        const productData = inv.map(item => {
            const itemSales = sales.filter(s => s.productId === item.id);
            const byDay = {};
            itemSales.forEach(s => { byDay[s.date] = (byDay[s.date] || 0) + s.quantity; });
            const sortedDays = Object.keys(byDay).sort();
            const dailySales = sortedDays.map(d => byDay[d]);
            return { id: item.id, name: item.name, dailySales, sortedDays, currentStock: item.stock };
        }).filter(p => p.dailySales.length > 0);

        if (!productData.length) {
            container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:2rem"><p>No sales recorded for inventory items yet.</p></div>`;
            return;
        }

        const insights = this.getInsights(productData);

        container.innerHTML = `
            ${insights.length ? `<div class="glass" style="padding:1.25rem;margin-bottom:1.5rem;border:1px solid rgba(139,92,246,0.3)">
                <h3 style="margin-bottom:0.75rem">&#x1F916; AI Forecast Insights</h3>
                ${insights.map(i => `<p style="font-size:0.875rem;margin-bottom:0.5rem;padding:0.5rem;background:rgba(139,92,246,0.08);border-radius:0.4rem;border-left:3px solid #7C3AED">${i}</p>`).join('')}
            </div>` : ''}

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-bottom:1.5rem">
                ${productData.slice(0, 6).map(p => {
                    const pred = this.predictNext(p.dailySales, 3);
                    const avg7 = p.dailySales.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, p.dailySales.length);
                    const daysLeft = avg7 > 0 ? Math.ceil(p.currentStock / avg7) : '∞';
                    return `<div class="glass" style="padding:1.25rem">
                        <div style="font-weight:700;margin-bottom:0.75rem">&#x1F4E6; ${p.name}</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;margin-bottom:0.75rem">
                            <div style="text-align:center;background:rgba(255,255,255,0.04);padding:0.5rem;border-radius:0.5rem">
                                <div style="font-size:0.65rem;color:var(--text-muted)">AVG DAILY</div>
                                <div style="font-weight:700">${avg7.toFixed(1)}</div>
                            </div>
                            <div style="text-align:center;background:rgba(255,255,255,0.04);padding:0.5rem;border-radius:0.5rem">
                                <div style="font-size:0.65rem;color:var(--text-muted)">STOCK</div>
                                <div style="font-weight:700;color:${p.currentStock < 10 ? '#EF4444' : '#10B981'}">${p.currentStock}</div>
                            </div>
                            <div style="text-align:center;background:rgba(255,255,255,0.04);padding:0.5rem;border-radius:0.5rem">
                                <div style="font-size:0.65rem;color:var(--text-muted)">DAYS LEFT</div>
                                <div style="font-weight:700;color:${typeof daysLeft==='number'&&daysLeft<7?'#EF4444':'#10B981'}">${daysLeft}</div>
                            </div>
                        </div>
                        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.3rem">Predicted next 3 days:</div>
                        <div style="display:flex;gap:0.5rem">
                            ${pred.map((v, i) => `<div style="flex:1;text-align:center;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);border-radius:0.4rem;padding:0.4rem">
                                <div style="font-size:0.65rem;color:var(--text-muted)">Day ${i+1}</div>
                                <div style="font-weight:700;color:#8B5CF6">${Math.ceil(v)}</div>
                            </div>`).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </div>

            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">&#x1F4C9; Sales Trend &amp; Forecast Chart</h3>
                <div style="height:280px"><canvas id="demandChart"></canvas></div>
            </div>`;

        this.renderChart(productData);
    },

    renderChart(productData) {
        const canvas = document.getElementById('demandChart');
        if (!canvas) return;
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        const p = productData[0];
        if (!p) return;
        const pred = this.predictNext(p.dailySales, 5);
        const labels = [...p.sortedDays, ...Array.from({ length: 5 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() + i + 1);
            return d.toISOString().split('T')[0];
        })];
        const actuals = [...p.dailySales, ...Array(5).fill(null)];
        const forecasts = [...Array(p.dailySales.length).fill(null), ...pred];
        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels.map(l => new Date(l).toLocaleDateString('en-IN', { day:'numeric', month:'short' })),
                datasets: [
                    { label: `${p.name} (Actual)`, data: actuals, borderColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 2.5, pointRadius: 4, fill: true, tension: 0.4 },
                    { label: 'Forecast', data: forecasts, borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', borderDash: [6, 3], borderWidth: 2, pointRadius: 4, fill: false, tension: 0.4 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: true, labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
                    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.5)', maxTicksLimit: 10 } }
                }
            }
        });
    }
};
window.DemandForecast = DemandForecast;
