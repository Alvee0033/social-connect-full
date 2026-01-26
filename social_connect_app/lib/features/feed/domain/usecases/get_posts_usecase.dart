import 'package:fpdart/fpdart.dart';
import 'package:injectable/injectable.dart';
import '../../../../core/errors/failures.dart';
import '../entities/post.dart';
import '../repositories/feed_repository.dart';

@injectable
class GetPostsUseCase {
  final FeedRepository repository;

  GetPostsUseCase(this.repository);

  Future<Either<Failure, List<Post>>> call() {
    return repository.getPosts();
  }
}
