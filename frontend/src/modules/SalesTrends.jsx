import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useData } from '../context/DataContext'

const TT = (props) => (
  <Tooltip {...props} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
)

const forecastFull = [
  { day: 'Jan', actual: 380, forecast: null }, { day: 'Feb', actual: 320, forecast: null },
  { day: 'Mar', actual: 450, forecast: null }, { day: 'Apr', actual: 510, forecast: null },
  { day: 'May', actual: 490, forecast: null }, { day: 'Jun', actual: 620, forecast: null },
  { day: 'Jul', actual: 580, forecast: null }, { day: 'Aug', actual: 670, forecast: null },
  { day: 'Sep', actual: 715, forecast: null }, { day: 'Oct', actual: 760, forecast: null },
  { day: 'Nov', actual: 890, forecast: null }, { day: 'Dec', actual: 1050, forecast: null },
  { day: 'Jan\'25', actual: null, forecast: 980 }, { day: 'Feb\'25', actual: null, forecast: 1080 },
  { day: 'Mar\'25', actual: null, forecast: 1240 }, { day: 'Apr\'25', actual: null, forecast: 1380 },
]

export default function SalesTrends() {
  const { appData } = useData()
  const [view, setView] = useState('trend')
  
  if (!appData) return null
  const { salesTrendData, demandForecast } = appData

  const avgSales = salesTrendData.reduce((s, d) => s + d.sales, 0) / salesTrendData.length
  const trend = salesTrendData[salesTrendData.length - 1].sales > salesTrendData[0].sales ? 'up' : 'down'
  const growth = ((salesTrendData[salesTrendData.length - 1].sales - salesTrendData[0].sales) / salesTrendData[0].sales * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black mb-1">Sales Trends & Forecast</h2>
          <p className="text-white/40 text-sm">12-month trend analysis with 30-day demand forecasting.</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          {[['trend', 'Trend Analysis'], ['forecast', '30-Day Forecast']].map(([key, label]) => (
            <button key={key} onClick={() => setView(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === key ? 'bg-violet-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="text-xs text-violet-400 font-bold uppercase mb-2">Overall Trend</div>
          <div className={`text-2xl font-black flex items-center gap-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp size={22} /> : <TrendingDown size={22} />} {trend === 'up' ? 'Rising' : 'Falling'}
          </div>
          <div className="text-white/40 text-xs mt-1">{growth}% YoY growth</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="text-xs text-cyan-400 font-bold uppercase mb-2">Avg Monthly Sales</div>
          <div className="text-2xl font-black text-white">₹{Math.round(avgSales)}k</div>
          <div className="text-white/40 text-xs mt-1">12-month rolling average</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="text-xs text-green-400 font-bold uppercase mb-2">Peak Month</div>
          <div className="text-2xl font-black text-white">Dec</div>
          <div className="text-green-400 text-xs mt-1">₹1,050k — Seasonal high</div>
        </div>
      </div>

      {/* Charts */}
      {view === 'trend' ? (
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-4">12-Month Sales Trend with Moving Average</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}k`} />
              <TT formatter={(v, n) => [`₹${v}k`, n === 'sales' ? 'Actual Sales' : 'Moving Avg']} />
              <ReferenceLine y={avgSales} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Avg', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <Legend formatter={(v) => v === 'sales' ? 'Actual Sales' : 'Moving Average'} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
              <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="ma" stroke="#06b6d4" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white mb-2">30-Day Demand Forecast</h3>
          <p className="text-white/40 text-xs mb-4">Blue = Actual | Purple = AI Predicted</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={demandForecast}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}k`} />
              <TT formatter={(v, n) => [v ? `₹${v}k` : '—', n === 'actual' ? 'Actual' : 'Forecast']} />
              <ReferenceLine x="Jan'25" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: 'Forecast →', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <Area type="monotone" dataKey="actual" stroke="#06b6d4" strokeWidth={2.5} fill="url(#ga)" connectNulls={false} />
              <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gf)" strokeDasharray="6 3" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p className="text-violet-400 text-sm font-semibold">🔮 AI Forecast Insight</p>
            <p className="text-white/60 text-xs mt-1">Demand is projected to grow by 18–32% in Q1 2025, driven by post-holiday restocking and seasonal trends. Consider increasing inventory by 25% in Electronics and FMCG categories.</p>
          </div>
        </div>
      )}
    </div>
  )
}
