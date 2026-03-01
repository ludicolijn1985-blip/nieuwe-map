import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BusinessFormData } from '../types';

export async function downloadFlutterProject(data: BusinessFormData, codeFiles: { filename: string; code: string }[]) {
  const zip = new JSZip();
  const projectName = toSnakeCase(data.name || 'my_business_app');
  const root = zip.folder(projectName)!;

  // pubspec.yaml
  root.file('pubspec.yaml', generatePubspec(data));

  // analysis_options.yaml
  root.file('analysis_options.yaml', `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_declarations: true
    avoid_print: false
`);

  // README.md
  root.file('README.md', generateReadme(data));

  // .gitignore
  root.file('.gitignore', `# Flutter/Dart
.dart_tool/
.packages
build/
.flutter-plugins
.flutter-plugins-dependencies
*.iml
.idea/
.vscode/
*.lock

# Android
android/.gradle/
android/app/build/
android/local.properties
android/key.properties
*.jks

# iOS
ios/Pods/
ios/.symlinks/
ios/Flutter/Flutter.framework
ios/Flutter/Flutter.podspec

# macOS
macos/Pods/
macos/Flutter/Flutter.framework

# Generated
*.g.dart
*.freezed.dart
`);

  // lib/ folder — add all generated code files
  const lib = root.folder('lib')!;
  for (const file of codeFiles) {
    if (file.filename.includes('/')) {
      const parts = file.filename.split('/');
      let folder = lib;
      for (let i = 0; i < parts.length - 1; i++) {
        folder = folder.folder(parts[i])!;
      }
      folder.file(parts[parts.length - 1], file.code);
    } else {
      lib.file(file.filename, file.code);
    }
  }

  // Add additional service/model files
  lib.folder('services')!.file('api_service.dart', generateApiService(data));
  lib.folder('services')!.file('notification_service.dart', generateNotificationService());
  lib.folder('services')!.file('storage_service.dart', generateStorageService());
  lib.folder('models')!.file('user_model.dart', generateUserModel());
  lib.folder('models')!.file('business_model.dart', generateBusinessModel(data));
  lib.folder('providers')!.file('app_provider.dart', generateAppProvider(data));

  // Android folder structure
  const android = root.folder('android')!;
  android.file('build.gradle', generateAndroidRootGradle());
  android.file('settings.gradle', generateSettingsGradle(data));
  android.file('gradle.properties', generateGradleProperties());

  const androidGradleWrapper = android.folder('gradle')!.folder('wrapper')!;
  androidGradleWrapper.file('gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.3-all.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

  const app = android.folder('app')!;
  app.file('build.gradle', generateAppBuildGradle(data));

  const mainAndroid = app.folder('src')!.folder('main')!;
  mainAndroid.file('AndroidManifest.xml', generateAndroidManifest(data));

  const resValues = mainAndroid.folder('res')!.folder('values')!;
  resValues.file('strings.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${data.name || 'My Business'}</string>
</resources>`);
  resValues.file('styles.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="LaunchTheme" parent="@android:style/Theme.Light.NoTitleBar">
        <item name="android:windowBackground">@drawable/launch_background</item>
    </style>
    <style name="NormalTheme" parent="@android:style/Theme.Light.NoTitleBar">
        <item name="android:windowBackground">?android:colorBackground</item>
    </style>
</resources>`);

  const resDrawable = mainAndroid.folder('res')!.folder('drawable')!;
  resDrawable.file('launch_background.xml', `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@android:color/black" />
</layer-list>`);

  // iOS folder structure (basic)
  const ios = root.folder('ios')!;
  const iosRunner = ios.folder('Runner')!;
  iosRunner.file('Info.plist', generateInfoPlist(data));

  // test/ folder
  const test = root.folder('test')!;
  test.file('widget_test.dart', generateWidgetTest(data));

  // assets/ folder
  const assets = root.folder('assets')!;
  assets.folder('images')!.file('.gitkeep', '');
  assets.folder('fonts')!.file('.gitkeep', '');
  assets.file('README.md', `# Assets

Place your assets in the appropriate folders:
- \`images/\` — App icons, logos, banners
- \`fonts/\` — Custom font files (.ttf, .otf)

These are referenced in pubspec.yaml under the flutter > assets section.
`);

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  saveAs(blob, `${projectName}.zip`);
}

function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'my_business_app';
}

function generatePubspec(data: BusinessFormData): string {
  const name = toSnakeCase(data.name || 'my_business_app');
  return `name: ${name}
description: "${data.name || 'My Business'} — Custom mobile app built with ForgeLocal AI"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Networking & API
  dio: ^5.4.0
  retrofit: ^4.0.3

  # Local Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # Firebase
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  firebase_analytics: ^10.8.0

  # UI & Design
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0
  lottie: ^2.7.0

  # Navigation
  go_router: ^13.0.1

  # Utilities
  intl: ^0.19.0
  url_launcher: ^6.2.2
  share_plus: ^7.2.1
  package_info_plus: ^5.0.1
  connectivity_plus: ^5.0.2

  # Icons
  cupertino_icons: ^1.0.6
  flutter_launcher_icons: ^0.13.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.7
  riverpod_generator: ^2.3.9
  retrofit_generator: ^8.0.6
  hive_generator: ^2.0.1
  json_serializable: ^6.7.1

flutter:
  uses-material-design: true

  assets:
    - assets/images/
    - assets/fonts/

  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
          weight: 400
        - asset: assets/fonts/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
        - asset: assets/fonts/Inter-ExtraBold.ttf
          weight: 800

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/images/icon.png"
  adaptive_icon_background: "${data.secondaryColor || '#0a0a0f'}"
  adaptive_icon_foreground: "assets/images/icon_foreground.png"
`;
}

function generateReadme(data: BusinessFormData): string {
  return `# ${data.name || 'My Business App'}

> Custom mobile app generated by [ForgeLocal AI](https://forgelocal.ai)

## 🚀 Quick Start

### Prerequisites
- Flutter SDK >= 3.2.0 ([Install Flutter](https://docs.flutter.dev/get-started/install))
- Android Studio or VS Code with Flutter extension
- An Android device or emulator / iOS Simulator

### Run the app

\`\`\`bash
# Install dependencies
flutter pub get

# Run on connected device
flutter run

# Build release APK
flutter build apk --release

# Build release iOS (macOS only)
flutter build ios --release
\`\`\`

## 📁 Project Structure

\`\`\`
lib/
├── main.dart                  # App entry point
├── theme/
│   └── app_theme.dart         # Colors, typography, theme config
├── screens/
│   └── home_screen.dart       # Main home screen
├── widgets/
│   ├── feature_grid.dart      # Feature cards grid
│   └── bottom_nav.dart        # Bottom navigation bar
├── models/
│   ├── user_model.dart        # User data model
│   └── business_model.dart    # Business data model
├── services/
│   ├── api_service.dart       # API client (Dio + Retrofit)
│   ├── notification_service.dart  # Push notifications (FCM)
│   └── storage_service.dart   # Local storage (Hive)
└── providers/
    └── app_provider.dart      # Riverpod state management
\`\`\`

## 🏗️ Architecture

- **State Management:** Riverpod 2.x (code generation)
- **Navigation:** GoRouter with deep linking
- **Networking:** Dio + Retrofit (type-safe API calls)
- **Local Storage:** Hive (fast NoSQL) + SharedPreferences
- **Push Notifications:** Firebase Cloud Messaging
- **Analytics:** Firebase Analytics
- **Theming:** Custom dark theme with brand colors

## 🎨 Brand Colors

| Color | Hex |
|-------|-----|
| Primary | \`${data.primaryColor || '#22c55e'}\` |
| Secondary | \`${data.secondaryColor || '#0a0a0f'}\` |

## 📱 Features

${(data.features || 'Menu\nReservations\nLoyalty\nContact').split('\n').filter(f => f.trim()).map(f => `- ${f.trim()}`).join('\n')}

## 🔥 Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app with package name from \`android/app/build.gradle\`
3. Download \`google-services.json\` → place in \`android/app/\`
4. Add iOS app and download \`GoogleService-Info.plist\` → place in \`ios/Runner/\`
5. Run \`flutterfire configure\` for automatic setup

## 🏪 Store Submission

- App icons: Run \`flutter pub run flutter_launcher_icons\`
- Splash screen: Configured in \`android/app/src/main/res/drawable/launch_background.xml\`
- Signing: Add your keystore in \`android/key.properties\`

## 📄 License

Generated by ForgeLocal AI. All rights reserved to the business owner.

---

Built with ❤️ by ForgeLocal AI • ${new Date().getFullYear()}
`;
}

function generateApiService(data: BusinessFormData): string {
  const className = toPascalCase(data.name || 'MyBusiness');
  return `import 'package:dio/dio.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late final Dio _dio;

  void init({required String baseUrl, String? token}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer \$token',
      },
    ));

    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
    ));
  }

  // GET request
  Future<Response> get(String path, {Map<String, dynamic>? params}) async {
    return await _dio.get(path, queryParameters: params);
  }

  // POST request
  Future<Response> post(String path, {dynamic data}) async {
    return await _dio.post(path, data: data);
  }

  // PUT request
  Future<Response> put(String path, {dynamic data}) async {
    return await _dio.put(path, data: data);
  }

  // DELETE request
  Future<Response> delete(String path) async {
    return await _dio.delete(path);
  }
}

// Example: ${className} API endpoints
class ${className}Api {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getItems() async {
    final response = await _api.get('/items');
    return response.data as List<dynamic>;
  }

  Future<dynamic> getItemById(String id) async {
    final response = await _api.get('/items/\$id');
    return response.data;
  }

  Future<void> createItem(Map<String, dynamic> data) async {
    await _api.post('/items', data: data);
  }
}
`;
}

function generateNotificationService(): string {
  return `import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> init() async {
    // Request permission (iOS)
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('✅ Push notification permission granted');
    }

    // Get FCM token
    final token = await _messaging.getToken();
    print('📱 FCM Token: \$token');

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('📩 Foreground message: \${message.notification?.title}');
      _showLocalNotification(message);
    });

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_backgroundHandler);

    // Handle notification tap (app in background)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('🔔 Notification tapped: \${message.data}');
      _handleNotificationTap(message);
    });
  }

  static Future<void> _backgroundHandler(RemoteMessage message) async {
    print('📩 Background message: \${message.messageId}');
  }

  void _showLocalNotification(RemoteMessage message) {
    // Implement local notification display
    // Use flutter_local_notifications package for rich notifications
  }

  void _handleNotificationTap(RemoteMessage message) {
    // Navigate to relevant screen based on message data
    final type = message.data['type'];
    final id = message.data['id'];
    print('Navigate to: \$type with id: \$id');
  }

  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }
}
`;
}

function generateStorageService(): string {
  return `import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  late final SharedPreferences _prefs;
  late final Box _appBox;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    await Hive.initFlutter();
    _appBox = await Hive.openBox('app_data');
  }

  // SharedPreferences (simple key-value)
  Future<void> setString(String key, String value) async {
    await _prefs.setString(key, value);
  }

  String? getString(String key) => _prefs.getString(key);

  Future<void> setBool(String key, bool value) async {
    await _prefs.setBool(key, value);
  }

  bool? getBool(String key) => _prefs.getBool(key);

  // Hive (complex objects)
  Future<void> saveData(String key, dynamic data) async {
    await _appBox.put(key, data);
  }

  dynamic getData(String key) => _appBox.get(key);

  Future<void> deleteData(String key) async {
    await _appBox.delete(key);
  }

  Future<void> clearAll() async {
    await _prefs.clear();
    await _appBox.clear();
  }

  // Auth token management
  Future<void> saveToken(String token) async {
    await setString('auth_token', token);
  }

  String? getToken() => getString('auth_token');

  Future<void> clearToken() async {
    await _prefs.remove('auth_token');
  }

  bool get isLoggedIn => getToken() != null;
}
`;
}

function generateUserModel(): string {
  return `class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final int loyaltyPoints;
  final int totalVisits;
  final String memberSince;
  final String tier; // 'Bronze', 'Silver', 'Gold', 'Platinum'

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.loyaltyPoints = 0,
    this.totalVisits = 0,
    required this.memberSince,
    this.tier = 'Bronze',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      loyaltyPoints: json['loyalty_points'] as int? ?? 0,
      totalVisits: json['total_visits'] as int? ?? 0,
      memberSince: json['member_since'] as String,
      tier: json['tier'] as String? ?? 'Bronze',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phone': phone,
    'avatar_url': avatarUrl,
    'loyalty_points': loyaltyPoints,
    'total_visits': totalVisits,
    'member_since': memberSince,
    'tier': tier,
  };

  UserModel copyWith({
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    int? loyaltyPoints,
    int? totalVisits,
    String? tier,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
      totalVisits: totalVisits ?? this.totalVisits,
      memberSince: memberSince,
      tier: tier ?? this.tier,
    );
  }
}
`;
}

function generateBusinessModel(data: BusinessFormData): string {
  const className = toPascalCase(data.type || 'Business');
  return `class ${className}Model {
  final String id;
  final String name;
  final String type;
  final String city;
  final String? postcode;
  final String? description;
  final List<String> features;
  final String primaryColor;
  final String secondaryColor;
  final double rating;
  final int reviewCount;
  final String? logoUrl;
  final Map<String, String> openingHours;

  const ${className}Model({
    required this.id,
    required this.name,
    required this.type,
    required this.city,
    this.postcode,
    this.description,
    this.features = const [],
    this.primaryColor = '${data.primaryColor || '#22c55e'}',
    this.secondaryColor = '${data.secondaryColor || '#0a0a0f'}',
    this.rating = 4.8,
    this.reviewCount = 0,
    this.logoUrl,
    this.openingHours = const {},
  });

  factory ${className}Model.fromJson(Map<String, dynamic> json) {
    return ${className}Model(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      city: json['city'] as String,
      postcode: json['postcode'] as String?,
      description: json['description'] as String?,
      features: List<String>.from(json['features'] ?? []),
      primaryColor: json['primary_color'] as String? ?? '${data.primaryColor || '#22c55e'}',
      secondaryColor: json['secondary_color'] as String? ?? '${data.secondaryColor || '#0a0a0f'}',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      reviewCount: json['review_count'] as int? ?? 0,
      logoUrl: json['logo_url'] as String?,
      openingHours: Map<String, String>.from(json['opening_hours'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'type': type,
    'city': city,
    'postcode': postcode,
    'description': description,
    'features': features,
    'primary_color': primaryColor,
    'secondary_color': secondaryColor,
    'rating': rating,
    'review_count': reviewCount,
    'logo_url': logoUrl,
    'opening_hours': openingHours,
  };
}
`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateAppProvider(_data: BusinessFormData): string {
  return `import 'package:flutter_riverpod/flutter_riverpod.dart';

// Theme state
enum AppThemeMode { light, dark, system }

class AppState {
  final AppThemeMode themeMode;
  final bool isLoggedIn;
  final String? userName;
  final int loyaltyPoints;
  final int currentNavIndex;
  final bool notificationsEnabled;

  const AppState({
    this.themeMode = AppThemeMode.dark,
    this.isLoggedIn = false,
    this.userName,
    this.loyaltyPoints = 0,
    this.currentNavIndex = 0,
    this.notificationsEnabled = true,
  });

  AppState copyWith({
    AppThemeMode? themeMode,
    bool? isLoggedIn,
    String? userName,
    int? loyaltyPoints,
    int? currentNavIndex,
    bool? notificationsEnabled,
  }) {
    return AppState(
      themeMode: themeMode ?? this.themeMode,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      userName: userName ?? this.userName,
      loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
      currentNavIndex: currentNavIndex ?? this.currentNavIndex,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
    );
  }
}

class AppNotifier extends StateNotifier<AppState> {
  AppNotifier() : super(const AppState());

  void setThemeMode(AppThemeMode mode) {
    state = state.copyWith(themeMode: mode);
  }

  void login(String name) {
    state = state.copyWith(isLoggedIn: true, userName: name);
  }

  void logout() {
    state = state.copyWith(isLoggedIn: false, userName: null, loyaltyPoints: 0);
  }

  void addPoints(int points) {
    state = state.copyWith(loyaltyPoints: state.loyaltyPoints + points);
  }

  void setNavIndex(int index) {
    state = state.copyWith(currentNavIndex: index);
  }

  void toggleNotifications() {
    state = state.copyWith(notificationsEnabled: !state.notificationsEnabled);
  }
}

// Providers
final appProvider = StateNotifierProvider<AppNotifier, AppState>((ref) {
  return AppNotifier();
});

final isLoggedInProvider = Provider<bool>((ref) {
  return ref.watch(appProvider).isLoggedIn;
});

final loyaltyPointsProvider = Provider<int>((ref) {
  return ref.watch(appProvider).loyaltyPoints;
});

final currentNavIndexProvider = Provider<int>((ref) {
  return ref.watch(appProvider).currentNavIndex;
});
`;
}

function generateAndroidRootGradle(): string {
  return `buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:\$kotlin_version"
        classpath 'com.google.gms:google-services:4.4.0'
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

function generateSettingsGradle(data: BusinessFormData): string {
  const name = toSnakeCase(data.name || 'my_business_app');
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

function generateGradleProperties(): string {
  return `org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=2G -XX:+HeapDumpOnOutOfMemoryError
android.useAndroidX=true
android.enableJetifier=true
android.defaults.buildfeatures.buildconfig=true
android.nonTransitiveRClass=false
android.nonFinalResIds=false
`;
}

function generateAppBuildGradle(data: BusinessFormData): string {
  const name = toSnakeCase(data.name || 'my_business_app');
  return `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
    id "com.google.gms.google-services"
}

def localProperties = new Properties()
def localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader("UTF-8") { reader ->
        localProperties.load(reader)
    }
}

def flutterVersionCode = localProperties.getProperty("flutter.versionCode")
if (flutterVersionCode == null) {
    flutterVersionCode = "1"
}

def flutterVersionName = localProperties.getProperty("flutter.versionName")
if (flutterVersionName == null) {
    flutterVersionName = "1.0"
}

android {
    namespace "ai.forgelocal.${name}"
    compileSdk 34
    ndkVersion "26.1.10909125"

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17
    }

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
            // TODO: Configure signing for Play Store
            // keyAlias keystoreProperties['keyAlias']
            // keyPassword keystoreProperties['keyPassword']
            // storeFile file(keystoreProperties['storeFile'])
            // storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
            // signingConfig signingConfigs.release
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
}

flutter {
    source "../.."
}
`;
}

function generateAndroidManifest(data: BusinessFormData): string {
  const name = toSnakeCase(data.name || 'my_business_app');
  return `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ai.forgelocal.${name}">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

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
            <meta-data
                android:name="io.flutter.embedding.android.NormalTheme"
                android:resource="@style/NormalTheme"/>
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2"/>

        <!-- Firebase Cloud Messaging -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="high_importance_channel"/>
    </application>
</manifest>
`;
}

function generateInfoPlist(data: Pick<BusinessFormData, 'name'>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>${data.name || 'My Business'}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${data.name || 'My Business'}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIBackgroundModes</key>
    <array>
        <string>fetch</string>
        <string>remote-notification</string>
    </array>
    <key>FirebaseAppDelegateProxyEnabled</key>
    <false/>
</dict>
</plist>
`;
}

function generateWidgetTest(data: Pick<BusinessFormData, 'name'>): string {
  const className = toPascalCase(data.name || 'MyBusiness');
  return `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:${toSnakeCase(data.name || 'my_business_app')}/main.dart';

void main() {
  testWidgets('${className}App renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const ${className}App());

    // Verify app renders
    expect(find.byType(MaterialApp), findsOneWidget);

    // Verify home screen appears
    expect(find.text('Welcome to'), findsOneWidget);
    expect(find.text('${data.name || 'My Business'}'), findsOneWidget);
  });

  testWidgets('Bottom navigation works', (WidgetTester tester) async {
    await tester.pumpWidget(const ${className}App());

    // Tap on different tabs
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Rewards'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}
`;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('') || 'MyBusiness';
}
