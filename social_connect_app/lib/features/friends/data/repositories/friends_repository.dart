import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/user_session.dart';
import '../models/friend_models.dart';

class FriendsRepository {
  final ApiClient _apiClient;

  FriendsRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<List<FriendUser>> getFriends() async {
    try {
      final response = await _apiClient.get('/friends/');
      
      final data = response.data as List;
      return data.map((json) => FriendUser.fromJson(json)).toList();
    } catch (e) {
      print('Get friends error: $e');
      rethrow;
    }
  }

  Future<List<FriendRequest>> getPendingRequests() async {
    try {
      final response = await _apiClient.get('/friends/requests/pending');
      
      final data = response.data as List;
      return data.map((json) => FriendRequest.fromJson(json)).toList();
    } catch (e) {
      print('Get pending requests error: $e');
      rethrow;
    }
  }

  Future<List<FriendRequest>> getSentRequests() async {
    try {
      final response = await _apiClient.get('/friends/requests/sent');
      
      final data = response.data as List;
      return data.map((json) => FriendRequest.fromJson(json)).toList();
    } catch (e) {
      print('Get sent requests error: $e');
      rethrow;
    }
  }

  Future<List<FriendUser>> searchUsers(String query) async {
    try {
      final response = await _apiClient.get(
        '/friends/search',
        queryParameters: {'query': query},
      );
      
      final data = response.data as List;
      return data.map((json) => FriendUser.fromJson(json)).toList();
    } catch (e) {
      print('Search users error: $e');
      rethrow;
    }
  }

  Future<void> sendFriendRequest(String addresseeId) async {
    try {
      await _apiClient.post(
        '/friends/request',
        data: {'addresseeId': addresseeId},
      );
    } catch (e) {
      print('Send friend request error: $e');
      rethrow;
    }
  }

  Future<void> respondToFriendRequest(String friendshipId, String action) async {
    try {
      await _apiClient.put(
        '/friends/request/$friendshipId',
        data: {'action': action},
      );
    } catch (e) {
      print('Respond to friend request error: $e');
      rethrow;
    }
  }

  Future<void> removeFriend(String friendId) async {
    try {
      await _apiClient.delete('/friends/$friendId');
    } catch (e) {
      print('Remove friend error: $e');
      rethrow;
    }
  }
}
