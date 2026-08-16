import 'package:flutter/material.dart';
import '../services/api_client.dart';

/// 세 기록 타입(수면/식사/운동) 공통으로 쓰는 조회 화면.
/// TODO: 세 API 모두 응답 필드명이 명세서에 없어서 추정값이에요. 백엔드 확인 필요.
class HealthHistoryScreen extends StatelessWidget {
  const HealthHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('건강기록 히스토리'),
          bottom: const TabBar(
            tabs: [
              Tab(text: '수면'),
              Tab(text: '식사'),
              Tab(text: '운동'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _RecordListView(
              endpoint: '/health/sleep',
              emptyText: '기록된 수면이 없어요.',
              itemBuilder: _buildSleepTile,
            ),
            _RecordListView(
              endpoint: '/health/meals',
              emptyText: '기록된 식사가 없어요.',
              itemBuilder: _buildMealTile,
            ),
            _RecordListView(
              endpoint: '/health/exercise',
              emptyText: '기록된 운동이 없어요.',
              itemBuilder: _buildExerciseTile,
            ),
          ],
        ),
      ),
    );
  }
}

Widget _buildSleepTile(Map<String, dynamic> json) {
  final date = json['date'] as String? ?? '';
  final start = json['startTime'] as String? ?? '';
  final end = json['endTime'] as String? ?? '';
  return ListTile(
    leading: const Icon(Icons.bedtime_outlined),
    title: Text('$start ~ $end'),
    subtitle: Text(date),
  );
}

Widget _buildMealTile(Map<String, dynamic> json) {
  final date = json['date'] as String? ?? '';
  final time = json['mealTime'] as String? ?? '';
  final type = json['mealType'] as String? ?? '';
  final memo = json['memo'] as String?;
  return ListTile(
    leading: const Icon(Icons.restaurant_outlined),
    title: Text('$type · $time'),
    subtitle: Text(memo?.isNotEmpty == true ? '$date · $memo' : date),
  );
}

Widget _buildExerciseTile(Map<String, dynamic> json) {
  final date = json['date'] as String? ?? '';
  final time = json['time'] as String? ?? '';
  final type = json['type'] as String? ?? '';
  final duration = json['durationMinutes'];
  return ListTile(
    leading: const Icon(Icons.directions_run_outlined),
    title: Text('$type · ${duration ?? '-'}분'),
    subtitle: Text('$date $time'),
  );
}

/// 하나의 엔드포인트에서 목록을 불러와 리스트로 보여주는 공통 위젯.
class _RecordListView extends StatefulWidget {
  final String endpoint;
  final String emptyText;
  final Widget Function(Map<String, dynamic> json) itemBuilder;

  const _RecordListView({
    required this.endpoint,
    required this.emptyText,
    required this.itemBuilder,
  });

  @override
  State<_RecordListView> createState() => _RecordListViewState();
}

class _RecordListViewState extends State<_RecordListView> {
  bool _isLoading = true;
  String? _errorMessage;
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final data = await apiClient.get(widget.endpoint);
      final list = (data as List<dynamic>? ?? [])
          .map((e) => e as Map<String, dynamic>)
          .toList();
      setState(() => _items = list);
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: _load, child: const Text('다시 시도')),
          ],
        ),
      );
    }

    if (_items.isEmpty) {
      return Center(child: Text(widget.emptyText));
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: _items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) => widget.itemBuilder(_items[index]),
          ),
        ),
      ),
    );
  }
}