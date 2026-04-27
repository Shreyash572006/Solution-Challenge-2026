// AI Business Decision Engine
const DecisionEngine = {
    init() {
        this.renderHistory();
        const generateBtn = document.getElementById('generateDecisionsBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateSmartDecisions();
            });
        }
    },

    generateSmartDecisions() {
        // Clear old decisions
        DB.clearDecisions();

        // Gather Data
        const kpis = DB.getKPIs();
        const inventory = DB.getInventory();
        const sales = DB.getSales();
        
        let decisionsGenerated = 0;

        // 1. Detect sales drop (>20%)
        // We will simulate a sales drop check. Let's compare recent 3 days vs previous 3 days or just if revenue is low and profit exists.
        // For simplicity and to meet the requirement: if recent sales avg is lower than past, or just randomly trigger to show the feature if there isn't enough data (since it's a demo).
        // Let's implement real logic: check total revenue / days.
        if (sales.length > 5) {
            // Sort sales by date descending
            const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));
            // First 3 vs Next 3 sales entries (simplified tracking)
            const recentSales = sortedSales.slice(0, 3).reduce((sum, s) => sum + s.totalSales, 0);
            const pastSales = sortedSales.slice(3, 6).reduce((sum, s) => sum + s.totalSales, 0);
            
            if (pastSales > 0 && recentSales < pastSales * 0.8) {
                DB.addDecision(
                    "Sales drop detected (>20%)",
                    "Sales decreased due to low demand or high pricing",
                    "Reduce price by 5% or improve marketing"
                );
                decisionsGenerated++;
            }
        } else if (sales.length > 0 && kpis.revenue < 1000) {
            // Fallback rule to show decision for small data sets
             DB.addDecision(
                "Low overall sales volume",
                "Sales decreased due to low demand or high pricing",
                "Reduce price by 5% or improve marketing"
            );
            decisionsGenerated++;
        }

        // 2. Detect low profit margin (<10%)
        if (kpis.profitMargin !== undefined && kpis.profitMargin < 10) {
            DB.addDecision(
                "Low Profit Margin (<10%)",
                "High expenses affecting profit",
                "Reduce unnecessary expenses"
            );
            decisionsGenerated++;
        }
        
        // 3. Detect overstock or understock in inventory
        inventory.forEach(item => {
            if (item.stock > 50) {
                DB.addDecision(
                    `High Inventory: ${item.name}`,
                    "Overstock detected",
                    "Run discount or bundle offers"
                );
                decisionsGenerated++;
            } else if (item.stock > 0 && item.stock < 5) {
                DB.addDecision(
                    `Low Stock: ${item.name}`,
                    "Understock detected, risk of losing sales",
                    "Restock from supplier immediately"
                );
                decisionsGenerated++;
            }
        });

        // Fallback if everything is perfect
        if (decisionsGenerated === 0) {
           DB.addDecision(
                "Business is Stable",
                "No critical issues detected in margins, sales, or inventory.",
                "Continue monitoring and explore expansion."
            );
        }

        showToast("AI Decisions Generated successfully! 🧠", "success");
        this.renderHistory();
    },

    renderHistory() {
        const decisionsList = document.getElementById('decisionsOutputGrid');
        if (!decisionsList) return;

        const decisions = DB.getDecisions().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (decisions.length === 0) {
            decisionsList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
                No decisions generated yet. Click the button above to run the AI engine.
            </div>`;
            return;
        }

        decisionsList.innerHTML = decisions.map(d => `
            <div class="glass kpi-card" style="display:flex;flex-direction:column;gap:0.75rem;padding:1.5rem">
                <div style="font-size:0.75rem;color:var(--text-muted)">${new Date(d.timestamp).toLocaleString()}</div>
                <div>
                    <span class="badge" style="background:rgba(239,68,68,0.1);color:var(--danger);border:1px solid rgba(239,68,68,0.3);margin-bottom:0.5rem;display:inline-block;">⚠️ Problem Detected</span>
                    <div style="font-weight:700;font-size:1.1rem;color:white;">${d.problem}</div>
                </div>
                <div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.25rem;">Reason Analysis</div>
                    <div style="font-size:0.95rem;font-weight:500;">${d.reason}</div>
                </div>
                <div style="margin-top:auto;padding-top:0.5rem;border-top:1px solid rgba(255,255,255,0.1)">
                    <span class="badge" style="background:rgba(16,185,129,0.1);color:#10B981;border:1px solid rgba(16,185,129,0.3);margin-bottom:0.5rem;display:inline-block;">💡 Recommended Action</span>
                    <div style="font-weight:700;color:#10B981;">${d.suggestion}</div>
                </div>
            </div>
        `).join('');
    }
};

window.DecisionEngine = DecisionEngine;
