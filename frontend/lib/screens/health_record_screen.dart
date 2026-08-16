import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'health_history_screen.dart';

/// 수면/식사/운동 기록을 탭으로 나눠 입력하는 화면.
class HealthRecordScreen extends StatefulWidget {
  const HealthRecordScreen({super.key});

  @override
  State<HealthRecordScreen> createState() => _HealthRecordScreenState();
}

class _HealthRecordScreenState extends State<HealthRecordScreen> {
  DateTime _selectedDate = DateTime.now();

  String _formatDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('건강기록'),
          actions: [
            IconButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const HealthHistoryScreen()),
                );
              },
              icon: const Icon(Icons.history),
              tooltip: '기록 히스토리 보기',
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(text: '수면'),
              Tab(text: '식사'),
              Tab(text: '운동'),
            ],
          ),
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: OutlinedButton.icon(
                onPressed: _pickDate,
                icon: const Icon(Icons.calendar_today, size: 18),
                label: Text(_formatDate(_selectedDate)),
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _SleepForm(date: _selectedDate),
                  _MealForm(date: _selectedDate),
                  _ExerciseForm(date: _selectedDate),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 공통: 로딩/에러 처리 + 저장 버튼을 감싸는 폼 뼈대.
class _RecordFormScaffold extends StatelessWidget {
  final List<Widget> fields;
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback onSubmit;

  const _RecordFormScaffold({
    required this.fields,
    required this.isLoading,
    required this.errorMessage,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ...fields,
              if (errorMessage != null) ...[
                const SizedBox(height: 12),
                Text(errorMessage!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: isLoading ? null : onSubmit,
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('기록 저장'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

String _formatTime(TimeOfDay time) {
  final h = time.hour.toString().padLeft(2, '0');
  final m = time.minute.toString().padLeft(2, '0');
  return '$h:$m';
}

String _formatDateStatic(DateTime date) {
  final y = date.year.toString().padLeft(4, '0');
  final m = date.month.toString().padLeft(2, '0');
  final d = date.day.toString().padLeft(2, '0');
  return '$y-$m-$d';
}

// ---------------- 수면 ----------------

class _SleepForm extends StatefulWidget {
  final DateTime date;
  const _SleepForm({required this.date});

  @override
  State<_SleepForm> createState() => _SleepFormState();
}

class _SleepFormState extends State<_SleepForm> {
  TimeOfDay? _start;
  TimeOfDay? _end;
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _pick({required bool isStart}) async {
    final picked = await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (picked == null) return;
    setState(() => isStart ? _start = picked : _end = picked);
  }

  Future<void> _submit() async {
    if (_start == null || _end == null) {
      setState(() => _errorMessage = '취침·기상 시간을 선택해주세요.');
      return;
    }
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      // TODO: 백엔드 실제 요청 필드명 확인 필요 (date/startTime/endTime 추정).
      await apiClient.post('/health/sleep', body: {
        'date': _formatDateStatic(widget.date),
        'startTime': _formatTime(_start!),
        'endTime': _formatTime(_end!),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('수면 기록이 저장됐어요.')));
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
    return _RecordFormScaffold(
      isLoading: _isLoading,
      errorMessage: _errorMessage,
      onSubmit: _submit,
      fields: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => _pick(isStart: true),
                child: Text(_start == null ? '취침 시간' : _formatTime(_start!)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton(
                onPressed: () => _pick(isStart: false),
                child: Text(_end == null ? '기상 시간' : _formatTime(_end!)),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ---------------- 식사 ----------------

enum MealType { breakfast, lunch, dinner, snack }

extension MealTypeLabel on MealType {
  String get label {
    switch (this) {
      case MealType.breakfast:
        return '아침';
      case MealType.lunch:
        return '점심';
      case MealType.dinner:
        return '저녁';
      case MealType.snack:
        return '간식';
    }
  }

  String get apiValue => name.toUpperCase();
}

class _MealForm extends StatefulWidget {
  final DateTime date;
  const _MealForm({required this.date});

  @override
  State<_MealForm> createState() => _MealFormState();
}

class _MealFormState extends State<_MealForm> {
  MealType _type = MealType.breakfast;
  TimeOfDay? _time;
  final _memoController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _memoController.dispose();
    super.dispose();
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (picked != null) setState(() => _time = picked);
  }

  Future<void> _submit() async {
    if (_time == null) {
      setState(() => _errorMessage = '식사 시간을 선택해주세요.');
      return;
    }
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      // TODO: 백엔드 실제 요청 필드명 확인 필요 (date/mealTime/mealType/memo 추정).
      await apiClient.post('/health/meals', body: {
        'date': _formatDateStatic(widget.date),
        'mealTime': _formatTime(_time!),
        'mealType': _type.apiValue,
        'memo': _memoController.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('식사 기록이 저장됐어요.')));
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
    return _RecordFormScaffold(
      isLoading: _isLoading,
      errorMessage: _errorMessage,
      onSubmit: _submit,
      fields: [
        DropdownButtonFormField<MealType>(
          initialValue: _type,
          decoration: const InputDecoration(labelText: '식사 종류', border: OutlineInputBorder()),
          items: MealType.values
              .map((t) => DropdownMenuItem(value: t, child: Text(t.label)))
              .toList(),
          onChanged: (value) {
            if (value != null) setState(() => _type = value);
          },
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: _pickTime,
          child: Text(_time == null ? '식사 시간 선택' : _formatTime(_time!)),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _memoController,
          decoration: const InputDecoration(labelText: '메모 (선택)', border: OutlineInputBorder()),
        ),
      ],
    );
  }
}

// ---------------- 운동 ----------------

class _ExerciseForm extends StatefulWidget {
  final DateTime date;
  const _ExerciseForm({required this.date});

  @override
  State<_ExerciseForm> createState() => _ExerciseFormState();
}

class _ExerciseFormState extends State<_ExerciseForm> {
  TimeOfDay? _time;
  final _typeController = TextEditingController();
  final _durationController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _typeController.dispose();
    _durationController.dispose();
    super.dispose();
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (picked != null) setState(() => _time = picked);
  }

  Future<void> _submit() async {
    final duration = int.tryParse(_durationController.text.trim());
    if (_time == null || _typeController.text.trim().isEmpty || duration == null) {
      setState(() => _errorMessage = '운동 시간, 종류, 시간(분)을 모두 입력해주세요.');
      return;
    }
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      // TODO: 백엔드 실제 요청 필드명 확인 필요 (date/time/type/durationMinutes 추정).
      await apiClient.post('/health/exercise', body: {
        'date': _formatDateStatic(widget.date),
        'time': _formatTime(_time!),
        'type': _typeController.text.trim(),
        'durationMinutes': duration,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('운동 기록이 저장됐어요.')));
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
    return _RecordFormScaffold(
      isLoading: _isLoading,
      errorMessage: _errorMessage,
      onSubmit: _submit,
      fields: [
        OutlinedButton(
          onPressed: _pickTime,
          child: Text(_time == null ? '운동 시간 선택' : _formatTime(_time!)),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _typeController,
          decoration: const InputDecoration(labelText: '운동 종류 (예: 걷기)', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _durationController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: '운동 시간(분)', border: OutlineInputBorder()),
        ),
      ],
    );
  }
}