import 'dart:developer'; 
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../constants/app_strings.dart';
import '../errors/failures.dart';
import '../services/user_session.dart';

class ApiClient {
  final Dio _dio;

  ApiClient({required Dio dio}) : _dio = dio {
    _dio.options.baseUrl = AppConfig.apiBaseUrl;
    _dio.options.connectTimeout = AppConfig.connectTimeout;
    _dio.options.receiveTimeout = AppConfig.receiveTimeout;
    
    // Custom Logger Interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        log('REQUEST[${options.method}] => PATH: ${options.path}', name: 'ApiClient');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        log('RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}', name: 'ApiClient');
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        log('ERROR[${e.response?.statusCode}] => PATH: ${e.requestOptions.path}', name: 'ApiClient', error: e);
        return handler.next(e);
      },
    ));
    
    // Auth interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = UserSession.userToken;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response> post(String path, {dynamic data}) async {
    try {
      return await _dio.post(path, data: data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response> put(String path, {dynamic data}) async {
    try {
      return await _dio.put(path, data: data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response> delete(String path) async {
    try {
      return await _dio.delete(path);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException error) {
    if (error.response != null) {
      log('Dio Response Error: ${error.response?.data}', name: 'ApiClient');
      return ServerFailure(error.response?.data['message'] ?? AppStrings.serverError);
    } else {
      log('Dio Network Error: ${error.message}', name: 'ApiClient');
      return NetworkFailure('${AppStrings.networkError}: ${error.message}');
    }
  }
}
