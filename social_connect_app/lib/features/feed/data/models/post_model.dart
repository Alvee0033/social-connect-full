import '../../domain/entities/post.dart';

class PostModel extends Post {
  const PostModel({
    required super.id,
    required super.content,
    super.imageUrl,
    required super.likesCount,
    required super.userId,
    required super.userName,
    required super.createdAt,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: json['id'] as String,
      content: json['content'] as String,
      imageUrl: json['imageUrl'] as String?,
      likesCount: json['likesCount'] is int 
          ? json['likesCount'] as int 
          : int.tryParse(json['likesCount']?.toString() ?? '0') ?? 0,
      userId: json['userId'] as String,
      userName: (json['User'] is Map) ? json['User']['displayName'] ?? 'Unknown User' : 'Unknown User',
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
