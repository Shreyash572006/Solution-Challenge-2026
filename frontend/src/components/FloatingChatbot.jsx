import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function FloatingChatbot() {
  const { appData } = useData()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your Vendrixa AI assistant. How can I help you analyze your data or market trends today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, isTyping])

  const generateIntelligentResponse = (query) => {
    const lower = query.toLowerCase()
    
    // 1. Conversational Pleasantries & Short Responses
    if (/^(hi|hello|hey|greetings)/.test(lower)) return "Hello! I'm your Vendrixa AI. You can ask me to analyze your sales, check inventory, predict revenue, or review your GST data."
    if (/^(thanks|thank you|thx)/.test(lower)) return "You're very welcome! Let me know if you need any other business insights."
    if (/^(yes|yeah|sure|yep|ok|okay)/.test(lower)) return "Great! How can I assist you further? You can ask for a quick summary of your KPIs or latest AI alerts."
    if (/^(no|nah|nope)/.test(lower)) return "Alright. I'll be right here if you need me!"
    if (/(how are you|how do you do)/.test(lower)) return "I'm functioning optimally! Ready to help you grow your business."
    if (/(who are you|what are you)/.test(lower)) return "I am the Vendrixa AI Analyst, a dedicated intelligence engine designed to help you make data-driven decisions."

    // 2. Require Data for Business Queries
    if (!appData) return "It looks like you haven't uploaded any business data yet. Please upload your CSV or Excel file so I can provide customized insights!"

    // 3. Extract Intents via Regex
    const isSales = /(sale|revenue|profit|income|earn|sold|money|kpi|performance)/.test(lower)
    const isInventory = /(inventory|stock|shortage|product|item|qty|quantity)/.test(lower)
    const isCompetitor = /(competitor|market|compare|other sellers)/.test(lower)
    const isPrediction = /(predict|forecast|future|target|q2|trend|growth)/.test(lower)
    const isReturn = /(return|refund|defective)/.test(lower)
    const isGst = /(gst|tax|cgst|sgst|payable)/.test(lower)
    const isAlert = /(alert|warning|problem|issue)/.test(lower)

    const alerts = appData.aiAlerts || []

    // 4. Generate Contextual Business Insights
    if (isSales && isPrediction) {
      return `Based on current trends, your Q2 revenue target is projected at ₹3.6Cr. Your YoY growth is currently +18.4%. Keep up the momentum!`
    }
    
    if (isSales) {
      return `Your total taxable sales this month are ₹${appData.gstData?.totalSales?.toLocaleString('en-IN') || '...'} and your net profit margin is looking strong. You collected ₹${appData.gstData?.totalGST?.toLocaleString('en-IN')} in GST.`
    }

    if (isInventory) {
      const criticalStocks = alerts.filter(a => a.priority === 'critical' && a.title.toLowerCase().includes('stock'))
      if (criticalStocks.length > 0) {
         return `🚨 Inventory Alert: ${criticalStocks[0].message}. Please reorder immediately to avoid lost sales.`
      }
      return `Your inventory is mostly stable, but you have 2 products (Sony Headphones, JBL Speaker) running critically low on stock.`
    }

    if (isGst) {
      return `Your net GST payable this month is ₹${appData.gstData?.netPayable?.toLocaleString('en-IN')}. You've claimed ₹${appData.gstData?.inputCredit?.toLocaleString('en-IN')} in Input Tax Credit.`
    }

    if (isCompetitor) {
      const topCompetitor = appData.competitorData?.[1]?.name || 'average competitors'
      return `Market Analysis: Vendrixa IQ leads the segment with a 4.8 user rating, compared to ${topCompetitor}'s lower rating. You offer more AI features at a highly competitive price point.`
    }

    if (isReturn) {
      const returnAlerts = alerts.filter(a => a.title.toLowerCase().includes('return'))
      if (returnAlerts.length > 0) {
         return `⚠️ Returns Warning: ${returnAlerts[0].message}`
      }
      return `Your overall return rate is around 3.2%, but Samsung Galaxy Watches are seeing a much higher 20% return rate.`
    }

    if (isAlert) {
      const criticalCount = alerts.filter(a => a.priority === 'critical').length
      return `You currently have ${criticalCount} critical alert(s). The top issue is a "Critical Stock Shortage" for 2 products which could cost you ₹82,000 in lost sales.`
    }

    // 5. Smart Fallback
    return `I see you're asking about "${query}". I analyzed your dashboard and noticed you have ${alerts.filter(a => a.priority === 'critical').length} critical alerts requiring attention. Let me know if you want a breakdown of your alerts or a specific KPI!`
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setInput('')
    setIsTyping(true)
    
    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = generateIntelligentResponse(userMessage)
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mb-4 w-[340px] sm:w-[380px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-violet-600/80 to-blue-600/80 border-b border-white/10 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-violet-500/30">
                    <Bot size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0f172a]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px] leading-tight">Vendrixa AI Analyst</h3>
                  <p className="text-[11px] text-white/80 flex items-center gap-1 font-medium mt-0.5"><Sparkles size={10} className="text-yellow-400" /> Always Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide bg-[#030712]/50">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm' : 'bg-white/10 text-white/95 rounded-bl-sm border border-white/5 backdrop-blur-md'}`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-end gap-2 max-w-[85%] flex-row">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                      <Bot size={14} />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 text-white/95 rounded-bl-sm border border-white/5 flex items-center gap-1.5 backdrop-blur-md">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-[#0f172a]">
              <div className="flex items-center gap-2 relative bg-white/5 rounded-full p-1 border border-white/10 hover:border-violet-500/30 transition-colors focus-within:border-violet-500/50 focus-within:bg-white/10 shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for predictions, data insights..."
                  className="w-full bg-transparent py-2 pl-4 pr-12 text-[14px] text-white placeholder-white/30 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-1.5 p-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-center mt-2">
                 <p className="text-[10px] text-white/30">AI can make mistakes. Verify important business data.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(139,92,246,0.6)] border border-white/20 relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={26} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageCircle size={26} />
              {/* Notification Dot */}
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-transparent animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
