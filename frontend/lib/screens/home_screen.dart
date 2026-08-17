import 'package:flutter/material.dart';
import '../main.dart' show AppColors;
import '../services/api_client.dart';

/// 오늘의 루틴 항목 상태.
/// TODO: 백엔드 실제 status 값(문자열)이 이 4개와 맞는지 확인 필요해요.
enum RoutineStatus { completed, postponed, upcoming, waiting }

extension RoutineStatusLabel on RoutineStatus {
  String get label {
    switch (this) {
      case RoutineStatus.completed:
        return '완료';
      case RoutineStatus.postponed:
        return '미룸';
      case RoutineStatus.upcoming:
        return '예정';
      case RoutineStatus.waiting:
        return '대기';
    }
  }

  static RoutineStatus fromApi(String? value) {
    switch (value) {
      case 'completed':
        return RoutineStatus.completed;
      case 'postponed':
        return RoutineStatus.postponed;
      case 'waiting':
        return RoutineStatus.waiting;
      case 'upcoming':
      default:
        return RoutineStatus.upcoming;
    }
  }
}

/// 오늘의 루틴 항목 하나.
/// TODO: 필드명이 백엔드 실제 응답과 맞는지 확인 필요해요 (id/time/title/status 추정).
class RoutineItem {
  final String id;
  final String time; // "HH:mm"
  final String title;
  final RoutineStatus status;

  RoutineItem({
    required this.id,
    required this.time,
    required this.title,
    required this.status,
  });

  factory RoutineItem.fromJson(Map<String, dynamic> json) {
    return RoutineItem(
      id: json['id'].toString(),
      time: json['time'] as String? ?? '--:--',
      title: json['title'] as String? ?? '',
      status: RoutineStatusLabel.fromApi(json['status'] as String?),
    );
  }

  RoutineItem copyWith({RoutineStatus? status}) {
    return RoutineItem(id: id, time: time, title: title, status: status ?? this.status);
  }
}

/// 홈 화면 = "오늘의 루틴" 화면. 로그인 후 첫 화면이자 하단 탭의 첫 번째 탭이에요.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<RoutineItem> _routines = [];
  String? _expandedId;

  // TODO: GET /api/today/work 응답 필드명 확인 필요 (date/workType 추정).
  String? _dateLabel;
  String? _workTypeLabel;

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
      final results = await Future.wait([
        apiClient.get('/today/work'),
        apiClient.get('/today/routines'),
      ]);

      final workData = results[0] as Map<String, dynamic>?;
      final routinesData = results[1] as List<dynamic>? ?? [];

      setState(() {
        _dateLabel = workData?['date'] as String?;
        _workTypeLabel = workData?['workType'] as String?;
        _routines = routinesData
            .map((e) => RoutineItem.fromJson(e as Map<String, dynamic>))
            .toList();
      });
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _setStatus(RoutineItem item, RoutineStatus newStatus) async {
    final endpoint = newStatus == RoutineStatus.completed
        ? '/today/routines/${item.id}/complete'
        : '/today/routines/${item.id}/postpone'; // TODO: 미루기 엔드포인트는 명세서에 없어 추정값이에요.

    setState(() {
      _routines = _routines
          .map((r) => r.id == item.id ? r.copyWith(status: newStatus) : r)
          .toList();
      _expandedId = null;
    });

    try {
      await apiClient.post(endpoint);
    } catch (e) {
      // 실패하면 되돌리고 안내해요.
      setState(() {
        _routines = _routines
            .map((r) => r.id == item.id ? r.copyWith(status: item.status) : r)
            .toList();
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('처리에 실패했어요. 다시 시도해주세요.')));
    }
  }

  int get _completedCount =>
      _routines.where((r) => r.status == RoutineStatus.completed).length;

  /// 완료되지 않은 것 중 가장 먼저 오는 항목의 id (타임라인에서 강조 표시할 대상).
  String? get _nextUpId {
    final upcoming = _routines.where((r) => r.status != RoutineStatus.completed);
    return upcoming.isEmpty ? null : upcoming.first.id;
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: RefreshIndicator(
              onRefresh: _load,
              child: _buildBody(textTheme),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBody(TextTheme textTheme) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return ListView(
        children: [
          const SizedBox(height: 120),
          Center(
            child: Column(
              children: [
                Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 12),
                OutlinedButton(onPressed: _load, child: const Text('다시 시도')),
              ],
            ),
          ),
        ],
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      children: [
        // 상단: 날짜 · 근무유형
        Text(
          [
            if (_dateLabel != null) _dateLabel!,
            if (_workTypeLabel != null) _workTypeLabel!,
          ].join('  |  '),
          style: textTheme.bodyMedium,
        ),
        const SizedBox(height: 8),
        Text('오늘의 루틴', style: textTheme.headlineMedium),
        const SizedBox(height: 4),
        Text('물을 마셔보는 것이 어떨까요?', style: textTheme.bodyLarge),
        const SizedBox(height: 16),

        // 진행도
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('진행도', style: textTheme.bodyMedium),
            Text(
              '$_completedCount / ${_routines.length}',
              style: textTheme.titleMedium,
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: _routines.isEmpty ? 0 : _completedCount / _routines.length,
            minHeight: 6,
            backgroundColor: AppColors.neutral100,
            valueColor: const AlwaysStoppedAnimation(AppColors.primary400),
          ),
        ),
        const SizedBox(height: 24),

        // 요일 스트립 (날짜는 실제 이번 주, 근무유형은 TODO: 실제 데이터 연동 필요)
        _WeekStrip(),
        const SizedBox(height: 24),

        if (_routines.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: Text('오늘 등록된 루틴이 없어요.')),
          )
        else
          ..._buildTimeline(textTheme),

        const SizedBox(height: 16),
        _DisclaimerBox(),
      ],
    );
  }

  List<Widget> _buildTimeline(TextTheme textTheme) {
    final nextUpId = _nextUpId;
    return List.generate(_routines.length, (index) {
      final item = _routines[index];
      final isLast = index == _routines.length - 1;
      final isExpanded = _expandedId == item.id;
      final isHighlighted = item.id == nextUpId;

      return _RoutineRow(
        item: item,
        isLast: isLast,
        isExpanded: isExpanded,
        isHighlighted: isHighlighted,
        textTheme: textTheme,
        onTap: () {
          setState(() => _expandedId = isExpanded ? null : item.id);
        },
        onComplete: () => _setStatus(item, RoutineStatus.completed),
        onPostpone: () => _setStatus(item, RoutineStatus.postponed),
      );
    });
  }
}

/// 이번 주 요일 스트립. 날짜는 실제 값, 근무유형 배지는 TODO(백엔드 연동 전 자리 표시자)예요.
class _WeekStrip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday % 7)); // 일요일 시작
    const labels = ['일', '월', '화', '수', '목', '금', '토'];

    return SizedBox(
      height: 64,
      child: Row(
        children: List.generate(7, (i) {
          final date = startOfWeek.add(Duration(days: i));
          final isToday = date.day == now.day && date.month == now.month;
          return Expanded(
            child: Column(
              children: [
                Text(labels[i], style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 6),
                Container(
                  width: 28,
                  height: 28,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isToday ? AppColors.primary400 : Colors.transparent,
                  ),
                  child: Text(
                    '${date.day}',
                    style: TextStyle(
                      color: isToday ? Colors.white : AppColors.neutral900,
                      fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}

class _DisclaimerBox extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.primary50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary100),
      ),
      child: Text(
        '본 루틴은 생활 관리 목적의 권장 사항입니다.\n건강 상태에 따른 판단이 필요한 경우 의료 전문가와 상담하세요.',
        style: Theme.of(context).textTheme.bodySmall,
      ),
    );
  }
}

class _RoutineRow extends StatelessWidget {
  final RoutineItem item;
  final bool isLast;
  final bool isExpanded;
  final bool isHighlighted;
  final TextTheme textTheme;
  final VoidCallback onTap;
  final VoidCallback onComplete;
  final VoidCallback onPostpone;

  const _RoutineRow({
    required this.item,
    required this.isLast,
    required this.isExpanded,
    required this.isHighlighted,
    required this.textTheme,
    required this.onTap,
    required this.onComplete,
    required this.onPostpone,
  });

  Color get _dotColor {
    switch (item.status) {
      case RoutineStatus.completed:
        return AppColors.primary400;
      case RoutineStatus.postponed:
        return Colors.orange;
      case RoutineStatus.upcoming:
      case RoutineStatus.waiting:
        return AppColors.neutral300;
    }
  }

  Widget _statusBadge() {
    Color bg;
    Color fg;
    switch (item.status) {
      case RoutineStatus.completed:
        bg = AppColors.primary400;
        fg = Colors.white;
        break;
      case RoutineStatus.postponed:
        bg = Colors.orange.shade100;
        fg = Colors.orange.shade800;
        break;
      case RoutineStatus.upcoming:
      case RoutineStatus.waiting:
        bg = AppColors.neutral100;
        fg = AppColors.neutral700;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(item.status.label, style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final canAct = item.status != RoutineStatus.completed;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 48,
            child: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(item.time, style: textTheme.bodySmall),
            ),
          ),
          Column(
            children: [
              Container(
                width: 10,
                height: 10,
                margin: const EdgeInsets.only(top: 6),
                decoration: BoxDecoration(shape: BoxShape.circle, color: _dotColor),
              ),
              if (!isLast) Expanded(child: Container(width: 2, color: AppColors.neutral100)),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isHighlighted ? AppColors.primary400 : AppColors.neutral200,
                    width: isHighlighted ? 1.5 : 1,
                  ),
                ),
                child: InkWell(
                  onTap: canAct ? onTap : null,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(item.title,
                                style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                          ),
                          _statusBadge(),
                          if (canAct) ...[
                            const SizedBox(width: 4),
                            Icon(
                              isExpanded ? Icons.expand_less : Icons.expand_more,
                              size: 18,
                              color: AppColors.neutral400,
                            ),
                          ],
                        ],
                      ),
                      if (isExpanded && canAct) ...[
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: FilledButton(onPressed: onComplete, child: const Text('완료')),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: OutlinedButton(onPressed: onPostpone, child: const Text('미루기')),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}