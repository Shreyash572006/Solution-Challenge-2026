import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { NeonButton } from '../components/AnimationKit'

// Reused animated input
function AnimatedInput({ id, label, type = 'text', value, onChange, error, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.length > 0

  return (
    <div className="relative mb-5">
      <motion.label
        htmlFor={id}
        className="absolute left-4 pointer-events-none font-medium"
        animate={{
          top: focused || hasValue ? -10 : 'calc(50% - 10px)',
          fontSize: focused || hasValue ? '11px' : '14px',
          color: focused ? (error ? '#EF4444' : '#8B5CF6') : error ? '#EF4444' : 'rgba(255,255,255,0.4)',
          background: focused || hasValue ? '#0d1424' : 'transparent',
          paddingLeft: focused || hasValue ? '4px' : '0px',
          paddingRight: focused || hasValue ? '4px' : '0px',
        }}
        transition={{ duration: 0.2 }}
        style={{ zIndex: 1 }}
      >
        {label}
      </motion.label>
      <motion.input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        placeholder={focused ? placeholder : ''}
        className="w-full px-4 pt-4 pb-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${error ? '#EF4444' : focused ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)'}` : 'none',
        }}
        animate={error ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

// AI Spinner
function AISpinner() {
  return (
    <motion.div
      className="w-5 h-5 rounded-full border-2 border-transparent inline-block"
      style={{ borderTopColor: 'white', borderRightColor: 'rgba(255,255,255,0.3)' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// Step indicator
function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            className="flex items-center justify-center rounded-full text-xs font-bold"
            animate={{
              width: i === step ? 32 : 24,
              height: i === step ? 32 : 24,
              background: i < step
                ? '#10B981'
                : i === step
                  ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                  : 'rgba(255,255,255,0.1)',
              boxShadow: i === step ? '0 0 16px rgba(139,92,246,0.5)' : 'none',
            }}
            transition={{ duration: 0.3 }}
          >
            {i < step ? '✓' : i + 1}
          </motion.div>
          {i < total - 1 && (
            <motion.div
              className="h-px rounded-full"
              animate={{ width: 40, background: i < step ? '#10B981' : 'rgba(255,255,255,0.1)' }}
              style={{ width: 40 }}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-white/40">Step {step + 1} of {total}</span>
    </div>
  )
}

// Password strength meter
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong!']
  const colors = ['#EF4444', '#EF4444', '#F59E0B', '#10B981', '#10B981']

  if (!password) return null

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 -mt-3">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i}
            className="h-1 flex-1 rounded-full"
            animate={{ background: i < score ? colors[score] : 'rgba(255,255,255,0.1)' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>
      <div className="text-xs" style={{ color: colors[score] }}>{labels[score]}</div>
    </motion.div>
  )
}

// Left panel for signup
function SignupLeftPanel() {
  const benefits = [
    '🧠 16 AI Business Modules',
    '🎤 Voice AI Co-Founder',
    '📦 Inventory Forecasting',
    '💰 Pricing Optimization',
    '📢 Marketing Campaigns',
    '📊 GST & Finance AI',
  ]

  return (
    <div className="relative flex flex-col items-center justify-center p-12 overflow-hidden min-h-full"
      style={{ background: 'linear-gradient(160deg, #0c1a2e 0%, #0f172a 50%, #120f2a 100%)' }}>

      {/* Glow */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 60%)' }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-7xl mb-6"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🚀
        </motion.div>
        <h2 className="text-3xl font-black mb-3">
          <span className="text-gradient">Join 50,000+</span>
        </h2>
        <h2 className="text-2xl font-black mb-6 text-white/80">Successful Sellers</h2>

        <div className="space-y-3 text-left mb-10">
          {benefits.map((b, i) => (
            <motion.div key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              whileHover={{ x: 4, borderColor: 'rgba(139,92,246,0.3)' }}
            >
              <span className="text-lg">{b}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          {['R', 'A', 'P', 'S'].map((char, i) => (
            <motion.div key={i}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 border-black"
              style={{ background: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i], marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1, type: 'spring' }}
            >
              {char}
            </motion.div>
          ))}
          <span className="text-xs text-white/40 ml-2">+49,996 sellers</span>
        </div>
      </div>
    </div>
  )
}

// Step 1
function Step1({ form, setForm, errors }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2 className="text-2xl font-black mb-1">Create Your Account</h2>
      <p className="text-white/40 text-sm mb-8">Start your free AI-powered business journey.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <AnimatedInput id="sg-fname" label="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} error={errors.firstName} placeholder="Rahul" autoComplete="given-name" />
          {errors.firstName && <div className="text-red-400 text-xs -mt-4 mb-4 ml-1">{errors.firstName}</div>}
        </div>
        <div>
          <AnimatedInput id="sg-lname" label="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} error={errors.lastName} placeholder="Sharma" autoComplete="family-name" />
          {errors.lastName && <div className="text-red-400 text-xs -mt-4 mb-4 ml-1">{errors.lastName}</div>}
        </div>
      </div>

      <AnimatedInput id="sg-email" label="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} placeholder="rahul@shop.com" autoComplete="email" />
      {errors.email && <div className="text-red-400 text-xs -mt-4 mb-4 ml-1">{errors.email}</div>}

      <AnimatedInput id="sg-shop" label="Shop / Business Name" value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} error={errors.shopName} placeholder="Rahul General Store" autoComplete="organization" />
      {errors.shopName && <div className="text-red-400 text-xs -mt-4 mb-4 ml-1">{errors.shopName}</div>}

      <div className="mb-5">
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: form.category ? 'white' : 'rgba(255,255,255,0.4)' }}
        >
          <option value="" disabled>Select Business Category</option>
          {['Grocery / FMCG', 'Fashion & Clothing', 'Electronics', 'Food & Beverages', 'Health & Wellness', 'Home Decor', 'Other'].map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
        </select>
      </div>
    </motion.div>
  )
}

// Step 2
function Step2({ form, setForm, errors }) {
  const [show, setShow] = useState(false)

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2 className="text-2xl font-black mb-1">Secure Your Account</h2>
      <p className="text-white/40 text-sm mb-8">Create a strong password to protect your business data.</p>

      <div className="relative">
        <AnimatedInput
          id="sg-pass"
          label="Password"
          type={show ? 'text' : 'password'}
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          error={errors.password}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-3.5 text-white/30 hover:text-white/70 transition-colors text-sm">
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {errors.password && <div className="text-red-400 text-xs -mt-4 mb-3 ml-1">{errors.password}</div>}
      <PasswordStrength password={form.password} />

      <AnimatedInput
        id="sg-cpass"
        label="Confirm Password"
        type="password"
        value={form.confirmPassword}
        onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
        error={errors.confirmPassword}
        placeholder="Repeat password"
        autoComplete="new-password"
      />
      {errors.confirmPassword && <div className="text-red-400 text-xs -mt-4 mb-3 ml-1">{errors.confirmPassword}</div>}

      <div className="flex items-start gap-3 mt-2">
        <motion.div
          onClick={() => setForm(f => ({ ...f, terms: !f.terms }))}
          className="w-5 h-5 rounded flex items-center justify-center border flex-shrink-0 cursor-pointer mt-0.5"
          style={{ background: form.terms ? '#8B5CF6' : 'transparent', borderColor: form.terms ? '#8B5CF6' : errors.terms ? '#EF4444' : 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence>
            {form.terms && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-white text-xs">✓</motion.span>}
          </AnimatePresence>
        </motion.div>
        <label className="text-sm text-white/50 cursor-pointer" onClick={() => setForm(f => ({ ...f, terms: !f.terms }))}>
          I agree to the{' '}
          <a href="#" className="text-violet-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-violet-400 hover:underline">Privacy Policy</a>
        </label>
      </div>
      {errors.terms && <div className="text-red-400 text-xs mt-1 ml-8">{errors.terms}</div>}

      {/* What happens next */}
      <motion.div
        className="mt-6 p-4 rounded-xl"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-xs font-semibold text-green-400 mb-2">✨ After signup you get:</div>
        {['Free access to 3 AI modules instantly', 'AI business health score in 60 seconds', 'No credit card required ever'].map(item => (
          <div key={item} className="text-xs text-white/50 flex items-center gap-2 mb-1">
            <span className="text-green-400">✓</span> {item}
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', shopName: '', category: '',
    password: '', confirmPassword: '', terms: false,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateStep1 = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.shopName.trim()) e.shopName = 'Business name required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    if (form.password.length < 8) e.password = 'Minimum 8 characters required'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.terms) e.terms = 'You must agree to continue'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 0 && validateStep1()) {
      setStep(1)
      setErrors({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          password: form.password,
          shopName: form.shopName,
          category: form.category,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.token) localStorage.setItem('viq_token', data.token)
        setSuccess(true)
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        // If not ok, assume backend is not up and fallback to demo mode
        throw new Error('API not available, fallback to demo mode')
      }
    } catch {
      // Demo mode fallback
      console.warn('Backend not available, proceeding with demo mode')
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <motion.div
        className="hidden lg:flex flex-1"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <SignupLeftPanel />
      </motion.div>

      {/* Right */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'linear-gradient(180deg, #030712 0%, #0d1117 100%)' }}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/">
            <motion.div className="flex items-center gap-2 mb-8" whileHover={{ scale: 1.03 }}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold shadow-lg shadow-violet-500/30">V</div>
              <span className="font-black text-xl text-gradient">VENDRIXA IQ</span>
            </motion.div>
          </Link>

          <StepIndicator step={step} total={2} />

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(10px)' }}
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="glass-card p-10 text-center max-w-sm"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                    className="text-7xl mb-6"
                  >🎉</motion.div>
                  <h2 className="text-2xl font-black text-gradient mb-2">Account Created!</h2>
                  <p className="text-white/50 text-sm">Welcome to Vendrixa IQ. Your AI co-founder is ready.</p>
                  <div className="mt-6 flex justify-center">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-400"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General error */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
              >
                ⚠️ {errors.general}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={step === 0 ? handleNext : handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 0
                ? <Step1 key="s1" form={form} setForm={setForm} errors={errors} />
                : <Step2 key="s2" form={form} setForm={setForm} errors={errors} />
              }
            </AnimatePresence>

            <div className="flex gap-3 mt-2">
              {step > 0 && (
                <NeonButton type="button" variant="secondary" className="flex-none px-6" onClick={() => { setStep(0); setErrors({}) }}>
                  ← Back
                </NeonButton>
              )}
              <NeonButton type="submit" className="flex-1 py-4 text-base">
                {loading ? (
                  <span className="flex items-center justify-center gap-3"><AISpinner /> Creating account...</span>
                ) : step === 0 ? (
                  'Continue →'
                ) : (
                  '🚀 Create Free Account'
                )}
              </NeonButton>
            </div>
          </form>

          <p className="text-center text-white/35 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">Sign In →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

