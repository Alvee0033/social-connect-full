import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/socket_service.dart';
import '../../../../core/services/user_session.dart';
import '../../data/models/chat_models.dart';
import '../../data/repositories/chat_repository.dart';

class ChatPage extends StatefulWidget {
  final String userId;
  final String userName;
  final String? conversationId;
  final String? avatarUrl;

  const ChatPage({
    super.key, 
    required this.userId, 
    required this.userName,
    this.conversationId,
    this.avatarUrl,
  });

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ChatRepository _repository = GetIt.I<ChatRepository>();
  final SocketService _socketService = SocketService.instance;
  
  List<ChatMessage> _messages = [];
  bool _isLoading = true;
  String? _conversationId;
  bool _otherUserTyping = false;
  Timer? _typingTimer;
  
  late StreamSubscription _messageSubscription;
  late StreamSubscription _typingSubscription;

  @override
  void initState() {
    super.initState();
    _conversationId = widget.conversationId;
    _initializeChat();
    _setupSocketListeners();
  }

  Future<void> _initializeChat() async {
    try {
      if (_conversationId == null) {
        final conversation = await _repository.getOrCreateConversation(widget.userId);
        _conversationId = conversation.id;
      }
      
      if (_conversationId != null) {
        final messages = await _repository.getMessages(_conversationId!);
        setState(() {
          _messages = messages;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error initializing chat: \$e');
      setState(() => _isLoading = false);
    }
  }

  void _setupSocketListeners() {
    _messageSubscription = _socketService.messageStream.listen((data) {
      if (!mounted) return;
      
      final msgSenderId = data['senderId'];
      final msgConversationId = data['conversationId'];
      
      if (msgConversationId == _conversationId || msgSenderId == widget.userId) {
        setState(() {
          _messages.insert(0, ChatMessage.fromJson(data));
        });
      }
    });

    _typingSubscription = _socketService.typingStream.listen((data) {
      if (!mounted) return;
      if (data['userId'] == widget.userId) {
        setState(() {
          _otherUserTyping = data['isTyping'] ?? false;
        });
      }
    });
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _socketService.sendMessage(widget.userId, text);
    _messageController.clear();
  }

  void _onTypingChanged(String text) {
    if (text.isNotEmpty) {
      _socketService.startTyping(widget.userId);
      _typingTimer?.cancel();
      _typingTimer = Timer(const Duration(milliseconds: 1000), () {
        _socketService.stopTyping(widget.userId);
      });
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _typingTimer?.cancel();
    _messageSubscription.cancel();
    _typingSubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.tealLight,
              backgroundImage: widget.avatarUrl != null 
                  ? NetworkImage(widget.avatarUrl!) 
                  : null,
              child: widget.avatarUrl == null 
                  ? const Icon(Icons.person, size: 20, color: AppColors.tealDark)
                  : null,
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.userName, style: const TextStyle(fontSize: 16)),
                if (_otherUserTyping)
                  const Text(
                    'typing...',
                    style: TextStyle(fontSize: 12, color: AppColors.primaryTeal),
                  ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.videocam), onPressed: () {}),
          IconButton(icon: const Icon(Icons.call), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty 
                    ? const Center(child: Text('Say hello!'))
                    : ListView.builder(
                        reverse: true,
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[index];
                          final isMe = message.senderId == UserSession.userId;
                          
                          return TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0.0, end: 1.0),
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeOut,
                            builder: (context, value, child) {
                              return Transform.translate(
                                offset: Offset(0, 20 * (1 - value)),
                                child: Opacity(
                                  opacity: value,
                                  child: child,
                                ),
                              );
                            },
                            child: Align(
                              alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                decoration: BoxDecoration(
                                  color: isMe ? AppColors.primaryTeal : AppColors.surfaceGrey.withOpacity(0.3),
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(16),
                                    topRight: const Radius.circular(16),
                                    bottomLeft: isMe ? const Radius.circular(16) : Radius.zero,
                                    bottomRight: isMe ? Radius.zero : const Radius.circular(16),
                                  ),
                                  boxShadow: [
                                     BoxShadow(
                                      color: Colors.black.withOpacity(0.05),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      message.content,
                                      style: TextStyle(
                                        color: isMe ? Colors.white : AppColors.textDark,
                                        fontSize: 16,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      DateFormat('h:mm a').format(message.createdAt.toLocal()),
                                      style: TextStyle(
                                        color: isMe ? Colors.white70 : AppColors.textGrey,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    onChanged: _onTypingChanged,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: AppColors.primaryTeal,
                  radius: 24,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 20),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
