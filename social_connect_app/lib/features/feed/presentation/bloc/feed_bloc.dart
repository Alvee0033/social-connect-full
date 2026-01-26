import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:injectable/injectable.dart';
import '../../domain/usecases/create_post_usecase.dart';
import '../../domain/usecases/get_posts_usecase.dart';
import '../../domain/usecases/react_to_post_usecase.dart';
import 'feed_event.dart';
import 'feed_state.dart';

@injectable
class FeedBloc extends Bloc<FeedEvent, FeedState> {
  final GetPostsUseCase getPostsUseCase;
  final ReactToPostUseCase reactToPostUseCase;
  final CreatePostUseCase createPostUseCase;

  FeedBloc(this.getPostsUseCase, this.reactToPostUseCase, this.createPostUseCase) : super(FeedInitial()) {
    on<FetchPostsRequested>(_onFetchPostsRequested);
    on<ReactToPostRequested>(_onReactToPostRequested);
    on<CreatePostRequested>(_onCreatePostRequested);
  }

  Future<void> _onFetchPostsRequested(
    FetchPostsRequested event,
    Emitter<FeedState> emit,
  ) async {
    emit(FeedLoading());
    final result = await getPostsUseCase();
    result.fold(
      (failure) => emit(FeedError(failure.message)),
      (posts) => emit(FeedLoaded(posts)),
    );
  }

  Future<void> _onReactToPostRequested(
    ReactToPostRequested event,
    Emitter<FeedState> emit,
  ) async {
    final currentState = state;
    if (currentState is FeedLoaded) {
      final result = await reactToPostUseCase(event.postId);
      result.fold(
        (failure) => emit(currentState.copyWith(error: failure.message)),
        (updatedPost) {
          final updatedPosts = currentState.posts.map((post) {
            return post.id == updatedPost.id ? updatedPost : post;
          }).toList();
          emit(FeedLoaded(updatedPosts));
        },
      );
    }
  }

  Future<void> _onCreatePostRequested(
    CreatePostRequested event,
    Emitter<FeedState> emit,
  ) async {
    final currentState = state;
    List<dynamic> currentPosts = [];
    if (currentState is FeedLoaded) {
      currentPosts = currentState.posts;
      emit(currentState.copyWith(isCreatingPost: true));
    }

    final result = await createPostUseCase(event.content, event.imageUrl, event.userId);
    result.fold(
      (failure) {
         if (state is FeedLoaded) {
             emit((state as FeedLoaded).copyWith(isCreatingPost: false, error: failure.message));
         } else {
             emit(FeedError(failure.message));
         }
      },
      (newPost) {
        emit(PostCreatedSuccess(newPost));
        // Refresh the feed to show the new post
        add(FetchPostsRequested());
      },
    );
  }
}

