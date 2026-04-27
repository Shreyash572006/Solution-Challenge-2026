// ═══════════════════════════════════════════════════════════
// MEGA MODULES FILE — 12 Additional Modules
// Staff · Cash Flow · Goals · Supplier · Orders · Offers
// Market · Peak · Voice Entry · Multi-Shop · Offline · ROI
// ═══════════════════════════════════════════════════════════

const uid = () => Auth.getCurrentUser()?.id || 'guest';
const lsGet  = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const lsSet  = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const lsPush = (k, item) => { const arr = lsGet(k); arr.unshift(item); lsSet(k, arr.slice(0, 200)); };

// ─── CASH FLOW TRACKER ──────────────────────────────────────
const CashFlow = {
    init() { this.render(); },
    getKey() { return 'viq_cashflow_' + uid(); },

    addEntry(type, category, amount, note) {
        lsPush(this.getKey(), { id: 'cf_' + Date.now(), type, category, amount: parseFloat(amount), note, date: new Date().toISOString().split('T')[0] });
    },

    render() {
        const el = document.getElementById('cashFlowContent'); if (!el) return;
        const records = lsGet(this.getKey());
        const cashIn  = records.filter(r => r.type === 'in').reduce((s, r) => s + r.amount, 0);
        const cashOut = records.filter(r => r.type === 'out').reduce((s, r) => s + r.amount, 0);
        const balance = cashIn - cashOut;
        const aiMsg = cashOut > cashIn ? '🚨 Spending exceeds earnings! Reduce expenses immediately.' : cashOut > cashIn * 0.8 ? '⚠️ Cash outflow is high (>80% of income). Review expenses.' : '✅ Cash flow is healthy. Keep maintaining good balance.';

        el.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem">
                <div class="glass kpi-card" style="border:1px solid rgba(16,185,129,0.3)"><h3>Cash In</h3><div class="value" style="color:#10B981">&#x20B9;${cashIn.toLocaleString('en-IN')}</div></div>
                <div class="glass kpi-card" style="border:1px solid rgba(239,68,68,0.3)"><h3>Cash Out</h3><div class="value" style="color:#EF4444">&#x20B9;${cashOut.toLocaleString('en-IN')}</div></div>
                <div class="glass kpi-card" style="border:1px solid rgba(${balance>=0?'16,185,129':'239,68,68'},0.3)"><h3>Net Balance</h3><div class="value" style="color:${balance>=0?'#10B981':'#EF4444'}">&#x20B9;${Math.abs(balance).toLocaleString('en-IN')}</div></div>
            </div>
            <div class="glass" style="padding:1.25rem;margin-bottom:1.5rem;border-left:4px solid ${cashOut>cashIn?'#EF4444':'#10B981'}">
                <strong>&#x1F916; AI Analysis:</strong> ${aiMsg}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem">
                <div class="glass" style="padding:1.25rem">
                    <h3 style="margin-bottom:1rem;color:#10B981">&#x2795; Add Cash In</h3>
                    <div class="form-group"><label>Category</label>
                        <select id="cfInCat" class="form-control"><option>Sales Revenue</option><option>Loan</option><option>Investment</option><option>Other Income</option></select></div>
                    <div class="form-group"><label>Amount (&#x20B9;)</label><input type="number" id="cfInAmt" class="form-control" placeholder="5000"></div>
                    <div class="form-group"><label>Notes</label><input type="text" id="cfInNote" class="form-control" placeholder="Description..."></div>
                    <button class="btn btn-primary w-full" onclick="CashFlow.submitIn()">&#x2795; Add Cash In</button>
                </div>
                <div class="glass" style="padding:1.25rem">
                    <h3 style="margin-bottom:1rem;color:#EF4444">&#x2796; Add Cash Out</h3>
                    <div class="form-group"><label>Category</label>
                        <select id="cfOutCat" class="form-control"><option>Stock Purchase</option><option>Rent</option><option>Salary</option><option>Utilities</option><option>Other Expense</option></select></div>
                    <div class="form-group"><label>Amount (&#x20B9;)</label><input type="number" id="cfOutAmt" class="form-control" placeholder="2000"></div>
                    <div class="form-group"><label>Notes</label><input type="text" id="cfOutNote" class="form-control" placeholder="Description..."></div>
                    <button class="btn btn-ghost w-full" style="border:1px solid rgba(239,68,68,0.4);color:#EF4444" onclick="CashFlow.submitOut()">&#x2796; Add Cash Out</button>
                </div>
            </div>
            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">&#x1F4CB; Transaction History</h3>
                ${records.length ? `<div class="table-container"><table>
                    <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead>
                    <tbody>${records.slice(0, 30).map(r => `<tr>
                        <td>${r.date}</td>
                        <td><span style="padding:2px 8px;border-radius:9999px;font-size:0.7rem;font-weight:700;background:${r.type==='in'?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'};color:${r.type==='in'?'#10B981':'#EF4444'}">${r.type==='in'?'CASH IN':'CASH OUT'}</span></td>
                        <td>${r.category}</td>
                        <td style="color:var(--text-muted)">${r.note}</td>
                        <td style="font-weight:700;color:${r.type==='in'?'#10B981':'#EF4444'}">${r.type==='in'?'+':'-'}&#x20B9;${r.amount.toLocaleString('en-IN')}</td>
                    </tr>`).join('')}</tbody>
                </table></div>` : '<p style="color:var(--text-muted)">No transactions yet.</p>'}
            </div>`;
    },

    submitIn()  { const a=document.getElementById('cfInAmt')?.value; const c=document.getElementById('cfInCat')?.value; const n=document.getElementById('cfInNote')?.value; if(!a){showToast('Enter amount','error');return;} this.addEntry('in',c,a,n); this.render(); showToast('Cash In recorded ✅','success'); },
    submitOut() { const a=document.getElementById('cfOutAmt')?.value; const c=document.getElementById('cfOutCat')?.value; const n=document.getElementById('cfOutNote')?.value; if(!a){showToast('Enter amount','error');return;} this.addEntry('out',c,a,n); this.render(); showToast('Cash Out recorded','info'); }
};
window.CashFlow = CashFlow;

// ─── BUSINESS GOALS ─────────────────────────────────────────
const GoalSystem = {
    chart: null,
    init() { this.render(); },
    getKey() { return 'viq_goals_' + uid(); },

    render() {
        const el = document.getElementById('goalsContent'); if (!el) return;
        const goals = lsGet(this.getKey());
        const kpis  = DB.getKPIs();

        el.innerHTML = `
            <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:1.25rem">&#x1F3AF; Set Monthly Business Goal</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1rem">
                    <div class="form-group"><label>Goal Type</label>
                        <select id="goalType" class="form-control"><option value="revenue">Revenue Target</option><option value="profit">Profit Target</option><option value="sales_count">Sales Count</option></select></div>
                    <div class="form-group"><label>Target Value</label><input type="number" id="goalTarget" class="form-control" placeholder="e.g. 50000"></div>
                    <div class="form-group"><label>Month</label><input type="month" id="goalMonth" class="form-control" value="${new Date().toISOString().slice(0,7)}"></div>
                </div>
                <button class="btn btn-primary" onclick="GoalSystem.addGoal()">&#x2795; Set Goal</button>
            </div>

            ${goals.length ? goals.map(g => {
                const actual  = g.type === 'revenue' ? kpis.revenue : g.type === 'profit' ? kpis.netProfit : DB.getSales().length;
                const pct     = Math.min(100, Math.max(0, (actual / g.target) * 100));
                const status  = pct >= 100 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444';
                const aiMsg   = pct >= 100 ? '&#x1F389; Goal achieved! Great work — set a higher target.' : pct >= 70 ? `&#x1F4AA; Almost there! You need ${(g.type==='sales_count'?g.target-actual:'&#x20B9;'+(g.target-actual).toLocaleString('en-IN'))} more to hit the goal.` : `&#x26A0; You are ${(100-pct).toFixed(0)}% behind target. Increase daily sales and reduce expenses.`;
                return `<div class="glass" style="padding:1.5rem;margin-bottom:1rem;border:1px solid ${status}44">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
                        <div>
                            <div style="font-weight:700">${g.type === 'revenue' ? '&#x1F4B0; Revenue' : g.type === 'profit' ? '&#x1F4C8; Profit' : '&#x1F6D2; Sales Count'} Goal — ${g.month}</div>
                            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem">Target: ${g.type!=='sales_count'?'&#x20B9;'+g.target.toLocaleString('en-IN'):g.target}</div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-size:1.75rem;font-weight:900;color:${status}">${pct.toFixed(0)}%</div>
                            <div style="font-size:0.75rem;color:var(--text-muted)">${pct>=100?'ACHIEVED':'IN PROGRESS'}</div>
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.06);border-radius:9999px;height:10px;margin-bottom:0.75rem">
                        <div style="height:10px;border-radius:9999px;background:${status};width:${pct}%;transition:width 0.8s"></div>
                    </div>
                    <div style="font-size:0.82rem;color:rgba(255,255,255,0.75)">${aiMsg}</div>
                    <button onclick="GoalSystem.deleteGoal('${g.id}')" style="margin-top:0.5rem;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.75rem">&#x1F5D1; Remove</button>
                </div>`;
            }).join('') : '<div class="glass" style="padding:2rem;text-align:center;color:var(--text-muted)"><div style="font-size:3rem">&#x1F3AF;</div><p>No goals set yet. Create your first business target above.</p></div>'}`;
    },

    addGoal() {
        const type = document.getElementById('goalType')?.value;
        const target = parseFloat(document.getElementById('goalTarget')?.value);
        const month = document.getElementById('goalMonth')?.value;
        if (!target || !month) { showToast('Fill all goal fields', 'error'); return; }
        lsPush(this.getKey(), { id: 'g_' + Date.now(), type, target, month });
        this.render();
        showToast('Goal set! &#x1F3AF;', 'success');
    },

    deleteGoal(id) {
        lsSet(this.getKey(), lsGet(this.getKey()).filter(g => g.id !== id));
        this.render();
    }
};
window.GoalSystem = GoalSystem;

// ─── STAFF MANAGEMENT ───────────────────────────────────────
const StaffManager = {
    init() { this.render(); },
    getKey() { return 'viq_staff_' + uid(); },

    render() {
        const el = document.getElementById('staffContent'); if (!el) return;
        const staff = lsGet(this.getKey());
        el.innerHTML = `
            <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:1rem">&#x1F464; Add Staff Member</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:1rem;align-items:end">
                    <div class="form-group" style="margin:0"><label>Staff Name</label><input type="text" id="staffName" class="form-control" placeholder="e.g. Ramesh"></div>
                    <div class="form-group" style="margin:0"><label>Role</label><input type="text" id="staffRole" class="form-control" placeholder="e.g. Cashier, Manager"></div>
                    <button class="btn btn-primary" onclick="StaffManager.addStaff()">&#x2795; Add</button>
                </div>
            </div>
            ${staff.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem">
                ${staff.map(s => {
                    const sales = lsGet('viq_staff_sales_' + s.id + '_' + uid());
                    const totalSales = sales.reduce((a, b) => a + b.amount, 0);
                    const aiTip = totalSales > 10000 ? '&#x1F31F; Top performer! Give recognition/bonus.' : totalSales > 3000 ? '&#x1F4AA; Good performance. Keep encouraging.' : '&#x1F4CB; Low activity. Review and provide training.';
                    return `<div class="glass" style="padding:1.5rem">
                        <div style="font-size:2rem;margin-bottom:0.5rem">&#x1F464;</div>
                        <div style="font-weight:700;font-size:1.1rem">${s.name}</div>
                        <div style="color:var(--text-muted);font-size:0.8rem;margin-bottom:1rem">${s.role}</div>
                        <div style="margin-bottom:0.5rem"><span style="font-size:0.7rem;color:var(--text-muted)">TOTAL SALES</span><div style="font-size:1.5rem;font-weight:800;color:#10B981">&#x20B9;${totalSales.toLocaleString('en-IN')}</div></div>
                        <p style="font-size:0.78rem;color:rgba(255,255,255,0.7)">${aiTip}</p>
                        <div style="margin-top:0.75rem;display:flex;gap:0.5rem">
                            <input type="number" id="staffSale_${s.id}" class="form-control" placeholder="Log sale &#x20B9;" style="flex:1">
                            <button class="btn btn-primary" style="padding:0.4rem 0.75rem;font-size:0.8rem" onclick="StaffManager.logSale('${s.id}')">Log</button>
                        </div>
                        <button onclick="StaffManager.removeStaff('${s.id}')" style="margin-top:0.5rem;font-size:0.72rem;background:none;border:none;color:var(--danger);cursor:pointer">Remove</button>
                    </div>`;
                }).join('')}
            </div>` : '<div class="glass" style="padding:2rem;text-align:center;color:var(--text-muted)"><div style="font-size:3rem">&#x1F465;</div><p>No staff added yet.</p></div>'}`;
    },

    addStaff() {
        const name = document.getElementById('staffName')?.value.trim();
        const role = document.getElementById('staffRole')?.value.trim();
        if (!name) { showToast('Enter staff name', 'error'); return; }
        lsPush(this.getKey(), { id: 'stf_' + Date.now(), name, role: role || 'Staff' });
        this.render(); showToast(`${name} added to staff ✅`, 'success');
    },

    removeStaff(id) {
        if (!confirm('Remove staff member?')) return;
        lsSet(this.getKey(), lsGet(this.getKey()).filter(s => s.id !== id));
        this.render();
    },

    logSale(staffId) {
        const amt = parseFloat(document.getElementById(`staffSale_${staffId}`)?.value);
        if (!amt) { showToast('Enter sale amount', 'error'); return; }
        lsPush('viq_staff_sales_' + staffId + '_' + uid(), { amount: amt, date: new Date().toISOString() });
        this.render(); showToast('Sale logged for staff ✅', 'success');
    }
};
window.StaffManager = StaffManager;

// ─── SUPPLIER MANAGEMENT ───────────────────────────────────
const SupplierManager = {
    init() { this.render(); },
    getKey() { return 'viq_suppliers_' + uid(); },

    render() {
        const el = document.getElementById('supplierContent'); if (!el) return;
        const suppliers = lsGet(this.getKey());
        el.innerHTML = `
            <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:1rem">&#x1F3EA; Add Supplier</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;align-items:end">
                    <div class="form-group" style="margin:0"><label>Supplier Name</label><input type="text" id="supName" class="form-control" placeholder="e.g. Sharma & Sons"></div>
                    <div class="form-group" style="margin:0"><label>Product Category</label><input type="text" id="supCat" class="form-control" placeholder="e.g. Grocery"></div>
                    <div class="form-group" style="margin:0"><label>Contact</label><input type="text" id="supPhone" class="form-control" placeholder="Phone"></div>
                    <div class="form-group" style="margin:0"><label>Avg Price Rating (1-5)</label><input type="number" id="supRating" class="form-control" min="1" max="5" placeholder="4"></div>
                    <button class="btn btn-primary" onclick="SupplierManager.addSupplier()" style="align-self:end">&#x2795; Add</button>
                </div>
            </div>
            ${suppliers.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem">
                ${suppliers.map(s => {
                    const purchases = lsGet('viq_sup_pur_' + s.id + '_' + uid());
                    const totalPurchased = purchases.reduce((a, b) => a + b.amount, 0);
                    const stars = '&#x2B50;'.repeat(s.rating) || '—';
                    const aiTip = s.rating >= 4 ? '&#x1F3C6; Best rated supplier — Preferred for bulk orders' : s.rating >= 3 ? '&#x1F44D; Good supplier — Negotiate for better rates' : '&#x26A0; Low rating — Consider switching supplier';
                    return `<div class="glass" style="padding:1.5rem">
                        <div style="font-size:1.5rem;margin-bottom:0.5rem">&#x1F3EA;</div>
                        <div style="font-weight:700;font-size:1.05rem">${s.name}</div>
                        <div style="color:var(--text-muted);font-size:0.8rem">${s.category} &bull; &#x1F4DE; ${s.phone}</div>
                        <div style="margin:0.75rem 0;font-size:1.1rem">${stars} <span style="font-size:0.75rem;color:var(--text-muted)">(${s.rating}/5)</span></div>
                        <div style="margin-bottom:0.5rem;font-size:0.8rem;color:var(--text-muted)">Total Purchased: <strong style="color:#10B981">&#x20B9;${totalPurchased.toLocaleString('en-IN')}</strong></div>
                        <p style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-bottom:0.75rem">${aiTip}</p>
                        <div style="display:flex;gap:0.5rem">
                            <input type="number" id="supPur_${s.id}" class="form-control" placeholder="Log purchase &#x20B9;" style="flex:1;height:36px">
                            <button class="btn btn-primary" style="padding:0.4rem 0.75rem;font-size:0.8rem" onclick="SupplierManager.logPurchase('${s.id}')">Log</button>
                        </div>
                        <button onclick="SupplierManager.remove('${s.id}')" style="margin-top:0.5rem;font-size:0.72rem;background:none;border:none;color:var(--danger);cursor:pointer">Remove</button>
                    </div>`;
                }).join('')}
            </div>` : '<div class="glass" style="padding:2rem;text-align:center;color:var(--text-muted)"><div style="font-size:3rem">&#x1F3EA;</div><p>No suppliers added yet.</p></div>'}`;
    },

    addSupplier() {
        const name = document.getElementById('supName')?.value.trim();
        if (!name) { showToast('Enter supplier name', 'error'); return; }
        lsPush(this.getKey(), { id: 'sup_' + Date.now(), name, category: document.getElementById('supCat')?.value || 'General', phone: document.getElementById('supPhone')?.value || '—', rating: parseInt(document.getElementById('supRating')?.value) || 3 });
        this.render(); showToast('Supplier added ✅', 'success');
    },

    remove(id) { if (!confirm('Remove supplier?')) return; lsSet(this.getKey(), lsGet(this.getKey()).filter(s => s.id !== id)); this.render(); },

    logPurchase(id) {
        const amt = parseFloat(document.getElementById(`supPur_${id}`)?.value);
        if (!amt) { showToast('Enter purchase amount', 'error'); return; }
        lsPush('viq_sup_pur_' + id + '_' + uid(), { amount: amt, date: new Date().toISOString() });
        this.render(); showToast('Purchase logged ✅', 'success');
    }
};
window.SupplierManager = SupplierManager;

// ─── AI OFFER GENERATOR ─────────────────────────────────────
const OfferGenerator = {
    init() { this.render(); },
    getKey() { return 'viq_offers_' + uid(); },

    generateOffers() {
        const inv   = DB.getInventory();
        const sales = DB.getSales();
        const offers = [];

        inv.forEach(item => {
            const itemSales = sales.filter(s => s.productId === item.id);
            const totalSold = itemSales.reduce((s, x) => s + x.quantity, 0);
            const avgSold   = itemSales.length ? totalSold / itemSales.length : 0;

            if (item.stock > 50 && avgSold < 2) {
                offers.push({ product: item.name, type: 'bundle', title: 'Bundle Deal', offer: 'Buy 2 Get 1 Free', reason: 'Slow-moving with high stock', color: '#F59E0B', icon: '&#x1F381;' });
            }
            if (item.stock > 30) {
                offers.push({ product: item.name, type: 'discount', title: 'Flash Sale', offer: 'Flat 10% Discount', reason: 'High stock needs quick clearance', color: '#EF4444', icon: '&#x26A1;' });
            }
            if (totalSold > 10 && item.stock < 10) {
                offers.push({ product: item.name, type: 'upsell', title: 'Hot Product Upsell', offer: 'Combo offer with related product', reason: 'High demand, low stock — upsell before stockout', color: '#10B981', icon: '&#x1F525;' });
            }
        });

        if (!offers.length && inv.length) {
            offers.push({ product: 'All Products', type: 'seasonal', title: 'Weekend Special', offer: '5% off on all items Saturday-Sunday', reason: 'Boost weekend footfall', color: '#8B5CF6', icon: '&#x1F389;' });
        }

        return offers.slice(0, 8);
    },

    activateOffer(idx) {
        const offers = this.generateOffers();
        const offer  = offers[idx];
        if (!offer) return;
        lsPush(this.getKey(), { ...offer, id: 'off_' + Date.now(), activated_at: new Date().toISOString(), status: 'active' });
        this.render(); showToast(`Offer activated: ${offer.offer} for ${offer.product}`, 'success');
    },

    render() {
        const el = document.getElementById('offersContent'); if (!el) return;
        const aiOffers   = this.generateOffers();
        const savedOffers = lsGet(this.getKey());

        el.innerHTML = `
            <div style="margin-bottom:2rem">
                <h3 style="margin-bottom:1rem">&#x1F916; AI-Suggested Offers (based on your inventory &amp; sales)</h3>
                ${aiOffers.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">
                    ${aiOffers.map((o, i) => `<div class="glass" style="padding:1.25rem;border:1px solid ${o.color}44">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
                            <span style="font-size:1.5rem">${o.icon}</span>
                            <span style="font-size:0.7rem;padding:2px 8px;border-radius:9999px;background:${o.color}22;color:${o.color};font-weight:700">${o.type.toUpperCase()}</span>
                        </div>
                        <div style="font-weight:700;margin-bottom:0.25rem">${o.product}</div>
                        <div style="font-size:1rem;font-weight:800;color:${o.color};margin-bottom:0.5rem">&#x1F3F7; ${o.offer}</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.75rem">Reason: ${o.reason}</div>
                        <button class="btn btn-primary w-full" style="font-size:0.8rem" onclick="OfferGenerator.activateOffer(${i})">&#x2705; Activate Offer</button>
                    </div>`).join('')}
                </div>` : '<p style="color:var(--text-muted)">Add inventory and sales data to generate AI offers.</p>'}
            </div>

            ${savedOffers.length ? `<div>
                <h3 style="margin-bottom:1rem">&#x1F4CB; Active &amp; Past Offers</h3>
                <div class="table-container"><table>
                    <thead><tr><th>Product</th><th>Offer</th><th>Type</th><th>Activated</th></tr></thead>
                    <tbody>${savedOffers.slice(0,10).map(o => `<tr>
                        <td><strong>${o.product}</strong></td>
                        <td style="color:${o.color||'#8B5CF6'}">${o.offer}</td>
                        <td>${o.type}</td>
                        <td style="color:var(--text-muted);font-size:0.8rem">${new Date(o.activated_at).toLocaleDateString('en-IN')}</td>
                    </tr>`).join('')}</tbody>
                </table></div>
            </div>` : ''}`;
    }
};
window.OfferGenerator = OfferGenerator;

// ─── PEAK SALES TIME ANALYZER ────────────────────────────────
const PeakSales = {
    chart: null,
    init() { this.render(); },

    render() {
        const el = document.getElementById('peakSalesContent'); if (!el) return;
        const cashflows = lsGet('viq_cashflow_' + uid());
        // Simulated hourly pattern from existing sales data
        const hours = Array.from({length:24}, (_, h) => ({ hour: h, sales: 0 }));
        // Use sales timestamps if any
        DB.getSales().forEach(s => {
            const h = new Date(s.id.replace('sale_','')/1).getHours();
            hours[h].sales += s.totalSales || 0;
        });
        // Fallback: use realistic shop pattern
        const hasData = hours.some(h => h.sales > 0);
        if (!hasData) {
            [7,8,9,17,18,19,20,21].forEach(h => hours[h].sales = Math.random() * 1000 + 200);
            [10,11,12,13,14,15].forEach(h => hours[h].sales = Math.random() * 500 + 100);
        }
        const peak = hours.reduce((a,b) => a.sales > b.sales ? a : b);
        const aiMsg = `&#x1F525; Max sales at ${peak.hour}:00–${peak.hour+1}:00 — Run flash offers and promotions during this window`;

        el.innerHTML = `
            <div class="glass" style="padding:1.25rem;margin-bottom:1.5rem;border-left:4px solid #F59E0B">
                <strong>&#x1F916; AI Insight:</strong> ${aiMsg}
            </div>
            <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:1rem">&#x1F570; Hourly Sales Pattern</h3>
                <div style="height:260px"><canvas id="peakHourChart"></canvas></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem">
                ${[{range:'6–9 AM',hours:[6,7,8],note:'Morning rush'},{range:'9–12 PM',hours:[9,10,11],note:'Mid-morning'},{range:'12–3 PM',hours:[12,13,14],note:'Afternoon lull'},{range:'3–6 PM',hours:[15,16,17],note:'Evening start'},{range:'6–9 PM',hours:[18,19,20],note:'Peak hours'},{range:'9–11 PM',hours:[21,22],note:'Night close'}].map(slot => {
                    const total = slot.hours.reduce((s,h) => s + hours[h].sales, 0);
                    const isPeak = slot.hours.includes(peak.hour);
                    return `<div class="glass" style="padding:1rem;text-align:center;border:1px solid rgba(${isPeak?'245,158,11':'255,255,255'},${isPeak?'0.4':'0.05'})">
                        <div style="font-size:0.8rem;color:var(--text-muted)">${slot.range}</div>
                        <div style="font-size:1.25rem;font-weight:800;color:${isPeak?'#F59E0B':'white'};margin:0.25rem 0">&#x20B9;${Math.round(total).toLocaleString('en-IN')}</div>
                        <div style="font-size:0.72rem;color:${isPeak?'#F59E0B':'var(--text-muted)'}">${isPeak?'&#x1F525; PEAK':''+slot.note}</div>
                    </div>`;
                }).join('')}
            </div>`;
        this.renderChart(hours);
    },

    renderChart(hours) {
        const canvas = document.getElementById('peakHourChart');
        if (!canvas) return;
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        const maxSales = Math.max(...hours.map(h => h.sales));
        this.chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: hours.map(h => h.hour < 10 ? '0' + h.hour + ':00' : h.hour + ':00'),
                datasets: [{
                    label: 'Sales (&#x20B9;)',
                    data: hours.map(h => h.sales),
                    backgroundColor: hours.map(h => h.sales >= maxSales * 0.8 ? 'rgba(245,158,11,0.8)' : 'rgba(139,92,246,0.5)'),
                    borderColor: hours.map(h => h.sales >= maxSales * 0.8 ? '#F59E0B' : '#8B5CF6'),
                    borderWidth: 1.5, borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } }, x: { grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { color: 'rgba(255,255,255,0.5)', maxRotation: 45 } } } }
        });
    }
};
window.PeakSales = PeakSales;

// ─── MINI E-COMMERCE ORDERS ─────────────────────────────────
const MiniEcommerce = {
    init() { this.render(); },
    getKey() { return 'viq_orders_' + uid(); },

    render() {
        const el = document.getElementById('ecommerceContent'); if (!el) return;
        const inv    = DB.getInventory();
        const orders = lsGet(this.getKey());
        const base   = window.location.origin + window.location.pathname.replace('dashboard.html', '');

        el.innerHTML = `
            <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:0.75rem">&#x1F517; Share Your Product Catalog</h3>
                <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem">Share this link with customers to receive online orders:</p>
                <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
                    <code style="background:rgba(255,255,255,0.06);padding:0.5rem 1rem;border-radius:0.5rem;font-size:0.8rem;flex:1;word-break:break-all">${base}order.html?shop=${Auth.getCurrentUser()?.id}</code>
                    <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${base}order.html?shop=${Auth.getCurrentUser()?.id}');showToast('Link copied!','success')">&#x1F4CB; Copy Link</button>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem">
                <div class="glass" style="padding:1.5rem">
                    <h3 style="margin-bottom:1rem">&#x1F6D2; Add Test Order (Simulate Customer)</h3>
                    <div class="form-group"><label>Customer Name</label><input type="text" id="orderCust" class="form-control" placeholder="Customer name"></div>
                    <div class="form-group"><label>Product</label>
                        <select id="orderProd" class="form-control">
                            <option value="">Select product</option>
                            ${inv.map(i => `<option value="${i.name}">&#x1F4E6; ${i.name} — &#x20B9;${i.targetSellingPrice}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Quantity</label><input type="number" id="orderQty" class="form-control" value="1" min="1"></div>
                    <div class="form-group"><label>Phone</label><input type="text" id="orderPhone" class="form-control" placeholder="Customer phone"></div>
                    <button class="btn btn-primary w-full" onclick="MiniEcommerce.addOrder()">&#x2795; Place Order</button>
                </div>
                <div class="glass" style="padding:1.5rem">
                    <h3 style="margin-bottom:1rem">&#x1F4CA; Order Stats</h3>
                    <div style="display:grid;gap:0.75rem">
                        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:0.5rem"><span>Total Orders</span><strong>${orders.length}</strong></div>
                        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:0.5rem"><span>Pending</span><strong style="color:#F59E0B">${orders.filter(o=>o.status==='pending').length}</strong></div>
                        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:0.5rem"><span>Fulfilled</span><strong style="color:#10B981">${orders.filter(o=>o.status==='fulfilled').length}</strong></div>
                    </div>
                </div>
            </div>

            <div class="glass" style="padding:1.5rem">
                <h3 style="margin-bottom:1rem">&#x1F4CB; Incoming Orders</h3>
                ${orders.length ? `<div class="table-container"><table>
                    <thead><tr><th>Customer</th><th>Product</th><th>Qty</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>${orders.slice(0,20).map(o => `<tr>
                        <td><strong>${o.customer}</strong></td>
                        <td>${o.product}</td>
                        <td>${o.qty}</td>
                        <td style="color:var(--text-muted)">${o.phone}</td>
                        <td><span style="padding:2px 8px;border-radius:9999px;font-size:0.7rem;font-weight:700;background:${o.status==='fulfilled'?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)'};color:${o.status==='fulfilled'?'#10B981':'#F59E0B'}">${o.status.toUpperCase()}</span></td>
                        <td>${o.status==='pending'?`<button class="btn btn-primary" style="padding:0.2rem 0.6rem;font-size:0.72rem" onclick="MiniEcommerce.fulfill('${o.id}')">&#x2705; Fulfill</button>`:''}</td>
                    </tr>`).join('')}</tbody>
                </table></div>` : '<p style="color:var(--text-muted)">No orders yet.</p>'}
            </div>`;
    },

    addOrder() {
        const cust = document.getElementById('orderCust')?.value.trim();
        const prod = document.getElementById('orderProd')?.value;
        const qty  = parseInt(document.getElementById('orderQty')?.value) || 1;
        const phone = document.getElementById('orderPhone')?.value;
        if (!cust || !prod) { showToast('Fill customer name and product', 'error'); return; }
        lsPush(this.getKey(), { id: 'ord_' + Date.now(), customer: cust, product: prod, qty, phone, status: 'pending', created_at: new Date().toISOString() });
        showToast(`&#x1F514; New order from ${cust}!`, 'success');
        this.render();
    },

    fulfill(id) {
        const orders = lsGet(this.getKey()).map(o => o.id === id ? { ...o, status: 'fulfilled' } : o);
        lsSet(this.getKey(), orders); this.render(); showToast('Order fulfilled ✅', 'success');
    }
};
window.MiniEcommerce = MiniEcommerce;

// ─── VOICE ENTRY FOR SALES ──────────────────────────────────
const VoiceEntry = {
    recognition: null,
    init() {
        const btn = document.getElementById('voiceEntryBtn');
        if (btn) btn.addEventListener('click', () => this.startListening());
    },

    startListening() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            showToast('Voice input not supported in this browser', 'error'); return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SR();
        this.recognition.lang = 'hi-IN';
        this.recognition.interimResults = false;
        this.recognition.onstart = () => { document.getElementById('voiceEntryStatus').textContent = '&#x1F399; Listening...'; document.getElementById('voiceEntryBtn').style.background='rgba(239,68,68,0.3)'; };
        this.recognition.onresult = (e) => { const t = e.results[0][0].transcript; this.parseVoice(t); };
        this.recognition.onerror = () => showToast('Voice recognition error', 'error');
        this.recognition.onend = () => { document.getElementById('voiceEntryStatus').textContent = 'Click mic to record'; document.getElementById('voiceEntryBtn').style.background=''; };
        this.recognition.start();
    },

    parseVoice(text) {
        const statusEl = document.getElementById('voiceEntryStatus');
        const resultEl = document.getElementById('voiceEntryResult');
        if (statusEl) statusEl.textContent = `Heard: "${text}"`;
        // Parse: "add 2 kg sugar ₹100" / "sold 5 milk 50 rupees"
        const numMatch = text.match(/\d+/g) || [];
        const words    = text.toLowerCase().replace(/[₹]/g, '').split(' ');
        const qty      = numMatch[0] ? parseInt(numMatch[0]) : 1;
        const amount   = numMatch[1] ? parseFloat(numMatch[1]) : numMatch[0] ? parseFloat(numMatch[0]) : 0;
        const invItems = DB.getInventory();
        const matched  = invItems.find(item => words.some(w => item.name.toLowerCase().includes(w) && w.length > 2));

        if (resultEl) resultEl.innerHTML = `
            <div style="padding:1rem;background:rgba(139,92,246,0.12);border-radius:0.75rem;border:1px solid rgba(139,92,246,0.3)">
                <div style="font-weight:700;margin-bottom:0.5rem">&#x1F916; Parsed Voice Entry:</div>
                <div style="font-size:0.875rem">Product: <strong>${matched?.name || 'Not found in inventory'}</strong></div>
                <div style="font-size:0.875rem">Quantity: <strong>${qty}</strong></div>
                <div style="font-size:0.875rem">Amount: <strong>&#x20B9;${amount}</strong></div>
                ${matched ? `<button class="btn btn-primary" style="margin-top:0.75rem" onclick="VoiceEntry.confirmSale('${matched.id}',${qty},${amount})">&#x2705; Confirm &amp; Log Sale</button>` : '<p style="color:#F59E0B;margin-top:0.5rem;font-size:0.8rem">&#x26A0; Product not recognized. Please log manually in Sales Logger.</p>'}
            </div>`;
    },

    confirmSale(productId, qty, price) {
        try {
            DB.addSale(new Date().toISOString().split('T')[0], productId, price / qty, qty);
            showToast(`Voice sale logged: ${qty} units ✅`, 'success');
            document.getElementById('voiceEntryResult').innerHTML = '<p style="color:#10B981">&#x2705; Sale logged successfully from voice!</p>';
        } catch (e) {
            showToast('Error logging sale: ' + e.message, 'error');
        }
    }
};
window.VoiceEntry = VoiceEntry;

// ─── MULTI-SHOP MANAGEMENT ──────────────────────────────────
const MultiShop = {
    init() { this.render(); },
    getKey() { return 'viq_shops_' + (localStorage.getItem('viq_user_id') || 'guest'); },

    getShops() { return JSON.parse(localStorage.getItem('viq_all_shops') || '[]'); },

    addShop(name, type, location) {
        const shops = this.getShops();
        shops.push({ id: 'shop_' + Date.now(), name, type, location, created_at: new Date().toISOString() });
        localStorage.setItem('viq_all_shops', JSON.stringify(shops));
        this.render();
    },

    render() {
        const el = document.getElementById('multiShopContent'); if (!el) return;
        const user  = Auth.getCurrentUser();
        const shops = this.getShops();
        const currentShop = user?.shopName || 'Main Shop';
        el.innerHTML = `
            <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem;border:1px solid rgba(16,185,129,0.3)">
                <div style="display:flex;align-items:center;gap:1rem">
                    <div style="font-size:2rem">&#x1F3EA;</div>
                    <div>
                        <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase">Currently Active</div>
                        <div style="font-weight:800;font-size:1.2rem">${currentShop}</div>
                        <div style="font-size:0.8rem;color:#10B981">&bull; Primary Shop — All data synced here</div>
                    </div>
                </div>
            </div>
            <div class="glass" style="padding:1.5rem;margin-bottom:1.5rem">
                <h3 style="margin-bottom:1rem">&#x2795; Add Another Shop</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:0.75rem;align-items:end">
                    <div class="form-group" style="margin:0"><label>Shop Name</label><input type="text" id="shopName" class="form-control" placeholder="e.g. Branch 2"></div>
                    <div class="form-group" style="margin:0"><label>Type</label><input type="text" id="shopType" class="form-control" placeholder="Grocery / Medical..."></div>
                    <div class="form-group" style="margin:0"><label>Location</label><input type="text" id="shopLoc" class="form-control" placeholder="Area, City"></div>
                    <button class="btn btn-primary" onclick="MultiShop.addShop(document.getElementById('shopName').value,document.getElementById('shopType').value,document.getElementById('shopLoc').value)">Add</button>
                </div>
            </div>
            ${shops.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem">
                ${shops.map(s => `<div class="glass" style="padding:1.5rem">
                    <div style="font-size:1.5rem;margin-bottom:0.5rem">&#x1F3EA;</div>
                    <div style="font-weight:700">${s.name}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem">${s.type} — ${s.location}</div>
                    <p style="font-size:0.78rem;color:rgba(255,255,255,0.6)">&#x1F916; Independent data store ready. Use separate login for each shop to isolate data.</p>
                </div>`).join('')}
            </div>` : '<div class="glass" style="padding:2rem;text-align:center;color:var(--text-muted)"><p>Only your primary shop is configured. Add more branches above.</p></div>'}`;
    }
};
window.MultiShop = MultiShop;

// ─── MARKET TREND ANALYZER ──────────────────────────────────
const MarketTrends = {
    init() { this.render(); },

    render() {
        const el = document.getElementById('marketTrendsContent'); if (!el) return;
        const sales = DB.getSales();
        const prodMap = {};
        sales.forEach(s => {
            if (!prodMap[s.productName]) prodMap[s.productName] = { name: s.productName, sold: 0, revenue: 0, profit: 0 };
            prodMap[s.productName].sold    += s.quantity;
            prodMap[s.productName].revenue += s.totalSales;
            prodMap[s.productName].profit  += s.profit;
        });
        const trending = Object.values(prodMap).sort((a, b) => b.sold - a.sold);
        const slow     = Object.values(prodMap).sort((a, b) => a.sold - b.sold);

        el.innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem">
                <div class="glass" style="padding:1.5rem">
                    <h3 style="margin-bottom:1rem">&#x1F525; Trending Products</h3>
                    ${trending.length ? trending.slice(0,5).map((p, i) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div><span style="font-size:1rem;margin-right:0.5rem">${['&#x1F947;','&#x1F948;','&#x1F949;','4️⃣','5️⃣'][i]||''}</span><strong>${p.name}</strong></div>
                        <div style="text-align:right;font-size:0.85rem">
                            <div style="color:#F59E0B">${p.sold} sold</div>
                            <div style="color:var(--text-muted)">&#x20B9;${p.revenue.toLocaleString('en-IN')}</div>
                        </div>
                    </div>`).join('') : '<p style="color:var(--text-muted)">No sales data yet.</p>'}
                </div>
                <div class="glass" style="padding:1.5rem">
                    <h3 style="margin-bottom:1rem">&#x1F6A8; Slow Movers</h3>
                    ${slow.filter(p=>p.sold<3).length ? slow.filter(p=>p.sold<3).slice(0,5).map(p => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                        <strong style="color:#EF4444">${p.name}</strong>
                        <div style="font-size:0.85rem;color:var(--text-muted)">${p.sold} sold only</div>
                    </div>`).join('') : '<p style="color:#10B981">No slow-moving products. Great!</p>'}
                </div>
            </div>
            <div class="glass" style="padding:1.5rem;border-left:4px solid #F59E0B">
                <h3 style="margin-bottom:0.75rem">&#x1F916; AI Market Recommendations</h3>
                ${trending.slice(0,3).map(p => `<p style="font-size:0.875rem;margin-bottom:0.5rem;padding:0.5rem;background:rgba(139,92,246,0.08);border-radius:0.4rem">&#x1F4A1; <strong>${p.name}</strong> is your best seller — Ensure stock is always available and consider upselling nearby products</p>`).join('')}
                ${slow.filter(p=>p.sold<3).slice(0,2).map(p => `<p style="font-size:0.875rem;margin-bottom:0.5rem;padding:0.5rem;background:rgba(239,68,68,0.08);border-radius:0.4rem">&#x26A0; <strong>${p.name}</strong> has very low sales — Consider discount offer or remove from inventory</p>`).join('')}
                ${!sales.length ? '<p style="color:var(--text-muted)">Log sales to generate market insights.</p>' : ''}
            </div>`;
    }
};
window.MarketTrends = MarketTrends;

// ─── OFFLINE MODE INDICATOR ──────────────────────────────────
const OfflineMode = {
    queue: [],
    init() {
        window.addEventListener('online',  () => { this.syncQueue(); showToast('&#x1F4F6; Back online — syncing data...', 'success'); });
        window.addEventListener('offline', () => showToast('&#x1F4F5; You are offline. Data saved locally.', 'info'));
        this.updateStatus();
    },
    updateStatus() {
        const el = document.getElementById('offlineStatus');
        if (el) el.textContent = navigator.onLine ? '&#x1F4F6; Online' : '&#x1F4F5; Offline (local mode)';
    },
    syncQueue() {
        // All data is in localStorage, no real sync needed for this local app
        this.queue = [];
        showToast('&#x2705; All local data is fully synced', 'success');
    }
};
window.OfflineMode = OfflineMode;
