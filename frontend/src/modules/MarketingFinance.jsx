import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, TrendingUp } from 'lucide-react'
import { useData } from '../context/DataContext'

const TT = (props) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
)

export default function MarketingFinance() {
  const { appData } = useData()
  if (!appData) return null
  const { marketingData, expenseData } = appData

  const totalSpend = marketingData.reduce((s, d) => s + d.spend, 0)
  const totalRevFromAds = marketingData.reduce((s, d) => s + d.revenue, 0)
  const overallROI = ((totalRevFromAds - totalSpend) / totalSpend * 100).toFixed(0)
  const bestChannel = [...marketingData].sort((a, b) => b.roi - a.roi)[0]
  const totalExpenses = expenseData.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">Marketing Analytics & Finance</h2>
        <p className="text-white/40 text-sm">ROI per channel, ad performance, expense breakdown and GST summary.</p>
      </div>

      {/* Marketing ROI Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Ad Spend', value: `₹${(totalSpend / 1000).toFixed(0)}k`, color: '#ef4444' },
          { label: 'Revenue from Ads', value: `₹${(totalRevFromAds / 1000).toFixed(0)}k`, color: '#10b981' },
          { label: 'Overall ROI', value: `${overallROI}%`, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ROI Bar Chart */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Ad Channel Performance (ROI %)</h3>
          <div className="text-xs text-green-400 font-bold px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            Best: {bestChannel.channel} — {bestChannel.roi}% ROI 🏆
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={marketingData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="channel" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <TT formatter={(v, n) => [n === 'roi' ? `${v}%` : `₹${v.toLocaleString('en-IN')}`, n.toUpperCase()]} />
            <Bar dataKey="roi" radius={[6, 6, 0, 0]}>
              {marketingData.map((entry, i) => (
                <Cell key={i} fill={entry.roi > 500 ? '#10b981' : entry.roi > 200 ? '#8b5cf6' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Excellent (&gt;500%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-violet-500 inline-block" /> Good (200–500%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Needs Work (&lt;200%)</span>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-4">Expense Categories (₹{(totalExpenses/1000).toFixed(0)}k total)</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={expenseData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="amount" stroke="none">
                  {expenseData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <TT formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1 text-xs">
              {expenseData.map(e => (
                <div key={e.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: e.color }} /><span className="text-white/60">{e.category}</span></div>
                  <span className="font-bold text-white">₹{(e.amount/1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Marketing Tips */}
        <div className="p-6 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-4">AI Optimization Tips</h3>
          {[
            { icon: '🎯', tip: 'Scale Email marketing — it delivers 820% ROI with only ₹2k/month spend.' },
            { icon: '📉', tip: 'Reduce Facebook budget by 30% — CPC is 4x higher than Google.' },
            { icon: '🔍', tip: 'Invest ₹10k/month in SEO content — organic traffic converts 3x better.' },
            { icon: '📊', tip: 'Run A/B test on Instagram creatives — engagement dropped 12% last month.' },
          ].map((t, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }}
              className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-white/60 text-sm leading-relaxed">{t.tip}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
