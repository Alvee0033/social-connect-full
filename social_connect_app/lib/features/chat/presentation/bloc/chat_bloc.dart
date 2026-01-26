import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/socket_service.dart';
import '../../data/models/chat_models.dart';
import '../../data/repositories/chat_repository.dart';

// Events
abstract class ChatEvent {}

class LoadConversations extends ChatEvent {}
class LoadMessages extends ChatEvent {
  final String conversationId;
  LoadMessages(this.conversationId);
}
class SendMessage extends ChatEvent {
  final String receiverId;
  final String content;
  SendMessage({required this.receiverId, required this.content});
}
class ReceiveMessage extends ChatEvent {
  final ChatMessage message;
  ReceiveMessage(this.message);
}
class UserTyping extends ChatEvent {
  final String userId;
  final bool isTyping;
  UserTyping(this.userId, this.isTyping);
}

// States
abstract class ChatState {}

class ChatInitial extends ChatState {}
class ChatLoading extends ChatState {}
class ConversationsLoaded extends ChatState {
  final List<Conversation> conversations;
  ConversationsLoaded(this.conversations);
}
class MessagesLoaded extends ChatState {
  final List<ChatMessage> messages;
  final String conversationId;
  MessagesLoaded(this.messages, this.conversationId);
}
class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
}

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository _repository;
  final SocketService _socketService;
  List<ChatMessage> _currentMessages = [];

  ChatBloc({required ChatRepository repository, required SocketService socketService}) 
      : _repository = repository, _socketService = socketService, super(ChatInitial()) {
    
    // Listen to socket events
    _socketService.messageStream.listen((data) {
      // Map data to ChatMessage and add ReceiveMessage event
      // Note: This needs careful handling to avoid state issues if not in chat
      // Ideally, the UI or a separate global bloc handles incoming notifications
      // For now, we'll try to update if we are in the conversation
    });

    on<LoadConversations>((event, emit) async {
      emit(ChatLoading());
      try {
        final conversations = await _repository.getConversations();
        emit(ConversationsLoaded(conversations));
      } catch (e) {
        emit(ChatError(e.toString()));
      }
    });

    on<LoadMessages>((event, emit) async {
      emit(ChatLoading());
      try {
        final messages = await _repository.getMessages(event.conversationId);
        _currentMessages = messages;
        emit(MessagesLoaded(messages, event.conversationId));
      } catch (e) {
        emit(ChatError(e.toString()));
      }
    });

    on<SendMessage>((event, emit) async {
      // Optimistic update could happen here
      try {
        // Send via socket usually doesn't return the full object immediately in all implementations,
        // but our socket implementation emits 'message_sent'.
        // We can also use REST API as fallback or primary. 
        // Let's use REST for persistence guarantee, then socket notifies others.
        // Actually, our backend socket handler does DB persistence too.
        
        // Let's use the socket service to send
        _socketService.sendMessage(event.receiverId, event.content);
        
        // Optimistically add message
        final optimisticMessage = ChatMessage(
          id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
          senderId: 'me', // TODO: Get actual ID
          receiverId: event.receiverId,
          content: event.content,
          createdAt: DateTime.now(),
          isRead: false,
        );
        
        _currentMessages = [optimisticMessage, ..._currentMessages];
        // emit(MessagesLoaded(_currentMessages, '')); // Need conversation ID...
      } catch (e) {
        emit(ChatError(e.toString()));
      }
    });
    
    // Allow external trigger to update messages (from Socket)
    on<ReceiveMessage>((event, emit) {
       _currentMessages = [event.message, ..._currentMessages];
       // We need to know which conversation we are currently viewing to emit correct state
       // This is a simplification.
    });
  }
}
