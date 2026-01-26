import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/user_session.dart';
import '../models/chat_models.dart';

class ChatRepository {
  final ApiClient _apiClient;

  ChatRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<List<Conversation>> getConversations() async {
    try {
      final response = await _apiClient.get(
        '/messages/conversations',
        queryParameters: {},
      );
      
      final data = response.data as List;
      return data.map((json) => Conversation.fromJson(json)).toList();
    } catch (e) {
      print('Get conversations error: $e');
      rethrow;
    }
  }

  Future<Conversation> getOrCreateConversation(String userId) async {
    try {
      final response = await _apiClient.get(
        '/messages/conversations/user/$userId',
      );
      
      return Conversation.fromJson(response.data);
    } catch (e) {
      print('Get or create conversation error: $e');
      rethrow;
    }
  }

  Future<List<ChatMessage>> getMessages(String conversationId, {int page = 1}) async {
    try {
      final response = await _apiClient.get(
        '/messages/conversations/$conversationId',
        queryParameters: {'page': page},
      );
      
      final data = response.data as List;
      return data.map((json) => ChatMessage.fromJson(json)).toList();
    } catch (e) {
      print('Get messages error: $e');
      rethrow;
    }
  }

  Future<ChatMessage> sendMessage(String receiverId, String content, {String messageType = 'text'}) async {
    try {
      final response = await _apiClient.post(
        '/messages/send',
        data: {
          'receiverId': receiverId,
          'content': content,
          'messageType': messageType,
        },
      );
      
      return ChatMessage.fromJson(response.data);
    } catch (e) {
      print('Send message error: $e');
      rethrow;
    }
  }
}
