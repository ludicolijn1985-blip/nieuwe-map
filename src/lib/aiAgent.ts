/**
 * AI Agent Integration — ForgeLocal AI
 * 
 * Connects to user-provided API keys for real Flutter code generation.
 * Supports: Groq (recommended, free), OpenAI, Anthropic, xAI (Grok)
 * 
 * All API calls go directly from the browser to the AI provider.
 * No data is sent to ForgeLocal servers.
 */

import type { BusinessFormData } from '../types';

export type AIProvider = 'openai' | 'anthropic' | 'grok' | 'groq';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

interface GenerationResult {
  filename: string;
  code: string;
  tokensUsed: number;
}

const MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  grok: 'grok-3',
  groq: 'llama-3.3-70b-versatile',
};

const AVAILABLE_GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Best quality, versatile' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Ultra fast, good quality' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Great for code generation' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google model, efficient' },
];

export { AVAILABLE_GROQ_MODELS };

const API_URLS: Record<AIProvider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  grok: 'https://api.x.ai/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
};

// ============================================
// MAIN GENERATION FUNCTION
// ============================================
export async function generateWithAI(
  config: AIConfig | null,
  data: BusinessFormData,
  step: number,
): Promise<GenerationResult> {
  if (!config || !config.apiKey) {
    return generateMockCode(data, step);
  }

  try {
    const prompt = buildPrompt(data, step);
    const result = await callAI(config, prompt);
    return result;
  } catch (error) {
    console.warn(`AI generation failed (step ${step}), using mock:`, error);
    return generateMockCode(data, step);
  }
}

// ============================================
// AI API CALLS
// ============================================
async function callAI(
  config: AIConfig,
  prompt: string,
): Promise<GenerationResult> {
  const model = config.model || MODELS[config.provider];
  const url = API_URLS[config.provider];

  if (config.provider === 'anthropic') {
    return callAnthropic(config.apiKey, model, prompt);
  }

  // OpenAI / Grok / Groq — all use OpenAI-compatible format
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`${config.provider} API error: ${response.status} - ${errorBody}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content || '';
  const parsed = parseCodeResponse(content, step_filename_from_prompt(prompt));

  return {
    ...parsed,
    tokensUsed: json.usage?.total_tokens || 0,
  };
}

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<GenerationResult> {
  const response = await fetch(API_URLS.anthropic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const json = await response.json();
  const content = json.content?.[0]?.text || '';
  const parsed = parseCodeResponse(content, step_filename_from_prompt(prompt));

  return {
    ...parsed,
    tokensUsed: (json.usage?.input_tokens || 0) + (json.usage?.output_tokens || 0),
  };
}

// ============================================
// PROMPT ENGINEERING
// ============================================
const SYSTEM_PROMPT = `You are an expert Flutter/Dart developer generating production-ready code.

Requirements:
- Flutter 3.24+ with Dart 3.5, null safety
- Clean Architecture pattern
- Riverpod 2.5 for state management
- Material 3 design system
- go_router for navigation
- Proper error handling

Output ONLY the Dart code. Start with "FILENAME: filename.dart" on the first line, then the complete code.
Do NOT include markdown code blocks. Do NOT include explanations.`;

function buildPrompt(data: BusinessFormData, step: number): string {
  const features = data.features || 'Menu\nReservations\nLoyalty\nContact';
  
  const steps: Record<number, string> = {
    1: `Generate main.dart for a ${data.type} app called "${data.name}" in ${data.city}.
Use MaterialApp.router with GoRouter, ProviderScope wrapper, theme with primary color ${data.primaryColor}.
Include Firebase initialization. The app should have 4 main screens: Home, Menu/Services, Rewards, Profile.
Business description: ${data.description || 'A modern local business app'}.`,

    2: `Generate app_theme.dart with complete Material 3 theming.
Primary color: ${data.primaryColor}, Secondary: ${data.secondaryColor}.
Include dark and light themes, Google Fonts (Inter), and component themes for cards, buttons, inputs, bottom nav bar.
Use Color(0xFF${(data.primaryColor || '#22c55e').replace('#', '')}) format.`,

    3: `Generate home_screen.dart for a ${data.type} called "${data.name}" in ${data.city}.
Include:
- Welcome header with greeting and avatar
- Hero promotional card with gradient using brand color
- Quick action grid with icons for: ${features}
- Recent activity or loyalty points section
- Notification badge
Use ConsumerStatefulWidget with staggered animations.`,

    4: `Generate menu_screen.dart for a ${data.type} called "${data.name}".
Include:
- Category filter chips (All, Popular, New, Deals)
- Search bar with filtering
- Item cards with emoji icon, name, description, price in euros
- Add to cart button with quantity
- Cart badge in app bar
Items should be realistic for a ${data.type} business.
Use ConsumerStatefulWidget with Riverpod for cart state.`,

    5: `Generate app_router.dart using go_router with ShellRoute and bottom NavigationBar.
Routes: / (home), /menu (menu/services), /rewards (loyalty), /profile.
Include animated page transitions.
Also generate a simple rewards_screen.dart with:
- Points balance display
- Daily check-in button (+100 points)
- Rewards catalog with claim buttons
- Progress bar to next tier`,
  };

  return steps[step] || steps[1];
}

function step_filename_from_prompt(prompt: string): string {
  if (prompt.includes('main.dart')) return 'main.dart';
  if (prompt.includes('app_theme')) return 'theme/app_theme.dart';
  if (prompt.includes('home_screen')) return 'screens/home_screen.dart';
  if (prompt.includes('menu_screen')) return 'screens/menu_screen.dart';
  if (prompt.includes('app_router')) return 'core/router/app_router.dart';
  return 'generated.dart';
}

function parseCodeResponse(content: string, fallbackFilename: string): { filename: string; code: string } {
  const filenameMatch = content.match(/FILENAME:\s*(.+\.dart)/);
  const filename = filenameMatch ? filenameMatch[1].trim() : fallbackFilename;

  let code = content
    .replace(/FILENAME:\s*.+\.dart\n?/, '')
    .replace(/```dart\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // If the AI returned nothing useful, use fallback
  if (code.length < 50) {
    return { filename: fallbackFilename, code: `// AI generation returned minimal output\n// Falling back to template code\n\n${code}` };
  }

  return { filename, code };
}

// ============================================
// HIGH-QUALITY MOCK GENERATION (NO API KEY)
// ============================================
function generateMockCode(data: BusinessFormData, step: number): GenerationResult {
  const name = data.name || 'MyBusiness';
  const cls = name.replace(/[^a-zA-Z0-9]/g, '');
  const color = data.primaryColor || '#22c55e';
  const hex = color.replace('#', '');
  const features = (data.features || 'Menu\nReservations\nLoyalty\nContact').split('\n').filter(f => f.trim());
  const desc = data.description || 'Discover our services';

  const files: Record<number, { filename: string; code: string }> = {
    1: {
      filename: 'main.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUIOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(
    const ProviderScope(
      child: ${cls}App(),
    ),
  );
}

class ${cls}App extends ConsumerWidget {
  const ${cls}App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final isDarkMode = ref.watch(themeNotifierProvider);
    
    return MaterialApp.router(
      title: '${name}',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      routerConfig: router,
    );
  }
}

final themeNotifierProvider = StateProvider<bool>((ref) => true);`,
    },
    2: {
      filename: 'core/theme/app_theme.dart',
      code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const _primaryColor = Color(0xFF${hex});
  static const _darkBg = Color(0xFF0A0A0F);
  static const _darkCard = Color(0xFF14141F);

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: _primaryColor,
      secondary: _primaryColor.withValues(alpha: 0.7),
      surface: _darkCard,
    ),
    scaffoldBackgroundColor: _darkBg,
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: _darkBg,
      elevation: 0,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
    ),
    cardTheme: CardThemeData(
      color: _darkCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
      ),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: _darkCard,
      selectedItemColor: _primaryColor,
      unselectedItemColor: Colors.grey[600],
    ),
  );

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: _primaryColor,
      surface: Colors.white,
    ),
    scaffoldBackgroundColor: const Color(0xFFF5F7FA),
    textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
    ),
  );
}`,
    },
    3: {
      filename: 'features/home/home_screen.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeController,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Welcome to',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[400],
                                )),
                              Text('${name}',
                                style: theme.textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                )),
                            ],
                          ),
                          // Notification + Avatar
                          Row(
                            children: [
                              Stack(
                                children: [
                                  IconButton(
                                    onPressed: () {},
                                    icon: const Icon(Icons.notifications_outlined),
                                  ),
                                  Positioned(
                                    right: 8, top: 8,
                                    child: Container(
                                      width: 8, height: 8,
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.primary,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              CircleAvatar(
                                backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.15),
                                child: Icon(Icons.person, color: theme.colorScheme.primary),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      
                      // Hero Card
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              theme.colorScheme.primary.withValues(alpha: 0.15),
                              theme.colorScheme.primary.withValues(alpha: 0.05),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: theme.colorScheme.primary.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Welcome! 👋',
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              )),
                            const SizedBox(height: 8),
                            Text('${desc}',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[400],
                              )),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.explore, size: 18),
                              label: const Text('Explore Now'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),
                      
                      // Quick Actions
                      Text('Quick Actions',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        )),
                      const SizedBox(height: 12),
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 1.4,
                        children: [
${features.slice(0, 4).map((f, i) => {
  const icons = ['Icons.menu_book_rounded', 'Icons.calendar_today_rounded', 'Icons.card_giftcard_rounded', 'Icons.place_rounded'];
  return `                          _QuickAction(
                            icon: ${icons[i] || 'Icons.star_rounded'},
                            label: '${f.trim()}',
                            color: theme.colorScheme.primary,
                          ),`;
}).join('\n')}
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Loyalty Section
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: theme.cardColor,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.05),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 44, height: 44,
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(Icons.emoji_events,
                                color: theme.colorScheme.primary),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('2,450 points',
                                    style: theme.textTheme.titleSmall?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    )),
                                  Text('Premium member',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: Colors.grey[500],
                                    )),
                                ],
                              ),
                            ),
                            Icon(Icons.chevron_right, color: Colors.grey[600]),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  
  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.05),
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}`,
    },
    4: {
      filename: 'features/menu/menu_screen.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Cart state
final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

class CartItem {
  final String name;
  final double price;
  final String emoji;
  int quantity;
  
  CartItem({
    required this.name,
    required this.price,
    required this.emoji,
    this.quantity = 1,
  });
}

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);
  
  void addItem(String name, double price, String emoji) {
    final existing = state.indexWhere((item) => item.name == name);
    if (existing >= 0) {
      state[existing].quantity++;
      state = [...state];
    } else {
      state = [...state, CartItem(name: name, price: price, emoji: emoji)];
    }
  }
  
  void removeItem(String name) {
    state = state.where((item) => item.name != name).toList();
  }
  
  double get total => state.fold(0, (sum, item) => sum + item.price * item.quantity);
  int get itemCount => state.fold(0, (sum, item) => sum + item.quantity);
}

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key});
  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {
  String _selectedCategory = 'All';
  final _searchController = TextEditingController();

  final List<Map<String, dynamic>> _items = [
    {'name': 'Special Today', 'price': 8.50, 'cat': 'Popular', 'emoji': '⭐', 'desc': 'Our daily special'},
    {'name': 'Classic', 'price': 6.00, 'cat': 'Popular', 'emoji': '☕', 'desc': 'Timeless favorite'},
    {'name': 'Premium', 'price': 12.00, 'cat': 'Premium', 'emoji': '✨', 'desc': 'Top quality'},
    {'name': 'Budget Friendly', 'price': 4.50, 'cat': 'Deals', 'emoji': '💰', 'desc': 'Great value'},
    {'name': 'Seasonal', 'price': 9.00, 'cat': 'New', 'emoji': '🌟', 'desc': 'Limited edition'},
    {'name': 'House Special', 'price': 15.00, 'cat': 'Premium', 'emoji': '👑', 'desc': 'Chef\\'s choice'},
  ];

  List<Map<String, dynamic>> get _filtered {
    var items = _items;
    if (_selectedCategory != 'All') {
      items = items.where((i) => i['cat'] == _selectedCategory).toList();
    }
    if (_searchController.text.isNotEmpty) {
      items = items.where((i) => i['name'].toString().toLowerCase()
          .contains(_searchController.text.toLowerCase())).toList();
    }
    return items;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cart = ref.watch(cartProvider);
    final cartCount = cart.fold<int>(0, (sum, item) => sum + item.quantity);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Menu'),
        actions: [
          Stack(
            children: [
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.shopping_cart_outlined),
              ),
              if (cartCount > 0)
                Positioned(
                  right: 6, top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Text('$cartCount',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Search
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search, size: 20),
                    hintText: 'Search menu...',
                    filled: true,
                    fillColor: theme.cardColor,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
            ),
            // Categories
            SliverToBoxAdapter(
              child: SizedBox(
                height: 40,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: ['All', 'Popular', 'New', 'Premium', 'Deals'].map((cat) {
                    final isSelected = cat == _selectedCategory;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(cat),
                        selected: isSelected,
                        onSelected: (_) => setState(() => _selectedCategory = cat),
                        selectedColor: theme.colorScheme.primary.withValues(alpha: 0.15),
                        checkmarkColor: theme.colorScheme.primary,
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            // Items
            SliverPadding(
              padding: const EdgeInsets.all(20),
              sliver: SliverList.builder(
                itemCount: _filtered.length,
                itemBuilder: (context, index) {
                  final item = _filtered[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: theme.cardColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.05),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 52, height: 52,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(
                            child: Text(item['emoji'],
                              style: const TextStyle(fontSize: 24)),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'],
                                style: const TextStyle(fontWeight: FontWeight.w600)),
                              const SizedBox(height: 2),
                              Text(item['desc'],
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[500],
                                )),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('€\${item["price"].toStringAsFixed(2)}',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: theme.colorScheme.primary,
                              )),
                            const SizedBox(height: 6),
                            SizedBox(
                              height: 32,
                              child: ElevatedButton(
                                onPressed: () {
                                  ref.read(cartProvider.notifier).addItem(
                                    item['name'], item['price'], item['emoji']);
                                },
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  textStyle: const TextStyle(fontSize: 11),
                                ),
                                child: const Text('+ Add'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
    },
    5: {
      filename: 'core/router/app_router.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/home_screen.dart';
import '../../features/menu/menu_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: (_, __) => const NoTransitionPage(child: HomeScreen()),
          ),
          GoRoute(
            path: '/menu',
            pageBuilder: (_, __) => const NoTransitionPage(child: MenuScreen()),
          ),
          GoRoute(
            path: '/rewards',
            pageBuilder: (_, __) => const NoTransitionPage(child: RewardsScreen()),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (_, __) => const NoTransitionPage(child: ProfileScreen()),
          ),
        ],
      ),
    ],
  );
});

class AppShell extends StatefulWidget {
  final Widget child;
  const AppShell({super.key, required this.child});
  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;
  static const _routes = ['/', '/menu', '/rewards', '/profile'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) {
          setState(() => _index = i);
          if (i < _routes.length) context.go(_routes[i]);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Menu',
          ),
          NavigationDestination(
            icon: Icon(Icons.card_giftcard_outlined),
            selectedIcon: Icon(Icons.card_giftcard),
            label: 'Rewards',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outlined),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

// ============================================
// REWARDS SCREEN
// ============================================
class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});
  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  int _points = 2450;
  bool _checkedIn = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Rewards')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Points Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary.withValues(alpha: 0.2),
                    theme.colorScheme.primary.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  Text('Your Points', style: theme.textTheme.bodyMedium),
                  const SizedBox(height: 8),
                  Text('$_points',
                    style: theme.textTheme.displaySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    )),
                  const SizedBox(height: 12),
                  LinearProgressIndicator(
                    value: _points / 5000,
                    backgroundColor: Colors.white.withValues(alpha: 0.1),
                    valueColor: AlwaysStoppedAnimation(theme.colorScheme.primary),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  const SizedBox(height: 8),
                  Text('\${5000 - _points} points to Gold tier',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.grey[500],
                    )),
                ],
              ),
            ),
            const SizedBox(height: 20),
            
            // Daily Check-in
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _checkedIn ? null : () {
                  setState(() {
                    _points += 100;
                    _checkedIn = true;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('+100 points! Daily check-in complete')),
                  );
                },
                icon: Icon(_checkedIn ? Icons.check : Icons.today),
                label: Text(_checkedIn ? 'Checked in today ✓' : 'Daily Check-in (+100 pts)'),
              ),
            ),
            const SizedBox(height: 28),
            
            // Rewards Catalog
            Text('Rewards', style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            )),
            const SizedBox(height: 12),
            ...[
              {'name': 'Free Coffee', 'points': 500, 'emoji': '☕'},
              {'name': '10% Discount', 'points': 1000, 'emoji': '🏷️'},
              {'name': 'VIP Treatment', 'points': 2500, 'emoji': '👑'},
              {'name': 'Free Month', 'points': 5000, 'emoji': '🎉'},
            ].map((reward) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.cardColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Text(reward['emoji'] as String, style: const TextStyle(fontSize: 28)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(reward['name'] as String,
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                        Text('\${reward["points"]} points',
                          style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _points >= (reward['points'] as int) ? () {
                      setState(() => _points -= (reward['points'] as int));
                    } : null,
                    child: const Text('Claim'),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}

// ============================================
// PROFILE SCREEN
// ============================================
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            CircleAvatar(
              radius: 45,
              backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.15),
              child: Icon(Icons.person, size: 40, color: theme.colorScheme.primary),
            ),
            const SizedBox(height: 16),
            Text('John Doe', style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold)),
            Text('Premium Member', style: TextStyle(color: theme.colorScheme.primary)),
            const SizedBox(height: 24),
            ...['Notifications', 'Privacy', 'Help & Support', 'About', 'Sign Out'].map(
              (item) => ListTile(
                title: Text(item),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
    },
  };

  const file = files[step] || files[1];
  return { ...file, tokensUsed: 0 };
}

// ============================================
// VALIDATE API KEY
// ============================================
export async function validateApiKey(
  provider: AIProvider, 
  key: string
): Promise<{ valid: boolean; error?: string; model?: string }> {
  try {
    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Say "ok"' }],
          max_tokens: 5,
        }),
      });
      
      if (res.ok) {
        const json = await res.json();
        return { valid: true, model: json.model || 'llama-3.3-70b-versatile' };
      }
      
      const errorBody = await res.text().catch(() => '');
      let errorMsg = `Status ${res.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMsg = errorJson.error?.message || errorMsg;
      } catch { /* ignore parse errors */ }
      
      return { valid: false, error: errorMsg };
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: 'Say "ok"' }],
          max_tokens: 5,
        }),
      });
      return { valid: res.ok, error: res.ok ? undefined : `Status ${res.status}` };
    }

    // OpenAI / Grok
    const url = API_URLS[provider];
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODELS[provider],
        messages: [{ role: 'user', content: 'Say "ok"' }],
        max_tokens: 5,
      }),
    });
    return { valid: res.ok, error: res.ok ? undefined : `Status ${res.status}` };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}
