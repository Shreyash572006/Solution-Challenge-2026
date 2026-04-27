import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useData } from '../context/DataContext'

const TT = (props) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
)

export default function ReturnsAnalysis() {
  const { appData } = useData()
  if (!appData) return null
  const { returnsData } = appData
  const returnBarData = returnsData.map(r => ({ name: r.product.split(' ').slice(0, 2).join(' '), rate: r.rate, returns: r.returns }))

  const avgReturnRate = (returnsData.reduce((s, r) => s + r.rate, 0) / (returnsData.length || 1)).toFixed(1)
  const topReturned = [...returnsData].sort((a, b) => b.rate - a.rate)[0] || { product: 'None', rate: 0 }
  const totalReturns = returnsData.reduce((s, r) => s + r.returns, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">Returns Analysis</h2>
        <p className="text-white/40 text-sm">Return rates by product, reasons and prevention strategies.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Returns', value: totalReturns, color: '#ef4444' },
          { label: 'Avg Return Rate', value: `${avgReturnRate}%`, color: '#f59e0b' },
          { label: 'Top Returned', value: topReturned.product.split(' ').slice(0,2).join(' '), color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bold text-white mb-4">Return Rate by Product (%)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={returnBarData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <TT formatter={(v) => [`${v}%`, 'Return Rate']} />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
              {returnBarData.map((entry, i) => <Cell key={i} fill={entry.rate > 15 ? '#ef4444' : entry.rate > 8 ? '#f59e0b' : '#10b981'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bold text-white mb-4">Product Return Details</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wider">
              {['Product', 'Returns', 'Total Sold', 'Return Rate', 'Top Reason'].map(h => (
                <th key={h} className="pb-3 text-left pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {returnsData.map((r, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-3 pr-6 text-white font-medium">{r.product}</td>
                <td className="py-3 pr-6 text-red-400 font-bold">{r.returns}</td>
                <td className="py-3 pr-6 text-white/60">{r.total}</td>
                <td className="py-3 pr-6">
                  <span className={`font-bold ${r.rate > 15 ? 'text-red-400' : r.rate > 8 ? 'text-yellow-400' : 'text-green-400'}`}>{r.rate}%</span>
                </td>
                <td className="py-3 text-white/50">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Prevention Tips */}
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2"><RotateCcw size={16} /> Return Prevention Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            '📸 Add 360° product photos to reduce "not as expected" returns by 35%.',
            '📦 Improve packaging for fragile electronics — damage-in-transit is costing ₹28k/month.',
            '🤖 Deploy AI chatbot for pre-purchase Q&A to reduce compatibility-related returns.',
            '⭐ Add verified customer reviews to build product trust and set right expectations.',
          ].map((tip, i) => (
            <div key={i} className="p-3 bg-red-500/10 rounded-xl text-white/70 text-sm">{tip}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
