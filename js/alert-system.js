// ═══════════════════════════════════════════════════════════
// REAL-TIME ALERT SYSTEM
// ═══════════════════════════════════════════════════════════
const AlertSystem = {
    STORAGE_KEY: null,

    init() {
        this.STORAGE_KEY = 'viq_alerts_' + (Auth.getCurrentUser()?.id || 'guest');
        this.renderBell();
        this.renderDropdown();
        this.runChecks();
        // Auto-check every 60 seconds
        setInterval(() => this.runChecks(), 60000);
    },

    getAlerts() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    },

    saveAlerts(alerts) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(alerts.slice(-100)));
    },

    trigger(type, title, message, source = 'system') {
        const alerts = this.getAlerts();
        // Prevent duplicate within 1 hour
        const now = Date.now();
        const dup = alerts.find(a => a.title === title && (now - new Date(a.ts).getTime()) < 3600000);
        if (dup) return;

        const newAlert = {
            id: 'alert_' + now,
            type,   // 'red' | 'yellow' | 'green'
            title,
            message,
            source,
            ts: new Date().toISOString(),
            read: false
        };
        alerts.unshift(newAlert);
        this.saveAlerts(alerts);
        this.renderBell();
        this.renderDropdown();

        // Show toast for new alerts
        const toastType = type === 'red' ? 'error' : type === 'yellow' ? 'info' : 'success';
        if (typeof showToast === 'function') showToast(`${this.typeIcon(type)} ${title}: ${message}`, toastType);
    },

    typeIcon(type) {
        return type === 'red' ? '🔴' : type === 'yellow' ? '🟡' : '🟢';
    },

    typeLabel(type) {
        return type === 'red' ? 'Critical' : type === 'yellow' ? 'Warning' : 'Opportunity';
    },

    markRead(id) {
        const alerts = this.getAlerts().map(a => a.id === id ? { ...a, read: true } : a);
        this.saveAlerts(alerts);
        this.renderBell();
        this.renderDropdown();
    },

    markAllRead() {
        const alerts = this.getAlerts().map(a => ({ ...a, read: true }));
        this.saveAlerts(alerts);
        this.renderBell();
        this.renderDropdown();
    },

    clearAll() {
        this.saveAlerts([]);
        this.renderBell();
        this.renderDropdown();
    },

    unreadCount() {
        return this.getAlerts().filter(a => !a.read).length;
    },

    renderBell() {
        const bell = document.getElementById('alertBell');
        if (!bell) return;
        const count = this.unreadCount();
        bell.innerHTML = `
            🔔
            ${count > 0 ? `<span id="alertBadge" style="position:absolute;top:-4px;right:-4px;background:#EF4444;color:white;font-size:0.6rem;font-weight:800;min-width:16px;height:16px;border-radius:9999px;display:flex;align-items:center;justify-content:center;padding:0 3px;animation:pulse 2s infinite">${count > 9 ? '9+' : count}</span>` : ''}`;
    },

    renderDropdown() {
        const list = document.getElementById('alertsList');
        if (!list) return;
        const alerts = this.getAlerts();

        if (alerts.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:2rem">No alerts yet</div>';
            return;
        }

        const typeColors = { red: '#EF4444', yellow: '#F59E0B', green: '#10B981' };
        list.innerHTML = alerts.map(a => `
            <div onclick="AlertSystem.markRead('${a.id}')" class="alert-item ${a.read ? 'read' : 'unread'}" style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.75rem;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:background 0.2s;${!a.read ? 'background:rgba(255,255,255,0.03)' : ''}">
                <div style="width:8px;height:8px;border-radius:50%;background:${typeColors[a.type]};margin-top:5px;flex-shrink:0;${a.read ? 'opacity:0.3' : ''}"></div>
                <div style="flex:1;min-width:0">
                    <div style="font-weight:${a.read ? '500' : '700'};font-size:0.85rem;color:${typeColors[a.type]}">${a.title}</div>
                    <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.1rem">${a.message}</div>
                    <div style="font-size:0.68rem;color:var(--text-muted);margin-top:0.3rem">${new Date(a.ts).toLocaleString()}</div>
                </div>
                <span style="font-size:0.6rem;padding:2px 6px;border-radius:4px;background:${typeColors[a.type]}22;color:${typeColors[a.type]};flex-shrink:0">${this.typeLabel(a.type)}</span>
            </div>`).join('');
    },

    // Full alerts section render
    renderAlertsPage() {
        const container = document.getElementById('alertsPageList');
        if (!container) return;
        const alerts = this.getAlerts();

        if (alerts.length === 0) {
            container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:4rem">
                <div style="font-size:4rem">🔔</div>
                <p>No alerts triggered yet. Alerts fire automatically based on your business data.</p>
            </div>`;
            return;
        }

        const typeColors = { red: '#EF4444', yellow: '#F59E0B', green: '#10B981' };
        const typeLabels = { red: '🔴 Critical', yellow: '🟡 Warning', green: '🟢 Opportunity' };
        container.innerHTML = alerts.map(a => `
            <div onclick="AlertSystem.markRead('${a.id}')" style="display:flex;align-items:start;gap:1rem;padding:1rem;border:1px solid ${!a.read ? typeColors[a.type]+'44' : 'rgba(255,255,255,0.07)'};border-radius:0.75rem;margin-bottom:0.75rem;cursor:pointer;transition:all 0.2s;background:${!a.read ? typeColors[a.type]+'0a' : 'transparent'}">
                <div style="width:10px;height:10px;border-radius:50%;background:${typeColors[a.type]};margin-top:5px;flex-shrink:0;${a.read ? 'opacity:0.3' : ''}"></div>
                <div style="flex:1">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem">
                        <span style="font-weight:700;color:${typeColors[a.type]}">${a.title}</span>
                        <span style="font-size:0.7rem;padding:0.2rem 0.5rem;border-radius:4px;background:${typeColors[a.type]}22;color:${typeColors[a.type]}">${typeLabels[a.type]}</span>
                    </div>
                    <div style="font-size:0.9rem;color:rgba(255,255,255,0.75);margin-bottom:0.25rem">${a.message}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted)">${new Date(a.ts).toLocaleString()} · Source: ${a.source}</div>
                </div>
                ${a.read ? '' : '<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);margin-top:6px"></div>'}
            </div>`).join('');
    },

    // Automated business checks
    runChecks() {
        const kpis = DB.getKPIs();
        const inv  = DB.getInventory();
        const sales = DB.getSales();

        // Profit threshold
        if (kpis.profitMargin < 5 && kpis.revenue > 0) {
            this.trigger('red', 'Critical: Low Profit', `Profit margin is ${kpis.profitMargin.toFixed(1)}% — below 5%`, 'finance');
        } else if (kpis.profitMargin < 15 && kpis.revenue > 0) {
            this.trigger('yellow', 'Warning: Low Margin', `Profit margin is ${kpis.profitMargin.toFixed(1)}% — target 20%+`, 'finance');
        }

        // Sales drop
        if (sales.length >= 6) {
            const sorted = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
            const half = Math.floor(sorted.length / 2);
            const older  = sorted.slice(0, half).reduce((s, x) => s + x.totalSales, 0);
            const recent = sorted.slice(half).reduce((s, x) => s + x.totalSales, 0);
            if (older > 0 && recent < older * 0.75) {
                const drop = (((older - recent) / older) * 100).toFixed(0);
                this.trigger('red', 'Sales Drop Detected', `Sales dropped by ${drop}% compared to previous period`, 'sales');
            }
        }

        // High stock opportunity
        const richProducts = sales.length > 2 ? DB.getInventory().filter(i => i.stock > 100) : [];
        richProducts.forEach(p => {
            this.trigger('green', 'Opportunity: High Stock', `${p.name} has ${p.stock} units — consider bulk discount`, 'inventory');
        });
    }
};

window.AlertSystem = AlertSystem;
