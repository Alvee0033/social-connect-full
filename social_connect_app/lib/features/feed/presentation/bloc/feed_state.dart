import 'package:equatable/equatable.dart';
import '../../domain/entities/post.dart';

abstract class FeedState extends Equatable {
  const FeedState();

  @override
  List<Object?> get props => [];
}

class FeedInitial extends FeedState {}

class FeedLoading extends FeedState {}

class FeedLoaded extends FeedState {
  final List<Post> posts;
  final bool isCreatingPost;
  final String? error;

  const FeedLoaded(this.posts, {this.isCreatingPost = false, this.error});

  FeedLoaded copyWith({List<Post>? posts, bool? isCreatingPost, String? error}) {
    return FeedLoaded(
      posts ?? this.posts,
      isCreatingPost: isCreatingPost ?? this.isCreatingPost,
      error: error, // If null is passed, it clears the error. To keep existing, logic might need to be different, but usually we want to clear or set new.
      // Actually, standard copyWith pattern:
      // error: error ?? this.error,
      // But for error clearing we might need nullable wrapper or specific intent. 
      // For now let's assume if argument provided it replaces.
    );
  }

  @override
  List<Object?> get props => [posts, isCreatingPost, error];
}

class FeedError extends FeedState {
  final String message;

  const FeedError(this.message);

  @override
  List<Object?> get props => [message];
}

class PostCreatedSuccess extends FeedState {
  final Post post;

  const PostCreatedSuccess(this.post);

  @override
  List<Object?> get props => [post];
}
