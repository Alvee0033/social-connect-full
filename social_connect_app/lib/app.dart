import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/services/user_session.dart';

import 'features/auth/presentation/pages/login_page.dart';
import 'features/home/presentation/pages/home_page.dart';

class SocialConnectApp extends StatelessWidget {
  const SocialConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SocialConnect',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: UserSession.isLoggedIn ? const HomePage() : const LoginPage(),
    );
  }
}

