import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'recommendation_screen.dart';

/// 오늘의 루틴 항목 하나.
/// TODO: 필드명이 백엔드 실제 응답과 맞는지 확인 필요해요 (id/time/title/description/isCompleted 추정).
class RoutineItem {
  final String id;
  final String time; // "HH:mm"
  final String title;
  final String? description;
  final bool isCompleted;

  RoutineItem({
    required this.id,
    required this.time,
    required this.title,
    this.description,
    required this.isCompleted,
  });

  factory RoutineItem.fromJson(Map<String, dynamic> json) {
    return RoutineItem(
      id: json['id'].toString(),
      time: json['time'] as String? ?? '--:--',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      isCompleted: json['isCompleted'] as bool? ?? false,
    );
  }
}

class RoutineTimelineScreen extends StatefulWidget {
  const RoutineTimelineScreen({super.key});

  @override
  State<RoutineTimelineScreen> createState() => _RoutineTimelineScreenState();
}

class _RoutineTimelineScreenState extends State<RoutineTimelineScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<RoutineItem> _routines = [];

  @override
  void initState() {
    super.initState();
    _loadRoutines();
  }

  Future<void> _loadRoutines() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await apiClient.get('/today/routines');
      final list = (data as List<dynamic>? ?? [])
          .map((e) => RoutineItem.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() => _routines = list);
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleComplete(RoutineItem item) async {
    if (item.isCompleted) return; // 이미 완료된 항목은 그대로 둬요.

    // 먼저 화면에 바로 반영(낙관적 업데이트)하고, 실패하면 되돌려요.
    setState(() {
      _routines = _routines
          .map((r) => r.id == item.id
              ? RoutineItem(
                  id: r.id,
                  time: r.time,
                  title: r.title,
                  description: r.description,
                  isCompleted: true,
                )
              : r)
          .toList();
    });

    try {
      await apiClient.post('/today/routines/${item.id}/complete');
    } catch (e) {
      // 실패하면 원래대로 되돌리고 안내해요.
      setState(() {
        _routines = _routines
            .map((r) => r.id == item.id
                ? RoutineItem(
                    id: r.id,
                    time: r.time,
                    title: r.title,
                    description: r.description,
                    isCompleted: false,
                  )
                : r)
            .toList();
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('완료 처리에 실패했어요. 다시 시도해주세요.')),
      );
    }
  }

  void _goToRecommendations() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const RecommendationScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('오늘의 루틴'),
        actions: [
          IconButton(
            onPressed: _goToRecommendations,
            icon: const Icon(Icons.lightbulb_outline),
            tooltip: '맞춤 루틴 추천',
          ),
          IconButton(
            onPressed: _isLoading ? null : _loadRoutines,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
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
            OutlinedButton(onPressed: _loadRoutines, child: const Text('다시 시도')),
          ],
        ),
      );
    }

    if (_routines.isEmpty) {
      return const Center(child: Text('오늘 등록된 루틴이 없어요.'));
    }

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: ListView.builder(
          padding: const EdgeInsets.all(24),
          itemCount: _routines.length,
          itemBuilder: (context, index) {
            final item = _routines[index];
            final isLast = index == _routines.length - 1;
            return _TimelineRow(
              item: item,
              isLast: isLast,
              onTap: () => _toggleComplete(item),
            );
          },
        ),
      ),
    );
  }
}

class _TimelineRow extends StatelessWidget {
  final RoutineItem item;
  final bool isLast;
  final VoidCallback onTap;

  const _TimelineRow({
    required this.item,
    required this.isLast,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = item.isCompleted ? Colors.grey : Theme.of(context).colorScheme.primary;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 52,
            child: Text(
              item.time,
              style: TextStyle(color: color, fontWeight: FontWeight.w600),
            ),
          ),
          Column(
            children: [
              Icon(
                item.isCompleted ? Icons.check_circle : Icons.circle_outlined,
                color: color,
                size: 20,
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: Colors.grey.shade300),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: InkWell(
              onTap: onTap,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        decoration:
                            item.isCompleted ? TextDecoration.lineThrough : null,
                        color: item.isCompleted ? Colors.grey : null,
                      ),
                    ),
                    if (item.description != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        item.description!,
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}