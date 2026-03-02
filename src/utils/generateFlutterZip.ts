import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BusinessFormData } from '../types';

export async function downloadFlutterProject(data: BusinessFormData, codeFiles: { filename: string; code: string }[]) {
  const zip = new JSZip();
  const projectName = toSnakeCase(data.name || 'my_business_app');
  const root = zip.folder(projectName)!;
  const className = toPascalCase(data.name || 'MyBusiness');
  const color = data.primaryColor || '#22c55e';
  const colorHex = color.replace('#', '');
  const _features = (data.features || 'Menu\nReservations\nLoyalty\nContact').split('\n').filter(f => f.trim());
  void _features;

  // ============ ROOT FILES ============
  root.file('pubspec.yaml', genPubspec(data, projectName));
  root.file('analysis_options.yaml', genAnalysisOptions());
  root.file('README.md', genReadme(data, projectName));
  root.file('.gitignore', genGitignore());
  root.file('.env.example', genEnvExample());

  // ============ LIB ============
  const lib = root.folder('lib')!;
  
  // -- main.dart
  lib.file('main.dart', `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';
import 'core/services/notification_service.dart';
import 'core/services/storage_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // System UI
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0A0A0F),
  ));

  // Initialize services
  await Firebase.initializeApp();
  await Hive.initFlutter();
  await StorageService().init();
  await NotificationService().init();

  runApp(
    const ProviderScope(
      child: ${className}App(),
    ),
  );
}
`);

  // -- app.dart
  lib.file('app.dart', `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/providers/app_provider.dart';

class ${className}App extends ConsumerWidget {
  const ${className}App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appState = ref.watch(appProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: '${data.name || 'My Business'}',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: appState.themeMode == AppThemeMode.dark
          ? ThemeMode.dark
          : appState.themeMode == AppThemeMode.light
              ? ThemeMode.light
              : ThemeMode.system,
      routerConfig: router,
    );
  }
}
`);

  // ============ CORE ============
  const core = lib.folder('core')!;

  // -- core/theme/app_theme.dart
  core.folder('theme')!.file('app_theme.dart', `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const primary = Color(0xFF${colorHex});
  static const primaryLight = Color(0xFF${lightenColor(colorHex)});
  static const primaryDark = Color(0xFF${darkenColor(colorHex)});
  
  // Dark theme
  static const darkBg = Color(0xFF0A0A0F);
  static const darkCard = Color(0xFF14141F);
  static const darkSurface = Color(0xFF1A1A28);
  static const darkBorder = Color(0xFF2A2A3D);
  
  // Light theme
  static const lightBg = Color(0xFFF8F9FC);
  static const lightCard = Color(0xFFFFFFFF);
  static const lightSurface = Color(0xFFF0F2F7);
  static const lightBorder = Color(0xFFE2E8F0);
  
  // Status
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
}

class AppTheme {
  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.darkBg,
    colorScheme: ColorScheme.dark(
      primary: AppColors.primary,
      primaryContainer: AppColors.primaryDark,
      secondary: AppColors.primaryLight,
      surface: AppColors.darkCard,
      onSurface: Colors.white,
      error: AppColors.error,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.darkBg,
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: Colors.white),
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardTheme(
      color: AppColors.darkCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.darkBorder.withValues(alpha: 0.5)),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.darkCard,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: Colors.grey,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.darkSurface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.darkBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.darkBorder.withValues(alpha: 0.5)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 0,
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    dividerTheme: DividerThemeData(color: AppColors.darkBorder.withValues(alpha: 0.3)),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AppColors.darkCard,
      contentTextStyle: const TextStyle(color: Colors.white),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      behavior: SnackBarBehavior.floating,
    ),
  );

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.lightBg,
    colorScheme: ColorScheme.light(
      primary: AppColors.primary,
      primaryContainer: AppColors.primaryLight,
      secondary: AppColors.primaryDark,
      surface: AppColors.lightCard,
      onSurface: const Color(0xFF1A1A2E),
      error: AppColors.error,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.lightBg,
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: Color(0xFF1A1A2E)),
      titleTextStyle: TextStyle(
        color: Color(0xFF1A1A2E),
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardTheme(
      color: AppColors.lightCard,
      elevation: 2,
      shadowColor: Colors.black.withValues(alpha: 0.06),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.lightBorder.withValues(alpha: 0.5)),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.lightCard,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: Colors.grey,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.lightSurface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.lightBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.lightBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 2,
      ),
    ),
    dividerTheme: DividerThemeData(color: AppColors.lightBorder.withValues(alpha: 0.5)),
  );
}
`);

  // -- core/theme/app_typography.dart
  core.folder('theme')!.file('app_typography.dart', `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  static TextStyle get heading1 => GoogleFonts.inter(
    fontSize: 32, fontWeight: FontWeight.w800, letterSpacing: -0.5,
  );
  static TextStyle get heading2 => GoogleFonts.inter(
    fontSize: 24, fontWeight: FontWeight.w700, letterSpacing: -0.3,
  );
  static TextStyle get heading3 => GoogleFonts.inter(
    fontSize: 20, fontWeight: FontWeight.w600,
  );
  static TextStyle get subtitle => GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w500, color: Colors.grey[400],
  );
  static TextStyle get body => GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w400,
  );
  static TextStyle get bodySmall => GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w400, color: Colors.grey[500],
  );
  static TextStyle get caption => GoogleFonts.inter(
    fontSize: 10, fontWeight: FontWeight.w500, letterSpacing: 0.5,
  );
  static TextStyle get button => GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w600,
  );
  static TextStyle get mono => GoogleFonts.jetBrainsMono(
    fontSize: 13, fontWeight: FontWeight.w400,
  );
}
`);

  // -- core/constants/app_constants.dart
  core.folder('constants')!.file('app_constants.dart', `class AppConstants {
  static const String appName = '${data.name || 'My Business'}';
  static const String appVersion = '1.0.0';
  static const String city = '${data.city || ''}';
  static const String businessType = '${data.type || 'Business'}';

  // API
  static const String apiBaseUrl = 'https://api.example.com/v1';
  static const Duration apiTimeout = Duration(seconds: 15);

  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  static const String onboardingKey = 'onboarding_complete';
  static const String loyaltyKey = 'loyalty_points';

  // Loyalty
  static const int pointsPerVisit = 10;
  static const int pointsPerOrder = 25;
  static const int pointsForReward = 200;
  static const int dailyCheckInPoints = 50;

  // Animation durations
  static const Duration shortAnim = Duration(milliseconds: 200);
  static const Duration mediumAnim = Duration(milliseconds: 400);
  static const Duration longAnim = Duration(milliseconds: 800);
}
`);

  // -- core/constants/app_icons.dart
  core.folder('constants')!.file('app_icons.dart', `import 'package:flutter/material.dart';

class AppIcons {
  static const home = Icons.home_rounded;
  static const explore = Icons.explore_rounded;
  static const rewards = Icons.card_giftcard_rounded;
  static const profile = Icons.person_rounded;
  static const cart = Icons.shopping_cart_rounded;
  static const search = Icons.search_rounded;
  static const notification = Icons.notifications_rounded;
  static const settings = Icons.settings_rounded;
  static const back = Icons.arrow_back_ios_rounded;
  static const forward = Icons.arrow_forward_ios_rounded;
  static const close = Icons.close_rounded;
  static const add = Icons.add_rounded;
  static const remove = Icons.remove_rounded;
  static const favorite = Icons.favorite_rounded;
  static const favoriteBorder = Icons.favorite_border_rounded;
  static const share = Icons.share_rounded;
  static const location = Icons.location_on_rounded;
  static const phone = Icons.phone_rounded;
  static const email = Icons.email_rounded;
  static const time = Icons.access_time_rounded;
  static const star = Icons.star_rounded;
  static const starBorder = Icons.star_border_rounded;
  static const info = Icons.info_rounded;
  static const check = Icons.check_circle_rounded;
  static const warning = Icons.warning_rounded;
  static const error = Icons.error_rounded;
}
`);

  // -- core/utils/extensions.dart
  core.folder('utils')!.file('extensions.dart', `import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

extension StringExtensions on String {
  String get capitalize => isEmpty ? '' : '\${this[0].toUpperCase()}\${substring(1)}';
  String get titleCase => split(' ').map((w) => w.capitalize).join(' ');
  bool get isValidEmail => RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\$').hasMatch(this);
  bool get isValidPhone => RegExp(r'^[+]?[0-9]{10,13}\$').hasMatch(replaceAll(' ', ''));
}

extension NumberExtensions on num {
  String get toCurrency => NumberFormat.currency(locale: 'nl_NL', symbol: '€', decimalDigits: 2).format(this);
  String get toCompact => NumberFormat.compact(locale: 'nl_NL').format(this);
}

extension DateExtensions on DateTime {
  String get formatted => DateFormat('d MMM yyyy', 'nl_NL').format(this);
  String get timeFormatted => DateFormat('HH:mm').format(this);
  String get relative {
    final diff = DateTime.now().difference(this);
    if (diff.inMinutes < 1) return 'Zojuist';
    if (diff.inMinutes < 60) return '\${diff.inMinutes}m geleden';
    if (diff.inHours < 24) return '\${diff.inHours}u geleden';
    if (diff.inDays < 7) return '\${diff.inDays}d geleden';
    return formatted;
  }
}

extension ContextExtensions on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  ColorScheme get colorScheme => Theme.of(this).colorScheme;
  MediaQueryData get mediaQuery => MediaQuery.of(this);
  double get screenWidth => mediaQuery.size.width;
  double get screenHeight => mediaQuery.size.height;
  bool get isMobile => screenWidth < 600;
  bool get isTablet => screenWidth >= 600 && screenWidth < 1024;
  bool get isDesktop => screenWidth >= 1024;
  
  void showSnack(String message, {bool isError = false}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : null,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }
}
`);

  // -- core/utils/validators.dart
  core.folder('utils')!.file('validators.dart', `class Validators {
  static String? required(String? value, [String field = 'This field']) {
    if (value == null || value.trim().isEmpty) return '\$field is required';
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\$').hasMatch(value)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.isEmpty) return null;
    if (!RegExp(r'^[+]?[0-9\\s-]{10,15}\$').hasMatch(value)) {
      return 'Enter a valid phone number';
    }
    return null;
  }
}
`);

  // -- core/router/app_router.dart
  core.folder('router')!.file('app_router.dart', `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/home_screen.dart';
import '../../features/menu/menu_screen.dart';
import '../../features/menu/menu_detail_screen.dart';
import '../../features/cart/cart_screen.dart';
import '../../features/rewards/rewards_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../shared/widgets/app_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      // Onboarding
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      
      // Main app shell with bottom nav
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
      
      // Detail screens (outside shell)
      GoRoute(
        path: '/menu/:id',
        builder: (context, state) => MenuDetailScreen(itemId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: \${state.uri}')),
    ),
  );
});
`);

  // -- core/services
  const services = core.folder('services')!;

  services.file('api_service.dart', `import 'package:dio/dio.dart';
import '../constants/app_constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late final Dio _dio;
  String? _authToken;

  void init({String? baseUrl, String? token}) {
    _authToken = token;
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl ?? AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.apiTimeout,
      receiveTimeout: AppConstants.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer \$_authToken',
      },
    ));

    _dio.interceptors.addAll([
      LogInterceptor(requestBody: true, responseBody: true),
      InterceptorsWrapper(
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Handle token refresh
          }
          handler.next(error);
        },
      ),
    ]);
  }

  void setToken(String token) {
    _authToken = token;
    _dio.options.headers['Authorization'] = 'Bearer \$token';
  }

  void clearToken() {
    _authToken = null;
    _dio.options.headers.remove('Authorization');
  }

  Future<Response> get(String path, {Map<String, dynamic>? params}) =>
      _dio.get(path, queryParameters: params);

  Future<Response> post(String path, {dynamic data}) =>
      _dio.post(path, data: data);

  Future<Response> put(String path, {dynamic data}) =>
      _dio.put(path, data: data);

  Future<Response> delete(String path) =>
      _dio.delete(path);
}
`);

  services.file('storage_service.dart', `import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  late final SharedPreferences _prefs;
  late final Box _appBox;
  late final Box _cacheBox;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _appBox = await Hive.openBox('app_data');
    _cacheBox = await Hive.openBox('cache');
  }

  // Preferences
  Future<void> setString(String key, String value) => _prefs.setString(key, value);
  String? getString(String key) => _prefs.getString(key);
  Future<void> setBool(String key, bool value) => _prefs.setBool(key, value);
  bool getBool(String key) => _prefs.getBool(key) ?? false;
  Future<void> setInt(String key, int value) => _prefs.setInt(key, value);
  int getInt(String key) => _prefs.getInt(key) ?? 0;

  // Hive
  Future<void> save(String key, dynamic data) => _appBox.put(key, data);
  dynamic load(String key) => _appBox.get(key);
  Future<void> remove(String key) => _appBox.delete(key);

  // Cache with TTL
  Future<void> cache(String key, dynamic data, {Duration ttl = const Duration(hours: 1)}) async {
    await _cacheBox.put(key, {'data': data, 'expires': DateTime.now().add(ttl).millisecondsSinceEpoch});
  }

  dynamic getCache(String key) {
    final cached = _cacheBox.get(key);
    if (cached == null) return null;
    if (DateTime.now().millisecondsSinceEpoch > cached['expires']) {
      _cacheBox.delete(key);
      return null;
    }
    return cached['data'];
  }

  // Auth
  Future<void> saveToken(String token) => setString('auth_token', token);
  String? get token => getString('auth_token');
  Future<void> clearToken() async => _prefs.remove('auth_token');
  bool get isLoggedIn => token != null;

  // Clear
  Future<void> clearAll() async {
    await _prefs.clear();
    await _appBox.clear();
    await _cacheBox.clear();
  }
}
`);

  services.file('notification_service.dart', `import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _local = FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    // Request permission
    final settings = await _fcm.requestPermission(
      alert: true, badge: true, sound: true, provisional: false,
    );
    
    if (settings.authorizationStatus != AuthorizationStatus.authorized) return;

    // Get token
    final token = await _fcm.getToken();
    print('📱 FCM Token: \$token');

    // Local notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    await _local.initialize(
      const InitializationSettings(android: androidSettings, iOS: iosSettings),
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Create channel
    const channel = AndroidNotificationChannel(
      'high_importance_channel', 'Important Notifications',
      description: 'Channel for important notifications',
      importance: Importance.high,
    );
    await _local.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // Foreground handler
    FirebaseMessaging.onMessage.listen(_showNotification);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpen);
    FirebaseMessaging.onBackgroundMessage(_backgroundHandler);
  }

  static Future<void> _backgroundHandler(RemoteMessage message) async {
    print('📩 Background: \${message.messageId}');
  }

  void _showNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;
    
    _local.show(
      notification.hashCode,
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'high_importance_channel', 'Important Notifications',
          importance: Importance.high, priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: DarwinNotificationDetails(presentAlert: true, presentBadge: true, presentSound: true),
      ),
    );
  }

  void _onNotificationTap(NotificationResponse response) {
    print('🔔 Tapped notification: \${response.payload}');
  }

  void _handleMessageOpen(RemoteMessage message) {
    print('🔔 Opened from notification: \${message.data}');
  }

  Future<void> subscribeTopic(String topic) => _fcm.subscribeToTopic(topic);
  Future<void> unsubscribeTopic(String topic) => _fcm.unsubscribeFromTopic(topic);
}
`);

  // -- core/providers/app_provider.dart
  core.folder('providers')!.file('app_provider.dart', `import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/storage_service.dart';
import '../constants/app_constants.dart';

enum AppThemeMode { light, dark, system }

class AppState {
  final AppThemeMode themeMode;
  final bool isLoggedIn;
  final String? userName;
  final String? userEmail;
  final int loyaltyPoints;
  final int currentNavIndex;
  final bool notificationsEnabled;
  final bool onboardingComplete;
  final List<Map<String, dynamic>> cartItems;

  const AppState({
    this.themeMode = AppThemeMode.dark,
    this.isLoggedIn = false,
    this.userName,
    this.userEmail,
    this.loyaltyPoints = 0,
    this.currentNavIndex = 0,
    this.notificationsEnabled = true,
    this.onboardingComplete = false,
    this.cartItems = const [],
  });

  int get cartCount => cartItems.fold(0, (sum, item) => sum + (item['qty'] as int? ?? 1));
  double get cartTotal => cartItems.fold(0.0, (sum, item) => sum + (item['price'] as double? ?? 0) * (item['qty'] as int? ?? 1));

  AppState copyWith({
    AppThemeMode? themeMode, bool? isLoggedIn, String? userName, String? userEmail,
    int? loyaltyPoints, int? currentNavIndex, bool? notificationsEnabled,
    bool? onboardingComplete, List<Map<String, dynamic>>? cartItems,
  }) => AppState(
    themeMode: themeMode ?? this.themeMode,
    isLoggedIn: isLoggedIn ?? this.isLoggedIn,
    userName: userName ?? this.userName,
    userEmail: userEmail ?? this.userEmail,
    loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
    currentNavIndex: currentNavIndex ?? this.currentNavIndex,
    notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
    onboardingComplete: onboardingComplete ?? this.onboardingComplete,
    cartItems: cartItems ?? this.cartItems,
  );
}

class AppNotifier extends StateNotifier<AppState> {
  AppNotifier() : super(const AppState()) {
    _loadState();
  }

  final _storage = StorageService();

  void _loadState() {
    final points = _storage.getInt(AppConstants.loyaltyKey);
    final onboarding = _storage.getBool(AppConstants.onboardingKey);
    state = state.copyWith(loyaltyPoints: points, onboardingComplete: onboarding);
  }

  void setThemeMode(AppThemeMode mode) => state = state.copyWith(themeMode: mode);
  void setNavIndex(int index) => state = state.copyWith(currentNavIndex: index);
  
  void login(String name, String email) {
    state = state.copyWith(isLoggedIn: true, userName: name, userEmail: email);
  }
  
  void logout() {
    _storage.clearToken();
    state = state.copyWith(isLoggedIn: false, userName: null, userEmail: null, loyaltyPoints: 0, cartItems: []);
  }

  void addPoints(int points) {
    final newPoints = state.loyaltyPoints + points;
    _storage.setInt(AppConstants.loyaltyKey, newPoints);
    state = state.copyWith(loyaltyPoints: newPoints);
  }

  void addToCart(Map<String, dynamic> item) {
    final cart = List<Map<String, dynamic>>.from(state.cartItems);
    final idx = cart.indexWhere((i) => i['id'] == item['id']);
    if (idx >= 0) {
      cart[idx] = {...cart[idx], 'qty': (cart[idx]['qty'] as int? ?? 1) + 1};
    } else {
      cart.add({...item, 'qty': 1});
    }
    state = state.copyWith(cartItems: cart);
  }

  void removeFromCart(String id) {
    final cart = List<Map<String, dynamic>>.from(state.cartItems);
    final idx = cart.indexWhere((i) => i['id'] == id);
    if (idx >= 0) {
      final qty = cart[idx]['qty'] as int? ?? 1;
      if (qty <= 1) { cart.removeAt(idx); } else { cart[idx] = {...cart[idx], 'qty': qty - 1}; }
    }
    state = state.copyWith(cartItems: cart);
  }

  void clearCart() => state = state.copyWith(cartItems: []);

  void completeOnboarding() {
    _storage.setBool(AppConstants.onboardingKey, true);
    state = state.copyWith(onboardingComplete: true);
  }

  void toggleNotifications() => state = state.copyWith(notificationsEnabled: !state.notificationsEnabled);
}

final appProvider = StateNotifierProvider<AppNotifier, AppState>((ref) => AppNotifier());
final isLoggedInProvider = Provider<bool>((ref) => ref.watch(appProvider).isLoggedIn);
final loyaltyPointsProvider = Provider<int>((ref) => ref.watch(appProvider).loyaltyPoints);
final cartCountProvider = Provider<int>((ref) => ref.watch(appProvider).cartCount);
final cartTotalProvider = Provider<double>((ref) => ref.watch(appProvider).cartTotal);
`);

  // ============ SHARED WIDGETS ============
  const shared = lib.folder('shared')!;
  const widgets = shared.folder('widgets')!;

  widgets.file('app_shell.dart', `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/app_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_icons.dart';

class AppShell extends ConsumerWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final navIndex = ref.watch(appProvider).currentNavIndex;
    final cartCount = ref.watch(cartCountProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Theme.of(context).dividerColor, width: 0.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: navIndex,
          onTap: (i) {
            ref.read(appProvider.notifier).setNavIndex(i);
            switch (i) {
              case 0: context.go('/');
              case 1: context.go('/menu');
              case 2: context.go('/rewards');
              case 3: context.go('/profile');
            }
          },
          items: [
            const BottomNavigationBarItem(icon: Icon(AppIcons.home), label: 'Home'),
            BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: cartCount > 0,
                label: Text('\$cartCount', style: const TextStyle(fontSize: 10)),
                backgroundColor: AppColors.primary,
                child: const Icon(AppIcons.explore),
              ),
              label: '${getMenuLabel(data.type)}',
            ),
            const BottomNavigationBarItem(icon: Icon(AppIcons.rewards), label: 'Rewards'),
            const BottomNavigationBarItem(icon: Icon(AppIcons.profile), label: 'Profile'),
          ],
        ),
      ),
    );
  }
}
`);

  widgets.file('app_card.dart', `import 'package:flutter/material.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final VoidCallback? onTap;
  final Color? color;
  final double borderRadius;

  const AppCard({
    super.key, required this.child, this.padding, this.onTap, this.color, this.borderRadius = 16,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color ?? Theme.of(context).cardColor,
      borderRadius: BorderRadius.circular(borderRadius),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(borderRadius),
        child: Container(
          padding: padding ?? const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(color: Theme.of(context).dividerColor.withValues(alpha: 0.3)),
          ),
          child: child,
        ),
      ),
    );
  }
}
`);

  widgets.file('loading_indicator.dart', `import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class LoadingIndicator extends StatelessWidget {
  final double size;
  final Color? color;
  const LoadingIndicator({super.key, this.size = 24, this.color});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size, height: size,
      child: CircularProgressIndicator(
        strokeWidth: 2.5,
        valueColor: AlwaysStoppedAnimation<Color>(color ?? AppColors.primary),
      ),
    );
  }
}

class LoadingOverlay extends StatelessWidget {
  final String? message;
  const LoadingOverlay({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const LoadingIndicator(size: 40),
            if (message != null) ...[
              const SizedBox(height: 16),
              Text(message!, style: const TextStyle(color: Colors.white, fontSize: 14)),
            ],
          ],
        ),
      ),
    );
  }
}
`);

  widgets.file('shimmer_loading.dart', `import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerLoading extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerLoading({super.key, this.width = double.infinity, required this.height, this.borderRadius = 12});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF1A1A28) : const Color(0xFFE2E8F0),
      highlightColor: isDark ? const Color(0xFF2A2A3D) : const Color(0xFFF0F2F7),
      child: Container(
        width: width, height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class ShimmerList extends StatelessWidget {
  final int count;
  final double itemHeight;
  const ShimmerList({super.key, this.count = 5, this.itemHeight = 80});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(count, (i) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: ShimmerLoading(height: itemHeight),
      )),
    );
  }
}
`);

  // -- shared/models
  shared.folder('models')!.file('user_model.dart', `class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final int loyaltyPoints;
  final int totalOrders;
  final String memberSince;
  final String tier;

  const UserModel({
    required this.id, required this.name, required this.email,
    this.phone, this.avatarUrl, this.loyaltyPoints = 0,
    this.totalOrders = 0, required this.memberSince, this.tier = 'Bronze',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'], name: json['name'], email: json['email'],
    phone: json['phone'], avatarUrl: json['avatar_url'],
    loyaltyPoints: json['loyalty_points'] ?? 0,
    totalOrders: json['total_orders'] ?? 0,
    memberSince: json['member_since'] ?? DateTime.now().toIso8601String(),
    tier: json['tier'] ?? 'Bronze',
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'email': email, 'phone': phone,
    'avatar_url': avatarUrl, 'loyalty_points': loyaltyPoints,
    'total_orders': totalOrders, 'member_since': memberSince, 'tier': tier,
  };
}
`);

  shared.folder('models')!.file('menu_item_model.dart', `class MenuItemModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String? imageUrl;
  final String category;
  final bool isPopular;
  final bool isNew;
  final double rating;
  final List<String> tags;

  const MenuItemModel({
    required this.id, required this.name, required this.description,
    required this.price, this.imageUrl, required this.category,
    this.isPopular = false, this.isNew = false, this.rating = 4.5, this.tags = const [],
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) => MenuItemModel(
    id: json['id'], name: json['name'], description: json['description'] ?? '',
    price: (json['price'] as num).toDouble(),
    imageUrl: json['image_url'], category: json['category'] ?? '',
    isPopular: json['is_popular'] ?? false, isNew: json['is_new'] ?? false,
    rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
    tags: List<String>.from(json['tags'] ?? []),
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'description': description, 'price': price,
    'image_url': imageUrl, 'category': category, 'is_popular': isPopular,
    'is_new': isNew, 'rating': rating, 'tags': tags,
  };
}
`);

  // ============ FEATURES ============
  const feat = lib.folder('features')!;

  // -- features/home
  feat.folder('home')!.file('home_screen.dart', genHomeScreen(data, className));
  feat.folder('home')!.folder('widgets')!.file('hero_card.dart', genHeroCardWidget(data));
  feat.folder('home')!.folder('widgets')!.file('quick_actions.dart', genQuickActionsWidget(data));

  // -- features/menu
  feat.folder('menu')!.file('menu_screen.dart', genMenuScreen(data));
  feat.folder('menu')!.file('menu_detail_screen.dart', genMenuDetailScreen(data));
  feat.folder('menu')!.folder('providers')!.file('menu_provider.dart', genMenuProvider(data));

  // -- features/cart
  feat.folder('cart')!.file('cart_screen.dart', genCartScreen(data));

  // -- features/rewards
  feat.folder('rewards')!.file('rewards_screen.dart', genRewardsScreen(data));
  feat.folder('rewards')!.folder('providers')!.file('rewards_provider.dart', genRewardsProvider());

  // -- features/profile
  feat.folder('profile')!.file('profile_screen.dart', genProfileScreen(data));

  // -- features/auth
  feat.folder('auth')!.file('login_screen.dart', genLoginScreen(data));
  feat.folder('auth')!.folder('providers')!.file('auth_provider.dart', genAuthProvider());

  // -- features/onboarding
  feat.folder('onboarding')!.file('onboarding_screen.dart', genOnboardingScreen(data));

  // ============ ANDROID ============
  const android = root.folder('android')!;
  android.file('build.gradle', genAndroidRootGradle());
  android.file('settings.gradle', genSettingsGradle(projectName));
  android.file('gradle.properties', genGradleProperties());
  android.folder('gradle')!.folder('wrapper')!.file('gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-all.zip\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\n`);

  const app = android.folder('app')!;
  app.file('build.gradle', genAppBuildGradle(projectName));
  app.file('proguard-rules.pro', genProguardRules());
  
  const mainAndroid = app.folder('src')!.folder('main')!;
  mainAndroid.file('AndroidManifest.xml', genAndroidManifest(data, projectName));
  
  const kotlin = mainAndroid.folder('kotlin')!.folder('ai')!.folder('forgelocal')!.folder(projectName)!;
  kotlin.file('MainActivity.kt', `package ai.forgelocal.${projectName}\n\nimport io.flutter.embedding.android.FlutterActivity\n\nclass MainActivity: FlutterActivity()\n`);

  const res = mainAndroid.folder('res')!;
  res.folder('values')!.file('strings.xml', `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">${data.name || 'My Business'}</string>\n</resources>`);
  res.folder('values')!.file('styles.xml', `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="LaunchTheme" parent="@android:style/Theme.Light.NoTitleBar">\n        <item name="android:windowBackground">@drawable/launch_background</item>\n    </style>\n    <style name="NormalTheme" parent="@android:style/Theme.Light.NoTitleBar">\n        <item name="android:windowBackground">?android:colorBackground</item>\n    </style>\n</resources>`);
  res.folder('values-night')!.file('styles.xml', `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="LaunchTheme" parent="@android:style/Theme.Black.NoTitleBar">\n        <item name="android:windowBackground">@drawable/launch_background</item>\n    </style>\n    <style name="NormalTheme" parent="@android:style/Theme.Black.NoTitleBar">\n        <item name="android:windowBackground">?android:colorBackground</item>\n    </style>\n</resources>`);
  res.folder('drawable')!.file('launch_background.xml', `<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:drawable="@android:color/black" />\n</layer-list>`);
  res.folder('drawable-v21')!.file('launch_background.xml', `<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:drawable="@android:color/black" />\n</layer-list>`);

  // ============ iOS ============
  const ios = root.folder('ios')!;
  ios.folder('Runner')!.file('Info.plist', genInfoPlist(data));
  ios.folder('Runner')!.file('AppDelegate.swift', genAppDelegate());

  // ============ TEST ============
  root.folder('test')!.file('widget_test.dart', genWidgetTest(data, className, projectName));
  root.folder('test')!.file('app_test.dart', genAppTest(className, projectName));

  // ============ ASSETS ============
  root.folder('assets')!.folder('images')!.file('.gitkeep', '');
  root.folder('assets')!.folder('fonts')!.file('.gitkeep', '');
  root.folder('assets')!.folder('icons')!.file('.gitkeep', '');
  root.folder('assets')!.folder('animations')!.file('.gitkeep', '');

  // Also add the user's code files
  for (const file of codeFiles) {
    if (file.filename.includes('/')) {
      const parts = file.filename.split('/');
      let folder = lib;
      for (let i = 0; i < parts.length - 1; i++) {
        folder = folder.folder(parts[i])!;
      }
      folder.file(parts[parts.length - 1], file.code);
    }
  }

  // Generate ZIP
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  saveAs(blob, `${projectName}.zip`);
}

// ============ HELPERS ============
function toSnakeCase(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'my_business_app';
}

function toPascalCase(str: string): string {
  return str.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') || 'MyBusiness';
}

function lightenColor(hex: string): string {
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + 40);
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + 40);
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + 40);
  return r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

function darkenColor(hex: string): string {
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 30);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 30);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 30);
  return r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

function getMenuLabel(type: string): string {
  if (['Café/Restaurant', 'Bakkerij', 'IJssalon', 'Sushi takeaway', 'Wijnbar'].includes(type)) return 'Menu';
  if (['Kapsalon', 'Barbershop', 'Nagelstudio', 'Massage salon', 'Tattoo shop'].includes(type)) return 'Services';
  if (['Sportschool/Fitness', 'Yoga/Pilates studio', 'Yoga studio'].includes(type)) return 'Classes';
  if (['Kledingwinkel', 'Bloemist', 'Boekhandel'].includes(type)) return 'Shop';
  return 'Explore';
}

function getBusinessItems(type: string): { name: string; price: string; desc: string }[] {
  const items: Record<string, { name: string; price: string; desc: string }[]> = {
    'Café/Restaurant': [
      { name: 'Cappuccino', price: '3.50', desc: 'Smooth Italian espresso with steamed milk' },
      { name: 'Eggs Benedict', price: '12.50', desc: 'Poached eggs, ham, hollandaise on brioche' },
      { name: 'Club Sandwich', price: '11.00', desc: 'Triple-decker with chicken, bacon, avocado' },
      { name: 'Caesar Salad', price: '10.50', desc: 'Crisp romaine, parmesan, croutons' },
      { name: 'Cheesecake', price: '6.50', desc: 'New York style with berry compote' },
      { name: 'Fresh Juice', price: '4.50', desc: 'Orange, apple, or seasonal blend' },
    ],
    'Kapsalon': [
      { name: 'Knippen Heren', price: '25.00', desc: 'Wash, cut and style' },
      { name: 'Knippen Dames', price: '45.00', desc: 'Wash, cut, blowdry' },
      { name: 'Kleuren', price: '65.00', desc: 'Full color treatment' },
      { name: 'Highlights', price: '85.00', desc: 'Balayage or foils' },
      { name: 'Behandeling', price: '35.00', desc: 'Deep conditioning treatment' },
      { name: 'Baard Trim', price: '15.00', desc: 'Beard shape and trim' },
    ],
    'Sportschool/Fitness': [
      { name: 'Day Pass', price: '12.00', desc: 'Full gym access for one day' },
      { name: 'Monthly', price: '39.99', desc: 'Unlimited access all equipment' },
      { name: 'Personal Training', price: '55.00', desc: '1-on-1 session with trainer' },
      { name: 'Group Class', price: '8.00', desc: 'Spin, yoga, HIIT, boxing' },
      { name: 'Annual Pass', price: '349.00', desc: 'Best value - save 27%' },
      { name: 'Student Plan', price: '24.99', desc: 'Valid student ID required' },
    ],
  };
  return items[type] || items['Café/Restaurant']!;
}

// ============ SCREEN GENERATORS ============
function genHomeScreen(data: BusinessFormData, className: string): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';
import 'widgets/hero_card.dart';
import 'widgets/quick_actions.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fadeAnim = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero)
        .animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    _controller.forward();
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(appProvider);
    
    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SlideTransition(
            position: _slideAnim,
            child: SingleChildScrollView(
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
                          Text('Welcome to', style: TextStyle(color: Colors.grey[500], fontSize: 14)),
                          const SizedBox(height: 2),
                          Text('${data.name || className}', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            onPressed: () {},
                            icon: Badge(
                              smallSize: 8,
                              backgroundColor: AppColors.primary,
                              child: const Icon(Icons.notifications_outlined, size: 24),
                            ),
                          ),
                          const SizedBox(width: 4),
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                            child: Text(
                              (appState.userName ?? 'G')[0].toUpperCase(),
                              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const HeroCard(),
                  const SizedBox(height: 24),
                  const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  const QuickActions(),
                  const SizedBox(height: 24),
                  // Loyalty banner
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.primary.withValues(alpha: 0.12), AppColors.primary.withValues(alpha: 0.04)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(Icons.card_giftcard, color: AppColors.primary, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Loyalty Points', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                              const SizedBox(height: 2),
                              Text('\${appState.loyaltyPoints} points', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 20)),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[600]),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
}

function genHeroCardWidget(data: BusinessFormData): string {
  return `import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class HeroCard extends StatelessWidget {
  const HeroCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryDark],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                child: const Text('📍 ${data.city || 'Your City'}', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                child: const Row(children: [Icon(Icons.star, size: 14, color: Colors.amber), SizedBox(width: 4), Text('4.9', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))]),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text('${data.description || 'Welcome to our business!'}', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700, height: 1.3)),
          const SizedBox(height: 12),
          Text('Open now • Closes at 22:00', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13)),
        ],
      ),
    );
  }
}
`;
}

function genQuickActionsWidget(data: BusinessFormData): string {
  const featureList = (data.features || 'Menu\nReservations\nLoyalty\nContact').split('\n').filter(f => f.trim()).slice(0, 4);
  const icons = ['Icons.restaurant_menu', 'Icons.calendar_today', 'Icons.card_giftcard', 'Icons.phone'];
  return `import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = [
${featureList.map((f, i) => `      {'icon': ${icons[i] || 'Icons.star'}, 'label': '${f.trim()}', 'color': ${i === 0 ? 'AppColors.primary' : i === 1 ? 'AppColors.info' : i === 2 ? 'AppColors.warning' : 'AppColors.error'}},`).join('\n')}
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 2.2,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        final color = action['color'] as Color;
        return Material(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {},
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Theme.of(context).dividerColor.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                    child: Icon(action['icon'] as IconData, color: color, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Text(action['label'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
`;
}

function genMenuScreen(data: BusinessFormData): string {
  const items = getBusinessItems(data.type);
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key});
  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {
  String _selectedCategory = 'All';
  final _categories = ['All', 'Popular', 'New', 'Deals'];

  final _items = [
${items.map((item, i) => `    {'id': '${i}', 'name': '${item.name}', 'price': ${item.price}, 'desc': '${item.desc}', 'popular': ${i < 2}, 'isNew': ${i >= 4}},`).join('\n')}
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${getMenuLabel(data.type)}'),
        actions: [
          IconButton(onPressed: () => context.push('/cart'), icon: Badge(
            label: Text('\${ref.watch(cartCountProvider)}', style: const TextStyle(fontSize: 10)),
            isLabelVisible: ref.watch(cartCountProvider) > 0,
            backgroundColor: AppColors.primary,
            child: const Icon(Icons.shopping_cart_outlined),
          )),
        ],
      ),
      body: Column(
        children: [
          // Category tabs
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (context, i) {
                final selected = _categories[i] == _selectedCategory;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: selected,
                    label: Text(_categories[i]),
                    onSelected: (_) => setState(() => _selectedCategory = _categories[i]),
                    selectedColor: AppColors.primary.withValues(alpha: 0.15),
                    checkmarkColor: AppColors.primary,
                    labelStyle: TextStyle(
                      color: selected ? AppColors.primary : Colors.grey,
                      fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                );
              },
            ),
          ),
          // Items list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (context, i) {
                final item = _items[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Material(
                    color: Theme.of(context).cardColor,
                    borderRadius: BorderRadius.circular(16),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () => context.push('/menu/\${item['id']}'),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(item['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                                      if (item['popular'] == true) ...[
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                                          child: const Text('🔥', style: TextStyle(fontSize: 10)),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(item['desc'] as String, style: TextStyle(color: Colors.grey[500], fontSize: 12), maxLines: 2),
                                  const SizedBox(height: 8),
                                  Text('€\${(item['price'] as num).toStringAsFixed(2)}', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 16)),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                ref.read(appProvider.notifier).addToCart(item);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('\${item['name']} added to cart'), duration: const Duration(seconds: 1)),
                                );
                              },
                              icon: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.add, color: Colors.white, size: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
`;
}

function genMenuDetailScreen(_data: BusinessFormData): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';

class MenuDetailScreen extends ConsumerWidget {
  final String itemId;
  const MenuDetailScreen({super.key, required this.itemId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Details')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(child: Icon(Icons.image, size: 60, color: AppColors.primary.withValues(alpha: 0.3))),
            ),
            const SizedBox(height: 24),
            Text('Item #\$itemId', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Row(children: [
              const Icon(Icons.star, color: Colors.amber, size: 18),
              const SizedBox(width: 4),
              const Text('4.8', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(width: 8),
              Text('(124 reviews)', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
            ]),
            const SizedBox(height: 16),
            Text('A wonderful item from our collection. Made with premium ingredients and crafted with care.',
              style: TextStyle(color: Colors.grey[400], fontSize: 15, height: 1.6)),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ref.read(appProvider.notifier).addToCart({'id': itemId, 'name': 'Item #\$itemId', 'price': 12.50});
                  Navigator.pop(context);
                },
                child: const Text('Add to Order'),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
`;
}

function genMenuProvider(_data: BusinessFormData): string {
  return `import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/menu_item_model.dart';

final menuItemsProvider = FutureProvider<List<MenuItemModel>>((ref) async {
  // TODO: Replace with actual API call
  await Future.delayed(const Duration(milliseconds: 500));
  return [];
});

final selectedCategoryProvider = StateProvider<String>((ref) => 'All');

final filteredMenuProvider = Provider<AsyncValue<List<MenuItemModel>>>((ref) {
  final category = ref.watch(selectedCategoryProvider);
  final items = ref.watch(menuItemsProvider);
  return items.whenData((list) {
    if (category == 'All') return list;
    if (category == 'Popular') return list.where((i) => i.isPopular).toList();
    if (category == 'New') return list.where((i) => i.isNew).toList();
    return list.where((i) => i.category == category).toList();
  });
});
`;
}

function genCartScreen(_data: BusinessFormData): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';
import '../../core/constants/app_constants.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appState = ref.watch(appProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Cart')),
      body: appState.cartItems.isEmpty
          ? const Center(child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('Your cart is empty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                SizedBox(height: 4),
                Text('Add some items to get started', style: TextStyle(color: Colors.grey)),
              ],
            ))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: appState.cartItems.length,
                    itemBuilder: (context, i) {
                      final item = appState.cartItems[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Expanded(child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                Text('€\${((item['price'] as num?) ?? 0).toStringAsFixed(2)}', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                              ],
                            )),
                            Row(children: [
                              IconButton(
                                onPressed: () => ref.read(appProvider.notifier).removeFromCart(item['id'] as String),
                                icon: const Icon(Icons.remove_circle_outline, size: 22),
                              ),
                              Text('\${item['qty'] ?? 1}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                              IconButton(
                                onPressed: () => ref.read(appProvider.notifier).addToCart(item),
                                icon: Icon(Icons.add_circle, color: AppColors.primary, size: 22),
                              ),
                            ]),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
                  ),
                  child: SafeArea(
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                            Text('€\${appState.cartTotal.toStringAsFixed(2)}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              ref.read(appProvider.notifier).addPoints(appState.cartCount * AppConstants.pointsPerOrder);
                              ref.read(appProvider.notifier).clearCart();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('🎉 Order placed! Points earned!')),
                              );
                              Navigator.pop(context);
                            },
                            child: Text('Place Order • €\${appState.cartTotal.toStringAsFixed(2)}'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
`;
}

function genRewardsScreen(_data: BusinessFormData): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';
import '../../core/constants/app_constants.dart';

class RewardsScreen extends ConsumerWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final points = ref.watch(loyaltyPointsProvider);
    final progress = (points % AppConstants.pointsForReward) / AppConstants.pointsForReward;

    return Scaffold(
      appBar: AppBar(title: const Text('Rewards')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Points card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryDark]),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  const Text('Your Points', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text('\$points', style: const TextStyle(color: Colors.white, fontSize: 48, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(value: progress, minHeight: 8, backgroundColor: Colors.white24, valueColor: const AlwaysStoppedAnimation(Colors.white)),
                  ),
                  const SizedBox(height: 8),
                  Text('\${AppConstants.pointsForReward - (points % AppConstants.pointsForReward)} points to next reward', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Daily check-in
            Material(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(16),
              child: InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () {
                  ref.read(appProvider.notifier).addPoints(AppConstants.dailyCheckInPoints);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('+\${AppConstants.dailyCheckInPoints} points! Daily check-in bonus 🎉')),
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.wb_sunny, color: AppColors.warning),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Daily Check-in', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                          Text('Tap to earn bonus points', style: TextStyle(color: Colors.grey, fontSize: 13)),
                        ],
                      )),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                        child: Text('+\${AppConstants.dailyCheckInPoints}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Rewards list
            const Align(alignment: Alignment.centerLeft, child: Text('Available Rewards', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700))),
            const SizedBox(height: 12),
            ...['Free Item', '10% Discount', 'Priority Access'].asMap().entries.map((e) {
              final cost = (e.key + 1) * AppConstants.pointsForReward;
              final canClaim = points >= cost;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(16),
                  border: canClaim ? Border.all(color: AppColors.primary.withValues(alpha: 0.3)) : null,
                ),
                child: Row(
                  children: [
                    Expanded(child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(e.value, style: const TextStyle(fontWeight: FontWeight.w600)),
                        Text('\$cost points', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                      ],
                    )),
                    ElevatedButton(
                      onPressed: canClaim ? () {
                        ref.read(appProvider.notifier).addPoints(-cost);
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('🎁 \${e.value} claimed!')));
                      } : null,
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10)),
                      child: const Text('Claim'),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
`;
}

function genRewardsProvider(): string {
  return `import 'package:flutter_riverpod/flutter_riverpod.dart';

class Reward {
  final String id;
  final String title;
  final String description;
  final int pointsCost;
  final String icon;
  
  const Reward({required this.id, required this.title, required this.description, required this.pointsCost, this.icon = '🎁'});
}

final rewardsProvider = Provider<List<Reward>>((ref) => [
  const Reward(id: '1', title: 'Free Item', description: 'Get any item for free', pointsCost: 200, icon: '🎁'),
  const Reward(id: '2', title: '10% Discount', description: 'On your next order', pointsCost: 100, icon: '💰'),
  const Reward(id: '3', title: 'Priority Access', description: 'Skip the queue', pointsCost: 300, icon: '⚡'),
  const Reward(id: '4', title: 'VIP Experience', description: 'Exclusive perks', pointsCost: 500, icon: '👑'),
]);
`;
}

function genProfileScreen(data: BusinessFormData): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appState = ref.watch(appProvider);
    
    return Scaffold(
      appBar: AppBar(title: const Text('Profile'), actions: [
        IconButton(onPressed: () {}, icon: const Icon(Icons.settings_outlined)),
      ]),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            CircleAvatar(
              radius: 45,
              backgroundColor: AppColors.primary.withValues(alpha: 0.15),
              child: Text(
                (appState.userName ?? 'G')[0].toUpperCase(),
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 12),
            Text(appState.userName ?? 'Guest', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            Text(appState.userEmail ?? 'Login to save progress', style: TextStyle(color: Colors.grey[500])),
            const SizedBox(height: 24),
            Row(children: [
              _StatCard(value: '\${appState.loyaltyPoints}', label: 'Points'),
              const SizedBox(width: 12),
              _StatCard(value: '\${appState.cartItems.length}', label: 'Orders'),
              const SizedBox(width: 12),
              const _StatCard(value: 'Bronze', label: 'Tier'),
            ]),
            const SizedBox(height: 24),
            ...['Edit Profile', 'Notifications', 'Language', 'Help & Support', 'About ${data.name || 'App'}'].map((item) =>
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                child: Material(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(12),
                  child: ListTile(
                    title: Text(item, style: const TextStyle(fontWeight: FontWeight.w500)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    onTap: () {},
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            if (appState.isLoggedIn)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => ref.read(appProvider.notifier).logout(),
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error)),
                  child: const Text('Sign Out'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  const _StatCard({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(16)),
      child: Column(children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
      ]),
    ));
  }
}
`;
}

function genLoginScreen(data: BusinessFormData): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    ref.read(appProvider.notifier).login('User', _emailController.text);
    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
                child: Icon(Icons.lock_outline, color: AppColors.primary, size: 28),
              ),
              const SizedBox(height: 24),
              const Text('Welcome back', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text('Sign in to ${data.name || 'your account'}', style: TextStyle(color: Colors.grey[500], fontSize: 15)),
              const SizedBox(height: 32),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock_outlined)),
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(onPressed: () {}, child: Text('Forgot password?', style: TextStyle(color: AppColors.primary))),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Sign In'),
                ),
              ),
              const SizedBox(height: 16),
              Row(children: [const Expanded(child: Divider()), Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('or', style: TextStyle(color: Colors.grey[500]))), const Expanded(child: Divider())]),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Text('G', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  label: const Text('Continue with Google'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`;
}

function genAuthProvider(): string {
  return `import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final String? userId;
  final String? error;
  const AuthState({this.status = AuthStatus.initial, this.userId, this.error});
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());

  Future<void> login(String email, String password) async {
    state = const AuthState(status: AuthStatus.loading);
    try {
      await Future.delayed(const Duration(seconds: 1));
      state = AuthState(status: AuthStatus.authenticated, userId: 'user_\${DateTime.now().millisecondsSinceEpoch}');
    } catch (e) {
      state = AuthState(status: AuthStatus.error, error: e.toString());
    }
  }

  void logout() => state = const AuthState(status: AuthStatus.unauthenticated);
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
`;
}

function genOnboardingScreen(data: BusinessFormData): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});
  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  final _pages = [
    {'icon': Icons.store, 'title': 'Welcome to ${data.name || 'Our App'}', 'desc': 'Discover everything we have to offer'},
    {'icon': Icons.card_giftcard, 'title': 'Earn Rewards', 'desc': 'Collect points with every visit and redeem amazing rewards'},
    {'icon': Icons.notifications, 'title': 'Stay Updated', 'desc': 'Get notified about deals, events, and new arrivals'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _pages.length,
                itemBuilder: (_, i) {
                  final page = _pages[i];
                  return Padding(
                    padding: const EdgeInsets.all(40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(page['icon'] as IconData, size: 64, color: AppColors.primary),
                        ),
                        const SizedBox(height: 40),
                        Text(page['title'] as String, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800), textAlign: TextAlign.center),
                        const SizedBox(height: 12),
                        Text(page['desc'] as String, style: TextStyle(color: Colors.grey[500], fontSize: 16, height: 1.5), textAlign: TextAlign.center),
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(children: List.generate(3, (i) => Container(
                    width: _page == i ? 24 : 8, height: 8,
                    margin: const EdgeInsets.only(right: 6),
                    decoration: BoxDecoration(
                      color: _page == i ? AppColors.primary : Colors.grey[700],
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ))),
                  ElevatedButton(
                    onPressed: () {
                      if (_page < 2) { _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeOut); }
                      else { ref.read(appProvider.notifier).completeOnboarding(); context.go('/'); }
                    },
                    child: Text(_page < 2 ? 'Next' : 'Get Started'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`;
}

// ============ CONFIG FILES ============
function genPubspec(data: BusinessFormData, name: string): string {
  return `name: ${name}
description: "${data.name || 'My Business'} — Custom mobile app built with ForgeLocal AI"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.5.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # Navigation
  go_router: ^14.2.0

  # Firebase
  firebase_core: ^3.3.0
  firebase_auth: ^5.1.0
  cloud_firestore: ^5.2.0
  firebase_messaging: ^15.0.0
  firebase_analytics: ^11.2.0

  # Networking
  dio: ^5.5.0

  # Local Storage
  shared_preferences: ^2.3.1
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # UI
  google_fonts: ^6.2.1
  cached_network_image: ^3.4.0
  shimmer: ^3.0.0
  flutter_svg: ^2.0.10
  lottie: ^3.1.2

  # Notifications
  flutter_local_notifications: ^17.2.2

  # Utilities
  intl: ^0.19.0
  url_launcher: ^6.3.0
  share_plus: ^9.0.0
  package_info_plus: ^8.0.0
  connectivity_plus: ^6.0.0

  # Icons
  cupertino_icons: ^1.0.8
  flutter_launcher_icons: ^0.13.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  build_runner: ^2.4.11
  riverpod_generator: ^2.4.0
  hive_generator: ^2.0.1
  json_serializable: ^6.8.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/images/icon.png"
  adaptive_icon_background: "${data.secondaryColor || '#0a0a0f'}"
  adaptive_icon_foreground: "assets/images/icon_foreground.png"
`;
}

function genAnalysisOptions(): string {
  return `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_declarations: true
    avoid_print: false
    sort_child_properties_last: true
    use_build_context_synchronously: true

analyzer:
  errors:
    invalid_annotation_target: ignore
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
`;
}

function genGitignore(): string {
  return `.dart_tool/
.packages
build/
.flutter-plugins
.flutter-plugins-dependencies
*.iml
.idea/
.vscode/
*.lock
android/.gradle/
android/app/build/
android/local.properties
android/key.properties
*.jks
ios/Pods/
ios/.symlinks/
ios/Flutter/Flutter.framework
ios/Flutter/Flutter.podspec
macos/Pods/
macos/Flutter/Flutter.framework
*.g.dart
*.freezed.dart
.env
`;
}

function genEnvExample(): string {
  return `# Firebase (configure via flutterfire configure)
# FIREBASE_API_KEY=your_api_key
# FIREBASE_PROJECT_ID=your_project_id

# API
# API_BASE_URL=https://api.example.com/v1
# API_KEY=your_api_key
`;
}

function genReadme(data: BusinessFormData, name: string): string {
  return `# ${data.name || 'My Business App'}

> Custom mobile app generated by [ForgeLocal AI](https://forgelocal.ai)

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
flutter pub get

# Run code generation
dart run build_runner build --delete-conflicting-outputs

# Run on device
flutter run

# Build release APK
flutter build apk --release

# Build release iOS
flutter build ios --release
\`\`\`

## 📁 Architecture

\`\`\`
lib/
├── main.dart              # Entry point
├── app.dart               # MaterialApp configuration
├── core/
│   ├── theme/             # Colors, typography, theming
│   ├── router/            # GoRouter navigation
│   ├── constants/         # App constants, icons
│   ├── services/          # API, storage, notifications
│   ├── providers/         # Global Riverpod providers
│   └── utils/             # Extensions, validators
├── features/
│   ├── home/              # Home screen + widgets
│   ├── menu/              # Menu/services + providers
│   ├── cart/              # Shopping cart
│   ├── rewards/           # Loyalty system
│   ├── profile/           # User profile
│   ├── auth/              # Login/register
│   └── onboarding/        # First-time setup
└── shared/
    ├── models/            # Data models
    └── widgets/           # Reusable widgets
\`\`\`

## 🔥 Firebase Setup

1. Install FlutterFire CLI: \`dart pub global activate flutterfire_cli\`
2. Run: \`flutterfire configure\`
3. Follow the prompts to connect your Firebase project

## 🏪 Play Store

1. Generate icons: \`flutter pub run flutter_launcher_icons\`
2. Create keystore: \`keytool -genkey -v -keystore ${name}.jks -keyalg RSA -keysize 2048 -validity 10000\`
3. Add \`key.properties\` in \`android/\`
4. Build: \`flutter build appbundle --release\`

---

Built with ❤️ by ForgeLocal AI • ${new Date().getFullYear()}
`;
}

function genAndroidRootGradle(): string {
  return `buildscript {
    ext.kotlin_version = '1.9.24'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.3.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:\$kotlin_version"
        classpath 'com.google.gms:google-services:4.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = "../build"
subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
`;
}

function genSettingsGradle(name: string): string {
  return `include ':app'

def localPropertiesFile = new File(rootProject.projectDir, "local.properties")
def properties = new Properties()
assert localPropertiesFile.exists()
localPropertiesFile.withReader("UTF-8") { reader -> properties.load(reader) }

def flutterSdkPath = properties.getProperty("flutter.sdk")
assert flutterSdkPath != null, "flutter.sdk not set in local.properties"
apply from: "\$flutterSdkPath/packages/flutter_tools/gradle/app_plugin_loader.gradle"

rootProject.name = '${name}'
`;
}

function genGradleProperties(): string {
  return `org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=2G -XX:+HeapDumpOnOutOfMemoryError
android.useAndroidX=true
android.enableJetifier=true
android.defaults.buildfeatures.buildconfig=true
android.nonTransitiveRClass=false
android.nonFinalResIds=false
`;
}

function genAppBuildGradle(name: string): string {
  return `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
    id "com.google.gms.google-services"
}

def localProperties = new Properties()
def localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader("UTF-8") { reader -> localProperties.load(reader) }
}

def flutterVersionCode = localProperties.getProperty("flutter.versionCode") ?: "1"
def flutterVersionName = localProperties.getProperty("flutter.versionName") ?: "1.0"

// Signing
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace "ai.forgelocal.${name}"
    compileSdk 34
    ndkVersion "26.1.10909125"

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions { jvmTarget = "17" }

    defaultConfig {
        applicationId "ai.forgelocal.${name}"
        minSdk 24
        targetSdk 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true
    }

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
            if (keystorePropertiesFile.exists()) {
                signingConfig signingConfigs.release
            }
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
}

flutter { source "../.." }
`;
}

function genProguardRules(): string {
  return `-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class com.google.firebase.** { *; }
-dontwarn io.flutter.embedding.**
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
`;
}

function genAndroidManifest(data: BusinessFormData, name: string): string {
  return `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ai.forgelocal.${name}">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>

    <application
        android:label="${data.name || 'My Business'}"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data android:name="io.flutter.embedding.android.NormalTheme" android:resource="@style/NormalTheme"/>
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <meta-data android:name="flutterEmbedding" android:value="2"/>
        <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="high_importance_channel"/>
    </application>
</manifest>
`;
}

function genInfoPlist(data: BusinessFormData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key><string>en</string>
    <key>CFBundleDisplayName</key><string>${data.name || 'My Business'}</string>
    <key>CFBundleExecutable</key><string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key><string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key><string>6.0</string>
    <key>CFBundleName</key><string>${data.name || 'My Business'}</string>
    <key>CFBundlePackageType</key><string>APPL</string>
    <key>CFBundleShortVersionString</key><string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundleVersion</key><string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>LSRequiresIPhoneOS</key><true/>
    <key>UILaunchStoryboardName</key><string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key><string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIBackgroundModes</key>
    <array><string>fetch</string><string>remote-notification</string></array>
    <key>FirebaseAppDelegateProxyEnabled</key><false/>
</dict>
</plist>
`;
}

function genAppDelegate(): string {
  return `import UIKit
import Flutter
import FirebaseCore
import FirebaseMessaging

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    FirebaseApp.configure()
    GeneratedPluginRegistrant.register(with: self)
    
    UNUserNotificationCenter.current().delegate = self
    application.registerForRemoteNotifications()
    
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Messaging.messaging().apnsToken = deviceToken
  }
}
`;
}

function genWidgetTest(_data: BusinessFormData, className: string, name: string): string {
  void _data;
  return `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:${name}/app.dart';

void main() {
  testWidgets('${className}App renders correctly', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: ${className}App()));
    await tester.pumpAndSettle();
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
`;
}

function genAppTest(_className: string, name: string): string {
  void _className;
  return `import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:${name}/core/providers/app_provider.dart';

void main() {
  group('AppProvider', () {
    test('initial state', () {
      final container = ProviderContainer();
      final state = container.read(appProvider);
      expect(state.isLoggedIn, false);
      expect(state.loyaltyPoints, 0);
      expect(state.cartItems, isEmpty);
    });

    test('add to cart', () {
      final container = ProviderContainer();
      container.read(appProvider.notifier).addToCart({'id': '1', 'name': 'Test', 'price': 5.0});
      expect(container.read(appProvider).cartCount, 1);
    });

    test('add points', () {
      final container = ProviderContainer();
      container.read(appProvider.notifier).addPoints(100);
      expect(container.read(appProvider).loyaltyPoints, 100);
    });
  });
}
`;
}
