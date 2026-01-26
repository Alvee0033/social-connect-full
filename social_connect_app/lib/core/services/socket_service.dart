import 'dart:async';
import 'dart:io';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../services/user_session.dart';

class SocketService {
  static SocketService? _instance;
  IO.Socket? _socket;
  
  // Stream controllers for various events
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  final _typingController = StreamController<Map<String, dynamic>>.broadcast();
  final _onlineStatusController = StreamController<Map<String, dynamic>>.broadcast();
  final _friendRequestController = StreamController<Map<String, dynamic>>.broadcast();
  final _messageReadController = StreamController<Map<String, dynamic>>.broadcast();
  
  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get typingStream => _typingController.stream;
  Stream<Map<String, dynamic>> get onlineStatusStream => _onlineStatusController.stream;
  Stream<Map<String, dynamic>> get friendRequestStream => _friendRequestController.stream;
  Stream<Map<String, dynamic>> get messageReadStream => _messageReadController.stream;
  
  bool get isConnected => _socket?.connected ?? false;
  
  static SocketService get instance {
    _instance ??= SocketService._();
    return _instance!;
  }
  
  SocketService._();
  
  void connect() {
    if (_socket != null && _socket!.connected) {
      return;
    }
    
    final token = UserSession.userToken;
    if (token == null) {
      print('Cannot connect socket: No auth token');
      return;
    }
    
    _socket = IO.io(
      'https://51.21.199.60:3000',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(10)
          .setReconnectionDelay(1000)
          .build(),
    );
    
    _socket!.onConnect((_) {
      print('Socket connected');
    });
    
    _socket!.onDisconnect((_) {
      print('Socket disconnected');
    });
    
    _socket!.onError((error) {
      print('Socket error: $error');
    });
    
    _socket!.onConnectError((error) {
      print('Socket connect error: $error');
    });
    
    // Listen for new messages
    _socket!.on('new_message', (data) {
      print('New message received: $data');
      _messageController.add(Map<String, dynamic>.from(data));
    });
    
    // Listen for sent message confirmation
    _socket!.on('message_sent', (data) {
      print('Message sent: $data');
      _messageController.add({...Map<String, dynamic>.from(data), 'isSent': true});
    });
    
    // Listen for typing events
    _socket!.on('user_typing', (data) {
      _typingController.add({...Map<String, dynamic>.from(data), 'isTyping': true});
    });
    
    _socket!.on('user_stopped_typing', (data) {
      _typingController.add({...Map<String, dynamic>.from(data), 'isTyping': false});
    });
    
    // Listen for online status
    _socket!.on('user_online', (data) {
      _onlineStatusController.add({...Map<String, dynamic>.from(data), 'isOnline': true});
    });
    
    _socket!.on('user_offline', (data) {
      _onlineStatusController.add({...Map<String, dynamic>.from(data), 'isOnline': false});
    });
    
    // Listen for friend request events
    _socket!.on('new_friend_request', (data) {
      _friendRequestController.add({...Map<String, dynamic>.from(data), 'type': 'received'});
    });
    
    _socket!.on('friend_request_response', (data) {
      _friendRequestController.add({...Map<String, dynamic>.from(data), 'type': 'response'});
    });
    
    // Listen for message read events
    _socket!.on('messages_read', (data) {
      _messageReadController.add(Map<String, dynamic>.from(data));
    });
  }
  
  void sendMessage(String receiverId, String content, {String messageType = 'text'}) {
    if (_socket == null || !_socket!.connected) {
      print('Socket not connected');
      return;
    }
    
    _socket!.emit('send_message', {
      'receiverId': receiverId,
      'content': content,
      'messageType': messageType,
    });
  }
  
  void startTyping(String receiverId) {
    _socket?.emit('typing_start', {'receiverId': receiverId});
  }
  
  void stopTyping(String receiverId) {
    _socket?.emit('typing_stop', {'receiverId': receiverId});
  }
  
  void markMessagesAsRead(List<String> messageIds, String senderId) {
    _socket?.emit('mark_read', {
      'messageIds': messageIds,
      'senderId': senderId,
    });
  }
  
  void notifyFriendRequestSent(String addresseeId) {
    _socket?.emit('friend_request_sent', {'addresseeId': addresseeId});
  }
  
  void notifyFriendRequestResponse(String requesterId, String action) {
    _socket?.emit('friend_request_responded', {
      'requesterId': requesterId,
      'action': action,
    });
  }
  
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
  
  void dispose() {
    disconnect();
    _messageController.close();
    _typingController.close();
    _onlineStatusController.close();
    _friendRequestController.close();
    _messageReadController.close();
  }
}
