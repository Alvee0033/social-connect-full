import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/models/friend_models.dart';
import '../../data/repositories/friends_repository.dart';

// Events
abstract class FriendsEvent {}

class LoadFriends extends FriendsEvent {}
class LoadPendingRequests extends FriendsEvent {}
class LoadSentRequests extends FriendsEvent {}
class SearchUsers extends FriendsEvent {
  final String query;
  SearchUsers(this.query);
}
class SendFriendRequest extends FriendsEvent {
  final String userId;
  SendFriendRequest(this.userId);
}
class RespondToRequest extends FriendsEvent {
  final String friendshipId;
  final String action; // 'accept' or 'reject'
  RespondToRequest(this.friendshipId, this.action);
}

// States
abstract class FriendsState {}

class FriendsInitial extends FriendsState {}
class FriendsLoading extends FriendsState {}
class FriendsLoaded extends FriendsState {
  final List<FriendUser> friends;
  FriendsLoaded(this.friends);
}
class FriendsRequestsLoaded extends FriendsState {
  final List<FriendRequest> pending;
  final List<FriendRequest> sent;
  FriendsRequestsLoaded({this.pending = const [], this.sent = const []});
}
class FriendsSearchResults extends FriendsState {
  final List<FriendUser> users;
  FriendsSearchResults(this.users);
}
class FriendsError extends FriendsState {
  final String message;
  FriendsError(this.message);
}
class FriendActionSuccess extends FriendsState {
  final String message;
  FriendActionSuccess(this.message);
}

class FriendsBloc extends Bloc<FriendsEvent, FriendsState> {
  final FriendsRepository _repository;

  FriendsBloc({required FriendsRepository repository}) 
      : _repository = repository, super(FriendsInitial()) {
    
    on<LoadFriends>((event, emit) async {
      emit(FriendsLoading());
      try {
        final friends = await _repository.getFriends();
        emit(FriendsLoaded(friends));
      } catch (e) {
        emit(FriendsError(e.toString()));
      }
    });

    on<LoadPendingRequests>((event, emit) async {
      emit(FriendsLoading());
      try {
        final pending = await _repository.getPendingRequests();
        final sent = await _repository.getSentRequests();
        emit(FriendsRequestsLoaded(pending: pending, sent: sent));
      } catch (e) {
        emit(FriendsError(e.toString()));
      }
    });

    on<SearchUsers>((event, emit) async {
      if (event.query.length < 2) return;
      emit(FriendsLoading());
      try {
        final users = await _repository.searchUsers(event.query);
        emit(FriendsSearchResults(users));
      } catch (e) {
        emit(FriendsError(e.toString()));
      }
    });

    on<SendFriendRequest>((event, emit) async {
      try {
        await _repository.sendFriendRequest(event.userId);
        emit(FriendActionSuccess('Friend request sent!'));
        // Refresh search results ?? or just show success
      } catch (e) {
        emit(FriendsError(e.toString()));
      }
    });

    on<RespondToRequest>((event, emit) async {
      try {
        await _repository.respondToFriendRequest(event.friendshipId, event.action);
        emit(FriendActionSuccess('Request ${event.action}ed!'));
        add(LoadPendingRequests()); // Reload requests
      } catch (e) {
        emit(FriendsError(e.toString()));
      }
    });
  }
}
