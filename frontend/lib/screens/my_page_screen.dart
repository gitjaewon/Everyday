import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'login_screen.dart';

/// 내 정보.
/// TODO: 필드명이 백엔드 실제 응답과 맞는지 확인 필요해요 (email/name 추정).
class UserProfile {
  final String email;
  final String? name;

  UserProfile({required this.email, this.name});

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      email: json['email'] as String? ?? '',
      name: json['name'] as String?,
    );
  }
}

class MyPageScreen extends StatefulWidget {
  const MyPageScreen({super.key});

  @override
  State<MyPageScreen> createState() => _MyPageScreenState();
}

class _MyPageScreenState extends State<MyPageScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  UserProfile? _profile;

  final _nameController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final data = await apiClient.get('/users/me');
      final profile = UserProfile.fromJson(data as Map<String, dynamic>);
      setState(() {
        _profile = profile;
        _nameController.text = profile.name ?? '';
      });
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveName() async {
    setState(() => _isSaving = true);
    try {
      await apiClient.patch('/users/me', body: {
        'name': _nameController.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('저장됐어요.')));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('저장에 실패했어요. 다시 시도해주세요.')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('로그아웃'),
        content: const Text('로그아웃 하시겠어요?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('로그아웃'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    await apiClient.setAccessToken(null);
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (route) => false,
    );
  }

  Future<void> _confirmDeleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('회원탈퇴'),
        content: const Text('정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없어요.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('탈퇴하기'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await apiClient.delete('/users/me');
      await apiClient.setAccessToken(null);
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('탈퇴 처리에 실패했어요. 다시 시도해주세요.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('설정')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 내 정보 조회/수정 영역 — 로딩·에러·성공 상태에 따라 이 부분만 바뀌어요.
                _buildProfileSection(),

                // 로그아웃 · 회원탈퇴는 내 정보 조회 성공 여부와 관계없이 항상 보여요.
                const SizedBox(height: 32),
                OutlinedButton(
                  onPressed: _handleLogout,
                  child: const Text('로그아웃'),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: _confirmDeleteAccount,
                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                  child: const Text('회원탈퇴'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileSection() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null) {
      return Column(
        children: [
          Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: _loadProfile, child: const Text('내 정보 다시 불러오기')),
        ],
      );
    }

    final profile = _profile;
    if (profile == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          enabled: false,
          controller: TextEditingController(text: profile.email),
          decoration: const InputDecoration(
            labelText: '이메일',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: '이름',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: _isSaving ? null : _saveName,
          child: _isSaving
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('저장'),
        ),
      ],
    );
  }
}