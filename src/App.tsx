import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Upload, Sparkles, Zap, Shield, Globe,
  Star, CheckCircle2, Bot, Download,
  FolderArchive, FileCode2, Layers, Maximize2, X, ArrowLeft, Sun, Moon,
  User, LogOut, LayoutDashboard, CreditCard, LayoutGrid, Cookie, Key
} from 'lucide-react';
import { BusinessFormData, LogEntry, ROIData, AppPhase, UserProfile, SavedApp, SaaSPage } from './types';
import { generateROI, generateLogSteps, generateFlutterCode } from './mockData';
import { downloadFlutterProject } from './utils/generateFlutterZip';
import { saveApp, getCurrentUser, signOut } from './lib/supabase';
import { generateWithAI, AIProvider } from './lib/aiAgent';
import ROICard from './components/ROICard';
import PhonePreview from './components/PhonePreview';
import DevicePreview from './components/DevicePreview';
import LogPanel from './components/LogPanel';
import CodeViewer from './components/CodeViewer';
import LandingPage from './components/LandingPage';
import BusinessTypeDropdown from './components/BusinessTypeDropdown';
import AuthModal from './components/AuthModal';
import APIKeySettings from './components/APIKeySettings';
import Dashboard from './components/Dashboard';
import PlayStoreAssets from './components/PlayStoreAssets';
import MaintenanceAgent from './components/MaintenanceAgent';
import TemplateGallery from './components/TemplateGallery';

const defaultForm: BusinessFormData = {
  name: '', type: '', city: '', postcode: '', description: '',
  features: '', primaryColor: '#22c55e', secondaryColor: '#0a0a0f', logoUploaded: false,
};

export default function App() {
  const [page, setPage] = useState<SaaSPage>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('forgelocal-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  // Auth
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // Builder
  const [formData, setFormData] = useState<BusinessFormData>(defaultForm);
  const [phase, setPhase] = useState<AppPhase>('input');
  const [roi, setRoi] = useState<ROIData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [codeFiles, setCodeFiles] = useState<{ filename: string; code: string }[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [toast, setToast] = useState('');
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SaaS features
  const [selectedApp, setSelectedApp] = useState<SavedApp | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    return !localStorage.getItem('forgelocal-cookies-accepted');
  });

  // AI Settings
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<{ provider: AIProvider; apiKey: string; model?: string } | null>(() => {
    // Load saved AI config from localStorage on mount
    const savedProvider = localStorage.getItem('forgelocal-ai-provider') as AIProvider | null;
    const savedKey = savedProvider ? localStorage.getItem(`forgelocal-apikey-${savedProvider}`) : null;
    const savedModel = savedProvider ? localStorage.getItem(`forgelocal-model-${savedProvider}`) : null;
    if (savedProvider && savedKey) {
      return { provider: savedProvider, apiKey: savedKey, model: savedModel || undefined };
    }
    return null;
  });

  // Load user on mount
  useEffect(() => {
    getCurrentUser().then(u => { if (u) setUser(u); });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'input' && formData.name && formData.type && formData.city) {
          handleStart();
        }
      }
      if (e.key === 'Escape') {
        if (showFullPreview) setShowFullPreview(false);
        if (showTemplates) setShowTemplates(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, formData, showFullPreview, showTemplates]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('forgelocal-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  const showToastMsg = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  const updateField = useCallback((field: keyof BusinessFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleStart = useCallback(() => {
    setRoi(generateROI(formData));
    setPhase('roi');
  }, [formData]);

  const startBuilding = useCallback(() => {
    setPhase('building');
    const steps = generateLogSteps(formData);
    const codes = generateFlutterCode(formData);
    const useAI = !!(aiConfig && aiConfig.apiKey);
    const aiGeneratedFiles: { filename: string; code: string }[] = [];

    setCodeFiles(codes);
    setLogs(steps.map(s => ({ ...s, status: 'pending' as const, timestamp: '', detail: s.detail })));
    setCurrentStep(0);
    setProgress(0);

    let step = 0;
    const runStep = () => {
      if (step >= steps.length) {
        // If AI was used, merge AI-generated files with mock files
        if (useAI && aiGeneratedFiles.length > 0) {
          setCodeFiles(prev => {
            const aiFilenames = new Set(aiGeneratedFiles.map(f => f.filename));
            const filtered = prev.filter(f => !aiFilenames.has(f.filename));
            return [...aiGeneratedFiles, ...filtered];
          });
        }
        setPhase('complete');
        setProgress(100);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        if (roi) {
          const finalCodes = useAI && aiGeneratedFiles.length > 0 ? aiGeneratedFiles : codes;
          saveApp(formData, finalCodes, roi).then(() => {
            showToastMsg(useAI ? '🎉 App generated with real AI & saved!' : '🎉 App generated & saved!');
          });
        }
        return;
      }
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const startTime = Date.now();

      setLogs(prev => prev.map((l, i) => ({
        ...l,
        status: i < step ? 'complete' as const : i === step ? 'running' as const : 'pending' as const,
        timestamp: i === step ? timeStr : l.timestamp,
        detail: i === step && useAI ? `${l.detail} (🤖 AI: ${aiConfig!.provider})` : l.detail,
      })));
      setCurrentStep(step + 1);
      setProgress(((step + 0.3) / steps.length) * 100);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const target = ((step + 0.9) / steps.length) * 100;
          if (prev >= target) { clearInterval(progressInterval); return prev; }
          return prev + 0.5;
        });
      }, 50);

      // For code generation steps (1-5), use real AI if available
      const isCodeStep = step >= 0 && step <= 4 && useAI;

      const handleStepComplete = (elapsed: number) => {
        clearInterval(progressInterval);
        const durationStr = `${(elapsed / 1000).toFixed(1)}s`;
        setLogs(prev => prev.map((l, i) => ({
          ...l,
          status: i <= step ? 'complete' as const : 'pending' as const,
          duration: i === step ? durationStr : l.duration,
        })));
        setProgress(((step + 1) / steps.length) * 100);
        step++;
        intervalRef.current = setTimeout(runStep, 300 + Math.random() * 400);
      };

      if (isCodeStep) {
        // Real AI generation
        generateWithAI(aiConfig, formData, step + 1)
          .then((result) => {
            aiGeneratedFiles.push({ filename: result.filename, code: result.code });
            // Update code files in real-time
            setCodeFiles(prev => {
              const exists = prev.findIndex(f => f.filename === result.filename);
              if (exists >= 0) {
                const updated = [...prev];
                updated[exists] = { filename: result.filename, code: result.code };
                return updated;
              }
              return [...prev, { filename: result.filename, code: result.code }];
            });
            handleStepComplete(Date.now() - startTime);
          })
          .catch(() => {
            // Fallback to mock on error
            handleStepComplete(Date.now() - startTime);
          });
      } else {
        const stepDuration = 1800 + Math.random() * 2200;
        intervalRef.current = setTimeout(() => {
          handleStepComplete(Date.now() - startTime);
        }, stepDuration);
      }
    };

    setTimeout(runStep, 600);
  }, [formData, roi, aiConfig, showToastMsg]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadFlutterProject(formData, codeFiles);
      showToastMsg('✅ Flutter project downloaded!');
    } catch { showToastMsg('❌ Download failed.'); }
    setTimeout(() => setIsDownloading(false), 1500);
  }, [formData, codeFiles, showToastMsg]);

  const handleCopyFile = useCallback((code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    showToastMsg('📋 Code copied!');
  }, [showToastMsg]);

  const handleAuth = useCallback((u: UserProfile) => {
    setUser(u);
    setShowAuth(false);
    showToastMsg(`👋 Welcome, ${u.name || u.email}!`);
  }, [showToastMsg]);

  const handleTemplateSelect = useCallback((templateData: Partial<BusinessFormData>) => {
    setFormData(prev => ({ ...prev, ...templateData }));
    showToastMsg('✨ Template applied!');
  }, [showToastMsg]);

  const handleSaveAiConfig = useCallback((provider: AIProvider, apiKey: string, model?: string) => {
    if (apiKey) {
      localStorage.setItem('forgelocal-ai-provider', provider);
      setAiConfig({ provider, apiKey, model });
      showToastMsg(`🔑 ${provider === 'groq' ? 'Groq' : provider} API key saved!`);
    } else {
      localStorage.removeItem('forgelocal-ai-provider');
      setAiConfig(null);
    }
  }, [showToastMsg]);

  const acceptCookies = useCallback(() => {
    localStorage.setItem('forgelocal-cookies-accepted', 'true');
    setShowCookieBanner(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setPage('landing');
    showToastMsg('👋 Signed out');
  }, [showToastMsg]);

  const goToBuilder = useCallback(() => {
    setPage('builder');
    setPhase('input');
    setFormData(defaultForm);
    setLogs([]);
    setCodeFiles([]);
    setProgress(0);
    setCurrentStep(0);
    window.scrollTo(0, 0);
  }, []);

  const openAppInBuilder = useCallback((app: SavedApp) => {
    setFormData(app.businessData);
    setCodeFiles(app.codeFiles);
    setRoi(app.roi);
    setPhase('complete');
    setProgress(100);
    setCurrentStep(9);
    setPage('builder');
    setLogs(generateLogSteps(app.businessData).map(s => ({
      ...s, status: 'complete' as const, timestamp: '✓', duration: '—',
    })));
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, []);

  const isFormValid = formData.name && formData.type && formData.city;

  // ===== ROUTING =====
  if (page === 'landing') {
    return (
      <>
        <LandingPage onStartBuilder={goToBuilder} theme={theme} onToggleTheme={toggleTheme} />
        <AnimatePresence>{showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}</AnimatePresence>
        <AnimatePresence>{showApiSettings && (
          <APIKeySettings onClose={() => setShowApiSettings(false)} onSave={handleSaveAiConfig}
            currentProvider={aiConfig?.provider} currentKey={aiConfig?.apiKey} currentModel={aiConfig?.model} showToast={showToastMsg} />
        )}</AnimatePresence>
        <ToastDisplay toast={toast} />
      </>
    );
  }

  if (page === 'dashboard' && user) {
    return (
      <div className="min-h-screen">
        <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="hero-orb-1 opacity-30" /><div className="hero-orb-2 opacity-30" /></div>
        <AppHeader theme={theme} toggleTheme={toggleTheme} user={user} onSignOut={handleSignOut} onDashboard={() => setPage('dashboard')} onBack={() => setPage('landing')} onLogin={() => setShowAuth(true)} onPricing={() => { setPage('landing'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); }} onApiSettings={() => setShowApiSettings(true)} hasApiKey={!!(aiConfig && aiConfig.apiKey)} />
        <main className="relative z-10">
          <Dashboard user={user} onNewApp={goToBuilder}
            onOpenApp={openAppInBuilder}
            onPlayStore={(app) => { setSelectedApp(app); setPage('playstore'); }}
            onMaintenance={(app) => { setSelectedApp(app); setPage('maintenance'); }}
            showToast={showToastMsg}
          />
        </main>
        <AnimatePresence>{showApiSettings && (
          <APIKeySettings onClose={() => setShowApiSettings(false)} onSave={handleSaveAiConfig}
            currentProvider={aiConfig?.provider} currentKey={aiConfig?.apiKey} currentModel={aiConfig?.model} showToast={showToastMsg} />
        )}</AnimatePresence>
        <ToastDisplay toast={toast} />
      </div>
    );
  }

  if (page === 'playstore' && selectedApp) {
    return (
      <div className="min-h-screen">
        <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="hero-orb-1 opacity-30" /><div className="hero-orb-2 opacity-30" /></div>
        <AppHeader theme={theme} toggleTheme={toggleTheme} user={user} onSignOut={handleSignOut} onDashboard={() => setPage('dashboard')} onBack={() => setPage('dashboard')} onLogin={() => setShowAuth(true)} onPricing={() => { setPage('landing'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); }} onApiSettings={() => setShowApiSettings(true)} hasApiKey={!!(aiConfig && aiConfig.apiKey)} />
        <main className="relative z-10">
          <PlayStoreAssets app={selectedApp} onBack={() => setPage('dashboard')} showToast={showToastMsg} />
        </main>
        <ToastDisplay toast={toast} />
      </div>
    );
  }

  if (page === 'maintenance' && selectedApp) {
    return (
      <div className="min-h-screen">
        <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="hero-orb-1 opacity-30" /><div className="hero-orb-2 opacity-30" /></div>
        <AppHeader theme={theme} toggleTheme={toggleTheme} user={user} onSignOut={handleSignOut} onDashboard={() => setPage('dashboard')} onBack={() => setPage('dashboard')} onLogin={() => setShowAuth(true)} onPricing={() => { setPage('landing'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); }} onApiSettings={() => setShowApiSettings(true)} hasApiKey={!!(aiConfig && aiConfig.apiKey)} />
        <main className="relative z-10">
          <MaintenanceAgent app={selectedApp} onBack={() => setPage('dashboard')} showToast={showToastMsg} />
        </main>
        <ToastDisplay toast={toast} />
      </div>
    );
  }

  // ===== BUILDER PAGE =====
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="hero-orb-1 opacity-50" /><div className="hero-orb-2 opacity-50" /></div>

      {/* Header */}
      <AppHeader theme={theme} toggleTheme={toggleTheme} user={user} onSignOut={handleSignOut}
        onDashboard={() => setPage('dashboard')} onBack={() => { setPage(user ? 'dashboard' : 'landing'); setPhase('input'); }} onLogin={() => setShowAuth(true)}
        onPricing={() => { setPage('landing'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
        onApiSettings={() => setShowApiSettings(true)}
        hasApiKey={!!(aiConfig && aiConfig.apiKey)}
        extra={
          <>
            {(phase === 'building' || phase === 'complete') && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center gap-2 text-[11px] text-dim">
                <span>Building:</span><span className="text-sub font-semibold">{formData.name}</span>
              </motion.div>
            )}
            {(phase === 'building' || phase === 'complete') && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setShowFullPreview(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-[11px] text-green-400 font-medium transition-all cursor-pointer hover:bg-green-500/20"
              >
                <Maximize2 size={12} /><span className="hidden sm:inline">Preview</span>
              </motion.button>
            )}
          </>
        }
      />

      {/* Main content */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {phase === 'input' ? (
            <InputPhase key="input" formData={formData} updateField={updateField} onStart={handleStart} isValid={!!isFormValid} onOpenTemplates={() => setShowTemplates(true)} onOpenAiSettings={() => setShowApiSettings(true)} hasApiKey={!!(aiConfig && aiConfig.apiKey)} aiProvider={aiConfig?.provider} />
          ) : (
            <BuildPhase key="build" formData={formData} logs={logs} currentStep={currentStep} progress={progress}
              codeFiles={codeFiles} phase={phase} onOpenPreview={() => setShowFullPreview(true)} onCopyFile={handleCopyFile} />
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {phase === 'roi' && roi && <ROICard roi={roi} onContinue={startBuilding} />}
      </AnimatePresence>
      <AnimatePresence>{showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}</AnimatePresence>
      <AnimatePresence>{showTemplates && <TemplateGallery onSelectTemplate={handleTemplateSelect} onClose={() => setShowTemplates(false)} />}</AnimatePresence>
      <AnimatePresence>{showApiSettings && (
        <APIKeySettings
          onClose={() => setShowApiSettings(false)}
          onSave={handleSaveAiConfig}
          currentProvider={aiConfig?.provider}
          currentKey={aiConfig?.apiKey}
          currentModel={aiConfig?.model}
          showToast={showToastMsg}
        />
      )}</AnimatePresence>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[80]">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4'][i % 6],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Cookie Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[65] glass-card rounded-2xl p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <Cookie size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-hero text-sm font-semibold mb-1">🍪 Cookie Notice</p>
                <p className="text-sub text-xs leading-relaxed mb-3">We use cookies to improve your experience and remember your preferences (theme, language).</p>
                <div className="flex items-center gap-2">
                  <button onClick={acceptCookies} className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold cursor-pointer hover:bg-green-600 transition-all">Accept All</button>
                  <button onClick={acceptCookies} className="px-4 py-2 rounded-lg card-surface text-sub text-xs font-medium cursor-pointer hover:text-hero transition-all">Necessary Only</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Preview Overlay */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            <motion.div initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }} className="relative flex flex-col items-center gap-6 max-w-lg"
            >
              <button onClick={() => setShowFullPreview(false)} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-10 cursor-pointer">
                <X size={16} />
              </button>
              <div className="text-center">
                <span className="text-[11px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5 justify-center">
                  <Zap size={12} /> Interactive Preview
                </span>
                <p className="text-white/40 text-xs mt-1">Tap around to test your app</p>
              </div>
              <div className="transform scale-[1.2] sm:scale-[1.35] origin-center">
                <PhonePreview data={formData} currentStep={currentStep} isBuilding={phase === 'building' || phase === 'complete'} interactive={true} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete bar */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-0 left-0 right-0 z-50">
            <div className="h-20 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" style={{ '--bg': theme === 'dark' ? '#0a0a0f' : '#f8f9fc' } as React.CSSProperties} />
            <div className="nav-bg">
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <CheckCircle2 size={28} className="text-green-400" />
                  </motion.div>
                  <div>
                    <p className="text-hero font-bold text-sm flex items-center gap-2">🎉 App generated!</p>
                    <p className="text-dim text-xs">{codeFiles.length + 6} files ready</p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-6">
                  <div className="flex items-center gap-2 text-dim"><FileCode2 size={14} className="text-purple-400" /><span className="text-xs">{codeFiles.length} Dart files</span></div>
                  <div className="flex items-center gap-2 text-dim"><Layers size={14} className="text-cyan-400" /><span className="text-xs">Riverpod + Firebase</span></div>
                  <div className="flex items-center gap-2 text-dim"><FolderArchive size={14} className="text-amber-400" /><span className="text-xs">Full project</span></div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {user && (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setPage('dashboard')}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl card-surface text-hero text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard size={14} className="text-green-400" /> <span className="hidden sm:inline">Dashboard</span>
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowFullPreview(true)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl card-surface text-hero text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Maximize2 size={14} className="text-green-400" /> Preview
                  </motion.button>
                  {!user && (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setShowAuth(true)}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer hover:bg-purple-500/20"
                    >
                      <Star size={14} /> 14-day Free Trial
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleDownload} disabled={isDownloading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-60 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    {isDownloading ? (
                      <span className="relative flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Sparkles size={16} /></motion.div>
                        Generating...
                      </span>
                    ) : (
                      <span className="relative flex items-center gap-2"><Download size={16} /> Download .zip</span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastDisplay toast={toast} />
    </div>
  );
}

// ============================================
// SHARED HEADER COMPONENT
// ============================================
interface AppHeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: UserProfile | null;
  onSignOut: () => void;
  onDashboard: () => void;
  onBack: () => void;
  onLogin: () => void;
  extra?: React.ReactNode;
  onApiSettings?: () => void;
  hasApiKey?: boolean;
}

const AppHeader: React.FC<AppHeaderProps & { onPricing?: () => void }> = ({ theme, toggleTheme, user, onSignOut, onDashboard, onBack, onLogin, extra, onPricing, onApiSettings, hasApiKey }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="relative z-10 border-b border-soft">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 cursor-pointer text-sub hover:text-hero transition-colors mr-2">
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-hero">ForgeLocal <span className="gradient-text">AI</span></h1>
            <p className="text-[10px] text-dim -mt-0.5 hidden sm:block">Autonomous App Builder</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Connect Button — ALWAYS VISIBLE on all screen sizes */}
          {onApiSettings && (
            <motion.button
              onClick={onApiSettings}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shadow-lg ${
                hasApiKey 
                  ? 'bg-green-500/15 border-2 border-green-500/40 text-green-400 hover:bg-green-500/25 shadow-green-500/10' 
                  : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 shadow-amber-500/10 animate-pulse'
              }`}
            >
              <Key size={14} />
              <span className="hidden xs:inline">{hasApiKey ? '✓ AI Connected' : '🔑 Connect AI'}</span>
              <span className="xs:hidden">{hasApiKey ? '✓' : '🔑'}</span>
            </motion.button>
          )}

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {user && (
              <button onClick={onDashboard} className="px-3 py-1.5 rounded-lg text-[11px] text-sub hover:text-hero hover:bg-white/5 transition-all cursor-pointer font-medium">
                My Apps
              </button>
            )}
            {onPricing && (
              <button onClick={onPricing} className="px-3 py-1.5 rounded-lg text-[11px] text-sub hover:text-hero hover:bg-white/5 transition-all cursor-pointer font-medium flex items-center gap-1">
                <CreditCard size={11} /> Pricing
              </button>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-dim">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>AI Engine Active</span>
          </div>
          {extra}
          <button onClick={toggleTheme} className="w-9 h-9 rounded-xl card-surface flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-500" />}
          </button>

          {user ? (
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl card-surface cursor-pointer hover:bg-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <span className="text-sub text-xs font-medium hidden sm:block">{user.name || user.email.split('@')[0]}</span>
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 top-12 w-48 glass-card rounded-xl p-2 shadow-2xl z-50"
                  >
                    <button onClick={() => { onDashboard(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sub text-sm hover:bg-white/5 cursor-pointer transition-all text-left"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </button>
                    <button onClick={() => { onDashboard(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sub text-sm hover:bg-white/5 cursor-pointer transition-all text-left"
                    >
                      <CreditCard size={14} /> Subscription
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={() => { onSignOut(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-400 text-sm hover:bg-red-500/10 cursor-pointer transition-all text-left"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl card-surface text-sub text-sm font-medium cursor-pointer hover:text-hero transition-all"
            >
              <User size={14} /> Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// ============================================
// TOAST DISPLAY
// ============================================
const ToastDisplay: React.FC<{ toast: string }> = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
        className="fixed bottom-6 left-1/2 z-[70] px-6 py-3 rounded-2xl bg-green-500 text-white font-semibold text-sm shadow-2xl shadow-green-500/30 flex items-center gap-2"
      >
        {toast}
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================
// INPUT PHASE
// ============================================
interface InputPhaseProps {
  formData: BusinessFormData;
  updateField: (field: keyof BusinessFormData, value: string | boolean) => void;
  onStart: () => void;
  isValid: boolean;
  onOpenTemplates: () => void;
  onOpenAiSettings: () => void;
  hasApiKey: boolean;
  aiProvider?: string;
}

const InputPhase: React.FC<InputPhaseProps> = ({ formData, updateField, onStart, isValid, onOpenTemplates, onOpenAiSettings, hasApiKey, aiProvider }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <div className="text-center mb-10 sm:mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium mb-6"
      >
        <Bot size={14} /> Powered by Autonomous AI Agents
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-3xl sm:text-5xl lg:text-6xl font-black text-hero leading-tight mb-4"
      >
        Build your local business app<br /><span className="gradient-text">in minutes, not months</span>
      </motion.h2>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-base sm:text-lg text-sub max-w-2xl mx-auto"
      >
        Our AI agent analyses your business, designs a custom Flutter app, and generates production-ready code — completely autonomously.
      </motion.p>
    </div>

    <div className="grid lg:grid-cols-[1fr_380px] gap-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-green-400" />
            <h3 className="text-base font-bold text-hero">Tell us about your business</h3>
          </div>
          <button onClick={onOpenTemplates} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-medium cursor-pointer hover:bg-purple-500/20 transition-all">
            <LayoutGrid size={12} /> Templates
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">Business Name *</label>
            <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. Café De Hoek"
              className="w-full px-4 py-3 rounded-xl input-field focus:outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">Business Type *</label>
            <BusinessTypeDropdown value={formData.type} onChange={(val) => updateField('type', val)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">City *</label>
              <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="e.g. Amsterdam"
                className="w-full px-4 py-3 rounded-xl input-field focus:outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">Postcode</label>
              <input type="text" value={formData.postcode} onChange={(e) => updateField('postcode', e.target.value)} placeholder="e.g. 1012 AB"
                className="w-full px-4 py-3 rounded-xl input-field focus:outline-none transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">Short Description</label>
            <input type="text" value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="e.g. Cozy café with artisan coffee"
              className="w-full px-4 py-3 rounded-xl input-field focus:outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">Key Features Wanted</label>
            <textarea value={formData.features} onChange={(e) => updateField('features', e.target.value)}
              placeholder={'Online menu\nTable reservations\nLoyalty rewards\nPush notifications'} rows={4}
              className="w-full px-4 py-3 rounded-xl input-field focus:outline-none transition-all text-sm resize-none" />
            <p className="text-[10px] text-dim mt-1">One feature per line</p>
          </div>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={formData.primaryColor} onChange={(e) => updateField('primaryColor', e.target.value)} className="rounded-lg cursor-pointer" />
                <span className="text-xs font-mono text-dim">{formData.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-sub uppercase tracking-wider mb-1.5 block">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={formData.secondaryColor} onChange={(e) => updateField('secondaryColor', e.target.value)} className="rounded-lg cursor-pointer" />
                <span className="text-xs font-mono text-dim">{formData.secondaryColor}</span>
              </div>
            </div>
            <div>
              <button onClick={() => updateField('logoUploaded', !formData.logoUploaded)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  formData.logoUploaded ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'card-surface text-sub'
                }`}
              >
                <Upload size={14} /> {formData.logoUploaded ? 'Logo ✓' : 'Upload Logo'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Connection Card — PROMINENT */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
          className={`mt-6 p-5 rounded-2xl border-2 cursor-pointer transition-all group ${
            hasApiKey 
              ? 'bg-green-500/5 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50' 
              : 'bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/30 hover:from-amber-500/10 hover:to-orange-500/10 hover:border-amber-500/50'
          }`}
          onClick={onOpenAiSettings}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                hasApiKey ? 'bg-green-500/20 shadow-green-500/10' : 'bg-amber-500/20 shadow-amber-500/10'
              }`}>
                {hasApiKey ? '🤖' : '⚡'}
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-hero flex items-center gap-2">
                  {hasApiKey ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                      AI Connected — {aiProvider === 'groq' ? 'Groq' : aiProvider === 'openai' ? 'OpenAI' : aiProvider === 'anthropic' ? 'Anthropic' : 'xAI'}
                    </>
                  ) : (
                    '🔑 Connect je AI — klik hier!'
                  )}
                </p>
                <p className="text-xs text-sub mt-0.5">
                  {hasApiKey 
                    ? '✨ Real AI-generated Flutter code will be used during build' 
                    : 'Voer je gratis Groq API key in voor echte AI code generatie'}
                </p>
              </div>
            </div>
            <motion.div 
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 ${
                hasApiKey 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {hasApiKey ? '✓ Active' : 'Setup →'}
            </motion.div>
          </div>
          {!hasApiKey && (
            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-soft">
              <p className="text-xs text-sub font-medium mb-2">⚡ In 3 simpele stappen:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 text-[11px] text-dim">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Ga naar <strong className="text-sub">console.groq.com</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-dim">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Kopieer je <strong className="text-sub">API key</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-dim">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Plak hier → <strong className="text-green-400">klaar! ✓</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-dim border-t border-soft pt-2">
                <span className="flex items-center gap-1"><Zap size={10} className="text-green-400" /> 100% gratis</span>
                <span>•</span>
                <span>Geen creditcard</span>
                <span>•</span>
                <span>~750 tokens/sec</span>
                <span>•</span>
                <span>Llama 3.3 70B</span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.button whileHover={{ scale: isValid ? 1.01 : 1 }} whileTap={{ scale: isValid ? 0.98 : 1 }}
          onClick={isValid ? onStart : undefined} disabled={!isValid}
          className={`w-full mt-4 py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 transition-all ${
            isValid ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 cursor-pointer pulse-glow' : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          <Rocket size={20} /> {hasApiKey ? '🤖 Start AI Agent' : '🚀 Start Autonomous Agent'}
        </motion.button>
        {!isValid && <p className="text-center text-dim text-xs mt-2">Fill in the required fields to continue</p>}
        {isValid && hasApiKey && <p className="text-center text-green-400/60 text-xs mt-2">✨ Real AI code generation enabled</p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-4">
        <div className="glass-card rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-sub uppercase tracking-wider mb-4">Platform Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: '2,847', label: 'Apps Built' }, { value: '€4.2M', label: 'Revenue Generated' }, { value: '98.5%', label: 'Satisfaction' }, { value: '3.2 min', label: 'Avg Build Time' }].map(stat => (
              <div key={stat.label} className="text-center py-2">
                <p className="text-lg font-bold text-hero">{stat.value}</p>
                <p className="text-[10px] text-dim">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-sub uppercase tracking-wider mb-4">What You Get</h4>
          <div className="space-y-3">
            {[
              { icon: <Globe size={14} />, text: 'Custom Flutter app (iOS + Android)', color: 'text-cyan-400' },
              { icon: <Shield size={14} />, text: 'Production-ready source code', color: 'text-purple-400' },
              { icon: <Star size={14} />, text: 'Loyalty & rewards system', color: 'text-amber-400' },
              { icon: <Zap size={14} />, text: 'Push notifications built-in', color: 'text-green-400' },
              { icon: <Download size={14} />, text: 'One-click ZIP download', color: 'text-pink-400' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className={item.color}>{item.icon}</span>
                <span className="text-xs text-body">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-1 mb-3">{[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#fbbf24" stroke="#fbbf24" />)}</div>
          <p className="text-xs text-sub italic leading-relaxed">&quot;Within 4 minutes we had a fully working app. Our reservations increased by 40%.&quot;</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">M</div>
            <div><p className="text-[11px] text-hero font-medium">Marco de Jong</p><p className="text-[9px] text-dim">Ristorante Marco — Amsterdam</p></div>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// ============================================
// BUILD PHASE
// ============================================
interface BuildPhaseProps {
  formData: BusinessFormData;
  logs: LogEntry[];
  currentStep: number;
  progress: number;
  codeFiles: { filename: string; code: string }[];
  phase: AppPhase;
  onOpenPreview: () => void;
  onCopyFile: (code: string) => void;
}

const BuildPhase: React.FC<BuildPhaseProps> = ({ formData, logs, currentStep, progress, codeFiles, phase, onOpenPreview, onCopyFile }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="flex flex-wrap items-center justify-between gap-3 mb-5"
    >
      <div className="flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${phase === 'complete' ? 'bg-green-400' : 'bg-green-400 animate-pulse'}`} />
        <span className="text-sub font-medium">{phase === 'complete' ? '✓ Complete' : '⚡ Building'}</span>
        <span className="text-dim">|</span>
        <span className="text-hero font-semibold">{formData.name}</span>
        <span className="text-dim">•</span>
        <span className="text-sub">{formData.type}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-dim font-mono">{Math.round(progress)}%</span>
        {phase === 'complete' && (
          <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full font-medium border border-green-400/20 flex items-center gap-1"
          >
            <CheckCircle2 size={12} /> Complete
          </motion.span>
        )}
      </div>
    </motion.div>

    <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
      className="h-1 bg-white/5 rounded-full mb-6 overflow-hidden" style={{ transformOrigin: 'left' }}
    >
      <motion.div className="h-full rounded-full progress-bar-animated" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-5" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-4 sm:p-5 order-2 lg:order-1 max-h-[650px] overflow-hidden flex flex-col"
      >
        <LogPanel logs={logs} progress={progress} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="flex flex-col items-center justify-start py-2 order-1 lg:order-2"
      >
        <div className="sticky top-4">
          <DevicePreview data={formData} currentStep={currentStep} isBuilding={phase === 'building' || phase === 'complete'} interactive={phase === 'complete'} />
          {phase === 'complete' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center">
              <button onClick={onOpenPreview} className="text-[11px] font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                style={{ color: formData.primaryColor, background: `${formData.primaryColor}15`, border: `1px solid ${formData.primaryColor}25` }}
              >
                <Maximize2 size={12} /> Full Interactive Preview
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-4 sm:p-5 order-3 max-h-[650px] overflow-hidden flex flex-col"
      >
        <CodeViewer files={codeFiles} currentStep={currentStep} onCopyFile={onCopyFile} />
      </motion.div>
    </div>
  </motion.div>
);
