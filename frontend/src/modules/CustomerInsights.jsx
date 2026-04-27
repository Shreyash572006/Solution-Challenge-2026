import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Users, Star, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext'

const TT = (props) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
)

const retentionTips = [
  { icon: '🎁', title: 'Loyalty Program', desc: 'Offer points per purchase. Customers with loyalty cards spend 47% more.', impact: 'High' },
  { icon: '📧', title: 'Re-engagement Emails', desc: 'Send personalized "We miss you" campaign to 890 inactive customers.', impact: 'High' },
  { icon: '⭐', title: 'VIP Tier Rewards', desc: 'Create Gold/Platinum tiers for top 15% spenders to increase LTV.', impact: 'Medium' },
  { icon: '🏷️', title: 'Birthday Discounts', desc: 'Automated 15% birthday coupon shown to increase retention by 23%.', impact: 'Medium' },
]

export default function CustomerInsights() {
  const { appData } = useData()
  if (!appData) return null
  const { customerData } = appData

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">Customer Insights</h2>
        <p className="text-white/40 text-sm">Repeat vs new customer segmentation, LTV analysis, and retention strategies.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Retention Rate', value: `${customerData.retention.rate}%`, color: '#10b981', icon: <RefreshCw size={18} /> },
          { label: 'Avg Orders/Customer', value: customerData.retention.avgOrders, color: '#8b5cf6', icon: <Star size={18} /> },
          { label: 'Avg Lifetime Value', value: `₹${customerData.retention.ltv.toLocaleString('en-IN')}`, color: '#06b6d4', icon: <Users size={18} /> },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -4 }} className="p-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="p-2 rounded-xl mb-3 w-fit" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-4">Customer Type Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={customerData.types} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {customerData.types.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <TT formatter={(v, n) => [`${v}%`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 flex-1">
              {customerData.types.map((type) => (
                <div key={type.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: type.color }} />
                      <span className="text-white/70">{type.name}</span>
                    </div>
                    <span className="font-bold text-white">{type.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: type.color }} initial={{ width: 0 }} animate={{ width: `${type.value}%` }} transition={{ delay: 0.3, duration: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-4">Top Customers by Lifetime Value</h3>
          <div className="space-y-3">
            {customerData.topCustomers.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: i === 0 ? '#f59e0b20' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.5)' }}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">{c.name}</span>
                    <span className="text-white/80 font-bold text-sm">₹{c.spend.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">{c.orders} orders</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === 'repeat' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {c.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retention Strategies */}
      <div>
        <h3 className="font-bold text-white mb-4">AI-Generated Retention Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {retentionTips.map((tip, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02, borderColor: 'rgba(139,92,246,0.4)' }}
              className="p-5 rounded-2xl cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{tip.icon}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tip.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{tip.impact} Impact</span>
              </div>
              <div className="font-bold text-white mb-1">{tip.title}</div>
              <div className="text-white/50 text-xs leading-relaxed">{tip.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
