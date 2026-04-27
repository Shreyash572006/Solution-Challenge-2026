import { useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Percent } from 'lucide-react'
import { useData } from '../context/DataContext'

const TT = ({ contentStyle, ...props }) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, ...contentStyle }} />
)

function StatCard({ title, value, growth, icon: Icon, color, prefix = '', suffix = '' }) {
  const up = growth >= 0
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}
      className="p-5 rounded-2xl relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: color, filter: 'blur(30px)' }} />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: color + '20' }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${up ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {up ? '+' : ''}{growth}%
        </span>
      </div>
      <div className="text-2xl font-black text-white mb-1">{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}</div>
      <div className="text-xs text-white/40 font-medium uppercase tracking-wider">{title}</div>
    </motion.div>
  )
}

export default function AnalyticsHub() {
  const { appData } = useData()
  const [timeRange, setTimeRange] = useState('weekly')
  
  if (!appData) return null
  
  const { weeklyRevenue, monthlyRevenue, kpiSummary } = appData
  const data = timeRange === 'weekly' ? weeklyRevenue : monthlyRevenue

  const best = [...data].sort((a, b) => b.sales - a.sales)[0]
  const worst = [...data].sort((a, b) => a.sales - b.sales)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black mb-1">Analytics Hub</h2>
          <p className="text-white/40 text-sm">Revenue, orders, profit and growth rate — all in one place.</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          {['weekly', 'monthly'].map(t => (
            <button key={t} onClick={() => setTimeRange(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${timeRange === t ? 'bg-violet-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={kpiSummary.totalRevenue} growth={kpiSummary.revenueGrowth} icon={DollarSign} color="#8b5cf6" prefix="₹" />
        <StatCard title="Total Orders" value={kpiSummary.totalOrders} growth={kpiSummary.orderGrowth} icon={ShoppingCart} color="#06b6d4" />
        <StatCard title="Net Profit" value={kpiSummary.totalProfit} growth={kpiSummary.profitGrowth} icon={TrendingUp} color="#10b981" prefix="₹" />
        <StatCard title="Active Customers" value={kpiSummary.activeCustomers} growth={kpiSummary.customerGrowth} icon={Users} color="#f59e0b" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Sales & Profit Over Time</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />Sales</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <TT formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gs)" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#gp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-xs text-green-400 font-bold uppercase tracking-wider mb-2">🏆 Best Day</div>
            <div className="text-xl font-black text-white">{best?.name}</div>
            <div className="text-green-400 font-semibold">₹{best?.sales?.toLocaleString('en-IN')}</div>
            <div className="text-white/40 text-xs mt-1">Highest revenue recorded</div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="text-xs text-red-400 font-bold uppercase tracking-wider mb-2">📉 Worst Day</div>
            <div className="text-xl font-black text-white">{worst?.name}</div>
            <div className="text-red-400 font-semibold">₹{worst?.sales?.toLocaleString('en-IN')}</div>
            <div className="text-white/40 text-xs mt-1">Lowest revenue recorded</div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-2">📊 Profit Margin</div>
            <div className="text-xl font-black text-white">{kpiSummary.profitMargin}%</div>
            <div className="text-violet-400 font-semibold">₹{kpiSummary.avgOrderValue.toLocaleString('en-IN')} AOV</div>
            <div className="text-white/40 text-xs mt-1">Average order value</div>
          </div>
        </div>
      </div>

      {/* Orders Bar Chart */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-bold text-white mb-4">Daily/Weekly Order Volume</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <TT formatter={(v) => [v + ' orders', '']} />
            <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]}>
              <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
