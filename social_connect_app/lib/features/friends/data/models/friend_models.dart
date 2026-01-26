class FriendUser {
  final String id;
  final String displayName;
  final String? avatarUrl;
  final bool isOnline;
  final String? friendshipStatus;
  final String? friendshipId;

  FriendUser({
    required this.id,
    required this.displayName,
    this.avatarUrl,
    this.isOnline = false,
    this.friendshipStatus,
    this.friendshipId,
  });

  factory FriendUser.fromJson(Map<String, dynamic> json) {
    return FriendUser(
      id: json['id']?.toString() ?? '',
      displayName: json['display_name']?.toString() ?? 'Unknown',
      avatarUrl: json['avatar_url']?.toString(),
      isOnline: json['is_online'] == true,
      friendshipStatus: json['friendshipStatus']?.toString(),
      friendshipId: json['friendshipId']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'is_online': isOnline,
      'friendshipStatus': friendshipStatus,
      'friendshipId': friendshipId,
    };
  }

  FriendUser copyWith({
    String? id,
    String? displayName,
    String? avatarUrl,
    bool? isOnline,
    String? friendshipStatus,
    String? friendshipId,
  }) {
    return FriendUser(
      id: id ?? this.id,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isOnline: isOnline ?? this.isOnline,
      friendshipStatus: friendshipStatus ?? this.friendshipStatus,
      friendshipId: friendshipId ?? this.friendshipId,
    );
  }
}

class FriendRequest {
  final String id;
  final FriendUser requester;
  final FriendUser? addressee;
  final String status;
  final DateTime createdAt;

  FriendRequest({
    required this.id,
    required this.requester,
    this.addressee,
    required this.status,
    required this.createdAt,
  });

  factory FriendRequest.fromJson(Map<String, dynamic> json) {
    return FriendRequest(
      id: json['id'] ?? '',
      requester: FriendUser.fromJson(json['requester'] ?? {}),
      addressee: json['addressee'] != null 
          ? FriendUser.fromJson(json['addressee']) 
          : null,
      status: json['status'] ?? 'pending',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
    );
  }
}
