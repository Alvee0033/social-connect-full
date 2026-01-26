import 'package:fpdart/fpdart.dart';
import 'package:injectable/injectable.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/post.dart';
import '../../domain/repositories/feed_repository.dart';
import '../models/post_model.dart';

@LazySingleton(as: FeedRepository)
class FeedRepositoryImpl implements FeedRepository {
  final ApiClient apiClient;

  FeedRepositoryImpl(this.apiClient);

  @override
  Future<Either<Failure, List<Post>>> getPosts() async {
    try {
      final response = await apiClient.get('/posts');
      final posts = (response.data as List)
          .map((json) => PostModel.fromJson(json))
          .toList();
      return Right(posts);
    } on Failure catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Post>> createPost(String content, String? imageUrl, String userId) async {
    try {
      final response = await apiClient.post('/posts', data: {
        'content': content,
        'imageUrl': imageUrl,
        'userId': userId,
      });
      return Right(PostModel.fromJson(response.data));
    } on Failure catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Post>> reactToPost(String postId) async {
    try {
      final response = await apiClient.post('/posts/$postId/react');
      return Right(PostModel.fromJson(response.data));
    } on Failure catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}

