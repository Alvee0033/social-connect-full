import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:dio/dio.dart';
import 'core/network/api_client.dart';
import 'features/chat/data/repositories/chat_repository.dart';
import 'features/friends/data/repositories/friends_repository.dart';
import 'injection.config.dart';

final getIt = GetIt.instance;

@InjectableInit()
void configureDependencies() => getIt.init();

@module
abstract class RegisterModule {
  @lazySingleton
  Dio get dio => Dio();

  @lazySingleton
  ApiClient get apiClient => ApiClient(dio: dio);

  @lazySingleton
  ChatRepository get chatRepository => ChatRepository(apiClient: apiClient);

  @lazySingleton
  FriendsRepository get friendsRepository => FriendsRepository(apiClient: apiClient);
}

