import 'package:fpdart/fpdart.dart';
import '../../../../core/errors/failures.dart';
import '../entities/post.dart';

abstract class FeedRepository {
  Future<Either<Failure, List<Post>>> getPosts();
  Future<Either<Failure, Post>> createPost(String content, String? imageUrl, String userId);
  Future<Either<Failure, Post>> reactToPost(String postId);
}

