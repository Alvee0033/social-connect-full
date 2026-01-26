import 'package:equatable/equatable.dart';

abstract class FeedEvent extends Equatable {
  const FeedEvent();

  @override
  List<Object?> get props => [];
}

class FetchPostsRequested extends FeedEvent {}

class ReactToPostRequested extends FeedEvent {
  final String postId;

  const ReactToPostRequested(this.postId);

  @override
  List<Object?> get props => [postId];
}

class CreatePostRequested extends FeedEvent {
  final String content;
  final String? imageUrl;
  final String userId;

  const CreatePostRequested({
    required this.content,
    this.imageUrl,
    required this.userId,
  });

  @override
  List<Object?> get props => [content, imageUrl, userId];
}
