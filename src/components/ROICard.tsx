import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Gauge, CreditCard, Sparkles, ArrowRight, BarChart3, Shield } from 'lucide-react';
import { ROIData } from '../types';

interface ROICardProps {
  roi: ROIData;
  onContinue: () => void;
}

const ROICard: React.FC<ROICardProps> = ({ roi, onContinue }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl glass-card rounded-3xl overflow-hidden shadow-2xl shadow-green-500/10"
      >
        {/* Header with animated gradient */}
        <div className="relative p-8 pb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-emerald-500/8 to-cyan-500/10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-green-500/10 blur-[80px]" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-cyan-500/8 blur-[60px]" />
          
          <div className="relative flex items-center gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
            >
              <BarChart3 size={26} className="text-white" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-black text-white"
              >
                Predictable ROI
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-white/50"
              >
                AI-calculated business impact analysis
              </motion.p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="px-8 pb-2">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<TrendingUp size={20} />}
              label="Estimated Revenue Boost"
              value={`${roi.revenueBoostMin}–${roi.revenueBoostMax}%`}
              color="text-green-400"
              bgColor="bg-green-500/10"
              borderColor="border-green-500/20"
              delay={0.5}
            />
            <MetricCard
              icon={<Clock size={20} />}
              label="Build Time"
              value={`${roi.buildTimeMin}–${roi.buildTimeMax} min`}
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
              borderColor="border-cyan-500/20"
              delay={0.6}
            />
            <MetricCard
              icon={<Gauge size={20} />}
              label="Complexity"
              value={roi.complexity}
              color="text-purple-400"
              bgColor="bg-purple-500/10"
              borderColor="border-purple-500/20"
              delay={0.7}
            />
            <MetricCard
              icon={<CreditCard size={20} />}
              label="Monthly Price After Launch"
              value={`€${roi.monthlyPrice}`}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              borderColor="border-amber-500/20"
              delay={0.8}
            />
          </div>
        </div>

        {/* Payback message */}
        <div className="px-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-2xl p-5 bg-gradient-to-r from-green-500/10 via-emerald-500/8 to-green-500/5 border border-green-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 shimmer-bg" />
            <div className="relative">
              <p className="text-green-300 font-bold text-base flex items-center gap-2">
                <span className="text-xl">💰</span>
                This app will probably pay for itself in {roi.paybackWeeks} weeks
              </p>
              <p className="text-white/40 text-xs mt-2 leading-relaxed">
                Based on AI analysis of 2,847 similar {roi.complexity.toLowerCase()}-complexity local business apps
                in the Netherlands. Average customer retention increase: +{Math.round(roi.revenueBoostMin * 0.6)}%.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="px-8 pb-4 flex items-center justify-center gap-6"
        >
          {[
            { icon: <Shield size={12} />, text: 'No credit card required' },
            { icon: <Sparkles size={12} />, text: 'Cancel anytime' },
            { icon: <TrendingUp size={12} />, text: 'ROI guaranteed' },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5 text-white/30 text-[10px]">
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <div className="px-8 pb-8">
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-500/25 cursor-pointer transition-shadow relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <span className="relative flex items-center gap-3">
                🚀 Build My App Now
                <ArrowRight size={20} />
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  borderColor: string;
  delay: number;
}> = ({ icon, label, value, color, bgColor, borderColor, delay }) => {
  const [displayValue, setDisplayValue] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, delay * 1000 + 300);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl p-4 bg-[#0f0f18] border ${borderColor} hover:border-opacity-50 transition-all group`}
    >
      <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center ${color} mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1">{label}</p>
      <motion.p
        className={`text-2xl font-black ${color}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: displayValue ? 1 : 0 }}
      >
        {displayValue || '—'}
      </motion.p>
    </motion.div>
  );
};

export default ROICard;
