import 'package:flutter/material.dart';
import 'services/api_client.dart';
import 'screens/login_screen.dart';
import 'screens/main_screen.dart';

class AppColors {
  static const neutral50 = Color(0xFFFAFAFA);
  static const neutral100 = Color(0xFFF2F2F2);
  static const neutral200 = Color(0xFFE3E3E3);
  static const neutral300 = Color(0xFFD4D4D4);
  static const neutral400 = Color(0xFFAAAAAA);
  static const neutral500 = Color(0xFF808080);
  static const neutral700 = Color(0xFF404040);
  static const neutral900 = Color(0xFF171717);

  static const primary50 = Color(0xFFE8F8F1);
  static const primary100 = Color(0xFF1FD696);
  static const primary400 = Color(0xFF17C288);
  static const primary500 = Color(0xFF0FAE7A);
  static const primary700 = Color(0xFF04573E);
}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '하루결',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.neutral50,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary500,
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.neutral50,
          surfaceTintColor: Colors.transparent,
          foregroundColor: AppColors.neutral900,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: const BorderRadius.all(Radius.circular(16)),
            side: BorderSide(color: AppColors.neutral300),
          ),
        ),
        textTheme: const TextTheme(
          headlineMedium: TextStyle(fontSize: 28, height: 1.2, fontWeight: FontWeight.bold, color: AppColors.neutral900),
          headlineSmall: TextStyle(fontSize: 24, height: 1.2, fontWeight: FontWeight.w600, color: AppColors.neutral900),
          titleLarge: TextStyle(fontSize: 22, height: 1.2, fontWeight: FontWeight.w600, color: AppColors.neutral900),
          titleMedium: TextStyle(fontSize: 18, height: 1.2, fontWeight: FontWeight.w600, color: AppColors.neutral900),
          bodyLarge: TextStyle(fontSize: 16, height: 1.5, color: AppColors.neutral900),
          bodyMedium: TextStyle(fontSize: 14, height: 1.5, color: AppColors.neutral700),
          labelLarge: TextStyle(fontSize: 14, height: 1.5, color: AppColors.neutral700),
          bodySmall: TextStyle(fontSize: 12, height: 1.5, color: AppColors.neutral500),
        ),
      ),
      home: const _StartupGate(),
    );
  }
}

class _StartupGate extends StatefulWidget {
  const _StartupGate();

  @override
  State<_StartupGate> createState() => _StartupGateState();
}

class _StartupGateState extends State<_StartupGate> {
  bool _isChecking = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final restored = await apiClient.tryRestoreSession();
    if (!mounted) return;
    setState(() {
      _isLoggedIn = restored;
      _isChecking = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isChecking) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return _isLoggedIn ? const MainScreen() : const LoginScreen();
  }
}