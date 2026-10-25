import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// VIBEX API Service — communicates with the existing Express.js backend.
/// ZERO-FAKE-DATA CONTRACT: Never replaces missing or failed server responses with fabricated data.
class ApiService {
  final Dio _dio;

  ApiService({required String baseUrl})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 30),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        )) {
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => debugPrint(obj.toString()),
    ));
  }

  /// Verifies connectivity to the backend and its underlying services (PostgreSQL, Redis).
  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final resp = await _dio.get('/api/health');
      if (resp.statusCode == 200 && resp.data is Map<String, dynamic>) {
        return resp.data as Map<String, dynamic>;
      }
      return {'status': 'error', 'message': 'Unexpected server response'};
    } catch (e) {
      return {'status': 'unreachable', 'error': e.toString()};
    }
  }

  // ─── User Profile & Preferences ──────────────────────────────────────────

  /// Fetches authoritative user profile from PostgreSQL.
  Future<Map<String, dynamic>> fetchUserProfile(String userId) async {
    try {
      final resp = await _dio.get('/api/user/profile/$userId');
      return resp.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to fetch user profile: ${e.message}');
    }
  }

  /// Updates user preferences in PostgreSQL.
  Future<Map<String, dynamic>> updateUserProfile(
    String userId, {
    String? selectedInstrument,
    int? dailyGoalMinutes,
    String? experienceLevel,
    String? primaryGoal,
  }) async {
    try {
      final resp = await _dio.put('/api/user/profile/$userId', data: {
        if (selectedInstrument != null) 'selected_instrument': selectedInstrument,
        if (dailyGoalMinutes != null) 'daily_goal_minutes': dailyGoalMinutes,
        if (experienceLevel != null) 'experience_level': experienceLevel,
        if (primaryGoal != null) 'primary_goal': primaryGoal,
      });
      return resp.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to update user profile: ${e.message}');
    }
  }

  // ─── Real Progress & Practice History ───────────────────────────────────

  /// Fetches genuine earned progress, completed lessons, exercises, and badges.
  Future<Map<String, dynamic>> fetchUserProgress(String userId) async {
    try {
      final resp = await _dio.get('/api/user/progress/$userId');
      return resp.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to fetch user progress: ${e.message}');
    }
  }

  /// Persists a genuine completed practice session to PostgreSQL in a transaction.
  Future<Map<String, dynamic>> submitPracticeSession({
    required String userId,
    required String instrument,
    required int durationSeconds,
    required int notesPlayed,
    required int pitchAccuracy,
    required int rhythmAccuracy,
    required int overallScore,
    required bool isPassed,
    String? exerciseId,
  }) async {
    try {
      final resp = await _dio.post('/api/practice/session', data: {
        'userId': userId,
        'exerciseId': exerciseId,
        'instrument': instrument,
        'durationSeconds': durationSeconds,
        'notesPlayed': notesPlayed,
        'pitchAccuracy': pitchAccuracy,
        'rhythmAccuracy': rhythmAccuracy,
        'overallScore': overallScore,
        'isPassed': isPassed,
      });
      return resp.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to record practice session: ${e.response?.data?['error'] ?? e.message}');
    }
  }

  /// Marks a lesson completed idempotently in PostgreSQL.
  Future<Map<String, dynamic>> completeLesson({
    required String userId,
    required String lessonId,
    required int score,
  }) async {
    try {
      final resp = await _dio.post('/api/practice/complete-lesson', data: {
        'userId': userId,
        'lessonId': lessonId,
        'score': score,
      });
      return resp.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to complete lesson: ${e.response?.data?['error'] ?? e.message}');
    }
  }

  // ─── Gemini AI Routes (Honest Error Handling, No Fabricated Responses) ────

  /// Sends a chat message to the real AI Mentor endpoint.
  /// If Gemini is unconfigured or unavailable, returns the genuine error status.
  Future<Map<String, dynamic>> sendMentorChat({
    required String instrument,
    required String message,
    required List<Map<String, dynamic>> history,
  }) async {
    try {
      final resp = await _dio.post('/api/ai/mentor-chat', data: {
        'instrument': instrument,
        'message': message,
        'conversationHistory': history,
      });
      return resp.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final errData = e.response?.data;
      final serverMsg = (errData is Map && errData['error'] != null)
          ? errData['error'].toString()
          : (e.message ?? 'Unknown network error');
      return {
        'error': serverMsg,
        'configured': errData is Map ? errData['configured'] : false,
      };
    }
  }

  /// Requests real AI-generated exercise for current instrument.
  Future<Map<String, dynamic>> generateExercise({
    required String instrument,
    required String weakSkill,
    required String level,
  }) async {
    try {
      final resp = await _dio.post('/api/ai/generate-exercise', data: {
        'instrument': instrument,
        'weakSkill': weakSkill,
        'level': level,
      });
      return resp.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final errData = e.response?.data;
      final serverMsg = (errData is Map && errData['error'] != null)
          ? errData['error'].toString()
          : (e.message ?? 'Unknown network error');
      throw Exception('AI generation failed: $serverMsg');
    }
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

const _defaultBaseUrl = 'http://localhost:5000';

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(baseUrl: _defaultBaseUrl);
});
