import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Zap, ExternalLink, Trash2 } from 'lucide-react';
import { AIProvider, validateApiKey, AVAILABLE_GROQ_MODELS } from '../lib/aiAgent';

interface APIKeySettingsProps {
  onClose: () => void;
  onSave: (provider: AIProvider, apiKey: string, model?: string) => void;
  currentProvider?: AIProvider;
  currentKey?: string;
  currentModel?: string;
  showToast: (msg: string) => void;
}

const providers: { id: AIProvider; name: string; icon: string; color: string; description: string; url: string; free: boolean }[] = [
  { id: 'groq', name: 'Groq', icon: '⚡', color: '#f55036', description: 'Ultra-fast inference — Llama 3.3, Mixtral, Gemma', url: 'https://console.groq.com/keys', free: true },
  { id: 'openai', name: 'OpenAI', icon: '🤖', color: '#10a37f', description: 'GPT-4o, GPT-4 Turbo', url: 'https://platform.openai.com/api-keys', free: false },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', color: '#d4a574', description: 'Claude 4 Sonnet, Opus', url: 'https://console.anthropic.com/', free: false },
  { id: 'grok', name: 'xAI (Grok)', icon: '🚀', color: '#1da1f2', description: 'Grok-3', url: 'https://console.x.ai/', free: false },
];

export default function APIKeySettings({ onClose, onSave, currentProvider, currentKey, currentModel, showToast }: APIKeySettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(currentProvider || 'groq');
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [selectedModel, setSelectedModel] = useState(currentModel || 'llama-3.3-70b-versatile');
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);

  // Load saved key from localStorage when provider changes
  useEffect(() => {
    const savedKey = localStorage.getItem(`forgelocal-apikey-${selectedProvider}`);
    const savedModel = localStorage.getItem(`forgelocal-model-${selectedProvider}`);
    if (savedKey && savedKey !== currentKey) {
      setApiKey(savedKey);
    } else if (!savedKey) {
      setApiKey('');
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    setValidationResult(null);
  }, [selectedProvider, currentKey]);

  const handleValidate = async () => {
    if (!apiKey.trim()) return;
    setValidating(true);
    setValidationResult(null);

    const result = await validateApiKey(selectedProvider, apiKey.trim());
    setValidationResult(result);
    setValidating(false);

    if (result.valid) {
      showToast(`✅ ${providers.find(p => p.id === selectedProvider)?.name} API key is valid!`);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    // Save to localStorage (encrypted in real app)
    localStorage.setItem(`forgelocal-apikey-${selectedProvider}`, apiKey.trim());
    if (selectedProvider === 'groq') {
      localStorage.setItem(`forgelocal-model-${selectedProvider}`, selectedModel);
    }
    onSave(selectedProvider, apiKey.trim(), selectedProvider === 'groq' ? selectedModel : undefined);
    showToast(`🔑 ${providers.find(p => p.id === selectedProvider)?.name} API key saved!`);
    onClose();
  };

  const handleRemoveKey = () => {
    localStorage.removeItem(`forgelocal-apikey-${selectedProvider}`);
    localStorage.removeItem(`forgelocal-model-${selectedProvider}`);
    setApiKey('');
    setValidationResult(null);
    onSave(selectedProvider, '', undefined);
    showToast('🗑️ API key removed');
  };

  const currentProviderInfo = providers.find(p => p.id === selectedProvider)!;
  const maskedKey = apiKey ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 12)) + apiKey.slice(-4) : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-2xl glass-card rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Key size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-hero">AI Provider Settings</h2>
                <p className="text-xs text-dim">Connect your API key for real AI-generated Flutter code</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg card-surface flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
              <X size={16} className="text-sub" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-3 block">Choose Provider</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedProvider === provider.id
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-soft card-surface hover:border-white/20'
                  }`}
                >
                  {provider.free && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-green-500 text-[8px] font-bold text-white uppercase">Free</span>
                  )}
                  <div className="text-xl mb-1">{provider.icon}</div>
                  <div className="text-xs font-bold text-hero">{provider.name}</div>
                  <div className="text-[9px] text-dim mt-0.5 leading-tight">{provider.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Groq Recommendation Banner */}
          {selectedProvider === 'groq' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-bold text-hero">Aanbevolen: Groq is gratis en supersnel!</p>
                  <p className="text-xs text-sub mt-1">
                    Groq biedt gratis API toegang met de snelste inference ter wereld. 
                    Maak een account aan op <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline hover:text-orange-300">console.groq.com</a> en 
                    kopieer je API key hieronder.
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                      <CheckCircle2 size={10} /> Gratis tier beschikbaar
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                      <Zap size={10} /> ~750 tokens/sec
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                      <Shield size={10} /> Geen creditcard nodig
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Model Selection (Groq only) */}
          {selectedProvider === 'groq' && (
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-2 block">Model</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_GROQ_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-soft card-surface hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-hero">{model.name}</span>
                      {selectedModel === model.id && <CheckCircle2 size={14} className="text-green-400" />}
                    </div>
                    <p className="text-[10px] text-dim mt-0.5">{model.description}</p>
                    <p className="text-[9px] font-mono text-dim/60 mt-1">{model.id}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-sub uppercase tracking-wider">API Key</label>
              <a
                href={currentProviderInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300 transition-colors"
              >
                Get API Key <ExternalLink size={10} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setValidationResult(null); }}
                placeholder={
                  selectedProvider === 'groq' ? 'gsk_...' :
                  selectedProvider === 'openai' ? 'sk-...' :
                  selectedProvider === 'anthropic' ? 'sk-ant-...' :
                  'Enter your API key'
                }
                className="w-full px-4 py-3.5 pr-24 rounded-xl input-field focus:outline-none transition-all text-sm font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
                >
                  {showKey ? <EyeOff size={14} className="text-dim" /> : <Eye size={14} className="text-dim" />}
                </button>
                {apiKey && (
                  <button
                    onClick={handleRemoveKey}
                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                )}
              </div>
            </div>
            {apiKey && !showKey && (
              <p className="text-[10px] font-mono text-dim mt-1.5">{maskedKey}</p>
            )}
          </div>

          {/* Validation Result */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xl flex items-center gap-3 ${
                  validationResult.valid
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-400">API key is valid! ✓</p>
                      <p className="text-[10px] text-green-400/70">Ready to generate real Flutter code</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-400">Validation failed</p>
                      <p className="text-[10px] text-red-400/70">{validationResult.error || 'Invalid API key'}</p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-soft">
            <Shield size={14} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-sub font-medium">Veiligheid</p>
              <p className="text-[10px] text-dim leading-relaxed">
                Je API key wordt lokaal opgeslagen in je browser (localStorage). 
                De key wordt nooit naar onze servers gestuurd — API calls gaan direct van jouw browser naar {currentProviderInfo.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-soft flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl card-surface text-sub text-sm font-medium cursor-pointer hover:text-hero transition-all">
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidate}
              disabled={!apiKey.trim() || validating}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-soft text-sub text-sm font-medium cursor-pointer hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {validating ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Validating...
                </>
              ) : (
                'Test Connection'
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold cursor-pointer hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Key size={14} /> Save & Activate
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
