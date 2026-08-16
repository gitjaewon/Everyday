import 'package:flutter/material.dart';
import '../widgets/app_icon.dart';
import 'work_schedule_screen.dart';
import 'routine_timeline_screen.dart';
import 'health_record_screen.dart';
import 'sos_screen.dart';
import 'my_page_screen.dart';

/// 로그인 후 첫 화면이자 메인 메뉴.
/// 4개 영역(근무표/루틴/건강기록/SOS) 중 원하는 곳을 카드로 골라 들어가요.
/// 각 화면은 새 페이지로 열리고, 뒤로가기 버튼으로 다시 이 화면으로 돌아와요.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      _HomeItem(
        assetName: 'work_schedule.png',
        fallback: Icons.calendar_today_outlined,
        title: '근무표',
        subtitle: '근무 일정을 등록하고 관리해요',
        builder: (_) => const WorkScheduleScreen(),
      ),
      _HomeItem(
        assetName: 'routine.png',
        fallback: Icons.checklist_outlined,
        title: '루틴',
        subtitle: '오늘의 루틴을 확인하고 완료해요',
        builder: (_) => const RoutineTimelineScreen(),
      ),
      _HomeItem(
        assetName: 'health.png',
        fallback: Icons.monitor_heart_outlined,
        title: '건강기록',
        subtitle: '수면·식사·운동을 기록해요',
        builder: (_) => const HealthRecordScreen(),
      ),
      _HomeItem(
        assetName: 'sos.png',
        fallback: Icons.emergency_outlined,
        title: 'SOS',
        subtitle: '긴급 상황 시 루틴을 재계산해요',
        builder: (_) => const SosScreen(),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('하루결'),
        actions: [
          IconButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const MyPageScreen()),
              );
            },
            icon: const AppIcon('profile.png', fallback: Icons.person_outline),
            tooltip: '마이페이지',
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  '오늘은 무엇부터 확인할까요?',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 24),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.05,
                  children: items.map((item) => _HomeCard(item: item)).toList(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _HomeItem {
  final String assetName;
  final IconData fallback;
  final String title;
  final String subtitle;
  final WidgetBuilder builder;

  _HomeItem({
    required this.assetName,
    required this.fallback,
    required this.title,
    required this.subtitle,
    required this.builder,
  });
}

class _HomeCard extends StatelessWidget {
  final _HomeItem item;

  const _HomeCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(MaterialPageRoute(builder: item.builder));
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AppIcon(item.assetName, fallback: item.fallback, size: 32),
              const SizedBox(height: 12),
              Text(
                item.title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                item.subtitle,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}