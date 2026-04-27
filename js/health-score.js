// ═══════════════════════════════════════════════════════════
// BUSINESS HEALTH SCORE MODULE
// ═══════════════════════════════════════════════════════════
const HealthScore = {
    chart: null,

    init() {
        this.refresh();
    },

    calculate() {
        const kpis  = DB.getKPIs();
        const inv   = DB.getInventory();
        const sales = DB.getSales();

        // 1. Profit Margin Score (40%) — 0-100 based on margin %
        let marginScore = 0;
        if (kpis.profitMargin >= 30) marginScore = 100;
        else if (kpis.profitMargin >= 20) marginScore = 80;
        else if (kpis.profitMargin >= 10) marginScore = 55;
        else if (kpis.profitMargin > 0)   marginScore = 30;
        else marginScore = 0;

        // 2. Sales Growth Score (30%) — compare recent vs older entries
        let growthScore = 50; // default neutral
        if (sales.length >= 6) {
            const sorted = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
            const half = Math.floor(sorted.length / 2);
            const older  = sorted.slice(0, half).reduce((s, x) => s + x.totalSales, 0);
            const recent = sorted.slice(half).reduce((s, x) => s + x.totalSales, 0);
            if (older > 0) {
                const growth = ((recent - older) / older) * 100;
                if (growth >= 30)       growthScore = 100;
                else if (growth >= 15)  growthScore = 85;
                else if (growth >= 0)   growthScore = 65;
                else if (growth >= -15) growthScore = 40;
                else                    growthScore = 20;
            }
        } else if (sales.length > 0) {
            growthScore = 55; // some data, neutral
        }

        // 3. Inventory Balance Score (30%)
        let invScore = 50;
        if (inv.length === 0) {
            invScore = 20;
        } else {
            const lowStock     = inv.filter(i => i.stock < 5).length;
            const overStock    = inv.filter(i => i.stock > 50).length;
            const lowFraction  = lowStock / inv.length;
            const overFraction = overStock / inv.length;
            invScore = Math.max(0, 100 - (lowFraction * 60) - (overFraction * 30));
        }

        // Weighted total
        const total = Math.round((marginScore * 0.4) + (growthScore * 0.3) + (invScore * 0.3));

        return {
            total: Math.min(100, Math.max(0, total)),
            breakdown: { marginScore, growthScore, invScore }
        };
    },

    getStatus(score) {
        if (score >= 70) return { label: 'Good', color: '#10B981', icon: '🟢', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' };
        if (score >= 40) return { label: 'Average', color: '#F59E0B', icon: '🟡', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)' };
        return { label: 'Risk', color: '#EF4444', icon: '🔴', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' };
    },

    getMessage(score, breakdown) {
        if (score >= 75) return "✅ Your business is performing well! Keep up the great work.";
        if (score >= 60) return "📈 Your business is stable. Focus on improving sales growth.";
        if (score >= 40) {
            if (breakdown.marginScore < 50) return "⚠️ Your business needs improvement in profit margins. Reduce costs or raise prices.";
            if (breakdown.growthScore < 40) return "⚠️ Your business needs improvement in sales. Try promotions or new products.";
            return "⚠️ Business is average. Review your inventory and pricing strategy.";
        }
        return "🚨 Business is at risk! Immediate action needed on expenses and sales.";
    },

    saveScore(score) {
        const data = DB.getAllData();
        if (!data.healthHistory) data.healthHistory = [];
        const today = new Date().toISOString().split('T')[0];
        // Update today's entry or add new
        const idx = data.healthHistory.findIndex(h => h.date === today);
        if (idx >= 0) data.healthHistory[idx].score = score;
        else data.healthHistory.push({ date: today, score });
        // Keep last 30 days
        data.healthHistory = data.healthHistory.slice(-30);
        DB.saveAllData(data);
        return data.healthHistory;
    },

    refresh() {
        const { total, breakdown } = this.calculate();
        const status  = this.getStatus(total);
        const message = this.getMessage(total, breakdown);
        const history = this.saveScore(total);

        // Update mini card on overview
        const miniCard = document.getElementById('healthScoreMini');
        if (miniCard) {
            miniCard.innerHTML = `
                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Health Score</div>
                <div style="font-size:2rem;font-weight:900;color:${status.color}">${total}<span style="font-size:1rem">/100</span></div>
                <div style="font-size:0.8rem;font-weight:700;color:${status.color}">${status.icon} ${status.label}</div>`;
        }

        // Full health score section
        const scoreDisplay = document.getElementById('healthScoreDisplay');
        if (!scoreDisplay) return;

        scoreDisplay.innerHTML = `
            <div style="text-align:center;padding:2rem;background:${status.bg};border:1px solid ${status.border};border-radius:1.5rem;margin-bottom:2rem">
                <div style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.5rem">OVERALL BUSINESS HEALTH</div>
                <div style="font-size:5rem;font-weight:900;color:${status.color};line-height:1">${total}</div>
                <div style="font-size:1rem;color:var(--text-muted);margin-bottom:0.5rem">/ 100</div>
                <div style="display:inline-block;padding:0.4rem 1.2rem;border-radius:9999px;background:${status.bg};border:1px solid ${status.border};font-weight:700;color:${status.color};font-size:1.1rem">${status.icon} ${status.label}</div>
                <p style="margin-top:1.5rem;font-size:1rem;color:rgba(255,255,255,0.8)">${message}</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem">
                ${[
                    { label: 'Profit Margin', score: breakdown.marginScore, weight: '40%', icon: '💰' },
                    { label: 'Sales Growth',  score: breakdown.growthScore, weight: '30%', icon: '📈' },
                    { label: 'Inventory Balance', score: breakdown.invScore, weight: '30%', icon: '📦' }
                ].map(f => {
                    const c = f.score >= 70 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444';
                    return `<div class="glass" style="padding:1.25rem;text-align:center">
                        <div style="font-size:1.5rem">${f.icon}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);margin:0.4rem 0">${f.label} <span style="color:var(--primary-light)">(${f.weight})</span></div>
                        <div style="font-size:1.75rem;font-weight:800;color:${c}">${Math.round(f.score)}</div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:9999px;height:5px;margin-top:0.5rem">
                            <div style="height:5px;border-radius:9999px;background:${c};width:${f.score}%;transition:width 0.8s"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;

        this.renderTrendChart(history);
    },

    renderTrendChart(history) {
        const canvas = document.getElementById('healthTrendChart');
        if (!canvas) return;

        if (this.chart) { this.chart.destroy(); this.chart = null; }

        const labels = history.map(h => {
            const d = new Date(h.date);
            return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        });
        const data = history.map(h => h.score);

        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Health Score',
                    data,
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139,92,246,0.15)',
                    borderWidth: 3,
                    pointBackgroundColor: data.map(v => v >= 70 ? '#10B981' : v >= 40 ? '#F59E0B' : '#EF4444'),
                    pointRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `Score: ${ctx.raw}/100`
                        }
                    }
                },
                scales: {
                    y: {
                        min: 0, max: 100,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: 'rgba(255,255,255,0.5)', stepSize: 20 }
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: 'rgba(255,255,255,0.5)' }
                    }
                }
            }
        });
    }
};

window.HealthScore = HealthScore;
