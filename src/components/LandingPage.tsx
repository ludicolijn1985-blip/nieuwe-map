import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowRight, Star, Shield, Globe, Smartphone,
  Code2, Rocket, BarChart3, CheckCircle2, ChevronDown, Users,
  Download, Sparkles, Award, Play,
  Sun, Moon, Menu, X, Check, CreditCard, Bot
} from 'lucide-react';

interface LandingPageProps {
  onStartBuilder: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartBuilder, theme, onToggleTheme }) => {
  const [lang, setLang] = useState<'nl' | 'en'>('nl');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingAnnual, setBillingAnnual] = useState(true);
  const [trialStarted, setTrialStarted] = useState(false);
  const [showTrialToast, setShowTrialToast] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const t = lang === 'nl' ? nl : en;

  // Auto-rotate testimonials
  useEffect(() => {
    const iv = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(iv);
  }, []);

  const startTrial = () => {
    setTrialStarted(true);
    setShowTrialToast(true);
    setTimeout(() => setShowTrialToast(false), 4000);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-hero">
                ForgeLocal <span className="gradient-text">AI</span>
              </h1>
              <p className="text-[9px] text-dim -mt-0.5 hidden sm:block">Autonomous App Builder</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: t.navFeatures, id: 'features' },
              { label: t.navHowItWorks, id: 'how-it-works' },
              { label: t.navPricing, id: 'pricing' },
              { label: 'FAQ', id: 'faq' },
            ].map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="text-sm text-sub hover:text-hero transition-colors cursor-pointer">
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <button onClick={() => setLang(l => l === 'nl' ? 'en' : 'nl')} className="text-xs text-dim hover:text-sub transition-colors cursor-pointer px-2 py-1 rounded-lg">
              {lang === 'nl' ? '🇬🇧 EN' : '🇳🇱 NL'}
            </button>
            {/* Theme toggle */}
            <button onClick={onToggleTheme} className="w-9 h-9 rounded-xl card-surface flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-500" />}
            </button>
            {/* CTA */}
            <button onClick={onStartBuilder} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer">
              {t.navCta}
              <ArrowRight size={14} />
            </button>
            {/* Mobile menu */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-9 h-9 rounded-xl card-surface flex items-center justify-center cursor-pointer">
              {mobileMenuOpen ? <X size={16} className="text-sub" /> : <Menu size={16} className="text-sub" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-soft overflow-hidden">
              <div className="px-4 py-4 space-y-2">
                {['features', 'how-it-works', 'pricing', 'faq'].map(id => (
                  <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left px-4 py-2.5 rounded-xl text-sub hover:text-hero hover:bg-white/5 transition-all text-sm cursor-pointer capitalize">
                    {id.replace('-', ' ')}
                  </button>
                ))}
                <button onClick={() => { setMobileMenuOpen(false); onStartBuilder(); }} className="w-full mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold cursor-pointer">
                  🚀 {t.navCta}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-32 overflow-hidden">
        <div className="hero-orb-1" /><div className="hero-orb-2" /><div className="hero-orb-3" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium mb-6"
              >
                <Bot size={14} />
                {t.heroBadge}
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-hero mb-6"
              >
                {t.heroTitle1}
                <br />
                <span className="gradient-text">{t.heroTitle2}</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-sub leading-relaxed mb-8 max-w-xl"
              >
                {t.heroSubtitle}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-4 mb-10">
                <button onClick={onStartBuilder}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base hover:shadow-xl hover:shadow-green-500/30 transition-all cursor-pointer pulse-glow flex items-center gap-3"
                >
                  <Rocket size={20} />
                  {t.heroCta}
                  <ArrowRight size={18} />
                </button>
                <button onClick={() => scrollTo('how-it-works')}
                  className="px-6 py-4 rounded-2xl card-surface text-sub font-semibold text-sm hover:text-hero transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play size={16} className="text-green-500" />
                  {t.heroSecondary}
                </button>
              </motion.div>

              {/* Trust stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-8">
                {[
                  { value: '2,847+', label: t.statApps },
                  { value: '4.9 ★', label: t.statRating },
                  { value: '340+', label: t.statCities },
                  { value: '<5 min', label: t.statTime },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-xl font-black text-hero">{stat.value}</p>
                    <p className="text-xs text-dim">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Phone */}
            <motion.div initial={{ opacity: 0, x: 40, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
              className="relative flex justify-center"
            >
              <div className="float-slow">
                <div className="phone-frame w-[260px] h-[520px] relative">
                  <div className="phone-screen w-full h-full bg-[#0a0a0f]">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[9px] text-white/50">
                      <span className="font-semibold">9:41</span>
                      <div className="flex items-center gap-1.5 opacity-50">●●●</div>
                    </div>
                    {/* Notch */}
                    <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[80px] h-[24px] bg-black rounded-b-2xl z-20" />
                    {/* Screen content */}
                    <div className="px-4 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[9px] text-white/30">Welcome to</p>
                          <p className="text-white font-bold text-sm">Café De Hoek ☕</p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Users size={11} className="text-green-400" />
                        </div>
                      </div>
                      <div className="rounded-xl p-3 mb-3" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <p className="text-white text-[10px] font-semibold mb-0.5">☕ Dagspecial</p>
                        <p className="text-white/40 text-[8px]">Artisan Latte — €4.50</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1,2,3,4,5].map(i => <Star key={i} size={7} fill="#22c55e" stroke="#22c55e" />)}
                          <span className="text-[7px] text-white/30 ml-1">4.9</span>
                        </div>
                      </div>
                      <p className="text-[8px] text-white/25 mb-1.5 font-medium uppercase tracking-wider">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['☕ Menu', '📅 Reserveer', '🎁 Rewards', '📍 Locatie'].map(item => (
                          <div key={item} className="rounded-lg p-2 text-[8px] text-white/60 font-medium" style={{ background: '#14141f', border: '1px solid rgba(42,42,61,0.3)' }}>
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-lg p-2 flex items-center gap-2" style={{ background: '#14141f', border: '1px solid rgba(42,42,61,0.3)' }}>
                        <span className="text-[10px]">🏆</span>
                        <div>
                          <p className="text-[8px] text-white/60 font-medium">2,450 punten</p>
                          <p className="text-[6px] text-white/25">Premium lid</p>
                        </div>
                      </div>
                    </div>
                    {/* Bottom nav */}
                    <div className="absolute bottom-2 left-3 right-3 flex justify-around py-2 rounded-2xl" style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {['🏠', '🔍', '❤️', '👤'].map((e, i) => (
                        <span key={i} className={`text-xs ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -right-10 w-72 h-72 rounded-full bg-green-500/5 blur-[80px]" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-60 h-60 rounded-full bg-cyan-500/5 blur-[60px]" />
            </motion.div>
          </div>
        </div>

        {/* Logos marquee */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-16 sm:mt-24 border-y border-soft py-6 overflow-hidden"
        >
          <p className="text-center text-[10px] text-dim uppercase tracking-widest mb-4">{t.trustedBy}</p>
          <div className="flex overflow-hidden">
            <div className="flex gap-12 items-center marquee-track whitespace-nowrap px-6">
              {[...clientLogos, ...clientLogos].map((logo, i) => (
                <span key={i} className="text-dim text-sm font-semibold opacity-40 hover:opacity-70 transition-opacity">{logo}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 sm:py-28 section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader badge={t.featuresBadge} title={t.featuresTitle} subtitle={t.featuresSubtitle} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14 stagger-children">
            {features(t).map((f, i) => (
              <div key={i} className="card-surface rounded-2xl p-6 group pricing-card cursor-default">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${f.bg} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-hero font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sub text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader badge={t.howBadge} title={t.howTitle} subtitle={t.howSubtitle} />

          <div className="grid md:grid-cols-3 gap-8 mt-14 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-14 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-purple-500/20" />

            {steps(t).map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center relative z-10 ${step.bg}`}>
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold -mt-2 z-20">
                  {i + 1}
                </div>
                <h3 className="text-hero font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sub text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mt-14"
          >
            <button onClick={onStartBuilder} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base hover:shadow-xl hover:shadow-green-500/30 transition-all cursor-pointer flex items-center gap-3 mx-auto">
              <Rocket size={20} />
              {t.howCta}
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 sm:py-28 section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader badge={t.pricingBadge} title={t.pricingTitle} subtitle={t.pricingSubtitle} />

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-10 mb-12">
            <span className={`text-sm font-medium ${!billingAnnual ? 'text-hero' : 'text-dim'}`}>{t.monthly}</span>
            <button onClick={() => setBillingAnnual(!billingAnnual)} className={`w-14 h-7 rounded-full p-1 transition-colors cursor-pointer ${billingAnnual ? 'bg-green-500' : 'bg-white/10'}`}>
              <motion.div animate={{ x: billingAnnual ? 26 : 0 }} className="w-5 h-5 rounded-full bg-white shadow-lg" />
            </button>
            <span className={`text-sm font-medium ${billingAnnual ? 'text-hero' : 'text-dim'}`}>
              {t.annual} <span className="text-green-500 text-xs font-bold ml-1">-20%</span>
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers(t, billingAnnual).map((tier, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`rounded-3xl p-7 pricing-card relative ${tier.popular ? 'pricing-popular' : 'card-surface'}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-green-500/25">
                    ⭐ {t.mostPopular}
                  </div>
                )}
                <p className="text-dim text-xs font-semibold uppercase tracking-wider mb-2">{tier.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-hero">{tier.price}</span>
                  {tier.period && <span className="text-sub text-sm">/{tier.period}</span>}
                </div>
                <p className="text-sub text-sm mb-6">{tier.desc}</p>
                <button onClick={tier.price === '€0' ? onStartBuilder : startTrial}
                  className={`w-full py-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25'
                      : 'card-surface text-hero hover:border-green-500/30'
                  }`}
                >
                  {tier.cta}
                </button>
                <div className="mt-6 space-y-3">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sub text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-dim text-xs mt-8">{t.pricingNote}</p>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader badge={t.testimonialsBadge} title={t.testimonialsTitle} subtitle={t.testimonialsSubtitle} />

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`card-surface rounded-2xl p-6 testimonial-card ${activeTestimonial === i ? 'ring-1 ring-green-500/20' : ''}`}
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#22c55e" stroke="#22c55e" />)}
                </div>
                <p className="text-sub text-sm leading-relaxed italic mb-4">"{item.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: item.color }}>
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-hero text-sm font-semibold">{item.name}</p>
                    <p className="text-dim text-xs">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 sm:py-28 section-alt">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionHeader badge="FAQ" title={t.faqTitle} subtitle={t.faqSubtitle} />

          <div className="mt-14 space-y-3">
            {faqItems(t).map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="faq-card rounded-2xl overflow-hidden"
              >
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer group"
                >
                  <span className="text-hero font-semibold text-sm pr-4">{item.q}</span>
                  <motion.div animate={{ rotate: activeFaq === i ? 180 : 0 }} className="flex-shrink-0">
                    <ChevronDown size={16} className="text-dim group-hover:text-sub transition-colors" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-5 pb-5 text-sub text-sm leading-relaxed border-t border-soft pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="hero-orb-1" /><div className="hero-orb-2" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium mb-6">
              <Sparkles size={14} />
              {t.ctaBadge}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-hero leading-tight mb-6">
              {t.ctaTitle1}
              <br />
              <span className="gradient-text">{t.ctaTitle2}</span>
            </h2>
            <p className="text-sub text-lg mb-8 max-w-xl mx-auto">{t.ctaSubtitle}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={onStartBuilder}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base hover:shadow-xl hover:shadow-green-500/30 transition-all cursor-pointer pulse-glow flex items-center gap-3"
              >
                <Rocket size={20} />
                {t.ctaButton}
                <ArrowRight size={18} />
              </button>
              {!trialStarted && (
                <button onClick={startTrial}
                  className="px-6 py-4 rounded-2xl card-surface text-sub font-semibold text-sm hover:text-hero transition-all cursor-pointer flex items-center gap-2"
                >
                  <CreditCard size={16} className="text-green-500" />
                  {t.ctaTrial}
                </button>
              )}
              {trialStarted && (
                <div className="px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {t.trialActive}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="font-bold text-white">ForgeLocal AI</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">{t.footerDesc}</p>
            </div>
            {/* Links */}
            <div>
              <p className="text-white/60 font-semibold text-sm mb-4">{t.footerProduct}</p>
              <div className="space-y-2">
                {[t.navFeatures, t.navHowItWorks, t.navPricing, 'API Docs'].map(l => (
                  <p key={l} className="text-white/30 text-sm hover:text-white/60 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/60 font-semibold text-sm mb-4">{t.footerCompany}</p>
              <div className="space-y-2">
                {[t.footerAbout, t.footerBlog, t.footerCareers, t.footerContact].map(l => (
                  <p key={l} className="text-white/30 text-sm hover:text-white/60 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/60 font-semibold text-sm mb-4">{t.footerLegal}</p>
              <div className="space-y-2">
                {[t.footerPrivacy, t.footerTerms, 'GDPR', 'Cookie Policy'].map(l => (
                  <p key={l} className="text-white/30 text-sm hover:text-white/60 cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-white/25 text-xs">© {new Date().getFullYear()} ForgeLocal AI — All rights reserved</p>
            <div className="flex items-center gap-4">
              <span className="text-white/20 text-xs flex items-center gap-1"><Shield size={10} /> SSL</span>
              <span className="text-white/20 text-xs flex items-center gap-1"><Globe size={10} /> GDPR</span>
              <span className="text-white/20 text-xs flex items-center gap-1"><Award size={10} /> SOC 2</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Trial Toast */}
      <AnimatePresence>
        {showTrialToast && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 px-6 py-4 rounded-2xl bg-green-500 text-white font-bold text-sm shadow-2xl shadow-green-500/30 flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            {t.trialToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============= Section Header =============
const SectionHeader: React.FC<{ badge: string; title: string; subtitle: string }> = ({ badge, title, subtitle }) => (
  <div className="text-center">
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium mb-4">
      {badge}
    </span>
    <h2 className="text-3xl sm:text-4xl font-black text-hero leading-tight mb-3">{title}</h2>
    <p className="text-sub text-base max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

// ============= DATA =============
const clientLogos = [
  'Café De Hoek', 'Kapsalon Fresh', 'FitZone Gym', 'Bakkerij Brood & Co', 'Restaurant Marco',
  'Bloemist Rosalie', 'Barbershop Kings', 'Yoga Studio Zen', 'Tandarts Smile', 'AutoWas Pro',
  'Pet Palace', 'Hotel Centrum', 'Sushi Express', 'IJssalon Gelato', 'Wijnbar Noble'
];

const testimonials = [
  { name: 'Marco de Jong', initials: 'MJ', role: 'Ristorante Marco — Amsterdam', quote: 'Binnen 4 minuten had ik een complete app. Onze reserveringen zijn met 40% gestegen in de eerste maand.', color: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { name: 'Sarah van Dijk', initials: 'SD', role: 'Kapsalon Fresh — Rotterdam', quote: 'Mijn klanten boeken nu allemaal via de app. Geen no-shows meer! De AI begreep precies wat ik nodig had.', color: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
  { name: 'Bram Willems', initials: 'BW', role: 'FitZone Gym — Utrecht', quote: 'De loyalty rewards feature is geweldig. Leden zijn veel actiever geworden. ROI in 2 weken terugverdiend.', color: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { name: 'Lisa Bakker', initials: 'LB', role: 'Bakkerij Brood & Co — Den Haag', quote: 'Eerst dacht ik: te mooi om waar te zijn. Maar de app werkt perfect en onze bestellingen zijn verdubbeld.', color: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
  { name: 'Ahmed El Amrani', initials: 'AE', role: 'Sushi Express — Eindhoven', quote: 'Push notificaties voor dagspecials werken fantastisch. 35% meer bestellingen op rustige dagen.', color: 'linear-gradient(135deg, #f97316, #eab308)' },
  { name: 'Emma Jansen', initials: 'EJ', role: 'Yoga Studio Zen — Groningen', quote: 'De Flutter code was productiekwaliteit. Mijn developer was verbaasd. Direct naar de Play Store gegaan.', color: 'linear-gradient(135deg, #a855f7, #6366f1)' },
];

const features = (t: typeof nl) => [
  { icon: <Bot size={22} className="text-green-400" />, title: t.f1Title, desc: t.f1Desc, bg: 'bg-green-500/10' },
  { icon: <Smartphone size={22} className="text-cyan-400" />, title: t.f2Title, desc: t.f2Desc, bg: 'bg-cyan-500/10' },
  { icon: <Code2 size={22} className="text-purple-400" />, title: t.f3Title, desc: t.f3Desc, bg: 'bg-purple-500/10' },
  { icon: <Shield size={22} className="text-amber-400" />, title: t.f4Title, desc: t.f4Desc, bg: 'bg-amber-500/10' },
  { icon: <BarChart3 size={22} className="text-pink-400" />, title: t.f5Title, desc: t.f5Desc, bg: 'bg-pink-500/10' },
  { icon: <Download size={22} className="text-blue-400" />, title: t.f6Title, desc: t.f6Desc, bg: 'bg-blue-500/10' },
];

const steps = (t: typeof nl) => [
  { emoji: '📝', title: t.step1Title, desc: t.step1Desc, bg: 'bg-green-500/10' },
  { emoji: '🤖', title: t.step2Title, desc: t.step2Desc, bg: 'bg-cyan-500/10' },
  { emoji: '📱', title: t.step3Title, desc: t.step3Desc, bg: 'bg-purple-500/10' },
];

const pricingTiers = (t: typeof nl, annual: boolean) => [
  {
    name: 'Starter', price: '€0', period: '', desc: t.priceFreeDesc, popular: false,
    cta: t.priceFreeCta,
    features: [t.pf1, t.pf2, t.pf3, t.pf4],
  },
  {
    name: 'Professional', price: annual ? '€39' : '€49', period: annual ? t.perMonth : t.perMonth,
    desc: t.priceProDesc, popular: true,
    cta: t.priceProCta,
    features: [t.pp1, t.pp2, t.pp3, t.pp4, t.pp5, t.pp6],
  },
  {
    name: 'Agency', price: annual ? '€159' : '€199', period: annual ? t.perMonth : t.perMonth,
    desc: t.priceAgencyDesc, popular: false,
    cta: t.priceAgencyCta,
    features: [t.pa1, t.pa2, t.pa3, t.pa4, t.pa5, t.pa6],
  },
];

const faqItems = (t: typeof nl) => [
  { q: t.faq1q, a: t.faq1a },
  { q: t.faq2q, a: t.faq2a },
  { q: t.faq3q, a: t.faq3a },
  { q: t.faq4q, a: t.faq4a },
  { q: t.faq5q, a: t.faq5a },
  { q: t.faq6q, a: t.faq6a },
];

// ============= TRANSLATIONS =============
const nl = {
  navFeatures: 'Features', navHowItWorks: 'Hoe het werkt', navPricing: 'Prijzen', navCta: 'Start gratis',
  heroBadge: 'Powered by Autonomous AI Agents',
  heroTitle1: 'Bouw je eigen app voor je lokale bedrijf', heroTitle2: 'in minuten, niet maanden',
  heroSubtitle: 'Onze AI-agent analyseert je bedrijf, ontwerpt een custom Flutter app, en genereert productieklare code — volledig autonoom. Geen technische kennis nodig.',
  heroCta: 'Start gratis bouwen', heroSecondary: 'Bekijk hoe het werkt',
  statApps: 'Apps gebouwd', statRating: 'Beoordeling', statCities: 'Steden', statTime: 'Gem. bouwtijd',
  trustedBy: 'Vertrouwd door 2.800+ lokale ondernemers in Nederland',
  featuresBadge: '✨ Functies', featuresTitle: 'Alles wat je nodig hebt', featuresSubtitle: 'Van AI-analyse tot Play Store — wij regelen het complete traject voor je.',
  f1Title: 'Autonome AI Agent', f1Desc: 'Onze AI analyseert je branche, concurrenten en lokale markt om de perfecte app te bouwen.',
  f2Title: 'Live App Preview', f2Desc: 'Bekijk je app realtime terwijl de AI bouwt. Tap door schermen, test de navigatie.',
  f3Title: 'Productieklare Flutter Code', f3Desc: 'Clean Architecture, Riverpod state management, Firebase integratie — echte code, geen templates.',
  f4Title: 'Play Store Klaar', f4Desc: 'Adaptive icons, splash screens, signing config — klaar om te publiceren met één klik.',
  f5Title: 'Voorspelbare ROI', f5Desc: 'AI-berekende omzetverhoging op basis van 2.800+ vergelijkbare bedrijven in Nederland.',
  f6Title: 'Eén-Klik Download', f6Desc: 'Download je complete Flutter project als ZIP. Meteen uitvoeren met flutter run.',
  howBadge: '🚀 3 Stappen', howTitle: 'Van idee naar app in 5 minuten', howSubtitle: 'Zo simpel is het. Geen code, geen design skills, geen maanden wachten.',
  step1Title: 'Vul je bedrijfsgegevens in', step1Desc: 'Bedrijfsnaam, type, stad, features die je wilt. Onze AI doet de rest.',
  step2Title: 'AI bouwt je app', step2Desc: 'Bekijk live hoe de agent je app ontwerpt, code schrijft en optimaliseert.',
  step3Title: 'Download & Lanceer', step3Desc: 'Download de complete Flutter app. Klaar voor de Play Store in dezelfde dag.',
  howCta: 'Begin nu — het is gratis',
  pricingBadge: '💰 Prijzen', pricingTitle: 'Simpele, eerlijke prijzen', pricingSubtitle: 'Start gratis. Upgrade wanneer je klaar bent voor de volgende stap.',
  monthly: 'Maandelijks', annual: 'Jaarlijks', perMonth: 'maand', mostPopular: 'Meest gekozen',
  priceFreeDesc: 'Perfect om te beginnen', priceFreeCta: 'Start gratis',
  pf1: '1 app per maand', pf2: 'Basis features', pf3: 'Community support', pf4: 'ForgeLocal watermark',
  priceProDesc: 'Voor serieuze ondernemers', priceProCta: 'Start 14-dagen proefperiode',
  pp1: 'Onbeperkt apps', pp2: 'Alle features + Firebase', pp3: 'Prioriteit support', pp4: 'Geen watermark', pp5: 'Play Store hulp', pp6: 'Custom branding',
  priceAgencyDesc: 'Voor bureaus en teams', priceAgencyCta: 'Neem contact op',
  pa1: 'Alles van Pro', pa2: 'White-label branding', pa3: '5 teamleden', pa4: 'API toegang', pa5: 'SLA garantie (99.9%)', pa6: 'Dedicated support',
  pricingNote: 'Alle prijzen excl. BTW. Geen verborgen kosten. Op elk moment opzegbaar.',
  testimonialsBadge: '💬 Reviews', testimonialsTitle: 'Wat onze klanten zeggen', testimonialsSubtitle: 'Meer dan 2.800 lokale ondernemers gingen je voor.',
  faqTitle: 'Veelgestelde vragen', faqSubtitle: 'Alles wat je wilt weten over ForgeLocal AI.',
  faq1q: 'Heb ik technische kennis nodig?', faq1a: 'Nee! Je vult alleen je bedrijfsgegevens in. De AI doet al het technische werk — van design tot code. De gegenereerde Flutter app kun je direct uitvoeren.',
  faq2q: 'Kan ik de code aanpassen?', faq2a: 'Absoluut. Je krijgt de volledige broncode als ZIP download. Het is een standaard Flutter project dat je in Android Studio of VS Code kunt openen en aanpassen.',
  faq3q: 'Hoe realistisch is de telefoon preview?', faq3a: 'De preview simuleert pixel-perfect hoe je app eruitziet met jouw kleuren, bedrijfsnaam en features. Je kunt navigeren, items toevoegen aan winkelwagen, en het loyaliteitssysteem testen.',
  faq4q: 'Is de app echt klaar voor de Play Store?', faq4a: 'De gegenereerde code is ~90% productieklaar. Je hebt nog nodig: Flutter SDK, Firebase project configuratie, en een signing keystore. Wij helpen je met de laatste stappen (Pro plan).',
  faq5q: 'Welke backend wordt gebruikt?', faq5a: 'Firebase is standaard geïntegreerd: Authentication, Cloud Firestore, Cloud Messaging (push notificaties), en Analytics. Je kunt ook eenvoudig een custom backend koppelen via de meegeleverde API service.',
  faq6q: 'Kan ik mijn geld terugkrijgen?', faq6a: 'Ja, we bieden een 14-dagen niet-goed-geld-terug garantie op alle betaalde plannen. Geen vragen, geen gedoe.',
  ctaBadge: 'Klaar om te starten?', ctaTitle1: 'Bouw vandaag nog je app', ctaTitle2: 'en boost je omzet', ctaSubtitle: 'Sluit je aan bij 2.800+ ondernemers die hun bedrijf laten groeien met ForgeLocal AI.',
  ctaButton: 'Start gratis bouwen', ctaTrial: 'Start 14-dagen proefperiode', trialActive: '✅ Proefperiode actief — 14 dagen resterend',
  trialToast: '🎉 Proefperiode gestart! 14 dagen gratis Pro features.',
  footerDesc: 'AI-gestuurde app builder voor lokale bedrijven. Van idee naar Play Store in minuten.',
  footerProduct: 'Product', footerCompany: 'Bedrijf', footerLegal: 'Juridisch',
  footerAbout: 'Over ons', footerBlog: 'Blog', footerCareers: 'Vacatures', footerContact: 'Contact',
  footerPrivacy: 'Privacybeleid', footerTerms: 'Algemene voorwaarden',
};

const en: typeof nl = {
  navFeatures: 'Features', navHowItWorks: 'How it works', navPricing: 'Pricing', navCta: 'Start free',
  heroBadge: 'Powered by Autonomous AI Agents',
  heroTitle1: 'Build your own app for your local business', heroTitle2: 'in minutes, not months',
  heroSubtitle: 'Our AI agent analyzes your business, designs a custom Flutter app, and generates production-ready code — fully autonomous. No technical skills needed.',
  heroCta: 'Start building free', heroSecondary: 'See how it works',
  statApps: 'Apps built', statRating: 'Rating', statCities: 'Cities', statTime: 'Avg build time',
  trustedBy: 'Trusted by 2,800+ local entrepreneurs in the Netherlands',
  featuresBadge: '✨ Features', featuresTitle: 'Everything you need', featuresSubtitle: 'From AI analysis to Play Store — we handle the complete journey for you.',
  f1Title: 'Autonomous AI Agent', f1Desc: 'Our AI analyzes your industry, competitors, and local market to build the perfect app.',
  f2Title: 'Live App Preview', f2Desc: 'Watch your app being built in real-time. Tap through screens, test navigation.',
  f3Title: 'Production-Ready Flutter Code', f3Desc: 'Clean Architecture, Riverpod state management, Firebase integration — real code, not templates.',
  f4Title: 'Play Store Ready', f4Desc: 'Adaptive icons, splash screens, signing config — ready to publish with one click.',
  f5Title: 'Predictable ROI', f5Desc: 'AI-calculated revenue boost based on 2,800+ similar businesses in the Netherlands.',
  f6Title: 'One-Click Download', f6Desc: 'Download your complete Flutter project as ZIP. Run immediately with flutter run.',
  howBadge: '🚀 3 Steps', howTitle: 'From idea to app in 5 minutes', howSubtitle: "It's that simple. No code, no design skills, no months of waiting.",
  step1Title: 'Enter your business details', step1Desc: 'Business name, type, city, features you want. Our AI handles the rest.',
  step2Title: 'AI builds your app', step2Desc: 'Watch live as the agent designs your app, writes code, and optimizes.',
  step3Title: 'Download & Launch', step3Desc: 'Download the complete Flutter app. Ready for the Play Store the same day.',
  howCta: 'Start now — it\'s free',
  pricingBadge: '💰 Pricing', pricingTitle: 'Simple, fair pricing', pricingSubtitle: 'Start free. Upgrade when you\'re ready for the next step.',
  monthly: 'Monthly', annual: 'Annual', perMonth: 'month', mostPopular: 'Most popular',
  priceFreeDesc: 'Perfect to get started', priceFreeCta: 'Start free',
  pf1: '1 app per month', pf2: 'Basic features', pf3: 'Community support', pf4: 'ForgeLocal watermark',
  priceProDesc: 'For serious entrepreneurs', priceProCta: 'Start 14-day free trial',
  pp1: 'Unlimited apps', pp2: 'All features + Firebase', pp3: 'Priority support', pp4: 'No watermark', pp5: 'Play Store guidance', pp6: 'Custom branding',
  priceAgencyDesc: 'For agencies and teams', priceAgencyCta: 'Contact us',
  pa1: 'Everything in Pro', pa2: 'White-label branding', pa3: '5 team members', pa4: 'API access', pa5: 'SLA guarantee (99.9%)', pa6: 'Dedicated support',
  pricingNote: 'All prices excl. VAT. No hidden fees. Cancel anytime.',
  testimonialsBadge: '💬 Reviews', testimonialsTitle: 'What our customers say', testimonialsSubtitle: 'Over 2,800 local entrepreneurs chose ForgeLocal AI.',
  faqTitle: 'Frequently asked questions', faqSubtitle: 'Everything you want to know about ForgeLocal AI.',
  faq1q: 'Do I need technical knowledge?', faq1a: 'No! You only fill in your business details. The AI handles all the technical work — from design to code. The generated Flutter app can be run immediately.',
  faq2q: 'Can I customize the code?', faq2a: 'Absolutely. You get the full source code as a ZIP download. It\'s a standard Flutter project you can open and edit in Android Studio or VS Code.',
  faq3q: 'How realistic is the phone preview?', faq3a: 'The preview simulates pixel-perfect how your app looks with your colors, business name, and features. You can navigate, add items to cart, and test the loyalty system.',
  faq4q: 'Is the app really Play Store ready?', faq4a: 'The generated code is ~90% production-ready. You still need: Flutter SDK, Firebase project configuration, and a signing keystore. We help with the final steps (Pro plan).',
  faq5q: 'Which backend is used?', faq5a: 'Firebase is integrated by default: Authentication, Cloud Firestore, Cloud Messaging (push notifications), and Analytics. You can also easily connect a custom backend via the included API service.',
  faq6q: 'Can I get a refund?', faq6a: 'Yes, we offer a 14-day money-back guarantee on all paid plans. No questions asked.',
  ctaBadge: 'Ready to start?', ctaTitle1: 'Build your app today', ctaTitle2: 'and boost your revenue', ctaSubtitle: 'Join 2,800+ entrepreneurs growing their business with ForgeLocal AI.',
  ctaButton: 'Start building free', ctaTrial: 'Start 14-day free trial', trialActive: '✅ Trial active — 14 days remaining',
  trialToast: '🎉 Trial started! 14 days of free Pro features.',
  footerDesc: 'AI-powered app builder for local businesses. From idea to Play Store in minutes.',
  footerProduct: 'Product', footerCompany: 'Company', footerLegal: 'Legal',
  footerAbout: 'About us', footerBlog: 'Blog', footerCareers: 'Careers', footerContact: 'Contact',
  footerPrivacy: 'Privacy policy', footerTerms: 'Terms of service',
};

export default LandingPage;
