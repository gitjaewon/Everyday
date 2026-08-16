import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'transition_guide_screen.dart';

/// 근무 유형. 백엔드와 실제 값(코드)이 맞는지 팀원한테 확인 필요해요.
enum WorkType { day, evening, night, off }

extension WorkTypeLabel on WorkType {
  String get label {
    switch (this) {
      case WorkType.day:
        return '주간';
      case WorkType.evening:
        return '오후';
      case WorkType.night:
        return '야간';
      case WorkType.off:
        return '휴무';
    }
  }

  // TODO: 백엔드가 기대하는 실제 문자열 값(예: 'DAY', 'day' 등)인지 확인하세요.
  String get apiValue => name.toUpperCase();
}

class WorkScheduleScreen extends StatefulWidget {
  const WorkScheduleScreen({super.key});

  @override
  State<WorkScheduleScreen> createState() => _WorkScheduleScreenState();
}

class _WorkScheduleScreenState extends State<WorkScheduleScreen> {
  DateTime? _selectedDate;
  WorkType _selectedType = WorkType.day;
  TimeOfDay? _startTime;
  TimeOfDay? _endTime;

  bool _isLoading = false;
  String? _errorMessage;

  bool get _isOff => _selectedType == WorkType.off;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime({required bool isStart}) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (picked == null) return;
    setState(() {
      if (isStart) {
        _startTime = picked;
      } else {
        _endTime = picked;
      }
    });
  }

  String _formatDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  String _formatTime(TimeOfDay time) {
    final h = time.hour.toString().padLeft(2, '0');
    final m = time.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  Future<void> _handleSubmit() async {
    if (_selectedDate == null) {
      setState(() => _errorMessage = '날짜를 선택해주세요.');
      return;
    }
    if (!_isOff && (_startTime == null || _endTime == null)) {
      setState(() => _errorMessage = '근무 시작·종료 시간을 선택해주세요.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await apiClient.post('/work-schedules', body: {
        'workDate': _formatDate(_selectedDate!),
        'workType': _selectedType.apiValue,
        if (!_isOff) 'startTime': _formatTime(_startTime!),
        if (!_isOff) 'endTime': _formatTime(_endTime!),
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('근무 일정이 등록됐어요.')),
      );
      setState(() {
        _selectedDate = null;
        _startTime = null;
        _endTime = null;
        _selectedType = WorkType.day;
      });
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
      appBar: AppBar(
        title: const Text('근무 일정 등록'),
        actions: [
          IconButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const TransitionGuideScreen()),
              );
            },
            icon: const Icon(Icons.swap_horiz),
            tooltip: '근무 전환일 가이드',
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                OutlinedButton(
                  onPressed: _pickDate,
                  child: Text(
                    _selectedDate == null
                        ? '날짜 선택'
                        : _formatDate(_selectedDate!),
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<WorkType>(
                  initialValue: _selectedType,
                  decoration: const InputDecoration(
                    labelText: '근무 유형',
                    border: OutlineInputBorder(),
                  ),
                  items: WorkType.values
                      .map((type) => DropdownMenuItem(
                            value: type,
                            child: Text(type.label),
                          ))
                      .toList(),
                  onChanged: (value) {
                    if (value != null) setState(() => _selectedType = value);
                  },
                ),
                if (!_isOff) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _pickTime(isStart: true),
                          child: Text(
                            _startTime == null
                                ? '시작 시간'
                                : _formatTime(_startTime!),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _pickTime(isStart: false),
                          child: Text(
                            _endTime == null ? '종료 시간' : _formatTime(_endTime!),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                if (_errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _isLoading ? null : _handleSubmit,
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('등록'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}