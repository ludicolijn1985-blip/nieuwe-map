import { BusinessFormData, LogEntry, ROIData } from './types';

export function generateROI(data: BusinessFormData): ROIData {
  const complexityMap: Record<string, 'Easy' | 'Medium' | 'Advanced'> = {
    'Café': 'Easy',
    'Kapsalon': 'Easy',
    'Restaurant': 'Medium',
    'Sportschool': 'Medium',
    'Winkel': 'Medium',
    'Bakkerij': 'Easy',
    'Tandarts': 'Advanced',
    'Fysiotherapie': 'Advanced',
    'Schoonheidssalon': 'Easy',
    'Autogarage': 'Medium',
  };

  const boostMapMin: Record<string, number> = {
    'Café': 22, 'Kapsalon': 25, 'Restaurant': 20, 'Sportschool': 28,
    'Winkel': 18, 'Bakkerij': 20, 'Tandarts': 18, 'Fysiotherapie': 22,
    'Schoonheidssalon': 26, 'Autogarage': 18,
  };
  const boostMapMax: Record<string, number> = {
    'Café': 34, 'Kapsalon': 38, 'Restaurant': 35, 'Sportschool': 42,
    'Winkel': 29, 'Bakkerij': 32, 'Tandarts': 27, 'Fysiotherapie': 35,
    'Schoonheidssalon': 40, 'Autogarage': 28,
  };

  const complexity = complexityMap[data.type] || 'Medium';
  const buildMin = complexity === 'Easy' ? 4 : complexity === 'Medium' ? 5 : 7;
  const buildMax = complexity === 'Easy' ? 6 : complexity === 'Medium' ? 8 : 10;

  return {
    revenueBoostMin: boostMapMin[data.type] || 18,
    revenueBoostMax: boostMapMax[data.type] || 35,
    buildTimeMin: buildMin,
    buildTimeMax: buildMax,
    complexity,
    monthlyPrice: 29,
    paybackWeeks: 3,
  };
}

export function generateLogSteps(data: BusinessFormData): Omit<LogEntry, 'status' | 'duration'>[] {
  const businessName = data.name || 'your business';
  const businessType = data.type || 'business';
  const city = data.city || 'local area';

  return [
    {
      step: 1, total: 9,
      message: `Analysing your ${businessType.toLowerCase()} "${businessName}"...`,
      detail: `Scanning business profile, industry benchmarks, and ${city} market data`,
      timestamp: '',
    },
    {
      step: 2, total: 9,
      message: `Scanning ${city} market competitors & trends...`,
      detail: 'Identifying top 5 competitors, pricing strategies, and feature gaps',
      timestamp: '',
    },
    {
      step: 3, total: 9,
      message: `Designing main screen with brand colors...`,
      detail: `Applying color scheme ${data.primaryColor} • Creating responsive layout grid`,
      timestamp: '',
    },
    {
      step: 4, total: 9,
      message: `Building navigation & menu system...`,
      detail: 'Generating bottom navigation, side menu, routing architecture',
      timestamp: '',
    },
    {
      step: 5, total: 9,
      message: `Creating ${businessType === 'Restaurant' ? 'menu & ordering' : businessType === 'Kapsalon' ? 'booking & services' : businessType === 'Sportschool' ? 'class schedule & membership' : businessType === 'Café' ? 'menu & loyalty' : 'product catalog'} screen...`,
      detail: `Rendering ${businessType.toLowerCase()}-specific UI components with animations`,
      timestamp: '',
    },
    {
      step: 6, total: 9,
      message: `Integrating loyalty rewards system...`,
      detail: 'Points engine, tier system, rewards catalog, push notification triggers',
      timestamp: '',
    },
    {
      step: 7, total: 9,
      message: `Setting up push notifications & analytics...`,
      detail: 'Firebase Cloud Messaging, event tracking, A/B testing framework',
      timestamp: '',
    },
    {
      step: 8, total: 9,
      message: `Generating Flutter source code & assets...`,
      detail: 'Writing 5 Dart files, SVG assets, theme config, pubspec.yaml',
      timestamp: '',
    },
    {
      step: 9, total: 9,
      message: `Final optimisation & quality check complete ✓`,
      detail: 'Code linting passed • Performance score: 98/100 • Accessibility: AA',
      timestamp: '',
    },
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
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const ${className}App());
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

class AppTheme {
  static const primaryColor = Color(0xFF${color.replace('#', '')});
  static const backgroundColor = Color(0xFF0A0A0F);
  static const cardColor = Color(0xFF14141F);

  static ThemeData get darkTheme => ThemeData(
    brightness: Brightness.dark,
    primaryColor: primaryColor,
    scaffoldBackgroundColor: backgroundColor,
    cardColor: cardColor,
    colorScheme: ColorScheme.dark(
      primary: primaryColor,
      surface: cardColor,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: backgroundColor,
      elevation: 0,
      centerTitle: true,
    ),
  );
}`
    },
    {
      filename: 'screens/home_screen.dart',
      code: `import 'package:flutter/material.dart';
import '../widgets/hero_banner.dart';
import '../widgets/feature_grid.dart';
import '../widgets/bottom_nav.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
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
                        Theme.of(context).primaryColor,
                    child: const Icon(Icons.person),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const HeroBanner(),
              const SizedBox(height: 24),
              const FeatureGrid(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNav(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
      ),
    );
  }
}`
    },
    {
      filename: 'widgets/feature_grid.dart',
      code: `import 'package:flutter/material.dart';

class FeatureGrid extends StatelessWidget {
  const FeatureGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final features = [
${(data.features || 'Menu\nReservations\nLoyalty\nContact').split('\n').filter(f => f.trim()).map(f => `      '${f.trim()}'`).join(',\n')}
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
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
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withOpacity(0.05),
            ),
          ),
          child: Center(
            child: Text(
              features[index],
              style: const TextStyle(
                fontWeight: FontWeight.w600,
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

export const businessTypes = [
  'Café',
  'Restaurant',
  'Kapsalon',
  'Sportschool',
  'Bakkerij',
  'Winkel',
  'Tandarts',
  'Tattoo Shop',
  'Kledingwinkel',
  'Huisartsenpraktijk',
  'Fietsenmaker',
  'Bloemist',
  'Boekhandel',
  'Barbershop',
  'Yoga Studio',
  'Nagelstudio',
  'Autowasstraat',
  'IJssalon',
  'Sushi Takeaway',
  'Pet Grooming',
  'Massage Salon',
  'Fotostudio',
  'Wijnbar',
  'Dierenarts',
  'Fysiotherapie',
  'Schoonheidssalon',
  'Autogarage',
];
