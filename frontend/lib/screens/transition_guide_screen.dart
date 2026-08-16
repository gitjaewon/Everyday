import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'work_schedule_screen.dart' show WorkType, WorkTypeLabel;

/// 전환 가이드에 담기는 항목 하나 (시간대별 팁).
/// TODO: 필드명이 백엔드 실제 응답과 맞는지 확인 필요해요 (time/title/description 추정).
class TransitionGuideItem {
  final String time;
  final String title;
  final String? description;

  TransitionGuideItem({required this.time, required this.title, this.description});

  factory TransitionGuideItem.fromJson(Map<String, dynamic> json) {
    return TransitionGuideItem(
      time: json['time'] as String? ?? '--:--',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
    );
  }
}

class TransitionGuideScreen extends StatefulWidget {
  const TransitionGuideScreen({super.key});

  @override
  State<TransitionGuideScreen> createState() => _TransitionGuideScreenState();
}

class _TransitionGuideScreenState extends State<TransitionGuideScreen> {
  WorkType _fromType = WorkType.night;
  WorkType _toType = WorkType.day;

  bool _isLoading = false;
  String? _errorMessage;
  List<TransitionGuideItem> _guide = [];
  bool _hasSearched = false;

  Future<void> _loadGuide() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _hasSearched = true;
    });

    try {
      // TODO: 실제 엔드포인트/필드명은 명세서에 없어서 추정한 값이에요. 백엔드 팀원 확인 필요.
      final data = await apiClient.post('/routines/transition-guide', body: {
        'fromType': _fromType.apiValue,
        'toType': _toType.apiValue,
      });
      final list = (data as List<dynamic>? ?? [])
          .map((e) => TransitionGuideItem.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() => _guide = list);
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
    return Scaffold(
      appBar: AppBar(title: const Text('근무 전환일 가이드')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      '패턴이 바뀌는 날, 수면 부채를 최소화하는\n전환 전용 루틴을 알려드려요.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<WorkType>(
                            initialValue: _fromType,
                            decoration: const InputDecoration(
                              labelText: '이전 근무',
                              border: OutlineInputBorder(),
                            ),
                            items: WorkType.values
                                .map((t) => DropdownMenuItem(value: t, child: Text(t.label)))
                                .toList(),
                            onChanged: (value) {
                              if (value != null) setState(() => _fromType = value);
                            },
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8),
                          child: Icon(Icons.arrow_forward),
                        ),
                        Expanded(
                          child: DropdownButtonFormField<WorkType>(
                            initialValue: _toType,
                            decoration: const InputDecoration(
                              labelText: '다음 근무',
                              border: OutlineInputBorder(),
                            ),
                            items: WorkType.values
                                .map((t) => DropdownMenuItem(value: t, child: Text(t.label)))
                                .toList(),
                            onChanged: (value) {
                              if (value != null) setState(() => _toType = value);
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _isLoading ? null : _loadGuide,
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('가이드 보기'),
                    ),
                  ],
                ),
              ),
              Expanded(child: _buildResult()),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResult() {
    if (!_hasSearched) {
      return const SizedBox.shrink();
    }
    if (_errorMessage != null) {
      return Center(
        child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
      );
    }
    if (_guide.isEmpty) {
      return _isLoading
          ? const SizedBox.shrink()
          : const Center(child: Text('가이드 정보가 없어요.'));
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
      itemCount: _guide.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final item = _guide[index];
        return Card(
          child: ListTile(
            leading: CircleAvatar(child: Text(item.time.split(':').first)),
            title: Text(item.title),
            subtitle: item.description != null ? Text(item.description!) : null,
          ),
        );
      },
    );
  }
}