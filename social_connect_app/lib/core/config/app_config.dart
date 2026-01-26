import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
  static Duration get connectTimeout => Duration(milliseconds: int.parse(dotenv.env['CONNECT_TIMEOUT'] ?? '10000'));
  static Duration get receiveTimeout => Duration(milliseconds: int.parse(dotenv.env['RECEIVE_TIMEOUT'] ?? '10000'));
}
