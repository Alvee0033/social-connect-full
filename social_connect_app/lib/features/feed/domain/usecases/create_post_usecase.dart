import 'package:fpdart/fpdart.dart';
import 'package:injectable/injectable.dart';
import '../../../../core/errors/failures.dart';
import '../entities/post.dart';
import '../repositories/feed_repository.dart';

@injectable
class CreatePostUseCase {
  final FeedRepository repository;

  CreatePostUseCase(this.repository);

  Future<Either<Failure, Post>> call(String content, String? imageUrl, String userId) {
    return repository.createPost(content, imageUrl, userId);
  }
}
