import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bot, TrendingUp, Shield, Palette, Sparkles,
  CheckCircle2, X, Zap, Clock, AlertTriangle, BarChart3, Rocket
} from 'lucide-react';
import type { SavedApp, MaintenanceSuggestion } from '../types';

interface MaintenanceAgentProps {
  app: SavedApp;
  onBack: () => void;
  showToast: (msg: string) => void;
}

const MaintenanceAgent: React.FC<MaintenanceAgentProps> = ({ app, onBack, showToast }) => {
  const [suggestions, setSuggestions] = useState<MaintenanceSuggestion[]>([]);
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(app.maintenanceEnabled);

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setScanning(false);
            setSuggestions(generateSuggestions(app));
            return 100;
          }
          return p + 2;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [scanning, app]);

  const handleApply = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'applied' } : s));
    showToast('✅ Suggestion applied! Code updated.');
  };

  const handleDismiss = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'dismissed' } : s));
  };

  const toggleMaintenance = () => {
    setEnabled(!enabled);
    showToast(enabled ? '⏸️ Maintenance paused' : '✅ Auto-maintenance activated!');
  };

  const pending = suggestions.filter(s => s.status === 'pending');
  const applied = suggestions.filter(s => s.status === 'applied');

  const typeIcons: Record<string, React.ReactNode> = {
    feature: <Sparkles size={16} className="text-purple-400" />,
    performance: <Zap size={16} className="text-amber-400" />,
    security: <Shield size={16} className="text-red-400" />,
    design: <Palette size={16} className="text-cyan-400" />,
    conversion: <TrendingUp size={16} className="text-green-400" />,
  };

  const impactColors: Record<string, string> = {
    low: 'text-gray-400 bg-gray-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    high: 'text-green-400 bg-green-500/10',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl card-surface flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <ArrowLeft size={18} className="text-sub" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-hero flex items-center gap-2">
            <Bot size={24} className="text-green-400" /> AI Maintenance Agent
          </h1>
          <p className="text-sub text-sm">{app.businessData.name} — Continuous improvement</p>
        </div>
        <button onClick={toggleMaintenance}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 ${
            enabled ? 'bg-green-500 text-white hover:bg-green-600' : 'card-surface text-sub hover:text-hero'
          }`}
        >
          {enabled ? <><CheckCircle2 size={14} /> Auto-Maintenance ON</> : <><Clock size={14} /> Enable Auto-Maintenance</>}
        </button>
      </div>

      {/* Scanning animation */}
      <AnimatePresence>
        {scanning && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-2xl p-8 mb-8 text-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6"
            >
              <Bot size={28} className="text-white" />
            </motion.div>
            <h3 className="text-hero font-bold text-lg mb-2">Scanning your app...</h3>
            <p className="text-sub text-sm mb-4">Analyzing code quality, performance, security, and conversion opportunities</p>
            <div className="w-full max-w-md mx-auto h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                style={{ width: `${progress}%` }} transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-dim text-xs mt-2">{progress}% — {progress < 30 ? 'Analyzing code...' : progress < 60 ? 'Checking performance...' : progress < 90 ? 'Finding opportunities...' : 'Almost done...'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!scanning && (
        <>
          {/* Summary */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <span className="text-hero font-bold text-sm">Pending</span>
              </div>
              <p className="text-3xl font-black text-amber-400">{pending.length}</p>
              <p className="text-dim text-xs mt-1">suggestions to review</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-hero font-bold text-sm">Applied</span>
              </div>
              <p className="text-3xl font-black text-green-400">{applied.length}</p>
              <p className="text-dim text-xs mt-1">improvements made</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-cyan-400" />
                <span className="text-hero font-bold text-sm">Est. Impact</span>
              </div>
              <p className="text-3xl font-black gradient-text">+{applied.reduce((sum, s) => sum + parseInt(s.estimatedBoost) || 0, 0) || 0}%</p>
              <p className="text-dim text-xs mt-1">conversion boost</p>
            </div>
          </div>

          {/* Suggestions list */}
          <div className="space-y-4">
            <h3 className="text-hero font-bold flex items-center gap-2">
              <Rocket size={16} className="text-green-400" /> AI Suggestions
            </h3>
            {suggestions.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-2xl p-5 ${s.status === 'applied' ? 'border-green-500/20' : s.status === 'dismissed' ? 'opacity-40' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {typeIcons[s.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-hero font-semibold text-sm">{s.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${impactColors[s.impact]}`}>
                          {s.impact} impact
                        </span>
                        <span className="text-green-400 text-xs font-bold">+{s.estimatedBoost}</span>
                      </div>
                    </div>
                    <p className="text-sub text-sm leading-relaxed mb-3">{s.description}</p>

                    {s.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApply(s.id)}
                          className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold cursor-pointer hover:bg-green-600 transition-colors flex items-center gap-1.5"
                        >
                          <Sparkles size={12} /> Apply
                        </button>
                        <button onClick={() => handleDismiss(s.id)}
                          className="px-4 py-2 rounded-lg card-surface text-dim text-xs cursor-pointer hover:text-sub transition-all flex items-center gap-1.5"
                        >
                          <X size={12} /> Dismiss
                        </button>
                      </div>
                    )}
                    {s.status === 'applied' && (
                      <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> Applied successfully
                      </span>
                    )}
                    {s.status === 'dismissed' && (
                      <span className="text-dim text-xs">Dismissed</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// MOCK SUGGESTIONS
// ============================================
function generateSuggestions(app: SavedApp): MaintenanceSuggestion[] {
  const name = app.businessData.name;
  return [
    {
      id: '1', type: 'conversion', title: 'Add push notification opt-in popup',
      description: `Show a friendly popup after the user's second visit encouraging push notification signup. Based on data from similar ${app.businessData.type} apps, this increases retention by 35%.`,
      impact: 'high', estimatedBoost: '12%', status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2', type: 'performance', title: 'Enable image lazy loading',
      description: 'Menu item images are loading all at once. Add lazy loading with CachedNetworkImage to reduce initial load time by ~40%.',
      impact: 'medium', estimatedBoost: '5%', status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3', type: 'feature', title: 'Add social sharing for loyalty milestones',
      description: `When users reach a loyalty tier, let them share to Instagram/WhatsApp. This creates free word-of-mouth marketing for ${name}.`,
      impact: 'high', estimatedBoost: '18%', status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4', type: 'security', title: 'Update Firebase SDK to latest version',
      description: 'A new Firebase SDK version includes security patches for authentication. Recommended update from 3.1.0 to 3.3.2.',
      impact: 'medium', estimatedBoost: '0%', status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5', type: 'design', title: 'Add skeleton loading screens',
      description: 'Replace spinning loaders with skeleton shimmer animations for a more premium feel. Perceived loading time decreases by 30%.',
      impact: 'low', estimatedBoost: '3%', status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '6', type: 'conversion', title: 'Implement abandoned cart reminders',
      description: 'Send a push notification 30 minutes after a user adds items but doesn\'t complete the order. Recovers up to 15% of lost orders.',
      impact: 'high', estimatedBoost: '15%', status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '7', type: 'feature', title: 'Add Android 16 edge-to-edge support',
      description: 'Android 16 requires edge-to-edge rendering. Update your app to use the new predictive back gesture and transparent navigation bars.',
      impact: 'medium', estimatedBoost: '2%', status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];
}

export default MaintenanceAgent;
