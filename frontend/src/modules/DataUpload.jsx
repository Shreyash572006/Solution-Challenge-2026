import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye } from 'lucide-react'
import { useData } from '../context/DataContext'
import { generateDashboardData } from '../utils/aiDataGenerator'

// Simulated AI processing engine
function processCSVData(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })

  // Column classification
  const classify = (col) => {
    const c = col.toLowerCase()
    if (c.includes('revenue') || c.includes('sales') || c.includes('amount') || c.includes('price')) return 'Sales'
    if (c.includes('stock') || c.includes('inventory') || c.includes('qty') || c.includes('quantity')) return 'Inventory'
    if (c.includes('expense') || c.includes('cost') || c.includes('spend')) return 'Expenses'
    if (c.includes('customer') || c.includes('client') || c.includes('user')) return 'Customers'
    if (c.includes('date') || c.includes('time') || c.includes('day')) return 'Date'
    if (c.includes('product') || c.includes('item') || c.includes('name')) return 'Product'
    return 'General'
  }

  const columnMap = headers.map(h => ({ column: h, type: classify(h) }))
  const duplicates = rows.length - [...new Set(rows.map(r => JSON.stringify(r)))].length
  const missing = rows.reduce((acc, row) => {
    headers.forEach(h => { if (!row[h] || row[h] === '') acc++ })
    return acc
  }, 0)

  return { headers, rows: lines.length > 500 ? rows : rows, previewRows: rows.slice(0, 10), total: rows.length, columnMap, duplicates, missing }
}

export default function DataUploadModule() {
  const { setAppData } = useData()
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const processFile = useCallback((file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Only CSV and Excel files are supported.')
      return
    }
    setError(null)
    setProcessing(true)
    setProgress(0)

    // Simulate progressive AI processing
    const steps = [
      { msg: 'Reading file...', pct: 15 },
      { msg: 'Detecting columns...', pct: 35 },
      { msg: 'Cleaning data...', pct: 55 },
      { msg: 'Classifying schema...', pct: 75 },
      { msg: 'Generating report...', pct: 95 },
    ]

    let stepIdx = 0
    const iv = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx].pct)
        stepIdx++
      } else {
        clearInterval(iv)
        if (ext === 'csv') {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const data = processCSVData(e.target.result)
              setResult({ ...data, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', processedAt: new Date().toLocaleTimeString() })
              
              // Generate AI Dashboard data
              const generatedData = generateDashboardData(data.rows, data.columnMap)
              setAppData(generatedData)

            } catch (err) {
              console.error(err)
              setError('Could not parse file. Please ensure it is a valid CSV.')
            }
            setProcessing(false)
            setProgress(100)
          }
          reader.readAsText(file)
        } else {
          // Excel mock result
          const data = {
            fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', processedAt: new Date().toLocaleTimeString(),
            headers: ['Date', 'Product', 'Category', 'Quantity', 'Unit Price', 'Revenue', 'Customer', 'Expense'],
            total: 1248, duplicates: 3, missing: 7,
            columnMap: [
              { column: 'Date', type: 'Date' }, { column: 'Product', type: 'Product' },
              { column: 'Category', type: 'General' }, { column: 'Quantity', type: 'Inventory' },
              { column: 'Unit Price', type: 'Sales' }, { column: 'Revenue', type: 'Sales' },
              { column: 'Customer', type: 'Customers' }, { column: 'Expense', type: 'Expenses' },
            ],
            rows: [
              { Date: '2024-01-01', Product: 'iPhone 15', Category: 'Smartphones', Quantity: '5', 'Unit Price': '74999', Revenue: '374995', Customer: 'Rajesh K', Expense: '280000' },
              { Date: '2024-01-02', Product: 'JBL Speaker', Category: 'Audio', Quantity: '8', 'Unit Price': '12999', Revenue: '103992', Customer: 'Priya M', Expense: '72000' },
            ],
            previewRows: [
              { Date: '2024-01-01', Product: 'iPhone 15', Category: 'Smartphones', Quantity: '5', 'Unit Price': '74999', Revenue: '374995', Customer: 'Rajesh K', Expense: '280000' },
              { Date: '2024-01-02', Product: 'JBL Speaker', Category: 'Audio', Quantity: '8', 'Unit Price': '12999', Revenue: '103992', Customer: 'Priya M', Expense: '72000' },
            ]
          }
          setResult(data)
          
          // Generate AI Dashboard data
          const generatedData = generateDashboardData(data.rows, data.columnMap)
          setAppData(generatedData)

          setProcessing(false)
          setProgress(100)
        }
      }
    }, 300)
  }, [])

  const typeColors = { Sales: '#10b981', Inventory: '#3b82f6', Expenses: '#ef4444', Customers: '#f59e0b', Date: '#8b5cf6', Product: '#06b6d4', General: '#6b7280' }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">AI Data Processor</h2>
        <p className="text-white/40 text-sm">Upload your CSV or Excel file — AI will clean, classify and structure it automatically.</p>
      </div>

      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); processFile(e.dataTransfer.files[0]) }}
        animate={{ borderColor: dragActive ? '#8b5cf6' : 'rgba(255,255,255,0.1)', background: dragActive ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)' }}
        className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all"
        onClick={() => document.getElementById('file-input').click()}
      >
        <input id="file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => processFile(e.target.files[0])} />
        <motion.div animate={{ y: dragActive ? -8 : 0 }} transition={{ type: 'spring' }}>
          <Upload className="mx-auto mb-4 text-violet-400" size={48} />
          <p className="text-lg font-bold text-white mb-2">Drop your file here or click to browse</p>
          <p className="text-white/40 text-sm">Supports CSV, XLSX, XLS • Up to 50MB</p>
        </motion.div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Processing State */}
      <AnimatePresence>
        {processing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-6 rounded-2xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-violet-400 font-bold text-sm">🤖 AI Processing...</span>
              <span className="text-white/60 text-sm">{progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" animate={{ width: `${progress}%` }} transition={{ ease: 'easeOut' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      {result && !processing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* File Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'File', value: result.fileName, icon: <FileText size={14} /> },
              { label: 'Total Rows', value: result.total?.toLocaleString() || '—', icon: <CheckCircle size={14} className="text-green-400" /> },
              { label: 'Duplicates Removed', value: result.duplicates, icon: <X size={14} className="text-red-400" /> },
              { label: 'Missing Values', value: result.missing, icon: <AlertCircle size={14} className="text-yellow-400" /> },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-1 text-white/50 text-xs mb-1">{item.icon} {item.label}</div>
                <div className="font-bold text-white text-sm truncate">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Column Mapping */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Eye size={16} className="text-violet-400" /> Column Classification</h3>
            <div className="flex flex-wrap gap-2">
              {result.columnMap?.map(col => (
                <span key={col.column} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: typeColors[col.type] + '20', color: typeColors[col.type], border: `1px solid ${typeColors[col.type]}40` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: typeColors[col.type], display: 'inline-block' }} />
                  {col.column} — {col.type}
                </span>
              ))}
            </div>
          </div>

          {/* Data Preview */}
          <div className="p-5 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-bold text-white mb-3">📋 Data Preview (first 10 rows)</h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr>
                  {result.headers?.map(h => (
                    <th key={h} className="pb-2 pr-4 text-white/50 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.previewRows?.map((row, i) => (
                  <tr key={i} className="border-t border-white/5">
                    {result.headers?.map(h => (
                      <td key={h} className="py-2 pr-4 text-white/70 whitespace-nowrap">{row[h] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
            <CheckCircle size={16} /> Data cleaned and ready for analytics. Navigate to other modules to explore insights.
          </div>
        </motion.div>
      )}
    </div>
  )
}
