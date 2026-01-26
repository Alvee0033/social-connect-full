import 'package:fpdart/fpdart.dart';
import 'package:injectable/injectable.dart';
import '../../../../core/errors/failures.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

@injectable
class SearchUsersUseCase {
  final AuthRepository repository;

  SearchUsersUseCase(this.repository);

  Future<Either<Failure, List<User>>> call(String query) {
    return repository.searchUsers(query);
  }
}
