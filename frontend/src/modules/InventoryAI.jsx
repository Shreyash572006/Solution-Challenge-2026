import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'

const TT = (props) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
)

const STATUS = {
  healthy: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'In Stock', icon: <CheckCircle size={13} /> },
  low:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Low Stock', icon: <AlertTriangle size={13} /> },
  critical:{ color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Critical!',  icon: <Clock size={13} /> },
}

export default function InventoryAI() {
  const { appData } = useData()
  if (!appData) return null
  const { inventoryData } = appData

  const critical = inventoryData.filter(i => i.status === 'critical')
  const low = inventoryData.filter(i => i.status === 'low')
  const healthy = inventoryData.filter(i => i.status === 'healthy')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">Inventory AI</h2>
        <p className="text-white/40 text-sm">Real-time stock levels, low-stock alerts, and predicted stockout dates.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Healthy Stock', count: healthy.length, ...STATUS.healthy },
          { label: 'Low Stock', count: low.length, ...STATUS.low },
          { label: 'Critical', count: critical.length, ...STATUS.critical },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -4 }} className="p-5 rounded-2xl text-center"
            style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Critical Alerts */}
      {critical.length > 0 && (
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-center gap-2 text-red-400 font-bold mb-3">
            <AlertTriangle size={16} /> Critical Stock Alert — Reorder Immediately!
          </div>
          <div className="grid gap-3">
            {critical.map(item => (
              <div key={item.product} className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl">
                <div>
                  <div className="text-white font-semibold text-sm">{item.product}</div>
                  <div className="text-red-400 text-xs">{item.category} • Only {item.stock} units left • ~{item.daysLeft} day(s) remaining</div>
                </div>
                <span className="text-xs bg-red-500/30 text-red-300 px-3 py-1.5 rounded-full font-bold">Order Now</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Level Bar Chart */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bold text-white mb-4">Stock Levels Overview</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={inventoryData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="product" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
              tickFormatter={v => v.split(' ').slice(0, 2).join(' ')} />
            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <TT formatter={(v, n, p) => [v + ' units', p.payload.product]} />
            <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
              {inventoryData.map((entry, i) => (
                <Cell key={i} fill={STATUS[entry.status].color} />
              ))}
            </Bar>
            <Bar dataKey="minStock" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> In Stock</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> Low Stock</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white/20 inline-block" /> Min. Required</span>
        </div>
      </div>

      {/* Full Inventory Table */}
      <div className="p-5 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bold text-white mb-4">Full Inventory Status</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wider">
              {['Product', 'Category', 'Stock', 'Min.Stock', 'Sales/Day', 'Days Left', 'Status'].map(h => (
                <th key={h} className="pb-3 text-left pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item, i) => {
              const st = STATUS[item.status]
              return (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-3 pr-4 text-white font-medium">{item.product}</td>
                  <td className="py-3 pr-4 text-white/60">{item.category}</td>
                  <td className="py-3 pr-4 font-bold" style={{ color: st.color }}>{item.stock}</td>
                  <td className="py-3 pr-4 text-white/50">{item.minStock}</td>
                  <td className="py-3 pr-4 text-white/60">{item.salesRate}/day</td>
                  <td className="py-3 pr-4 text-white/60">{item.daysLeft}d</td>
                  <td className="py-3">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold w-fit"
                      style={{ background: st.bg, color: st.color }}>
                      {st.icon} {st.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
