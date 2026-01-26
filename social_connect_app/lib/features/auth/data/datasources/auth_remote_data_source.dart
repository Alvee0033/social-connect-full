
import '../../../../core/network/api_client.dart';
import '../models/user_model.dart';
import 'package:injectable/injectable.dart';


abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<UserModel> register(String displayName, String email, String password);
  Future<List<UserModel>> searchUsers(String query);
}

@LazySingleton(as: AuthRemoteDataSource)
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient apiClient;

  AuthRemoteDataSourceImpl({required this.apiClient});

  @override
  Future<UserModel> login(String email, String password) async {
    final response = await apiClient.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return UserModel.fromJson(response.data);
  }

  @override
  Future<UserModel> register(String displayName, String email, String password) async {
    final response = await apiClient.post('/auth/register', data: {
      'display_name': displayName,
      'email': email,
      'password': password,
    });
    return UserModel.fromJson(response.data);
  }

  @override
  Future<List<UserModel>> searchUsers(String query) async {
    final response = await apiClient.get('/users/search', queryParameters: {'query': query});
    return (response.data as List)
        .map((json) => UserModel.fromJson(json))
        .toList();
  }
}
