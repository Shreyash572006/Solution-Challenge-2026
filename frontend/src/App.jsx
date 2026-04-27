import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ParticleCanvas from './components/ParticleCanvas'
import MouseGlow from './components/MouseGlow'
import { DataProvider } from './context/DataContext'
import './index.css'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } }
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div {...pageVariants}><Landing /></motion.div>} />
        <Route path="/login" element={<motion.div {...pageVariants}><Login /></motion.div>} />
        <Route path="/signup" element={<motion.div {...pageVariants}><Signup /></motion.div>} />
        <Route path="/dashboard" element={<motion.div {...pageVariants}><Dashboard /></motion.div>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <DataProvider>
      <Router basename="/Solution-Challenge-2026/">
        <div className="relative min-h-screen bg-[#030712] text-white overflow-x-hidden">
          <ParticleCanvas />
          <MouseGlow />
          <AnimatedRoutes />
        </div>
      </Router>
    </DataProvider>
  )
}
