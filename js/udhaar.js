// ═══════════════════════════════════════════════════════════
// UDHAAR (CREDIT MANAGEMENT) SYSTEM
// ═══════════════════════════════════════════════════════════
const Udhaar = {
    KEY: null,

    init() {
        this.KEY = 'viq_udhaar_' + (Auth.getCurrentUser()?.id || 'guest');
        this.render();
        document.getElementById('udhaarForm')?.addEventListener('submit', e => {
            e.preventDefault(); this.addEntry();
        });
    },

    getRecords() {
        return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    },

    saveRecords(r) {
        localStorage.setItem(this.KEY, JSON.stringify(r));
    },

    addEntry() {
        const name   = document.getElementById('udhaarName').value.trim();
        const phone  = document.getElementById('udhaarPhone').value.trim();
        const desc   = document.getElementById('udhaarDesc').value.trim();
        const amount = parseFloat(document.getElementById('udhaarAmount').value);
        const date   = document.getElementById('udhaarDate').value;
        if (!name || !desc || isNaN(amount) || !date) { showToast('Fill all fields', 'error'); return; }
        const records = this.getRecords();
        records.push({
            id: 'udh_' + Date.now(),
            customer_name: name, phone, description: desc,
            amount, status: 'pending', created_at: date,
            due_days: Math.floor((Date.now() - new Date(date)) / 86400000)
        });
        this.saveRecords(records);
        document.getElementById('udhaarForm').reset();
        document.getElementById('udhaarDate').value = new Date().toISOString().split('T')[0];
        this.render();
        showToast(`Udhaar entry added for ${name}`, 'success');
    },

    markPaid(id) {
        const records = this.getRecords().map(r => r.id === id ? { ...r, status: 'paid', paid_at: new Date().toISOString() } : r);
        this.saveRecords(records);
        this.render();
        showToast('Marked as Paid ✅', 'success');
    },

    deleteEntry(id) {
        if (!confirm('Delete this entry?')) return;
        this.saveRecords(this.getRecords().filter(r => r.id !== id));
        this.render();
    },

    getAIAnalysis(records) {
        const pendingByCustomer = {};
        records.filter(r => r.status === 'pending').forEach(r => {
            if (!pendingByCustomer[r.customer_name]) pendingByCustomer[r.customer_name] = [];
            pendingByCustomer[r.customer_name].push(r);
        });
        const insights = [];
        Object.entries(pendingByCustomer).forEach(([name, entries]) => {
            const maxDays = Math.max(...entries.map(e => e.due_days || 0));
            if (maxDays > 30) insights.push({ type: 'red', msg: `⚠️ ${name} has pending amount overdue by ${maxDays} days — Consider limiting credit` });
            else if (maxDays > 15) insights.push({ type: 'yellow', msg: `🕐 ${name} delays payments frequently — Send reminder` });
            else if (entries.length > 2) insights.push({ type: 'yellow', msg: `📋 ${name} has ${entries.length} pending entries — review credit limit` });
        });
        return insights;
    },

    render() {
        const records = this.getRecords();
        const pending = records.filter(r => r.status === 'pending');
        const totalPending = pending.reduce((s, r) => s + r.amount, 0);
        const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);

        // Summary cards
        const sumEl = document.getElementById('udhaarSummary');
        if (sumEl) sumEl.innerHTML = `
            <div class="glass kpi-card" style="border:1px solid rgba(239,68,68,0.3)">
                <h3>Total Pending</h3>
                <div class="value" style="color:#EF4444">&#x20B9;${totalPending.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">${pending.length} entries</div>
            </div>
            <div class="glass kpi-card" style="border:1px solid rgba(16,185,129,0.3)">
                <h3>Total Recovered</h3>
                <div class="value" style="color:#10B981">&#x20B9;${totalPaid.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">${records.filter(r=>r.status==='paid').length} paid</div>
            </div>
            <div class="glass kpi-card">
                <h3>Total Customers</h3>
                <div class="value">${[...new Set(records.map(r=>r.customer_name))].length}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">unique customers</div>
            </div>`;

        // AI insights
        const aiEl = document.getElementById('udhaarAI');
        if (aiEl) {
            const insights = this.getAIAnalysis(records);
            aiEl.innerHTML = insights.length ? insights.map(i => `
                <div style="padding:0.75rem 1rem;border-radius:0.5rem;margin-bottom:0.5rem;background:rgba(${i.type==='red'?'239,68,68':'245,158,11'},0.1);border-left:3px solid ${i.type==='red'?'#EF4444':'#F59E0B'};font-size:0.875rem">${i.msg}</div>`).join('')
                : '<p style="color:#10B981;font-size:0.875rem">&#x2705; All credit entries look healthy. Keep monitoring.</p>';
        }

        // Customer-wise ledger grouped
        const byCustomer = {};
        records.forEach(r => {
            if (!byCustomer[r.customer_name]) byCustomer[r.customer_name] = { phone: r.phone, entries: [] };
            byCustomer[r.customer_name].entries.push(r);
        });

        const ledgerEl = document.getElementById('udhaarLedger');
        if (!ledgerEl) return;
        if (!records.length) {
            ledgerEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:3rem"><div style="font-size:3rem">&#x1F4CB;</div><p>No udhaar entries yet. Add your first credit entry above.</p></div>';
            return;
        }

        ledgerEl.innerHTML = Object.entries(byCustomer).map(([name, data]) => {
            const totalAmt = data.entries.reduce((s, e) => s + e.amount, 0);
            const pendingAmt = data.entries.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
            const hasPending = pendingAmt > 0;
            return `<div class="glass" style="padding:1.5rem;margin-bottom:1.5rem;border:1px solid ${hasPending?'rgba(239,68,68,0.2)':'rgba(16,185,129,0.2)'}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">
                    <div>
                        <div style="font-weight:800;font-size:1.1rem">&#x1F464; ${name}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem">&#x1F4DE; ${data.phone || 'N/A'}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-size:0.7rem;color:var(--text-muted)">PENDING</div>
                        <div style="font-size:1.5rem;font-weight:800;color:${pendingAmt>0?'#EF4444':'#10B981'}">&#x20B9;${pendingAmt.toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Due Days</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>${data.entries.map(e => {
                            const daysOld = Math.floor((Date.now() - new Date(e.created_at)) / 86400000);
                            return `<tr>
                                <td>${e.created_at}</td>
                                <td>${e.description}</td>
                                <td style="font-weight:700">&#x20B9;${e.amount.toLocaleString('en-IN')}</td>
                                <td style="color:${daysOld>15?'#EF4444':'#F59E0B'}">${daysOld}d</td>
                                <td><span style="padding:0.2rem 0.6rem;border-radius:9999px;font-size:0.7rem;font-weight:700;background:${e.status==='paid'?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'};color:${e.status==='paid'?'#10B981':'#EF4444'}">${e.status.toUpperCase()}</span></td>
                                <td style="display:flex;gap:0.5rem">
                                    ${e.status==='pending'?`<button class="btn btn-primary" style="padding:0.2rem 0.6rem;font-size:0.72rem" onclick="Udhaar.markPaid('${e.id}')">&#x2705; Paid</button>`:''}
                                    <button class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.72rem" onclick="Udhaar.deleteEntry('${e.id}')">Del</button>
                                </td>
                            </tr>`;
                        }).join('')}</tbody>
                    </table>
                </div>
                ${data.phone ? `<div style="margin-top:0.75rem;display:flex;gap:0.75rem">
                    <a href="https://wa.me/91${data.phone}?text=Dear%20${encodeURIComponent(name)}%2C%20you%20have%20a%20pending%20amount%20of%20%E2%82%B9${pendingAmt}%20with%20our%20shop.%20Please%20clear%20at%20earliest.%20-%20${encodeURIComponent(Auth.getCurrentUser()?.shopName||'Shop')}" target="_blank" class="btn btn-ghost" style="font-size:0.75rem;padding:0.35rem 0.8rem;background:rgba(37,211,102,0.15);color:#25D366;border:1px solid rgba(37,211,102,0.3)">&#x1F4AC; WhatsApp Reminder</a>
                    <a href="tel:${data.phone}" class="btn btn-ghost" style="font-size:0.75rem;padding:0.35rem 0.8rem">&#x1F4DE; Call</a>
                </div>` : ''}
            </div>`;
        }).join('');
    }
};
window.Udhaar = Udhaar;
