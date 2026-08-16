import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// 하루결 백엔드와 통신하는 API 클라이언트.
/// API 공통 규칙(회원가입/로그인 제외 모든 요청에 Bearer 토큰 필요,
/// 성공 시 {status, message, data}, 실패 시 {status, code, message, errors})에 맞춰져 있어요.
class ApiClient {
  // TODO: 팀원한테 실제 백엔드 서버 주소 확인해서 바꾸세요.
  // 로컬 FastAPI 기본 포트는 보통 8000이에요. docker-compose.yml에서 확인 가능해요.
  static const String baseUrl = 'http://localhost:8000/api';
  static const String _tokenKey = 'access_token';

  String? _accessToken;

  /// 로그인 성공 시 토큰을 저장하고, 로그아웃 시 null로 초기화하세요.
  /// 브라우저(SharedPreferences)에도 같이 저장/삭제해서 새로고침해도 유지돼요.
  Future<void> setAccessToken(String? token) async {
    _accessToken = token;
    final prefs = await SharedPreferences.getInstance();
    if (token == null) {
      await prefs.remove(_tokenKey);
    } else {
      await prefs.setString(_tokenKey, token);
    }
  }

  /// 앱 시작 시 한 번 호출해서, 저장된 토큰이 있으면 불러와요.
  /// true를 반환하면 로그인된 상태로 바로 시작할 수 있어요.
  Future<bool> tryRestoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_tokenKey);
    if (saved != null && saved.isNotEmpty) {
      _accessToken = saved;
      return true;
    }
    return false;
  }

  bool get isLoggedIn => _accessToken != null;

  Map<String, String> get _headers {
    final headers = {'Content-Type': 'application/json'};
    if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final response = await http.get(uri, headers: _headers);
    return _handleResponse(response);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await http.post(
      uri,
      headers: _headers,
      body: jsonEncode(body ?? {}),
    );
    return _handleResponse(response);
  }

  Future<dynamic> patch(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await http.patch(
      uri,
      headers: _headers,
      body: jsonEncode(body ?? {}),
    );
    return _handleResponse(response);
  }

  Future<dynamic> delete(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await http.delete(uri, headers: _headers);
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    final Map<String, dynamic> json =
        response.body.isEmpty ? {} : jsonDecode(response.body);

    final isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    if (isSuccess) {
      return json['data'];
    }

    final errorsJson = json['errors'] as List<dynamic>? ?? [];
    throw ApiException(
      status: json['status'] ?? response.statusCode,
      code: json['code'] ?? 'UNKNOWN_ERROR',
      message: json['message'] ?? '알 수 없는 오류가 발생했어요.',
      errors: errorsJson
          .map((e) => ApiFieldError(
                field: e['field'] as String,
                message: e['message'] as String,
              ))
          .toList(),
    );
  }
}

class ApiFieldError {
  final String field;
  final String message;
  ApiFieldError({required this.field, required this.message});
}

/// API 요청이 실패했을 때 발생하는 예외.
/// 화면에서는 catch (e is ApiException) 로 잡아서 e.message를 보여주면 돼요.
class ApiException implements Exception {
  final int status;
  final String code;
  final String message;
  final List<ApiFieldError> errors;

  ApiException({
    required this.status,
    required this.code,
    required this.message,
    required this.errors,
  });

  @override
  String toString() => 'ApiException($code): $message';
}

/// 앱 전체에서 이 인스턴스 하나를 공유해서 써요.
final apiClient = ApiClient();