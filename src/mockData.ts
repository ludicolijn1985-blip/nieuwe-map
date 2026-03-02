import { BusinessFormData, LogEntry, ROIData } from './types';

export const businessTypes = [
  'Autowasstraat',
  'Bakkerij',
  'Barbershop',
  'Bloemist',
  'Boekhandel',
  'Café/Restaurant',
  'Fietsenmaker',
  'Fotostudio',
  'Huisartsenpraktijk',
  'IJssalon',
  'Kapsalon',
  'Kledingwinkel',
  'Massage salon',
  'Nagelstudio',
  'Pet grooming',
  'Sportschool/Fitness',
  'Sushi takeaway',
  'Tattoo shop',
  'Trimsalon',
  'Wijnbar',
  'Yoga/Pilates studio',
  'Yoga studio',
];

const roiMap: Record<string, { min: number; max: number; complexity: 'Easy' | 'Medium' | 'Advanced' }> = {
  'Autowasstraat': { min: 18, max: 28, complexity: 'Easy' },
  'Bakkerij': { min: 20, max: 32, complexity: 'Easy' },
  'Barbershop': { min: 24, max: 36, complexity: 'Easy' },
  'Bloemist': { min: 19, max: 30, complexity: 'Easy' },
  'Boekhandel': { min: 16, max: 26, complexity: 'Medium' },
  'Café/Restaurant': { min: 22, max: 35, complexity: 'Medium' },
  'Fietsenmaker': { min: 17, max: 27, complexity: 'Easy' },
  'Fotostudio': { min: 21, max: 33, complexity: 'Medium' },
  'Huisartsenpraktijk': { min: 18, max: 28, complexity: 'Advanced' },
  'IJssalon': { min: 23, max: 35, complexity: 'Easy' },
  'Kapsalon': { min: 25, max: 38, complexity: 'Easy' },
  'Kledingwinkel': { min: 20, max: 32, complexity: 'Medium' },
  'Massage salon': { min: 24, max: 36, complexity: 'Easy' },
  'Nagelstudio': { min: 26, max: 40, complexity: 'Easy' },
  'Pet grooming': { min: 22, max: 34, complexity: 'Easy' },
  'Sportschool/Fitness': { min: 28, max: 42, complexity: 'Medium' },
  'Sushi takeaway': { min: 25, max: 38, complexity: 'Medium' },
  'Tattoo shop': { min: 20, max: 32, complexity: 'Medium' },
  'Trimsalon': { min: 21, max: 33, complexity: 'Easy' },
  'Wijnbar': { min: 22, max: 34, complexity: 'Medium' },
  'Yoga/Pilates studio': { min: 26, max: 40, complexity: 'Easy' },
  'Yoga studio': { min: 25, max: 38, complexity: 'Easy' },
};

export function generateROI(data: BusinessFormData): ROIData {
  const info = roiMap[data.type] || { min: 18, max: 35, complexity: 'Medium' as const };
  const buildMin = info.complexity === 'Easy' ? 4 : info.complexity === 'Medium' ? 5 : 7;
  const buildMax = info.complexity === 'Easy' ? 6 : info.complexity === 'Medium' ? 8 : 10;

  return {
    revenueBoostMin: info.min,
    revenueBoostMax: info.max,
    buildTimeMin: buildMin,
    buildTimeMax: buildMax,
    complexity: info.complexity,
    monthlyPrice: 29,
    paybackWeeks: 3,
  };
}

export function generateLogSteps(data: BusinessFormData): Omit<LogEntry, 'status' | 'duration'>[] {
  const name = data.name || 'your business';
  const type = data.type || 'business';
  const city = data.city || 'local area';

  const typeLabel = type.toLowerCase();
  const menuLabel =
    ['Café/Restaurant', 'Bakkerij', 'IJssalon', 'Sushi takeaway', 'Wijnbar'].includes(type) ? 'menu & ordering' :
    ['Kapsalon', 'Barbershop', 'Nagelstudio', 'Massage salon', 'Tattoo shop'].includes(type) ? 'booking & services' :
    ['Sportschool/Fitness', 'Yoga/Pilates studio', 'Yoga studio'].includes(type) ? 'class schedule & membership' :
    ['Huisartsenpraktijk'].includes(type) ? 'appointment booking' :
    ['Pet grooming', 'Trimsalon'].includes(type) ? 'booking & pet services' :
    ['Autowasstraat'].includes(type) ? 'wash packages & booking' :
    ['Fotostudio'].includes(type) ? 'portfolio & booking' :
    'product catalog';

  return [
    { step: 1, total: 9, message: `Analysing your ${typeLabel} "${name}"...`, detail: `Scanning business profile, industry benchmarks, and ${city} market data`, timestamp: '' },
    { step: 2, total: 9, message: `Scanning ${city} market competitors & trends...`, detail: 'Identifying top 5 competitors, pricing strategies, and feature gaps', timestamp: '' },
    { step: 3, total: 9, message: `Designing main screen with brand colors...`, detail: `Applying color scheme ${data.primaryColor} • Creating responsive layout grid`, timestamp: '' },
    { step: 4, total: 9, message: `Building navigation & menu system...`, detail: 'Generating bottom navigation, side menu, routing architecture', timestamp: '' },
    { step: 5, total: 9, message: `Creating ${menuLabel} screen...`, detail: `Rendering ${typeLabel}-specific UI components with animations`, timestamp: '' },
    { step: 6, total: 9, message: `Integrating loyalty rewards system...`, detail: 'Points engine, tier system, rewards catalog, push notification triggers', timestamp: '' },
    { step: 7, total: 9, message: `Setting up push notifications & analytics...`, detail: 'Firebase Cloud Messaging, event tracking, A/B testing framework', timestamp: '' },
    { step: 8, total: 9, message: `Generating Flutter source code & assets...`, detail: 'Writing 5 Dart files, SVG assets, theme config, pubspec.yaml', timestamp: '' },
    { step: 9, total: 9, message: `Final optimisation & quality check complete ✓`, detail: 'Code linting passed • Performance score: 98/100 • Accessibility: AA', timestamp: '' },
  ];
}

export function generateFlutterCode(data: BusinessFormData): { filename: string; code: string }[] {
  const name = data.name || 'MyBusiness';
  const className = name.replace(/[^a-zA-Z0-9]/g, '');
  const color = data.primaryColor || '#22c55e';

  return [
    {
      filename: 'main.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: ${className}App(),
    ),
  );
}

class ${className}App extends StatelessWidget {
  const ${className}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${name}',
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}`
    },
    {
      filename: 'theme/app_theme.dart',
      code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const primaryColor = Color(0xFF${color.replace('#', '')});
  static const backgroundColor = Color(0xFF0A0A0F);
  static const cardColor = Color(0xFF14141F);
  static const surfaceColor = Color(0xFF1A1A28);

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: primaryColor,
    scaffoldBackgroundColor: backgroundColor,
    cardColor: cardColor,
    colorScheme: ColorScheme.dark(
      primary: primaryColor,
      surface: cardColor,
      onSurface: Colors.white,
    ),
    textTheme: GoogleFonts.interTextTheme(
      ThemeData.dark().textTheme,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: backgroundColor,
      elevation: 0,
      centerTitle: true,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: cardColor,
      selectedItemColor: primaryColor,
      unselectedItemColor: Colors.grey,
    ),
  );
}`
    },
    {
      filename: 'screens/home_screen.dart',
      code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../widgets/feature_grid.dart';
import '../widgets/bottom_nav.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() =>
      _HomeScreenState();
}

class _HomeScreenState
    extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _controller,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome to',
                          style: TextStyle(
                            color: Colors.grey[400],
                            fontSize: 14,
                          ),
                        ),
                        const Text(
                          '${name}',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    CircleAvatar(
                      backgroundColor:
                          AppTheme.primaryColor,
                      child: const Icon(Icons.person),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Hero Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppTheme.primaryColor
                            .withValues(alpha: 0.15),
                        AppTheme.primaryColor
                            .withValues(alpha: 0.05),
                      ],
                    ),
                    borderRadius:
                        BorderRadius.circular(20),
                    border: Border.all(
                      color: AppTheme.primaryColor
                          .withValues(alpha: 0.2),
                    ),
                  ),
                  child: const Column(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome! 👋',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Explore our services',
                        style: TextStyle(
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const FeatureGrid(),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNav(
        currentIndex: _currentIndex,
        onTap: (i) =>
            setState(() => _currentIndex = i),
      ),
    );
  }
}`
    },
    {
      filename: 'widgets/feature_grid.dart',
      code: `import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class FeatureGrid extends StatelessWidget {
  const FeatureGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final features = [
${(data.features || 'Menu\nReservations\nLoyalty\nContact').split('\n').filter(f => f.trim()).map(f => `      '${f.trim()}'`).join(',\n')}
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics:
          const NeverScrollableScrollPhysics(),
      gridDelegate:
          const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.5,
      ),
      itemCount: features.length,
      itemBuilder: (context, index) {
        return Container(
          decoration: BoxDecoration(
            color: AppTheme.cardColor,
            borderRadius:
                BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white
                  .withValues(alpha: 0.05),
            ),
          ),
          child: InkWell(
            borderRadius:
                BorderRadius.circular(16),
            onTap: () {},
            child: Center(
              child: Text(
                features[index],
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}`
    },
    {
      filename: 'widgets/bottom_nav.dart',
      code: `import 'package:flutter/material.dart';

class BottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.fixed,
      backgroundColor: const Color(0xFF14141F),
      selectedItemColor:
          Theme.of(context).primaryColor,
      unselectedItemColor: Colors.grey[600],
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_rounded),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.search_rounded),
          label: 'Explore',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.favorite_rounded),
          label: 'Rewards',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_rounded),
          label: 'Profile',
        ),
      ],
    );
  }
}`
    }
  ];
}
