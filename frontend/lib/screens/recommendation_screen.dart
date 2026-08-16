import 'package:flutter/material.dart';
import '../services/api_client.dart';

/// 추천 루틴 항목.
/// TODO: 필드명이 백엔드 실제 응답과 맞는지 확인 필요해요 (id/title/description/reason 추정).
class RecommendedRoutine {
  final String id;
  final String title;
  final String? description;
  final String? reason;

  RecommendedRoutine({
    required this.id,
    required this.title,
    this.description,
    this.reason,
  });

  factory RecommendedRoutine.fromJson(Map<String, dynamic> json) {
    return RecommendedRoutine(
      id: json['id'].toString(),
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      reason: json['reason'] as String?,
    );
  }
}

class RecommendationScreen extends StatefulWidget {
  const RecommendationScreen({super.key});

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<RecommendedRoutine> _recommendations = [];
  final Set<String> _appliedIds = {};
  final Set<String> _applyingIds = {};

  @override
  void initState() {
    super.initState();
    _loadRecommendations();
  }

  Future<void> _loadRecommendations() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await apiClient.get('/recommendations/routines');
      final list = (data as List<dynamic>? ?? [])
          .map((e) => RecommendedRoutine.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() => _recommendations = list);
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _applyRoutine(RecommendedRoutine routine) async {
    setState(() => _applyingIds.add(routine.id));

    try {
      await apiClient.post('/recommendations/routines/${routine.id}/apply');
      if (!mounted) return;
      setState(() => _appliedIds.add(routine.id));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('"${routine.title}" 루틴을 적용했어요.')),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('적용에 실패했어요. 다시 시도해주세요.')));
    } finally {
      if (mounted) setState(() => _applyingIds.remove(routine.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('맞춤 루틴 추천'),
        actions: [
          IconButton(
            onPressed: _isLoading ? null : _loadRecommendations,
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
            OutlinedButton(onPressed: _loadRecommendations, child: const Text('다시 시도')),
          ],
        ),
      );
    }

    if (_recommendations.isEmpty) {
      return const Center(child: Text('아직 추천할 루틴이 없어요.'));
    }

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: ListView.separated(
          padding: const EdgeInsets.all(24),
          itemCount: _recommendations.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final routine = _recommendations[index];
            final isApplied = _appliedIds.contains(routine.id);
            final isApplying = _applyingIds.contains(routine.id);

            return Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      routine.title,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    if (routine.description != null) ...[
                      const SizedBox(height: 6),
                      Text(routine.description!, style: TextStyle(color: Colors.grey.shade700)),
                    ],
                    if (routine.reason != null) ...[
                      const SizedBox(height: 6),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.lightbulb_outline, size: 16, color: Colors.amber.shade700),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              routine.reason!,
                              style: TextStyle(fontSize: 13, color: Colors.amber.shade900),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: isApplied
                          ? const Chip(
                              label: Text('적용됨'),
                              avatar: Icon(Icons.check, size: 16),
                            )
                          : FilledButton(
                              onPressed: isApplying ? null : () => _applyRoutine(routine),
                              child: isApplying
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : const Text('적용하기'),
                            ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}