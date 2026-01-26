class ChatUser {
  final String id;
  final String displayName;
  final String? avatarUrl;
  final bool isOnline;

  ChatUser({
    required this.id,
    required this.displayName,
    this.avatarUrl,
    this.isOnline = false,
  });

  factory ChatUser.fromJson(Map<String, dynamic> json) {
    return ChatUser(
      id: json['id'] ?? '',
      displayName: json['display_name'] ?? 'Unknown',
      avatarUrl: json['avatar_url'],
      isOnline: json['is_online'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'is_online': isOnline,
    };
  }

  ChatUser copyWith({
    String? id,
    String? displayName,
    String? avatarUrl,
    bool? isOnline,
  }) {
    return ChatUser(
      id: id ?? this.id,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isOnline: isOnline ?? this.isOnline,
    );
  }
}

class ChatMessage {
  final String id;
  final String senderId;
  final String receiverId;
  final String content;
  final String messageType;
  final bool isRead;
  final DateTime? readAt;
  final DateTime createdAt;
  final ChatUser? sender;
  final String? conversationId;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.content,
    this.messageType = 'text',
    this.isRead = false,
    this.readAt,
    required this.createdAt,
    this.sender,
    this.conversationId,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? '',
      senderId: json['senderId'] ?? '',
      receiverId: json['receiverId'] ?? '',
      content: json['content'] ?? '',
      messageType: json['messageType'] ?? 'text',
      isRead: json['isRead'] ?? false,
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      sender: json['sender'] != null ? ChatUser.fromJson(json['sender']) : null,
      conversationId: json['conversationId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'receiverId': receiverId,
      'content': content,
      'messageType': messageType,
      'isRead': isRead,
      'readAt': readAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'sender': sender?.toJson(),
      'conversationId': conversationId,
    };
  }
}

class Conversation {
  final String id;
  final ChatUser user;
  final ChatMessage? lastMessage;
  final int unreadCount;
  final DateTime? lastMessageAt;

  Conversation({
    required this.id,
    required this.user,
    this.lastMessage,
    this.unreadCount = 0,
    this.lastMessageAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] ?? '',
      user: ChatUser.fromJson(json['user'] ?? {}),
      lastMessage: json['lastMessage'] != null 
          ? ChatMessage.fromJson(json['lastMessage']) 
          : null,
      unreadCount: json['unreadCount'] ?? 0,
      lastMessageAt: json['lastMessageAt'] != null 
          ? DateTime.parse(json['lastMessageAt']) 
          : null,
    );
  }

  Conversation copyWith({
    String? id,
    ChatUser? user,
    ChatMessage? lastMessage,
    int? unreadCount,
    DateTime? lastMessageAt,
  }) {
    return Conversation(
      id: id ?? this.id,
      user: user ?? this.user,
      lastMessage: lastMessage ?? this.lastMessage,
      unreadCount: unreadCount ?? this.unreadCount,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
    );
  }
}
