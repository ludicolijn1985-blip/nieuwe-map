/**
 * AI Agent Integration
 * 
 * Connects to user-provided API keys for real code generation.
 * Supports: OpenAI (GPT-4/5), Anthropic (Claude), xAI (Grok)
 * Falls back to high-quality mock generation when no key is available.
 */

import type { BusinessFormData } from '../types';

export type AIProvider = 'openai' | 'anthropic' | 'grok';

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
};

const API_URLS: Record<AIProvider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  grok: 'https://api.x.ai/v1/chat/completions',
};

// ============================================
// MAIN GENERATION FUNCTION
// ============================================
export async function generateWithAI(
  config: AIConfig | null,
  data: BusinessFormData,
  step: number,
  onStream?: (chunk: string) => void
): Promise<GenerationResult> {
  // If no API key, use high-quality mock
  if (!config || !config.apiKey) {
    return generateMockCode(data, step);
  }

  try {
    const prompt = buildPrompt(data, step);
    const result = await callAI(config, prompt, onStream);
    return result;
  } catch (error) {
    console.warn('AI call failed, falling back to mock:', error);
    return generateMockCode(data, step);
  }
}

// ============================================
// AI API CALLS
// ============================================
async function callAI(
  config: AIConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<GenerationResult> {
  const model = config.model || MODELS[config.provider];
  const url = API_URLS[config.provider];

  if (config.provider === 'anthropic') {
    return callAnthropic(config.apiKey, model, prompt, onStream);
  }

  // OpenAI / Grok (same API format)
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
      stream: !!onStream,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  if (onStream && response.body) {
    return streamResponse(response.body, onStream);
  }

  const json = await response.json();
  const content = json.choices[0].message.content;
  const parsed = parseCodeResponse(content);

  return {
    ...parsed,
    tokensUsed: json.usage?.total_tokens || 0,
  };
}

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  onStream?: (chunk: string) => void
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
      stream: !!onStream,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  if (onStream && response.body) {
    return streamResponse(response.body, onStream);
  }

  const json = await response.json();
  const content = json.content[0].text;
  const parsed = parseCodeResponse(content);

  return {
    ...parsed,
    tokensUsed: json.usage?.input_tokens + json.usage?.output_tokens || 0,
  };
}

async function streamResponse(
  body: ReadableStream<Uint8Array>,
  onStream: (chunk: string) => void
): Promise<GenerationResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content ||
                       json.delta?.text || '';
        if (content) {
          fullContent += content;
          onStream(content);
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }

  const parsed = parseCodeResponse(fullContent);
  return { ...parsed, tokensUsed: 0 };
}

// ============================================
// PROMPT ENGINEERING
// ============================================
const SYSTEM_PROMPT = `You are an expert Flutter/Dart developer. Generate production-ready Flutter code using:
- Flutter 3.24+ with Dart 3.5
- Clean Architecture pattern
- Riverpod 2.5 for state management
- Material 3 design
- Proper null safety
- go_router for navigation

Output format: Start with FILENAME: followed by the filename, then the complete Dart code.
Only output code, no explanations.`;

function buildPrompt(data: BusinessFormData, step: number): string {
  const steps: Record<number, string> = {
    1: `Generate main.dart for a ${data.type} app called "${data.name}" in ${data.city}. 
        Use MaterialApp.router with GoRouter, Riverpod ProviderScope, and theme with primary color ${data.primaryColor}.`,
    2: `Generate app_theme.dart with Material 3 theming. Primary: ${data.primaryColor}, Secondary: ${data.secondaryColor}. 
        Include light and dark themes, custom text styles with Google Fonts (Inter), and component themes.`,
    3: `Generate home_screen.dart for a ${data.type}. Include:
        - Welcome header with business name "${data.name}"
        - Hero promotional card
        - Quick action grid for: ${data.features || 'Menu, Booking, Rewards, Contact'}
        - Loyalty points display
        Use ConsumerStatefulWidget with animations.`,
    4: `Generate the menu/services screen for a ${data.type} called "${data.name}". 
        Include category filters, item cards with images/prices, add to cart functionality, and search.
        ${data.description ? `Business description: ${data.description}` : ''}`,
    5: `Generate bottom_navigation.dart and app_router.dart with go_router. 
        Routes: /, /menu, /rewards, /profile, /cart. 
        Include animated bottom nav bar with 4 tabs.`,
  };

  return steps[step] || steps[1];
}

function parseCodeResponse(content: string): { filename: string; code: string } {
  const filenameMatch = content.match(/FILENAME:\s*(.+\.dart)/);
  const filename = filenameMatch ? filenameMatch[1].trim() : 'generated.dart';

  // Extract code (remove FILENAME line and any markdown)
  let code = content
    .replace(/FILENAME:\s*.+\.dart\n?/, '')
    .replace(/```dart\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

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

  const files: Record<number, { filename: string; code: string }> = {
    1: {
      filename: 'lib/main.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUIOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  
  // Lock orientation to portrait
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

// Theme state management
final themeNotifierProvider = StateProvider<bool>((ref) => true);`,
    },
    2: {
      filename: 'lib/core/theme/app_theme.dart',
      code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const _primaryColor = Color(0xFF${hex});
  static const _darkBg = Color(0xFF0A0A0F);
  static const _darkCard = Color(0xFF14141F);
  static const _darkSurface = Color(0xFF1A1A28);

  // ===== DARK THEME =====
  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: _primaryColor,
      secondary: _primaryColor.withValues(alpha: 0.7),
      surface: _darkCard,
      onSurface: Colors.white,
      outline: Colors.white.withValues(alpha: 0.1),
    ),
    scaffoldBackgroundColor: _darkBg,
    cardColor: _darkCard,
    
    // Typography
    textTheme: GoogleFonts.interTextTheme(
      ThemeData.dark().textTheme,
    ).copyWith(
      headlineLarge: GoogleFonts.inter(
        fontSize: 28,
        fontWeight: FontWeight.w800,
        color: Colors.white,
      ),
      headlineMedium: GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
      titleLarge: GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        color: Colors.white.withValues(alpha: 0.8),
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: Colors.white.withValues(alpha: 0.6),
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: Colors.white.withValues(alpha: 0.4),
        letterSpacing: 0.5,
      ),
    ),
    
    // App Bar
    appBarTheme: AppBarTheme(
      backgroundColor: _darkBg,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
    ),
    
    // Bottom Nav
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: _darkCard,
      selectedItemColor: _primaryColor,
      unselectedItemColor: Colors.grey[600],
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
    
    // Cards
    cardTheme: CardThemeData(
      color: _darkCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Colors.white.withValues(alpha: 0.05),
        ),
      ),
    ),
    
    // Elevated Buttons
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(
          horizontal: 24, vertical: 14,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    
    // Input Decoration
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: _darkSurface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: _primaryColor, width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16, vertical: 14,
      ),
      hintStyle: TextStyle(
        color: Colors.white.withValues(alpha: 0.25),
      ),
    ),
    
    // Chips
    chipTheme: ChipThemeData(
      backgroundColor: _darkSurface,
      selectedColor: _primaryColor.withValues(alpha: 0.15),
      labelStyle: GoogleFonts.inter(fontSize: 13),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
    ),
    
    // Divider
    dividerTheme: DividerThemeData(
      color: Colors.white.withValues(alpha: 0.05),
      thickness: 1,
    ),
  );

  // ===== LIGHT THEME =====
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: _primaryColor,
      secondary: _primaryColor.withValues(alpha: 0.7),
      surface: Colors.white,
      onSurface: const Color(0xFF1A1A2E),
    ),
    scaffoldBackgroundColor: const Color(0xFFF5F7FA),
    textTheme: GoogleFonts.interTextTheme(
      ThemeData.light().textTheme,
    ),
  );
}`,
    },
    3: {
      filename: 'lib/features/home/home_screen.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/feature_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));

    _fadeController.forward();
    _slideController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: CustomScrollView(
              slivers: [
                // Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome to',
                              style: theme.textTheme.bodyMedium,
                            ),
                            Text(
                              '${name}',
                              style: theme.textTheme.headlineMedium,
                            ),
                          ],
                        ),
                        // Notification bell + avatar
                        Row(
                          children: [
                            IconButton(
                              onPressed: () {},
                              icon: Badge(
                                smallSize: 8,
                                child: Icon(
                                  Icons.notifications_outlined,
                                  color: theme.colorScheme.onSurface
                                      .withValues(alpha: 0.5),
                                ),
                              ),
                            ),
                            const SizedBox(width: 4),
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: theme.colorScheme.primary
                                  .withValues(alpha: 0.15),
                              child: Icon(
                                Icons.person,
                                color: theme.colorScheme.primary,
                                size: 20,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Hero Card
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
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
                          Text(
                            'Welcome! 👋',
                            style: theme.textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${data.description || 'Discover our services and earn rewards with every visit.'}',
                            style: theme.textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.explore, size: 18),
                            label: const Text('Explore Now'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                // Section Title
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                    child: Text(
                      'Quick Actions',
                      style: theme.textTheme.labelSmall?.copyWith(
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ),
                
                // Feature Grid
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverGrid.count(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.4,
                    children: [
${features.slice(0, 4).map((f, i) => {
  const icons = ['Icons.menu_book', 'Icons.calendar_today', 'Icons.card_giftcard', 'Icons.place'];
  const colors = ['Colors.blue', 'Colors.orange', 'Colors.purple', 'Colors.teal'];
  return `                      FeatureCard(
                        icon: ${icons[i] || 'Icons.star'},
                        label: '${f.trim()}',
                        color: ${colors[i] || 'Colors.grey'},
                        onTap: () {},
                      ),`;
}).join('\n')}
                    ],
                  ),
                ),
                
                // Loyalty Card
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: theme.cardColor,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: theme.colorScheme.outline,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.amber.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Text('🏆', style: TextStyle(fontSize: 24)),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '2,450 Points',
                                  style: theme.textTheme.titleLarge,
                                ),
                                Text(
                                  'Premium Member • 50 pts to next reward',
                                  style: theme.textTheme.bodyMedium,
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.chevron_right,
                            color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                // Bottom spacing for nav bar
                const SliverToBoxAdapter(
                  child: SizedBox(height: 100),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}`,
    },
    4: {
      filename: 'lib/features/menu/menu_screen.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/providers/cart_provider.dart';

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key});

  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {
  String _selectedCategory = 'All';
  final _searchController = TextEditingController();

  final List<Map<String, dynamic>> _items = [
    {'name': 'Special Today', 'price': 8.50, 'category': 'Popular', 'emoji': '⭐'},
    {'name': 'Classic', 'price': 6.00, 'category': 'Popular', 'emoji': '☕'},
    {'name': 'Premium', 'price': 12.00, 'category': 'Premium', 'emoji': '✨'},
    {'name': 'Budget', 'price': 4.50, 'category': 'Deals', 'emoji': '💰'},
    {'name': 'Seasonal', 'price': 9.00, 'category': 'New', 'emoji': '🌟'},
    {'name': 'House Special', 'price': 15.00, 'category': 'Premium', 'emoji': '👑'},
  ];

  final List<String> _categories = ['All', 'Popular', 'New', 'Premium', 'Deals'];

  List<Map<String, dynamic>> get _filteredItems {
    var items = _items;
    if (_selectedCategory != 'All') {
      items = items.where((i) => i['category'] == _selectedCategory).toList();
    }
    if (_searchController.text.isNotEmpty) {
      items = items
          .where((i) => i['name']
              .toString()
              .toLowerCase()
              .contains(_searchController.text.toLowerCase()))
          .toList();
    }
    return items;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cart = ref.watch(cartProvider);

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Menu', style: theme.textTheme.headlineMedium),
                    Badge(
                      label: Text('\${cart.length}'),
                      isLabelVisible: cart.isNotEmpty,
                      child: IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.shopping_bag_outlined),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Search bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search, size: 20),
                    hintText: 'Search menu...',
                  ),
                ),
              ),
            ),

            // Categories
            SliverToBoxAdapter(
              child: SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = cat == _selectedCategory;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(cat),
                        selected: isSelected,
                        onSelected: (_) => setState(() {
                          _selectedCategory = cat;
                        }),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Items list
            SliverPadding(
              padding: const EdgeInsets.all(20),
              sliver: SliverList.builder(
                itemCount: _filteredItems.length,
                itemBuilder: (context, index) {
                  final item = _filteredItems[index];
                  return _MenuItemCard(
                    item: item,
                    onAdd: () {
                      ref.read(cartProvider.notifier).addItem(item);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('\${item['name']} added to cart'),
                          duration: const Duration(seconds: 1),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItemCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onAdd;

  const _MenuItemCard({required this.item, required this.onAdd});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.outline),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(
                item['emoji'] ?? '📦',
                style: const TextStyle(fontSize: 24),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item['category'],
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '€\${item['price'].toStringAsFixed(2)}',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 4),
              SizedBox(
                height: 32,
                child: ElevatedButton(
                  onPressed: onAdd,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    textStyle: const TextStyle(fontSize: 12),
                  ),
                  child: const Text('+ Add'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}`,
    },
    5: {
      filename: 'lib/core/router/app_router.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/home_screen.dart';
import '../../features/menu/menu_screen.dart';
import '../../features/rewards/rewards_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../shared/widgets/app_scaffold.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      ShellRoute(
        builder: (context, state, child) {
          return AppScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/menu',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: MenuScreen(),
            ),
          ),
          GoRoute(
            path: '/rewards',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: RewardsScreen(),
            ),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),
    ],
  );
});

class AppScaffold extends StatefulWidget {
  final Widget child;
  const AppScaffold({super.key, required this.child});

  @override
  State<AppScaffold> createState() => _AppScaffoldState();
}

class _AppScaffoldState extends State<AppScaffold> {
  int _currentIndex = 0;

  static const _routes = ['/', '/menu', '/rewards', '/profile'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
          context.go(_routes[index]);
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
}`,
    },
  };

  const file = files[step] || files[1];
  return { ...file, tokensUsed: 0 };
}

// ============================================
// VALIDATE API KEY
// ============================================
export async function validateApiKey(provider: AIProvider, key: string): Promise<{ valid: boolean; error?: string }> {
  try {
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
