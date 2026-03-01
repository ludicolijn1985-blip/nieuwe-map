import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Smartphone, FolderTree, Layers, Package,
  Download, MonitorSmartphone, Server, ShieldCheck, Info, CheckCircle2, AlertCircle, X
} from 'lucide-react';

interface TransparencyPanelProps {
  onClose: () => void;
}

interface FAQItem {
  id: number;
  icon: React.ReactNode;
  question: string;
  answer: React.ReactNode;
  status: 'green' | 'yellow' | 'blue';
}

const TransparencyPanel: React.FC<TransparencyPanelProps> = ({ onClose }) => {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const faqs: FAQItem[] = [
    {
      id: 1,
      icon: <Smartphone size={16} />,
      question: '1. What Flutter version is used by default?',
      answer: (
        <div className="space-y-2">
          <p><strong className="text-white">Flutter 3.22+ (latest stable)</strong> with Dart SDK &gt;= 3.2.0</p>
          <p>The generated <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 text-[10px]">pubspec.yaml</code> specifies:</p>
          <pre className="bg-black/40 rounded-lg p-3 text-[10px] font-mono text-green-300/80 mt-1">
{`environment:
  sdk: '>=3.2.0 <4.0.0'`}
          </pre>
          <p>This ensures compatibility with the latest Flutter features including Material 3, Impeller rendering, and all null-safety APIs.</p>
        </div>
      ),
      status: 'green'
    },
    {
      id: 2,
      icon: <FolderTree size={16} />,
      question: '2. Full folder structure of the generated project?',
      answer: (
        <div className="space-y-2">
          <pre className="bg-black/40 rounded-lg p-3 text-[10px] font-mono text-cyan-300/80 leading-relaxed">
{`📦 your_business_app/
├── 📄 pubspec.yaml              # Dependencies & config
├── 📄 analysis_options.yaml     # Linting rules
├── 📄 README.md                 # Setup instructions
├── 📄 .gitignore
├── 📁 lib/
│   ├── 📄 main.dart             # App entry point
│   ├── 📁 theme/
│   │   └── 📄 app_theme.dart    # Dark theme, colors, fonts
│   ├── 📁 screens/
│   │   └── 📄 home_screen.dart  # Main screen
│   ├── 📁 widgets/
│   │   ├── 📄 feature_grid.dart # Feature cards
│   │   └── 📄 bottom_nav.dart   # Bottom navigation
│   ├── 📁 models/
│   │   ├── 📄 user_model.dart   # User data model
│   │   └── 📄 business_model.dart
│   ├── 📁 services/
│   │   ├── 📄 api_service.dart  # Dio HTTP client
│   │   ├── 📄 notification_service.dart  # FCM
│   │   └── 📄 storage_service.dart       # Hive + SharedPrefs
│   └── 📁 providers/
│       └── 📄 app_provider.dart # Riverpod state
├── 📁 android/
│   ├── 📄 build.gradle          # Root Gradle config
│   ├── 📄 settings.gradle
│   ├── 📄 gradle.properties
│   └── 📁 app/
│       ├── 📄 build.gradle      # App-level Gradle
│       └── 📁 src/main/
│           ├── 📄 AndroidManifest.xml
│           └── 📁 res/
│               ├── 📁 values/   # strings.xml, styles.xml
│               └── 📁 drawable/ # launch_background.xml
├── 📁 ios/
│   └── 📁 Runner/
│       └── 📄 Info.plist        # iOS configuration
├── 📁 test/
│   └── 📄 widget_test.dart      # Basic widget tests
└── 📁 assets/
    ├── 📁 images/               # App icons, logos
    └── 📁 fonts/                # Custom font files`}
          </pre>
        </div>
      ),
      status: 'green'
    },
    {
      id: 3,
      icon: <Layers size={16} />,
      question: '3. Architecture & state management?',
      answer: (
        <div className="space-y-2">
          <p><strong className="text-white">Riverpod 2.x</strong> with code generation for type-safe state management.</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: 'State Mgmt', value: 'flutter_riverpod ^2.4.9' },
              { label: 'Navigation', value: 'go_router ^13.0.1' },
              { label: 'HTTP Client', value: 'Dio ^5.4.0 + Retrofit' },
              { label: 'Local DB', value: 'Hive ^2.2.3' },
              { label: 'Pattern', value: 'Feature-first folders' },
              { label: 'DI', value: 'Riverpod providers' },
            ].map(item => (
              <div key={item.label} className="bg-black/30 rounded-lg p-2">
                <span className="text-[9px] text-white/35 uppercase">{item.label}</span>
                <p className="text-[10px] text-cyan-300 font-mono">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ),
      status: 'green'
    },
    {
      id: 4,
      icon: <Package size={16} />,
      question: '4. 10+ packages automatically included?',
      answer: (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-1">
            {[
              { pkg: 'flutter_riverpod: ^2.4.9', desc: 'State management' },
              { pkg: 'dio: ^5.4.0', desc: 'HTTP client' },
              { pkg: 'go_router: ^13.0.1', desc: 'Declarative routing' },
              { pkg: 'firebase_core: ^2.24.2', desc: 'Firebase base' },
              { pkg: 'firebase_messaging: ^14.7.10', desc: 'Push notifications' },
              { pkg: 'firebase_analytics: ^10.8.0', desc: 'Analytics tracking' },
              { pkg: 'hive_flutter: ^1.1.0', desc: 'Local NoSQL database' },
              { pkg: 'shared_preferences: ^2.2.2', desc: 'Key-value storage' },
              { pkg: 'google_fonts: ^6.1.0', desc: 'Typography' },
              { pkg: 'cached_network_image: ^3.3.1', desc: 'Image caching' },
              { pkg: 'shimmer: ^3.0.0', desc: 'Loading skeletons' },
              { pkg: 'flutter_svg: ^2.0.9', desc: 'SVG rendering' },
              { pkg: 'lottie: ^2.7.0', desc: 'Animations' },
              { pkg: 'url_launcher: ^6.2.2', desc: 'External links' },
              { pkg: 'connectivity_plus: ^5.0.2', desc: 'Network status' },
            ].map(item => (
              <div key={item.pkg} className="flex items-center gap-2 bg-black/20 rounded-md px-2 py-1.5">
                <CheckCircle2 size={10} className="text-green-400 flex-shrink-0" />
                <code className="text-[9px] font-mono text-cyan-300 flex-1">{item.pkg}</code>
                <span className="text-[9px] text-white/30">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      status: 'green'
    },
    {
      id: 5,
      icon: <Download size={16} />,
      question: '5. Is it production-ready? Can I run flutter run immediately?',
      answer: (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-yellow-200/80">
              <strong>Almost!</strong> The code structure is complete and production-grade, but you need to:
            </p>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-white/60">
            <li>Install Flutter SDK (&gt;= 3.2.0) on your machine</li>
            <li>Run <code className="bg-white/10 px-1 rounded text-cyan-300">flutter pub get</code></li>
            <li>Set up Firebase project + download <code className="bg-white/10 px-1 rounded text-cyan-300">google-services.json</code></li>
            <li>Add your actual logo/icon assets to <code className="bg-white/10 px-1 rounded text-cyan-300">assets/images/</code></li>
            <li>Run <code className="bg-white/10 px-1 rounded text-cyan-300">flutter run</code> — the app will compile and launch!</li>
          </ol>
          <p className="text-[10px] text-white/40">The generated code compiles without errors. Firebase features need project configuration first.</p>
        </div>
      ),
      status: 'yellow'
    },
    {
      id: 6,
      icon: <Download size={16} />,
      question: '6. How does the download work?',
      answer: (
        <div className="space-y-2">
          <p><strong className="text-white">One-click ZIP download</strong> with the complete Flutter project.</p>
          <p className="text-[11px]">When the build completes, click <strong className="text-green-300">"Download ZIP"</strong> — you get a fully structured Flutter project folder with:</p>
          <ul className="space-y-1 text-[11px]">
            <li>✅ All Dart source files (<code className="bg-white/10 px-1 rounded text-cyan-300">lib/</code>)</li>
            <li>✅ Android Gradle build files (<code className="bg-white/10 px-1 rounded text-cyan-300">android/</code>)</li>
            <li>✅ iOS configuration (<code className="bg-white/10 px-1 rounded text-cyan-300">ios/</code>)</li>
            <li>✅ pubspec.yaml with all dependencies</li>
            <li>✅ README with setup instructions</li>
            <li>✅ Widget tests</li>
            <li>✅ Asset folder structure</li>
          </ul>
        </div>
      ),
      status: 'green'
    },
    {
      id: 7,
      icon: <MonitorSmartphone size={16} />,
      question: '7. How realistic is the Android phone preview?',
      answer: (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-200/80">
              <strong>It&apos;s a high-fidelity mock simulation</strong>, not a live Flutter compilation.
            </p>
          </div>
          <p className="text-[11px] text-white/60">
            The preview shows pixel-accurate representations of what your Flutter app screens will look like,
            using your actual brand colors, business name, features, and business type.
            It updates in real-time as the agent generates each screen.
          </p>
          <p className="text-[11px] text-white/60">
            For actual Flutter compilation, download the ZIP and run <code className="bg-white/10 px-1 rounded text-cyan-300">flutter run</code> on your device/emulator.
          </p>
        </div>
      ),
      status: 'blue'
    },
    {
      id: 8,
      icon: <Server size={16} />,
      question: '8. Which backend is included? Push notifications?',
      answer: (
        <div className="space-y-2">
          <p><strong className="text-white">Firebase (Google)</strong> is pre-configured as the default backend:</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { name: 'Firebase Core', desc: 'Base SDK', done: true },
              { name: 'Cloud Messaging', desc: 'Push notifications', done: true },
              { name: 'Analytics', desc: 'Event tracking', done: true },
              { name: 'Auth', desc: 'Add separately', done: false },
              { name: 'Firestore', desc: 'Add separately', done: false },
              { name: 'Storage', desc: 'Add separately', done: false },
            ].map(item => (
              <div key={item.name} className="bg-black/30 rounded-lg p-2 flex items-center gap-2">
                {item.done ? (
                  <CheckCircle2 size={10} className="text-green-400" />
                ) : (
                  <AlertCircle size={10} className="text-white/20" />
                )}
                <div>
                  <p className="text-[10px] text-white/80 font-medium">{item.name}</p>
                  <p className="text-[9px] text-white/30">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-1">
            Push notifications are fully wired with <code className="bg-white/10 px-1 rounded text-cyan-300">NotificationService</code> — just add your Firebase project config.
            Supabase/custom backend can be easily swapped using the <code className="bg-white/10 px-1 rounded text-cyan-300">ApiService</code>.
          </p>
        </div>
      ),
      status: 'green'
    },
    {
      id: 9,
      icon: <ShieldCheck size={16} />,
      question: '9. Ready for Google Play Store submission?',
      answer: (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-yellow-200/80">
              <strong>90% ready.</strong> A few manual steps are still needed:
            </p>
          </div>
          <div className="space-y-1">
            {[
              { item: 'App icons config', status: 'included', detail: 'flutter_launcher_icons in pubspec.yaml — add your icon PNG' },
              { item: 'Splash screen', status: 'included', detail: 'launch_background.xml configured' },
              { item: 'Permissions', status: 'included', detail: 'Internet, notifications, vibrate pre-declared' },
              { item: 'ProGuard rules', status: 'included', detail: 'Minification enabled in release build' },
              { item: 'Signing key', status: 'manual', detail: 'Create keystore + add to key.properties' },
              { item: 'Play Console', status: 'manual', detail: 'Screenshots, descriptions, content rating' },
              { item: 'Privacy policy', status: 'manual', detail: 'Required for Play Store listing' },
            ].map(item => (
              <div key={item.item} className="flex items-start gap-2 bg-black/20 rounded-md p-2">
                {item.status === 'included' ? (
                  <CheckCircle2 size={10} className="text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle size={10} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className="text-[10px] text-white/70 font-medium">{item.item}</span>
                  <span className={`text-[9px] ml-2 px-1.5 py-0.5 rounded-full ${
                    item.status === 'included' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                  }`}>{item.status}</span>
                  <p className="text-[9px] text-white/30 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      status: 'yellow'
    },
  ];

  const statusColors = {
    green: 'border-green-500/20 bg-green-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
  };

  const statusIcons = {
    green: <CheckCircle2 size={12} className="text-green-400" />,
    yellow: <AlertCircle size={12} className="text-yellow-400" />,
    blue: <Info size={12} className="text-blue-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl max-h-[85vh] glass-card rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Full Transparency</h2>
                <p className="text-xs text-white/40">Honest answers about your generated Flutter app</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-white/40" />
            </button>
          </div>

          {/* Summary badges */}
          <div className="relative flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
              <CheckCircle2 size={10} />
              6 Fully included
            </div>
            <div className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
              <AlertCircle size={10} />
              2 Need manual steps
            </div>
            <div className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full border border-blue-400/20">
              <Info size={10} />
              1 Mock simulation
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4 space-y-2">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: faq.id * 0.05 }}
              className={`rounded-xl border overflow-hidden transition-all ${
                expandedId === faq.id ? statusColors[faq.status] : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-white/40">{faq.icon}</span>
                <span className="text-xs font-semibold text-white/80 flex-1">{faq.question}</span>
                {statusIcons[faq.status]}
                {expandedId === faq.id ? (
                  <ChevronDown size={14} className="text-white/25" />
                ) : (
                  <ChevronRight size={14} className="text-white/25" />
                )}
              </button>
              <AnimatePresence>
                {expandedId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-[11px] text-white/55 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransparencyPanel;
