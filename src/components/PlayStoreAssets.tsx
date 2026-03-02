import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Smartphone, Type, FileText, Image, Shield, CheckCircle2,
  Copy, Download, Globe, Star, Tag, Sparkles
} from 'lucide-react';
import type { SavedApp } from '../types';

interface PlayStoreAssetsProps {
  app: SavedApp;
  onBack: () => void;
  showToast: (msg: string) => void;
}

const PlayStoreAssets: React.FC<PlayStoreAssetsProps> = ({ app, onBack, showToast }) => {
  const [generating, setGenerating] = useState(true);
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  const [activeSection, setActiveSection] = useState('listing');

  interface GeneratedAssets {
    title: string;
    shortDesc: string;
    fullDesc: string;
    category: string;
    tags: string[];
    privacyPolicy: string;
    screenshots: string[];
    checklist: { item: string; done: boolean; required: boolean }[];
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAssets(generateAssets(app));
      setGenerating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [app]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    showToast(`📋 ${label} copied!`);
  };

  if (generating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles size={28} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-black text-hero mb-3">Generating Play Store Assets...</h2>
          <p className="text-sub text-sm">AI is creating optimized listing for <strong>{app.businessData.name}</strong></p>
          <div className="w-64 h-2 rounded-full bg-white/5 mx-auto mt-6 overflow-hidden">
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1/3 h-full rounded-full bg-gradient-to-r from-transparent via-green-500 to-transparent"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!assets) return null;

  const sections = [
    { id: 'listing', label: 'Store Listing', icon: <Type size={14} /> },
    { id: 'screenshots', label: 'Screenshots', icon: <Image size={14} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={14} /> },
    { id: 'checklist', label: 'Launch Checklist', icon: <CheckCircle2 size={14} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl card-surface flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <ArrowLeft size={18} className="text-sub" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-hero">Play Store Assets</h1>
          <p className="text-sub text-sm">{app.businessData.name} — Ready for Google Play</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit overflow-x-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSection === s.id ? 'bg-green-500 text-white shadow-lg' : 'text-dim hover:text-sub'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'listing' && (
        <div className="space-y-6">
          <AssetField label="App Title" value={assets.title} onCopy={() => copyText(assets.title, 'Title')} maxLength={30} />
          <AssetField label="Short Description" value={assets.shortDesc} onCopy={() => copyText(assets.shortDesc, 'Short description')} maxLength={80} />
          <AssetField label="Full Description" value={assets.fullDesc} onCopy={() => copyText(assets.fullDesc, 'Full description')} maxLength={4000} multiline />
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-hero font-semibold text-sm flex items-center gap-2"><Globe size={14} className="text-cyan-400" /> Category</h3>
            </div>
            <p className="text-sub text-sm">{assets.category}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-hero font-semibold text-sm flex items-center gap-2 mb-3"><Tag size={14} className="text-amber-400" /> Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {assets.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 text-sub text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'screenshots' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-hero font-bold mb-4 flex items-center gap-2">
              <Smartphone size={16} className="text-cyan-400" /> Generated Screenshots
            </h3>
            <p className="text-sub text-sm mb-6">8 optimized screenshots for different device sizes</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {assets.screenshots.map((label, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="aspect-[9/16] rounded-2xl flex items-center justify-center text-center p-4 relative overflow-hidden group cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${app.businessData.primaryColor}20, ${app.businessData.primaryColor}05)`, border: `1px solid ${app.businessData.primaryColor}20` }}
                >
                  <div>
                    <p className="text-2xl mb-2">{['🏠', '📋', '🎁', '👤', '🛒', '📍', '⭐', '📱'][i]}</p>
                    <p className="text-sub text-xs font-medium">{label}</p>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={14} className="text-dim" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-hero font-bold mb-3 flex items-center gap-2">
              <Image size={16} className="text-purple-400" /> Feature Graphic
            </h3>
            <div className="aspect-[2/1] rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${app.businessData.primaryColor}30, ${app.businessData.secondaryColor}30)`, border: `1px solid ${app.businessData.primaryColor}20` }}>
              <div className="text-center">
                <p className="text-4xl mb-3">{getTypeEmoji(app.businessData.type)}</p>
                <p className="text-hero text-xl font-bold">{app.businessData.name}</p>
                <p className="text-sub text-sm">{app.businessData.description || 'Your local business app'}</p>
              </div>
            </div>
            <p className="text-dim text-xs mt-2">1024×500px — Required for Play Store listing</p>
          </div>
        </div>
      )}

      {activeSection === 'privacy' && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-hero font-bold flex items-center gap-2"><Shield size={16} className="text-green-400" /> Privacy Policy Draft</h3>
            <button onClick={() => copyText(assets.privacyPolicy, 'Privacy policy')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg card-surface text-sub text-xs font-medium cursor-pointer hover:text-hero transition-all"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <pre className="text-sub text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white/5 rounded-xl p-5 max-h-[500px] overflow-y-auto">
            {assets.privacyPolicy}
          </pre>
          <p className="text-amber-400/70 text-xs mt-3 flex items-center gap-1.5">
            ⚠️ This is a draft. Have it reviewed by a legal professional before publishing.
          </p>
        </div>
      )}

      {activeSection === 'checklist' && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-hero font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" /> Play Store Submission Checklist
          </h3>
          <div className="space-y-3">
            {assets.checklist.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${item.done ? 'bg-green-500/5 border border-green-500/10' : 'bg-white/5 border border-white/5'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-white/10'}`}>
                  {item.done ? <CheckCircle2 size={14} className="text-white" /> : <span className="text-dim text-xs">{i + 1}</span>}
                </div>
                <span className={`text-sm flex-1 ${item.done ? 'text-green-400' : 'text-sub'}`}>{item.item}</span>
                {item.required && <span className="text-red-400/60 text-[10px] uppercase font-semibold">Required</span>}
              </motion.div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm font-medium flex items-center gap-2">
              <Star size={14} /> {assets.checklist.filter(c => c.done).length}/{assets.checklist.length} completed — 
              {assets.checklist.filter(c => c.done).length >= 8 ? ' Ready to submit!' : ' Almost there!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// SUB COMPONENTS
// ============================================
const AssetField: React.FC<{
  label: string; value: string; onCopy: () => void; maxLength: number; multiline?: boolean;
}> = ({ label, value, onCopy, maxLength, multiline }) => (
  <div className="glass-card rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-hero font-semibold text-sm flex items-center gap-2">
        <FileText size={14} className="text-green-400" /> {label}
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-dim text-xs">{value.length}/{maxLength}</span>
        <button onClick={onCopy} className="flex items-center gap-1 px-2.5 py-1 rounded-lg card-surface text-sub text-xs cursor-pointer hover:text-hero transition-all">
          <Copy size={11} /> Copy
        </button>
      </div>
    </div>
    {multiline ? (
      <pre className="text-sub text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white/5 rounded-xl p-4 max-h-60 overflow-y-auto">{value}</pre>
    ) : (
      <p className="text-sub text-sm bg-white/5 rounded-xl px-4 py-3">{value}</p>
    )}
  </div>
);

// ============================================
// ASSET GENERATION
// ============================================
function generateAssets(app: SavedApp) {
  const d = app.businessData;
  const name = d.name;
  const type = d.type;
  const city = d.city;

  return {
    title: `${name} - ${type}`.slice(0, 30),
    shortDesc: `De officiële app van ${name} in ${city}. Bestel, reserveer en verdien beloningen.`.slice(0, 80),
    fullDesc: `${name} — De complete ${type.toLowerCase()} ervaring in je broekzak! 📱

🌟 FEATURES
• Bekijk ons volledige menu / aanbod
• Direct reserveren of afspraak maken
• Loyalty rewards — verdien punten bij elk bezoek
• Push notificaties voor speciale aanbiedingen
• Contactgegevens en routebeschrijving

📍 LOCATIE
${name} bevindt zich in ${city}${d.postcode ? ` (${d.postcode})` : ''}.

${d.description ? `ℹ️ OVER ONS\n${d.description}\n` : ''}
⭐ BELONINGEN
Verdien punten bij elke bestelling en wissel ze in voor gratis producten en exclusieve kortingen!

🔔 NOOIT IETS MISSEN
Activeer push notificaties en ontvang als eerste onze dagspecials, evenementen en seizoensaanbiedingen.

📞 CONTACT & SUPPORT
Vragen? Neem contact met ons op via de app of bezoek ons in ${city}.

Download nu en begin met punten sparen! 🎁`,
    category: getCategoryForType(type),
    tags: [type.toLowerCase(), city.toLowerCase(), 'lokaal', 'bestellen', 'reserveren', 'loyalty', 'rewards', 'nederland'],
    screenshots: ['Home Screen', 'Menu / Services', 'Rewards Program', 'Profile & Settings', 'Shopping Cart', 'Location & Map', 'Special Offers', 'Order Confirmation'],
    privacyPolicy: generatePrivacyPolicy(name, city),
    checklist: [
      { item: 'App title & short description', done: true, required: true },
      { item: 'Full description (SEO optimized)', done: true, required: true },
      { item: 'App icon (512×512 adaptive)', done: true, required: true },
      { item: 'Feature graphic (1024×500)', done: true, required: true },
      { item: '8 screenshots (phone)', done: true, required: true },
      { item: 'Privacy policy URL', done: true, required: true },
      { item: 'Content rating questionnaire', done: true, required: true },
      { item: 'Target audience & country', done: true, required: true },
      { item: 'Signing keystore generated', done: false, required: true },
      { item: 'Release APK/AAB built', done: false, required: true },
      { item: 'Tablet screenshots (optional)', done: false, required: false },
      { item: 'Promotional video (optional)', done: false, required: false },
    ],
  };
}

function getCategoryForType(type: string): string {
  const map: Record<string, string> = {
    'Café/Restaurant': 'Food & Drink', 'Bakkerij': 'Food & Drink', 'IJssalon': 'Food & Drink',
    'Sushi takeaway': 'Food & Drink', 'Wijnbar': 'Food & Drink',
    'Kapsalon': 'Beauty', 'Barbershop': 'Beauty', 'Nagelstudio': 'Beauty', 'Massage salon': 'Beauty',
    'Sportschool/Fitness': 'Health & Fitness', 'Yoga/Pilates studio': 'Health & Fitness',
    'Kledingwinkel': 'Shopping', 'Bloemist': 'Shopping', 'Boekhandel': 'Shopping',
    'Huisartsenpraktijk': 'Medical', 'Pet grooming': 'Lifestyle', 'Trimsalon': 'Lifestyle',
  };
  return map[type] || 'Lifestyle';
}

function getTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    'Café/Restaurant': '☕', 'Kapsalon': '✂️', 'Sportschool/Fitness': '💪',
    'Bakkerij': '🥐', 'Tattoo shop': '🎨', 'Kledingwinkel': '👗',
  };
  return map[type] || '📱';
}

function generatePrivacyPolicy(name: string, city: string): string {
  return `PRIVACY POLICY — ${name}
Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

1. INTRODUCTION
${name}, located in ${city}, Netherlands ("we", "our", "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our mobile application.

2. DATA WE COLLECT
• Account information (name, email address)
• Order history and preferences
• Loyalty program activity and points balance
• Device information and push notification tokens
• Location data (only when you use the map feature)

3. HOW WE USE YOUR DATA
• To process orders and reservations
• To manage your loyalty rewards account
• To send push notifications about offers and updates
• To improve our services and app experience
• To comply with legal obligations

4. DATA SHARING
We do not sell your personal data. We may share data with:
• Firebase (Google) for authentication and analytics
• Payment processors for order transactions
• Legal authorities when required by law

5. DATA RETENTION
We retain your data for as long as your account is active. You can request deletion at any time.

6. YOUR RIGHTS (GDPR)
Under EU/Dutch law, you have the right to:
• Access your personal data
• Correct inaccurate data
• Delete your account and data
• Data portability
• Withdraw consent

7. SECURITY
We use industry-standard encryption and security measures to protect your data.

8. COOKIES & ANALYTICS
Our app uses Firebase Analytics to track usage patterns. No third-party advertising cookies are used.

9. CHILDREN'S PRIVACY
Our app is not intended for children under 13. We do not knowingly collect data from children.

10. CONTACT
For privacy inquiries, contact us at:
${name}
${city}, Netherlands
Email: privacy@${name.toLowerCase().replace(/[^a-z]/g, '')}.nl

11. CHANGES
We may update this policy. Users will be notified of significant changes via the app.`;
}

export default PlayStoreAssets;
