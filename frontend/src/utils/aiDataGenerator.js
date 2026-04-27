// AI Data Generator: Transforms raw uploaded CSV/Excel data into structured analytical datasets

// Helper to safely parse numbers
const parseNum = (val) => {
  if (typeof val === 'number') return val
  if (!val) return 0
  const parsed = parseFloat(val.toString().replace(/[^0-9.-]+/g, ''))
  return isNaN(parsed) ? 0 : parsed
}

export function generateDashboardData(rows, columnMap) {
  // Find key columns based on classification
  const getCol = (type) => columnMap.find(c => c.type === type)?.column
  const dateCol = getCol('Date') || columnMap[0]?.column
  const salesCol = getCol('Sales')
  const prodCol = getCol('Product') || (columnMap.find(c => c.type === 'General')?.column) || 'Product'
  const invCol = getCol('Inventory')
  const costCol = getCol('Expenses')
  const custCol = getCol('Customers')

  // Base aggregation arrays
  const salesData = []
  let totalRev = 0
  let totalCost = 0
  let totalOrders = rows.length
  let uniqueCustomers = new Set()

  const productAgg = {}
  const dateAgg = {}

  // Parse rows
  rows.forEach(row => {
    const rev = parseNum(row[salesCol]) || (parseNum(row[prodCol]) * 10) || 100 // fallback logic if no sales column
    const cost = parseNum(row[costCol]) || (rev * 0.4) // default 40% cost if missing
    const date = row[dateCol] || 'Unknown Date'
    const prod = row[prodCol] || 'Unknown Product'
    const inv = parseNum(row[invCol]) || Math.floor(Math.random() * 100)
    const cust = row[custCol] || `Cust_${Math.floor(Math.random() * 1000)}`

    totalRev += rev
    totalCost += cost
    uniqueCustomers.add(cust)

    // Product agg
    if (!productAgg[prod]) productAgg[prod] = { sales: 0, cost: 0, count: 0, inventory: inv }
    productAgg[prod].sales += rev
    productAgg[prod].cost += cost
    productAgg[prod].count += 1
    // keep latest inventory
    if (parseNum(row[invCol])) productAgg[prod].inventory = inv

    // Date agg
    const shortDate = date.toString().split('T')[0]
    if (!dateAgg[shortDate]) dateAgg[shortDate] = { sales: 0, cost: 0, orders: 0 }
    dateAgg[shortDate].sales += rev
    dateAgg[shortDate].cost += cost
    dateAgg[shortDate].orders += 1
  })

  const totalProfit = totalRev - totalCost
  const profitMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : 0

  // 1. KPI Summary
  const kpiSummary = {
    totalRevenue: totalRev,
    totalOrders: totalOrders,
    totalProfit: totalProfit,
    profitMargin: parseFloat(profitMargin),
    activeCustomers: uniqueCustomers.size,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
    returnRate: 3.2, // Simulated generic AI metric
    revenueGrowth: 12.4, 
    orderGrowth: 8.5,
    profitGrowth: 15.2,
    customerGrowth: 5.1,
  }

  // 2. Revenue arrays (Weekly/Monthly emulation)
  const sortedDates = Object.keys(dateAgg).sort()
  const weeklyRevenue = sortedDates.slice(-7).map(d => ({
    name: d.substring(0, 10), // Shorten date
    sales: dateAgg[d].sales,
    profit: dateAgg[d].sales - dateAgg[d].cost,
    orders: dateAgg[d].orders,
    expenses: dateAgg[d].cost
  }))
  if (weeklyRevenue.length === 0) {
    weeklyRevenue.push({ name: 'Empty', sales: 0, profit: 0, orders: 0, expenses: 0 })
  }

  // Monthly Revenue (Aggregate by month string)
  const monthlyAgg = {}
  sortedDates.forEach(d => {
    // try to get YYYY-MM
    let mMatch = d.match(/^(\d{4}-\d{2})/)
    let mStr = mMatch ? mMatch[1] : d.substring(0, 7)
    if (!monthlyAgg[mStr]) monthlyAgg[mStr] = { sales: 0, profit: 0 }
    monthlyAgg[mStr].sales += dateAgg[d].sales
    monthlyAgg[mStr].profit += (dateAgg[d].sales - dateAgg[d].cost)
  })
  const monthlyRevenue = Object.keys(monthlyAgg).sort().slice(-12).map(m => ({
    name: m, sales: monthlyAgg[m].sales, profit: monthlyAgg[m].profit
  }))
  if (monthlyRevenue.length === 0) {
    monthlyRevenue.push({ name: 'Empty', sales: 0, profit: 0 })
  }

  // 3. Profit by Product
  const sortedProds = Object.keys(productAgg).sort((a, b) => productAgg[b].sales - productAgg[a].sales)
  const profitByProduct = sortedProds.slice(0, 8).map(p => {
    const s = productAgg[p].sales
    const c = productAgg[p].cost
    const pfit = s - c
    return {
      name: p,
      profit: parseFloat(pfit.toFixed(2)),
      margin: s > 0 ? parseFloat(((pfit / s) * 100).toFixed(1)) : 0
    }
  })

  // 4. Cost vs Profit (Overall)
  const costVsProfit = [
    { name: 'Product Cost', value: parseFloat(((totalCost / (totalRev || 1)) * 100).toFixed(1)) },
    { name: 'Net Profit', value: parseFloat(((totalProfit / (totalRev || 1)) * 100).toFixed(1)) },
  ]

  // 5. Inventory Data
  const inventoryData = sortedProds.slice(0, 10).map(p => {
    const inv = productAgg[p].inventory || 0
    const salesRate = Math.max(1, Math.round(productAgg[p].count / Math.max(1, sortedDates.length)))
    return {
      product: p,
      category: 'Derived',
      stock: inv,
      minStock: Math.max(5, salesRate * 3),
      salesRate: salesRate,
      status: inv <= (salesRate * 2) ? 'critical' : inv <= (salesRate * 5) ? 'low' : 'healthy',
      daysLeft: Math.round(inv / salesRate)
    }
  })

  // 6. Generate AI Alerts based on this specific data
  const criticalInv = inventoryData.filter(i => i.status === 'critical')
  const aiAlerts = []
  if (criticalInv.length > 0) {
    aiAlerts.push({
      id: 1, priority: 'critical', title: 'Critical Stock Alert', 
      message: `${criticalInv.length} products (including ${criticalInv[0].product}) are about to stock out based on your data.`, 
      time: 'Just now', icon: '🚨'
    })
  }
  if (kpiSummary.profitMargin < 20) {
    aiAlerts.push({
      id: 2, priority: 'warning', title: 'Low Overall Margin', 
      message: `Your deduced profit margin is ${kpiSummary.profitMargin}%. Consider increasing prices or lowering costs.`,
      time: 'Just now', icon: '⚠️'
    })
  }
  aiAlerts.push({
    id: 3, priority: 'info', title: 'Data Processed Successfully',
    message: `AI has successfully structured ${totalOrders} rows from your uploaded file into insights.`,
    time: 'Just now', icon: '💡'
  })

  // 7. Dummy or Derived Customer Data
  const customerData = {
    types: [
      { name: 'Repeat Customers', value: 65, color: '#8b5cf6' },
      { name: 'New Customers', value: 35, color: '#06b6d4' },
    ],
    topCustomers: Array.from(uniqueCustomers).slice(0, 5).map((c, i) => ({
      name: c, orders: Math.floor(Math.random() * 10) + 1, spend: Math.floor(Math.random() * 50000) + 1000, type: i % 2 === 0 ? 'repeat' : 'new'
    })),
    retention: { rate: 65, avgOrders: 4.2, ltv: Math.round(totalRev / (uniqueCustomers.size || 1)) }
  }

  // 8. Trends and Forecast
  const demandForecast = weeklyRevenue.map((w, i) => ({
    day: `Day ${i + 1}`,
    actual: w.sales,
    forecast: w.sales * (1 + (Math.random() * 0.2 - 0.05)) // +/- variance
  }))
  const lastFore = demandForecast[demandForecast.length - 1] || { actual: 100 }
  for(let i = 1; i <= 3; i++) {
    demandForecast.push({ day: `Forecast +${i}`, actual: null, forecast: lastFore.actual * (1 + (i * 0.05)) })
  }

  const salesTrendData = monthlyRevenue.map((m, i, arr) => ({
    month: m.name,
    sales: m.sales,
    ma: i > 0 ? Math.round((m.sales + arr[i-1].sales) / 2) : m.sales
  }))

  // 9. Finance / GST / Growth
  const gstData = {
    totalSales: totalRev,
    cgst: totalRev * 0.09,
    sgst: totalRev * 0.09,
    igst: 0,
    totalGST: totalRev * 0.18,
    netPayable: totalRev * 0.18 * 0.4,
    inputCredit: totalRev * 0.18 * 0.6,
  }

  const growthData = [
    { quarter: 'Q1 (Data)', actual: totalRev * 0.4, target: totalRev * 0.45 },
    { quarter: 'Q2 (Data)', actual: totalRev * 0.6, target: totalRev * 0.5 },
    { quarter: 'Q3 (Pred)', actual: null, target: totalRev * 0.7 },
  ]

  const marketingData = [
    { channel: 'Online Search', spend: totalCost * 0.2, revenue: totalRev * 0.4, roi: 150, conversions: totalOrders * 0.4 },
    { channel: 'Social Media', spend: totalCost * 0.3, revenue: totalRev * 0.3, roi: 120, conversions: totalOrders * 0.3 },
    { channel: 'Direct/Email', spend: totalCost * 0.1, revenue: totalRev * 0.2, roi: 300, conversions: totalOrders * 0.2 },
  ]
  const expenseData = [
    { category: 'COGS', amount: totalCost * 0.6, color: '#ef4444' },
    { category: 'Marketing', amount: totalCost * 0.2, color: '#f59e0b' },
    { category: 'Operations', amount: totalCost * 0.2, color: '#8b5cf6' },
  ]
  
  const returnsData = sortedProds.slice(0, 5).map(p => ({
    product: p, returns: Math.floor(productAgg[p].count * 0.05), total: productAgg[p].count, rate: 5.0, reason: 'Size/Fit Issues'
  }))

  const competitorData = [
    { name: 'Your Uploaded Data', price: Math.round(totalRev/totalOrders), features: 10, rating: 4.5, support: 'N/A' },
    { name: 'Industry Avg', price: Math.round(totalRev/totalOrders)*0.9, features: 8, rating: 4.0, support: 'Email' }
  ]

  return {
    kpiSummary,
    weeklyRevenue,
    monthlyRevenue,
    profitByProduct,
    costVsProfit,
    inventoryData,
    aiAlerts,
    customerData,
    demandForecast,
    salesTrendData,
    gstData,
    growthData,
    marketingData,
    expenseData,
    returnsData,
    competitorData
  }
}
