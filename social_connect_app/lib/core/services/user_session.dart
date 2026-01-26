import 'package:shared_preferences/shared_preferences.dart';

class UserSession {
  static const String _keyUserId = 'user_id';
  static const String _keyUserName = 'user_name';
  static const String _keyUserEmail = 'user_email';
  static const String _keyUserToken = 'user_token';
  static const String _keyUserAvatar = 'user_avatar';

  static String? _userId;
  static String? _userName;
  static String? _userEmail;
  static String? _userToken;
  static String? _userAvatar;

  static String? get userId => _userId;
  static String? get userName => _userName;
  static String? get userEmail => _userEmail;
  static String? get userToken => _userToken;
  static String? get userAvatar => _userAvatar;

  static bool get isLoggedIn => _userId != null && _userToken != null;

  static Future<void> saveUser({
    required String id,
    required String displayName,
    required String email,
    required String token,
    String? avatarUrl,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserId, id);
    await prefs.setString(_keyUserName, displayName);
    await prefs.setString(_keyUserEmail, email);
    await prefs.setString(_keyUserToken, token);
    if (avatarUrl != null) {
      await prefs.setString(_keyUserAvatar, avatarUrl);
    }

    _userId = id;
    _userName = displayName;
    _userEmail = email;
    _userToken = token;
    _userAvatar = avatarUrl;
  }

  static Future<void> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    _userId = prefs.getString(_keyUserId);
    _userName = prefs.getString(_keyUserName);
    _userEmail = prefs.getString(_keyUserEmail);
    _userToken = prefs.getString(_keyUserToken);
    _userAvatar = prefs.getString(_keyUserAvatar);
  }

  static Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyUserName);
    await prefs.remove(_keyUserEmail);
    await prefs.remove(_keyUserToken);
    await prefs.remove(_keyUserAvatar);

    _userId = null;
    _userName = null;
    _userEmail = null;
    _userToken = null;
    _userAvatar = null;
  }
}
