// ═══════════════════════════════════════════════════════════
// SMART PDF REPORT GENERATOR
// ═══════════════════════════════════════════════════════════
const SmartReports = {
    init() {
        const btn = document.getElementById('downloadPDFBtn');
        if (btn) btn.addEventListener('click', () => this.generatePDF());
        this.renderPreviewFull();
    },

    renderPreviewFull() {
        const el = document.getElementById('smartReportPreview');
        if (!el) return;
        const kpis  = DB.getKPIs();
        const sales = DB.getSales();
        const exps  = DB.getExpenses();
        const { total } = HealthScore.calculate();

        const bestProduct = sales.length ? [...sales].sort((a, b) => b.profit - a.profit)[0] : null;

        // Sales growth
        let growthText = 'Not enough data for growth analysis.';
        if (sales.length >= 4) {
            const sorted = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
            const h = Math.floor(sorted.length / 2);
            const old = sorted.slice(0, h).reduce((s, x) => s + x.totalSales, 0);
            const rec = sorted.slice(h).reduce((s, x) => s + x.totalSales, 0);
            if (old > 0) {
                const g = ((rec - old) / old * 100).toFixed(1);
                growthText = parseFloat(g) >= 0
                    ? `📈 Your sales increased by ${g}% compared to the previous period.`
                    : `📉 Your sales decreased by ${Math.abs(g)}% compared to the previous period.`;
            }
        }

        el.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem">
                ${[
                    { label: 'Total Revenue', val: formatMoney(kpis.revenue), color: '#8B5CF6' },
                    { label: 'Total Expenses', val: formatMoney(kpis.expenses), color: '#EF4444' },
                    { label: 'Net Profit', val: formatMoney(kpis.netProfit), color: '#10B981' },
                    { label: 'Profit Margin', val: kpis.profitMargin.toFixed(1) + '%', color: '#3B82F6' },
                    { label: 'Health Score', val: total + '/100', color: '#F59E0B' }
                ].map(k => `<div style="background:${k.color}1a;border:1px solid ${k.color}44;padding:1rem;border-radius:0.75rem">
                    <div style="font-size:0.7rem;color:var(--text-muted)">${k.label}</div>
                    <div style="font-size:1.5rem;font-weight:800;color:${k.color}">${k.val}</div>
                </div>`).join('')}
            </div>

            <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);padding:1.25rem;border-radius:0.75rem;margin-bottom:1rem">
                <div style="font-weight:700;margin-bottom:0.5rem">🤖 AI Business Summary</div>
                <p style="font-size:0.9rem;color:rgba(255,255,255,0.8);line-height:1.7">${growthText}</p>
                ${bestProduct ? `<p style="font-size:0.9rem;color:rgba(255,255,255,0.7);margin-top:0.5rem">⭐ Best performer: <strong>${bestProduct.productName}</strong> with ₹${bestProduct.profit.toFixed(2)} profit per transaction.</p>` : ''}
                <p style="font-size:0.9rem;color:rgba(255,255,255,0.7);margin-top:0.5rem">📊 ${sales.length} sales entries · 🧾 ${exps.length} expense records · Generated ${new Date().toLocaleString()}</p>
            </div>`;
    },

    generatePDF() {
        const kpis  = DB.getKPIs();
        const sales = DB.getSales();
        const exps  = DB.getExpenses();
        const inv   = DB.getInventory();
        const user  = Auth.getCurrentUser();
        const { total, breakdown } = HealthScore.calculate();

        const sorted = [...sales].sort((a,b) => new Date(b.date) - new Date(a.date));
        const bestProduct = sales.length ? [...sales].sort((a, b) => b.profit - a.profit)[0] : null;

        let growthText = 'Not enough data.';
        if (sales.length >= 4) {
            const s2 = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
            const h  = Math.floor(s2.length / 2);
            const o  = s2.slice(0, h).reduce((s, x) => s + x.totalSales, 0);
            const r  = s2.slice(h).reduce((s, x) => s + x.totalSales, 0);
            if (o > 0) { const g = ((r - o) / o * 100).toFixed(1); growthText = parseFloat(g) >= 0 ? `Sales increased by ${g}%` : `Sales decreased by ${Math.abs(g)}%`; }
        }

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>VENDRIXA IQ Business Report</title>
<style>
  body { font-family: Arial, sans-serif; color: #222; margin: 0; padding: 0; background: #fff; }
  .cover { background: linear-gradient(135deg,#7C3AED,#1D4ED8); color:white; padding:3rem 2rem; }
  .cover h1 { font-size:2.5rem; margin:0 0 0.5rem; letter-spacing:-0.05em; }
  .cover p  { opacity:0.8; margin:0; }
  .section  { padding:1.5rem 2rem; border-bottom:1px solid #eee; }
  .section h2 { font-size:1.2rem; color:#7C3AED; margin-bottom:1rem; }
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1rem; }
  .kpi { background:#f8f7ff; border:1px solid #e5e3ff; border-radius:0.5rem; padding:1rem; text-align:center; }
  .kpi .label { font-size:0.7rem; color:#555; text-transform:uppercase; }
  .kpi .val   { font-size:1.5rem; font-weight:800; color:#7C3AED; }
  table { width:100%; border-collapse:collapse; font-size:0.85rem; }
  th { background:#7C3AED; color:white; padding:0.5rem; text-align:left; }
  td { padding:0.5rem; border-bottom:1px solid #eee; }
  tr:hover td { background:#f8f7ff; }
  .ai-box { background:#f0ebff; border-left:4px solid #7C3AED; padding:1rem; border-radius:0.25rem; margin-top:1rem; }
  .score-bar { display:flex; align-items:center; gap:1rem; margin-bottom:0.5rem; }
  .bar-bg { flex:1; height:8px; background:#eee; border-radius:9999px; }
  .bar-fill { height:8px; border-radius:9999px; background:linear-gradient(90deg,#7C3AED,#3B82F6); }
  .footer { background:#f9f9f9; padding:1rem 2rem; font-size:0.75rem; color:#999; text-align:center; }
</style>
</head>
<body>
<div class="cover">
  <h1>VENDRIXA IQ</h1>
  <p>Business Intelligence Report for ${user?.shopName || 'Your Shop'} · ${user?.name || ''}</p>
  <p style="margin-top:0.5rem;font-size:0.85rem">Generated: ${new Date().toLocaleString()} · Health Score: ${total}/100</p>
</div>

<div class="section">
  <h2>📊 Key Performance Indicators</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="label">Revenue</div><div class="val">₹${kpis.revenue.toLocaleString('en-IN')}</div></div>
    <div class="kpi"><div class="label">Expenses</div><div class="val">₹${kpis.expenses.toLocaleString('en-IN')}</div></div>
    <div class="kpi"><div class="label">Net Profit</div><div class="val">₹${kpis.netProfit.toLocaleString('en-IN')}</div></div>
    <div class="kpi"><div class="label">Margin</div><div class="val">${kpis.profitMargin.toFixed(1)}%</div></div>
  </div>
  <div class="ai-box">
    <strong>🤖 AI Summary:</strong> ${growthText}. ${bestProduct ? `Best product: ${bestProduct.productName} (₹${bestProduct.profit.toFixed(2)} profit).` : ''}
    Business Health Score is ${total}/100.
  </div>
</div>

<div class="section">
  <h2>📈 Business Health Score Breakdown</h2>
  ${[['Profit Margin', breakdown.marginScore, '40%'], ['Sales Growth', breakdown.growthScore, '30%'], ['Inventory Balance', breakdown.invScore, '30%']].map(([name, score, wt]) => `
  <div class="score-bar"><span style="width:150px">${name} (${wt})</span><div class="bar-bg"><div class="bar-fill" style="width:${score}%"></div></div><strong>${Math.round(score)}/100</strong></div>`).join('')}
</div>

<div class="section">
  <h2>💳 Sales Log (Recent ${Math.min(sorted.length, 20)} entries)</h2>
  <table>
    <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Selling Price</th><th>Total</th><th>Profit</th><th>Margin</th></tr></thead>
    <tbody>${sorted.slice(0, 20).map(s => `<tr>
      <td>${s.date}</td><td>${s.productName}</td><td>${s.quantity}</td>
      <td>₹${s.sellingPrice}</td><td>₹${s.totalSales.toFixed(2)}</td>
      <td style="color:${s.profit>=0?'green':'red'}">₹${s.profit.toFixed(2)}</td>
      <td>${s.profitMargin.toFixed(1)}%</td></tr>`).join('')}
    </tbody>
  </table>
</div>

<div class="section">
  <h2>🧾 Expense Summary (${exps.length} entries)</h2>
  <table>
    <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
    <tbody>${exps.map(e => `<tr><td>${e.date}</td><td>${e.category}</td><td>${e.description}</td><td>₹${e.amount.toFixed(2)}</td></tr>`).join('')}</tbody>
  </table>
</div>

<div class="section">
  <h2>📦 Inventory Status (${inv.length} products)</h2>
  <table>
    <thead><tr><th>Product</th><th>Cost</th><th>Sell Price</th><th>Margin</th><th>Stock</th></tr></thead>
    <tbody>${inv.map(i => {
      const m = ((i.targetSellingPrice - i.costPrice) / i.targetSellingPrice * 100).toFixed(1);
      return `<tr><td>${i.name}</td><td>₹${i.costPrice}</td><td>₹${i.targetSellingPrice}</td><td style="color:${parseFloat(m)>15?'green':'red'}">${m}%</td><td style="color:${i.stock<5?'red':'green'}">${i.stock}</td></tr>`;
    }).join('')}</tbody>
  </table>
</div>

<div class="footer">VENDRIXA IQ — AI-Powered Business Intelligence · Confidential Business Report · Do not share without permission</div>
</body>
</html>`;

        // Open in new window and trigger print
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); }, 600);

        showToast('📄 PDF Report opened — use browser Print to save as PDF', 'success');
    }
};

window.SmartReports = SmartReports;
