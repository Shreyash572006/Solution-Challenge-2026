import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../context/DataContext'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { AlertTriangle, Zap, TrendingUp, FileText } from 'lucide-react'

const TT = (props) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
)

const problems = [
  { id: 1, icon: '🔴', title: 'Critical Stock Shortage', desc: '2 products (Sony Headphones, JBL Speaker) will stock out within 24 hours. Estimated ₹82,000 in lost sales if not reordered.', action: 'Reorder immediately via supplier dashboard.', priority: 'P1' },
  { id: 2, icon: '🟠', title: 'High Return Rate on Wearables', desc: 'Samsung Galaxy Watch at 20% return rate — 4x industry average. Returns are costing ₹28,000/month in processing fees.', action: 'Investigate product quality and update description.', priority: 'P2' },
  { id: 3, icon: '🟡', title: 'Ad Spend Inefficiency', desc: 'Facebook Ads delivering only 160% ROI vs Email at 820% ROI. ₹12,000/month being burned inefficiently.', action: 'Reallocate 40% of Facebook budget to Email & SEO.', priority: 'P3' },
]

export default function AIAdvisor() {
  const { appData } = useData()
  const [activeTab, setActiveTab] = useState('advisor')
  
  if (!appData) return null
  const { aiAlerts, gstData, growthData, competitorData, kpiSummary } = appData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black mb-1">AI Business Advisor</h2>
          <p className="text-white/40 text-sm">Monitoring alerts, growth projections, GST reports, and competitor analysis.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 flex-wrap">
        {[
          ['advisor', '🧠 Advisor'],
          ['monitoring', '🚨 Monitoring'],
          ['growth', '📈 Growth'],
          ['gst', '🧾 GST'],
          ['competitor', '⚔️ Competitors'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? 'bg-violet-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

          {/* AI Advisor */}
          {activeTab === 'advisor' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <h3 className="font-bold text-violet-400 mb-1 flex items-center gap-2"><Zap size={16} /> Top 3 Business Problems (AI Analysis)</h3>
                <p className="text-white/40 text-xs">Based on all datasets — ordered by revenue impact.</p>
              </div>
              {problems.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <div className="font-bold text-white">{p.title}</div>
                        <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">{p.priority} Priority</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mb-3 leading-relaxed">{p.desc}</p>
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="text-green-400 font-bold text-xs mt-0.5">✅ ACTION:</span>
                    <span className="text-green-300 text-xs">{p.action}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Monitoring */}
          {activeTab === 'monitoring' && (
            <div className="space-y-3">
              {aiAlerts.map((alert, i) => {
                const colors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
                const col = colors[alert.priority] || colors.info
                return (
                  <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="p-5 rounded-2xl flex items-start gap-4"
                    style={{ background: col + '08', border: `1px solid ${col}30` }}>
                    <span className="text-2xl">{alert.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{alert.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full uppercase font-bold" style={{ background: col + '20', color: col }}>{alert.priority}</span>
                      </div>
                      <p className="text-white/60 text-sm">{alert.message}</p>
                      <span className="text-white/30 text-xs">{alert.time}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Growth */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="text-2xl font-black text-green-400">+18.4%</div>
                  <div className="text-xs text-white/40 mt-1">YoY Revenue Growth</div>
                </div>
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div className="text-2xl font-black text-violet-400">₹3.1Cr</div>
                  <div className="text-xs text-white/40 mt-1">Q1 2025 Target</div>
                </div>
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <div className="text-2xl font-black text-cyan-400">₹3.6Cr</div>
                  <div className="text-xs text-white/40 mt-1">Q2 2025 Target</div>
                </div>
              </div>
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="font-bold text-white mb-4">Revenue Growth Projection</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={growthData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="quarter" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                    <TT formatter={(v) => [`₹${(v/100000).toFixed(1)}L`, '']} />
                    <Bar dataKey="actual" fill="#8b5cf6" name="Actual" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="target" fill="rgba(139,92,246,0.2)" name="Target" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* GST Report */}
          {activeTab === 'gst' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Taxable Sales', value: `₹${gstData.totalSales.toLocaleString('en-IN')}`, color: '#8b5cf6' },
                  { label: 'CGST (9%)', value: `₹${gstData.cgst.toLocaleString('en-IN')}`, color: '#3b82f6' },
                  { label: 'SGST (9%)', value: `₹${gstData.sgst.toLocaleString('en-IN')}`, color: '#06b6d4' },
                  { label: 'Total GST Collected', value: `₹${gstData.totalGST.toLocaleString('en-IN')}`, color: '#f59e0b' },
                  { label: 'Input Tax Credit', value: `₹${gstData.inputCredit.toLocaleString('en-IN')}`, color: '#10b981' },
                  { label: 'Net GST Payable', value: `₹${gstData.netPayable.toLocaleString('en-IN')}`, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-white/40 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-2 text-green-400 font-bold mb-2"><FileText size={16} /> Monthly GST Summary</div>
                <p className="text-white/60 text-sm">Your total GST liability for this month is ₹{gstData.netPayable.toLocaleString('en-IN')} after claiming ₹{gstData.inputCredit.toLocaleString('en-IN')} in input tax credit on purchases. File before 20th of next month to avoid penalties.</p>
              </div>
            </div>
          )}

          {/* Competitors */}
          {activeTab === 'competitor' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p className="text-violet-400 font-bold text-sm">🏆 Vendrixa IQ leads in AI modules (16 vs avg 9) and customer rating (4.8 vs avg 3.8) while offering mid-range pricing.</p>
              </div>
              <div className="overflow-x-auto rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                      {['Platform', 'Price/mo', 'AI Modules', 'Rating', 'Support'].map(h => (
                        <th key={h} className="p-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {competitorData.map((c, i) => (
                      <tr key={i} className={`border-t border-white/5 ${i === 0 ? 'bg-violet-500/5' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {i === 0 && <span className="text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full font-bold">You</span>}
                            <span className={i === 0 ? 'text-violet-400 font-bold' : 'text-white/70'}>{c.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white font-semibold">₹{c.price.toLocaleString()}/mo</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-violet-500" style={{ width: `${(c.features / 16) * 100}%` }} />
                            </div>
                            <span className="text-white/60">{c.features}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`font-bold ${i === 0 ? 'text-green-400' : 'text-white/60'}`}>⭐ {c.rating}</span>
                        </td>
                        <td className="p-4"><span className={i === 0 ? 'text-green-400 font-semibold' : 'text-white/50'}>{c.support}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="font-bold text-white mb-4">Module Count Comparison</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={competitorData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <TT />
                    <Bar dataKey="features" radius={[6, 6, 0, 0]}>
                      {competitorData.map((entry, i) => <Cell key={i} fill={i === 0 ? '#8b5cf6' : '#374151'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
