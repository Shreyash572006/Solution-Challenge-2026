// ═══════════════════════════════════════════════════════════
// UPGRADED PRICING OPTIMIZER WITH AI + FESTIVAL MODE
// ═══════════════════════════════════════════════════════════
const SmartPricing = {
    HISTORY_KEY: null,

    FESTIVALS: [
        { name: 'Diwali',     months: [10, 11], multiplier: 1.08 },
        { name: 'Eid',        months: [3, 4],   multiplier: 1.05 },
        { name: 'Holi',       months: [2, 3],   multiplier: 1.04 },
        { name: 'Christmas',  months: [12],      multiplier: 1.06 },
        { name: 'New Year',   months: [1, 12],   multiplier: 1.05 },
        { name: 'Navratri',   months: [9, 10],   multiplier: 1.05 }
    ],

    init() {
        this.HISTORY_KEY = 'viq_pricing_hist_' + (Auth.getCurrentUser()?.id || 'guest');
        const range = document.getElementById('aiPriceRange');
        const valEl = document.getElementById('aiPriceRangeVal');
        if (range) range.oninput = () => { valEl.textContent = '₹' + range.value; };

        const btn = document.getElementById('aiCalcPricing');
        if (btn) btn.addEventListener('click', () => this.calculate());

        const festMode = document.getElementById('festivalModeToggle');
        if (festMode) {
            // Show current festival if any
            const cur = this.getCurrentFestival();
            if (cur) {
                document.getElementById('festivalLabel').textContent = `🎉 ${cur.name} Mode Active (+${Math.round((cur.multiplier - 1) * 100)}% demand boost)`;
                document.getElementById('festivalLabel').style.display = 'block';
            }
            festMode.addEventListener('change', () => this.calculate());
        }

        this.renderHistory();
    },

    getCurrentFestival() {
        const month = new Date().getMonth() + 1;
        return this.FESTIVALS.find(f => f.months.includes(month)) || null;
    },

    calculate() {
        const product  = document.getElementById('aiPricingProduct')?.value || 'Product';
        const cost     = parseFloat(document.getElementById('aiPricingCost')?.value);
        const myPrice  = parseFloat(document.getElementById('aiPriceRange')?.value);
        const compPrice = parseFloat(document.getElementById('aiCompPrice')?.value);
        const qty      = parseInt(document.getElementById('aiPricingQty')?.value) || 100;
        const festMode = document.getElementById('festivalModeToggle')?.checked;

        if (isNaN(cost) || cost <= 0) { showToast('Enter a valid cost price', 'error'); return; }

        const margin      = ((myPrice - cost) / myPrice) * 100;
        const compDiff    = !isNaN(compPrice) ? myPrice - compPrice : null;
        const festival    = this.getCurrentFestival();
        const festApplied = festMode && festival;

        // AI Suggestion logic
        let suggestion = '';
        let reason     = '';
        let suggestedPrice = myPrice;

        if (compDiff !== null && compDiff > compPrice * 0.1) {
            const reduction = (compDiff * 0.5).toFixed(0);
            suggestedPrice  = Math.round(myPrice - reduction);
            suggestion = `Reduce price by ₹${reduction} (to ₹${suggestedPrice})`;
            reason     = `Your price is ₹${compDiff.toFixed(0)} higher than competitor. Risk of losing customers.`;
        } else if (compDiff !== null && compDiff < -compPrice * 0.15) {
            const bump    = Math.round(Math.abs(compDiff) * 0.4);
            suggestedPrice = myPrice + bump;
            suggestion = `You can increase price by ₹${bump} (to ₹${suggestedPrice})`;
            reason     = `You are significantly cheaper than competitors — margin opportunity exists.`;
        } else if (margin < 10) {
            suggestedPrice = Math.round(cost / 0.85);
            suggestion = `Raise price to ₹${suggestedPrice} for a healthy 15% margin`;
            reason     = `Current margin (${margin.toFixed(1)}%) is critically low.`;
        } else if (margin > 40) {
            suggestedPrice = Math.round(cost / 0.72);
            suggestion = `Consider reducing to ₹${suggestedPrice} to boost volume`;
            reason     = `Very high margin may be reducing sales volume.`;
        } else {
            suggestion = `Current pricing is competitive 👍`;
            reason     = `Margin of ${margin.toFixed(1)}% is healthy and price is near-market.`;
        }

        // Festival boost
        let festNote = '';
        if (festApplied) {
            const festPrice = Math.round(suggestedPrice * festival.multiplier);
            festNote = `<div style="margin-top:1rem;padding:0.75rem 1rem;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:0.75rem">
                <div style="font-weight:700;color:#F59E0B">🎉 ${festival.name} Festival Mode</div>
                <div style="font-size:0.85rem;color:rgba(255,255,255,0.8);margin-top:0.25rem">High demand season detected. Consider raising to <strong>₹${festPrice}</strong> (+${Math.round((festival.multiplier - 1) * 100)}%)</div>
            </div>`;
        }

        const monthlyProfit = (suggestedPrice - cost) * qty;

        document.getElementById('aiPricingResults').innerHTML = `
            <div style="background:rgba(124,58,237,0.12);padding:1.25rem;border-radius:0.75rem;margin-bottom:1rem">
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase">Current Metrics — ${product}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.75rem">
                    <div><span style="color:var(--text-muted);font-size:0.8rem">Your Price: </span><strong>₹${myPrice}</strong></div>
                    <div><span style="color:var(--text-muted);font-size:0.8rem">Margin: </span><strong style="color:${margin>15?'#10B981':'#EF4444'}">${margin.toFixed(1)}%</strong></div>
                    ${compPrice ? `<div><span style="color:var(--text-muted);font-size:0.8rem">Comp. Price: </span><strong>₹${compPrice}</strong></div>` : ''}
                    ${compDiff !== null ? `<div><span style="color:var(--text-muted);font-size:0.8rem">Difference: </span><strong style="color:${compDiff>0?'#EF4444':'#10B981'}">${compDiff>0?'+':''}₹${compDiff.toFixed(0)}</strong></div>` : ''}
                </div>
            </div>

            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);padding:1.25rem;border-radius:0.75rem;margin-bottom:1rem">
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem">🤖 AI Suggested Price</div>
                <div style="font-size:2rem;font-weight:900;color:#10B981">₹${suggestedPrice}</div>
                <div style="font-size:0.85rem;color:rgba(255,255,255,0.75);margin-top:0.25rem">${suggestion}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">Reason: ${reason}</div>
                <div style="font-size:0.8rem;color:#10B981;margin-top:0.5rem">Est. Monthly Profit: <strong>${formatMoney(monthlyProfit)}</strong></div>
            </div>

            ${festNote}`;

        // Save to history
        this.saveHistory({ product, cost, myPrice, suggestedPrice, margin: margin.toFixed(1), ts: new Date().toISOString() });
        this.renderHistory();
    },

    saveHistory(entry) {
        const raw  = localStorage.getItem(this.HISTORY_KEY);
        const hist = raw ? JSON.parse(raw) : [];
        hist.unshift(entry);
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(hist.slice(0, 20)));
    },

    renderHistory() {
        const el = document.getElementById('pricingHistoryList');
        if (!el) return;
        const raw  = localStorage.getItem(this.HISTORY_KEY);
        const hist = raw ? JSON.parse(raw) : [];
        if (!hist.length) {
            el.innerHTML = '<p style="color:var(--text-muted);font-size:0.875rem">No pricing history yet.</p>';
            return;
        }
        el.innerHTML = `<div class="table-container"><table>
            <thead><tr><th>Product</th><th>Cost</th><th>Your Price</th><th>AI Price</th><th>Margin</th><th>Date</th></tr></thead>
            <tbody>${hist.map(h => `<tr>
                <td><strong>${h.product}</strong></td>
                <td>₹${h.cost}</td>
                <td>₹${h.myPrice}</td>
                <td style="color:#10B981;font-weight:700">₹${h.suggestedPrice}</td>
                <td style="color:${parseFloat(h.margin)>15?'#10B981':'#EF4444'}">${h.margin}%</td>
                <td style="color:var(--text-muted);font-size:0.8rem">${new Date(h.ts).toLocaleDateString()}</td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    }
};

window.SmartPricing = SmartPricing;
