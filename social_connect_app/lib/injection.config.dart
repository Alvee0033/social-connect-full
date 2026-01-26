// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:dio/dio.dart' as _i361;
import 'package:get_it/get_it.dart' as _i174;
import 'package:injectable/injectable.dart' as _i526;
import 'package:social_connect_app/core/network/api_client.dart' as _i95;
import 'package:social_connect_app/features/auth/data/datasources/auth_remote_data_source.dart'
    as _i93;
import 'package:social_connect_app/features/auth/data/repositories/auth_repository_impl.dart'
    as _i996;
import 'package:social_connect_app/features/auth/domain/repositories/auth_repository.dart'
    as _i33;
import 'package:social_connect_app/features/auth/domain/usecases/login_usecase.dart'
    as _i741;
import 'package:social_connect_app/features/auth/domain/usecases/register_usecase.dart'
    as _i25;
import 'package:social_connect_app/features/auth/domain/usecases/search_users_usecase.dart'
    as _i83;
import 'package:social_connect_app/features/auth/presentation/bloc/auth_bloc.dart'
    as _i477;
import 'package:social_connect_app/features/auth/presentation/bloc/search_bloc.dart'
    as _i287;
import 'package:social_connect_app/features/chat/data/repositories/chat_repository.dart'
    as _i2;
import 'package:social_connect_app/features/feed/data/repositories/feed_repository_impl.dart'
    as _i863;
import 'package:social_connect_app/features/feed/domain/repositories/feed_repository.dart'
    as _i373;
import 'package:social_connect_app/features/feed/domain/usecases/create_post_usecase.dart'
    as _i35;
import 'package:social_connect_app/features/feed/domain/usecases/get_posts_usecase.dart'
    as _i535;
import 'package:social_connect_app/features/feed/domain/usecases/react_to_post_usecase.dart'
    as _i277;
import 'package:social_connect_app/features/feed/presentation/bloc/feed_bloc.dart'
    as _i28;
import 'package:social_connect_app/features/friends/data/repositories/friends_repository.dart'
    as _i729;
import 'package:social_connect_app/injection.dart' as _i402;

extension GetItInjectableX on _i174.GetIt {
// initializes the registration of main-scope dependencies inside of GetIt
  _i174.GetIt init({
    String? environment,
    _i526.EnvironmentFilter? environmentFilter,
  }) {
    final gh = _i526.GetItHelper(
      this,
      environment,
      environmentFilter,
    );
    final registerModule = _$RegisterModule();
    gh.lazySingleton<_i361.Dio>(() => registerModule.dio);
    gh.lazySingleton<_i95.ApiClient>(() => registerModule.apiClient);
    gh.lazySingleton<_i2.ChatRepository>(() => registerModule.chatRepository);
    gh.lazySingleton<_i729.FriendsRepository>(
        () => registerModule.friendsRepository);
    gh.lazySingleton<_i373.FeedRepository>(
        () => _i863.FeedRepositoryImpl(gh<_i95.ApiClient>()));
    gh.factory<_i277.ReactToPostUseCase>(
        () => _i277.ReactToPostUseCase(gh<_i373.FeedRepository>()));
    gh.factory<_i535.GetPostsUseCase>(
        () => _i535.GetPostsUseCase(gh<_i373.FeedRepository>()));
    gh.factory<_i35.CreatePostUseCase>(
        () => _i35.CreatePostUseCase(gh<_i373.FeedRepository>()));
    gh.lazySingleton<_i93.AuthRemoteDataSource>(
        () => _i93.AuthRemoteDataSourceImpl(apiClient: gh<_i95.ApiClient>()));
    gh.factory<_i28.FeedBloc>(() => _i28.FeedBloc(
          gh<_i535.GetPostsUseCase>(),
          gh<_i277.ReactToPostUseCase>(),
          gh<_i35.CreatePostUseCase>(),
        ));
    gh.lazySingleton<_i33.AuthRepository>(() => _i996.AuthRepositoryImpl(
        remoteDataSource: gh<_i93.AuthRemoteDataSource>()));
    gh.factory<_i83.SearchUsersUseCase>(
        () => _i83.SearchUsersUseCase(gh<_i33.AuthRepository>()));
    gh.factory<_i741.LoginUseCase>(
        () => _i741.LoginUseCase(gh<_i33.AuthRepository>()));
    gh.factory<_i25.RegisterUseCase>(
        () => _i25.RegisterUseCase(gh<_i33.AuthRepository>()));
    gh.factory<_i477.AuthBloc>(() => _i477.AuthBloc(
          gh<_i741.LoginUseCase>(),
          gh<_i25.RegisterUseCase>(),
        ));
    gh.factory<_i287.SearchBloc>(
        () => _i287.SearchBloc(gh<_i83.SearchUsersUseCase>()));
    return this;
  }
}

class _$RegisterModule extends _i402.RegisterModule {}
