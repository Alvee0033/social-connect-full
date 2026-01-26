import 'package:fpdart/fpdart.dart';
import 'package:injectable/injectable.dart';
import '../../../../core/errors/failures.dart';
import '../entities/post.dart';
import '../repositories/feed_repository.dart';

@injectable
class ReactToPostUseCase {
  final FeedRepository repository;

  ReactToPostUseCase(this.repository);

  Future<Either<Failure, Post>> call(String postId) {
    return repository.reactToPost(postId);
  }
}
