import 'package:equatable/equatable.dart';

class Post extends Equatable {
  final String id;
  final String content;
  final String? imageUrl;
  final int likesCount;
  final String userId;
  final String userName;
  final DateTime createdAt;

  const Post({
    required this.id,
    required this.content,
    this.imageUrl,
    required this.likesCount,
    required this.userId,
    required this.userName,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, content, imageUrl, likesCount, userId, userName, createdAt];
}
