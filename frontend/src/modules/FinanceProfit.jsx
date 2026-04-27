import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'

const TT = (props) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
)

const PIE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981']

export default function FinanceProfit() {
  const { appData } = useData()
  if (!appData) return null
  const { profitByProduct, costVsProfit, kpiSummary } = appData

  const lowMargin = profitByProduct.filter(p => p.margin < 25)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">Finance & Profit Analysis</h2>
        <p className="text-white/40 text-sm">Profit per product, margins, GST estimates and cost breakdown.</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${(kpiSummary.totalRevenue / 100000).toFixed(1)}L`, sub: '+18.4% growth', col: '#8b5cf6', icon: <DollarSign size={18} /> },
          { label: 'Net Profit', value: `₹${(kpiSummary.totalProfit / 100000).toFixed(1)}L`, sub: `${kpiSummary.profitMargin}% margin`, col: '#10b981', icon: <TrendingUp size={18} /> },
          { label: 'Avg Profit Margin', value: `${kpiSummary.profitMargin}%`, sub: '+2.8% from last month', col: '#06b6d4', icon: <TrendingUp size={18} /> },
        ].map(item => (
          <motion.div key={item.label} whileHover={{ y: -4 }} className="p-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 rounded-xl" style={{ background: item.col + '20', color: item.col }}>{item.icon}</div>
            </div>
            <div className="text-2xl font-black text-white">{item.value}</div>
            <div className="text-xs text-white/40 mt-1">{item.label}</div>
            <div className="text-xs mt-2 font-semibold" style={{ color: item.col }}>{item.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit by Product Bar Chart */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-4">Profit by Product (₹)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={profitByProduct} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
              <TT formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Profit']} />
              <Bar dataKey="profit" fill="url(#profGrad)" radius={[0, 6, 6, 0]}>
                <defs><linearGradient id="profGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost vs Profit Pie */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-4">Cost vs Profit Breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={costVsProfit} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                  {costVsProfit.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <TT formatter={(v, n) => [`${v}%`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {costVsProfit.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-white/60 text-xs">{item.name}</span>
                  </div>
                  <span className="font-bold text-white text-sm">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Low Margin Alert */}
      {lowMargin.length > 0 && (
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-center gap-2 text-red-400 font-bold mb-3">
            <AlertTriangle size={16} /> Low-Margin Products Alert
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lowMargin.map(p => (
              <div key={p.name} className="p-3 rounded-xl bg-red-500/10">
                <div className="text-white font-semibold text-sm">{p.name}</div>
                <div className="text-red-400 text-xs mt-1">Margin: {p.margin}% — Optimize pricing or reduce costs.</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Margin Table */}
      <div className="p-5 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bold text-white mb-4">Product Profit Table</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wider">
              <th className="pb-3 text-left">Product</th>
              <th className="pb-3 text-right">Profit (₹)</th>
              <th className="pb-3 text-right">Margin</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {profitByProduct.map((p, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-3 text-white font-medium">{p.name}</td>
                <td className="py-3 text-right text-white">₹{p.profit.toLocaleString('en-IN')}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.margin}%`, background: p.margin < 25 ? '#ef4444' : '#10b981' }} />
                    </div>
                    <span className={p.margin < 25 ? 'text-red-400' : 'text-green-400'}>{p.margin}%</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.margin < 25 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {p.margin < 25 ? 'Low Margin' : 'Healthy'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
