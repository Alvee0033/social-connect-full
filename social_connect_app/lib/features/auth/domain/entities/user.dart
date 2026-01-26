import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String displayName;
  final String? avatarUrl;
  final String token;

  const User({
    required this.id,
    required this.email,
    required this.displayName,
    this.avatarUrl,
    required this.token,
  });

  @override
  List<Object?> get props => [id, email, displayName, avatarUrl, token];
}
