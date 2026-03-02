import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Edit3,
  Calendar, Smartphone, TrendingUp, Key, Eye, EyeOff,
  Shield, CheckCircle2, Zap, BarChart3,
  ExternalLink, Settings, Cpu, Crown
} from 'lucide-react';
import type { UserProfile, SavedApp } from '../types';
import { getUserApps, deleteApp } from '../lib/supabase';
import { saveApiKey, getApiKey, deleteApiKey } from '../lib/supabase';
import type { AIProvider } from '../lib/aiAgent';
import { validateApiKey } from '../lib/aiAgent';

interface DashboardProps {
  user: UserProfile;
  onNewApp: () => void;
  onOpenApp: (app: SavedApp) => void;
  onPlayStore: (app: SavedApp) => void;
  onMaintenance: (app: SavedApp) => void;
  showToast: (msg: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user, onNewApp, onOpenApp, onPlayStore, onMaintenance, showToast
}) => {
  const [apps, setApps] = useState<SavedApp[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'apps' | 'apikeys' | 'analytics'>('apps');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    const data = await getUserApps();
    setApps(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteApp(id);
    setApps(prev => prev.filter(a => a.id !== id));
    showToast('🗑️ App deleted');
  };

  const filteredApps = apps.filter(a =>
    a.businessData.name.toLowerCase().includes(search.toLowerCase()) ||
    a.businessData.type.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalApps: apps.length,
    deployed: apps.filter(a => a.status === 'deployed').length,
    avgRoi: apps.length > 0 ? Math.round(apps.reduce((sum, a) => sum + (a.roi?.revenueBoostMin || 20), 0) / apps.length) : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-hero">
            Welcome back, <span className="gradient-text">{user.name || 'Builder'}</span>
          </h1>
          <p className="text-sub text-sm mt-1">Manage your apps, API keys, and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <Crown size={14} className="text-green-400" />
            <span className="text-xs font-semibold text-green-400 uppercase">{user.plan} Plan</span>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onNewApp}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm flex items-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-green-500/25 transition-all"
          >
            <Plus size={16} /> New App
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Apps', value: stats.totalApps, icon: <Smartphone size={18} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Deployed', value: stats.deployed, icon: <CheckCircle2 size={18} />, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Avg ROI Boost', value: `${stats.avgRoi}%`, icon: <TrendingUp size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Plan', value: user.plan.charAt(0).toUpperCase() + user.plan.slice(1), icon: <Zap size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-hero">{stat.value}</p>
            <p className="text-xs text-dim mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {([
          { id: 'apps', label: 'My Apps', icon: <Smartphone size={14} /> },
          { id: 'apikeys', label: 'API Keys', icon: <Key size={14} /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-dim hover:text-sub'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'apps' && (
          <motion.div key="apps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Search */}
            <div className="relative mb-6 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps..." className="w-full pl-10 pr-4 py-3 rounded-xl input-field focus:outline-none transition-all text-sm"
              />
            </div>

            {loading ? (
              <div className="text-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full mx-auto mb-4" />
                <p className="text-dim text-sm">Loading your apps...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-hero font-bold text-lg mb-2">No apps yet</h3>
                <p className="text-sub text-sm mb-6 max-w-sm mx-auto">Create your first app and start growing your local business with AI.</p>
                <button onClick={onNewApp}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm cursor-pointer hover:shadow-lg hover:shadow-green-500/25 transition-all inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Build Your First App
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map((app, i) => (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-5 group hover:border-green-500/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{ background: `${app.businessData.primaryColor}15` }}>
                          {getTypeEmoji(app.businessData.type)}
                        </div>
                        <div>
                          <h3 className="text-hero font-bold text-sm">{app.businessData.name}</h3>
                          <p className="text-dim text-xs">{app.businessData.type}</p>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-dim mb-4">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(app.createdAt).toLocaleDateString('nl-NL')}</span>
                      <span className="flex items-center gap-1"><TrendingUp size={12} /> +{app.roi?.revenueBoostMin || 20}% ROI</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => onOpenApp(app)} className="flex-1 py-2 rounded-lg card-surface text-sub text-xs font-medium cursor-pointer hover:text-hero transition-all flex items-center justify-center gap-1.5">
                        <Edit3 size={12} /> Edit
                      </button>
                      <button onClick={() => onPlayStore(app)} className="flex-1 py-2 rounded-lg card-surface text-sub text-xs font-medium cursor-pointer hover:text-hero transition-all flex items-center justify-center gap-1.5">
                        <ExternalLink size={12} /> Store
                      </button>
                      <button onClick={() => onMaintenance(app)} className="flex-1 py-2 rounded-lg card-surface text-sub text-xs font-medium cursor-pointer hover:text-hero transition-all flex items-center justify-center gap-1.5">
                        <Settings size={12} /> Maintain
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="py-2 px-2.5 rounded-lg card-surface text-red-400/50 text-xs cursor-pointer hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Add new card */}
                <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onClick={onNewApp}
                  className="glass-card rounded-2xl p-5 border-2 border-dashed border-white/10 hover:border-green-500/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[180px] group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={24} className="text-green-400" />
                  </div>
                  <p className="text-sub text-sm font-medium group-hover:text-hero transition-colors">Create New App</p>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'apikeys' && (
          <motion.div key="apikeys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ApiKeyManager showToast={showToast} />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AnalyticsDashboard apps={apps} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// API KEY MANAGER
// ============================================
const ApiKeyManager: React.FC<{ showToast: (msg: string) => void }> = ({ showToast }) => {
  const [keys, setKeys] = useState<Record<string, { hint: string; saved: boolean }>>({});
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const providers: AIProvider[] = ['openai', 'anthropic', 'grok'];
    const loaded: Record<string, { hint: string; saved: boolean }> = {};
    for (const p of providers) {
      const key = await getApiKey(p);
      if (key) {
        loaded[p] = { hint: key.hint, saved: true };
      }
    }
    setKeys(loaded);
  };

  const handleSave = async (provider: string) => {
    if (!keyInput.trim()) return;
    setValidating(true);

    const result = await validateApiKey(provider as AIProvider, keyInput);

    if (result.valid) {
      await saveApiKey(provider, keyInput);
      setKeys(prev => ({ ...prev, [provider]: { hint: '···' + keyInput.slice(-4), saved: true } }));
      setEditingProvider(null);
      setKeyInput('');
      showToast(`✅ ${provider} API key saved & validated!`);
    } else {
      showToast(`❌ Invalid API key: ${result.error}`);
    }
    setValidating(false);
  };

  const handleDelete = async (provider: string) => {
    await deleteApiKey(provider);
    setKeys(prev => {
      const copy = { ...prev };
      delete copy[provider];
      return copy;
    });
    showToast(`🗑️ ${provider} API key removed`);
  };

  const providers = [
    { id: 'openai', name: 'OpenAI', model: 'GPT-4o / GPT-5', color: 'text-emerald-400', bg: 'bg-emerald-500/10', placeholder: 'sk-...' },
    { id: 'anthropic', name: 'Anthropic', model: 'Claude Sonnet 4', color: 'text-orange-400', bg: 'bg-orange-500/10', placeholder: 'sk-ant-...' },
    { id: 'grok', name: 'xAI', model: 'Grok 3', color: 'text-blue-400', bg: 'bg-blue-500/10', placeholder: 'xai-...' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Cpu size={18} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-hero font-bold">AI Provider Keys</h3>
            <p className="text-dim text-xs">Add your API key to generate real Flutter code with AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Shield size={14} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-400/80 text-xs">Keys are stored encrypted locally. Never sent to our servers.</p>
        </div>
      </div>

      <div className="space-y-4">
        {providers.map(p => (
          <div key={p.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center`}>
                  <Key size={16} className={p.color} />
                </div>
                <div>
                  <h4 className="text-hero font-semibold text-sm">{p.name}</h4>
                  <p className="text-dim text-xs">{p.model}</p>
                </div>
              </div>
              {keys[p.id]?.saved && (
                <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                  <CheckCircle2 size={14} /> Connected
                </div>
              )}
            </div>

            {editingProvider === p.id ? (
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <input type={showKey ? 'text' : 'password'} value={keyInput} onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={p.placeholder} className="w-full px-4 py-2.5 rounded-xl input-field focus:outline-none text-sm font-mono pr-10"
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim cursor-pointer">
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button onClick={() => handleSave(p.id)} disabled={validating}
                  className="px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {validating ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : 'Save'}
                </button>
                <button onClick={() => { setEditingProvider(null); setKeyInput(''); }}
                  className="px-3 py-2.5 rounded-xl card-surface text-dim text-sm cursor-pointer hover:text-sub"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-3">
                {keys[p.id]?.saved ? (
                  <>
                    <span className="text-xs text-dim font-mono bg-white/5 px-3 py-1.5 rounded-lg flex-1">{keys[p.id].hint}</span>
                    <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg text-red-400/60 text-xs cursor-pointer hover:text-red-400 hover:bg-red-500/10 transition-all">
                      Remove
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditingProvider(p.id)}
                    className="px-4 py-2 rounded-xl card-surface text-sub text-xs font-medium cursor-pointer hover:text-hero transition-all flex items-center gap-1.5"
                  >
                    <Plus size={12} /> Add API Key
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ANALYTICS DASHBOARD
// ============================================
const AnalyticsDashboard: React.FC<{ apps: SavedApp[] }> = ({ apps }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const mockData = [2, 5, 3, 8, 6, apps.length || 4];
  const maxVal = Math.max(...mockData);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-hero font-bold mb-6">Apps Built Over Time</h3>
        <div className="flex items-end gap-3 h-40">
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${(mockData[i] / maxVal) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="w-full rounded-t-lg bg-gradient-to-t from-green-500/40 to-green-500/80 min-h-[4px]"
              />
              <span className="text-[10px] text-dim">{m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <h4 className="text-sub font-semibold text-sm mb-4">Top Business Types</h4>
          <div className="space-y-3">
            {['Café/Restaurant', 'Kapsalon', 'Sportschool'].map((type, i) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-body text-sm">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${[80, 55, 35][i]}%` }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="h-full rounded-full bg-green-500"
                    />
                  </div>
                  <span className="text-dim text-xs w-8 text-right">{[80, 55, 35][i]}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h4 className="text-sub font-semibold text-sm mb-4">Revenue Impact</h4>
          <div className="text-center py-4">
            <p className="text-4xl font-black gradient-text mb-2">+€12,400</p>
            <p className="text-dim text-xs">Estimated total revenue boost across all apps</p>
          </div>
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-green-500/10">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-green-400 text-xs font-medium">↑ 23% vs. last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELPERS
// ============================================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    draft: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Draft' },
    building: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Building' },
    complete: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Complete' },
    deployed: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Deployed' },
  };
  const c = config[status] || config.draft;
  return (
    <span className={`${c.color} ${c.bg} text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
      {c.label}
    </span>
  );
};

function getTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    'Café/Restaurant': '☕', 'Kapsalon': '✂️', 'Sportschool/Fitness': '💪',
    'Bakkerij': '🥐', 'Tattoo shop': '🎨', 'Kledingwinkel': '👗',
    'Huisartsenpraktijk': '🏥', 'Fietsenmaker': '🚲', 'Bloemist': '💐',
    'Boekhandel': '📚', 'Barbershop': '💈', 'Yoga/Pilates studio': '🧘',
    'Nagelstudio': '💅', 'Autowasstraat': '🚗', 'IJssalon': '🍦',
    'Sushi takeaway': '🍣', 'Pet grooming': '🐾', 'Massage salon': '💆',
    'Fotostudio': '📸', 'Wijnbar': '🍷', 'Trimsalon': '🐶',
  };
  return map[type] || '📱';
}

export default Dashboard;
