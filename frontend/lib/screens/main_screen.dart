import 'package:flutter/material.dart';
import '../main.dart' show AppColors;
import 'home_screen.dart';
import 'work_schedule_screen.dart';
import 'sos_screen.dart';
import 'my_page_screen.dart';

/// 로그인 후 진입하는 메인 화면.
/// 하단 탭바로 홈(오늘의 루틴) / 근무표 / 돌발상황 / 설정을 오가요.
/// (실제 피그마 디자인 기준 4탭 구조예요 — 루틴은 홈에 통합, 건강기록·추천·전환가이드는
/// 아직 이 4탭 안에 자리가 정해지지 않아 팀 논의가 필요해요.)
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final _screens = const [
    HomeScreen(),
    WorkScheduleScreen(),
    SosScreen(),
    MyPageScreen(), // TODO: 피그마 "설정" 디자인(알람 토글 + 근무표 관리)으로 교체 예정
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: NavigationBar(
        backgroundColor: Colors.white,
        indicatorColor: AppColors.primary50,
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined, color: AppColors.neutral400),
            selectedIcon: const Icon(Icons.home, color: AppColors.primary400),
            label: '홈',
          ),
          NavigationDestination(
            icon: const Icon(Icons.assignment_outlined, color: AppColors.neutral400),
            selectedIcon: const Icon(Icons.assignment, color: AppColors.primary400),
            label: '근무표',
          ),
          NavigationDestination(
            icon: const Icon(Icons.error_outline, color: AppColors.neutral400),
            selectedIcon: const Icon(Icons.error, color: AppColors.primary400),
            label: '돌발상황',
          ),
          NavigationDestination(
            icon: const Icon(Icons.settings_outlined, color: AppColors.neutral400),
            selectedIcon: const Icon(Icons.settings, color: AppColors.primary400),
            label: '설정',
          ),
        ],
      ),
    );
  }
}