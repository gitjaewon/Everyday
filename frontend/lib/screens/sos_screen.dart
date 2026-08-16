import 'package:flutter/material.dart';
import '../services/api_client.dart';

/// SOS 재계산 결과.
/// TODO: 백엔드 실제 응답 필드명 확인 필요해요 (napTime/caffeineCutoffTime/message 추정).
class SosResult {
  final String? napTime;
  final String? caffeineCutoffTime;
  final String message;

  SosResult({
    this.napTime,
    this.caffeineCutoffTime,
    required this.message,
  });

  factory SosResult.fromJson(Map<String, dynamic> json) {
    return SosResult(
      napTime: json['napTime'] as String?,
      caffeineCutoffTime: json['caffeineCutoffTime'] as String?,
      message: json['message'] as String? ?? '회복 루틴이 재계산됐어요.',
    );
  }
}

class SosScreen extends StatefulWidget {
  const SosScreen({super.key});

  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  bool _isLoading = false;
  String? _errorMessage;
  SosResult? _result;

  Future<void> _confirmAndTriggerSos() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('긴급 상황 발생'),
        content: const Text(
          '갑작스러운 출동·비상 상황으로 루틴이 흐트러지셨나요?\n'
          '지금까지의 수면 부족분을 반영해 오늘 남은 회복 루틴을 다시 계산해드려요.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('재계산하기'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _result = null;
    });

    try {
      final data = await apiClient.post('/today/sos');
      setState(() => _result = SosResult.fromJson(data as Map<String, dynamic>));
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
      appBar: AppBar(title: const Text('SOS')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  '돌발 상황이 생겼을 때 눌러주세요.\n'
                  'AI가 오늘 남은 하루의 회복 루틴을 즉시 다시 계산해드려요.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 32),
                GestureDetector(
                  onTap: _isLoading ? null : _confirmAndTriggerSos,
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isLoading ? Colors.red.shade200 : Colors.red,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withValues(alpha: 0.3),
                          blurRadius: 20,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: Center(
                      child: _isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'SOS',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                if (_errorMessage != null)
                  Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                  ),
                if (_result != null) _buildResultCard(_result!),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard(SosResult result) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(result.message, style: const TextStyle(fontSize: 16)),
            if (result.napTime != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.bedtime_outlined, size: 20),
                  const SizedBox(width: 8),
                  Text('추천 파워냅 시간: ${result.napTime}'),
                ],
              ),
            ],
            if (result.caffeineCutoffTime != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.local_cafe_outlined, size: 20),
                  const SizedBox(width: 8),
                  Text('카페인 컷오프 조정: ${result.caffeineCutoffTime}'),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}