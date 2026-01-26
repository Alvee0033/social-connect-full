import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/socket_service.dart';
import '../../../../core/services/user_session.dart';
import '../../data/models/friend_models.dart';
import '../../data/repositories/friends_repository.dart';
import '../../../chat/presentation/pages/chat_page.dart';

class FriendsPage extends StatefulWidget {
  const FriendsPage({super.key});

  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final FriendsRepository _repository = GetIt.I<FriendsRepository>();
  
  List<FriendUser> _friends = [];
  List<FriendRequest> _pendingRequests = [];
  List<FriendUser> _searchResults = [];
  
  bool _isLoading = true;
  bool _isSearching = false;
  String _searchQuery = '';
  
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
    _listenToSocketEvents();
  }

  void _listenToSocketEvents() {
    SocketService.instance.friendRequestStream.listen((data) {
      _loadPendingRequests();
    });
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    await Future.wait([
      _loadFriends(),
      _loadPendingRequests(),
    ]);
    setState(() => _isLoading = false);
  }

  Future<void> _loadFriends() async {
    try {
      final friends = await _repository.getFriends();
      setState(() => _friends = friends);
    } catch (e) {
      print('Error loading friends: $e');
    }
  }

  Future<void> _loadPendingRequests() async {
    try {
      final requests = await _repository.getPendingRequests();
      setState(() => _pendingRequests = requests);
    } catch (e) {
      print('Error loading pending requests: $e');
    }
  }

  Future<void> _searchUsers(String query) async {
    if (query.length < 2) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);
    try {
      final results = await _repository.searchUsers(query);
      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    } catch (e) {
      print('Error searching users: $e');
      setState(() => _isSearching = false);
    }
  }

  Future<void> _sendFriendRequest(FriendUser user) async {
    try {
      await _repository.sendFriendRequest(user.id);
      SocketService.instance.notifyFriendRequestSent(user.id);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Friend request sent to ${user.displayName}'),
          backgroundColor: AppColors.primaryTeal,
        ),
      );
      _searchUsers(_searchQuery);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to send friend request'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _respondToRequest(FriendRequest request, String action) async {
    try {
      await _repository.respondToFriendRequest(request.id, action);
      SocketService.instance.notifyFriendRequestResponse(request.requester.id, action);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(action == 'accept' 
              ? '${request.requester.displayName} is now your friend!' 
              : 'Friend request declined'),
          backgroundColor: action == 'accept' ? AppColors.primaryTeal : Colors.grey,
        ),
      );
      _loadData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to respond to request'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _openChat(FriendUser friend) {
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => ChatPage(
          userId: friend.id,
          userName: friend.displayName,
          avatarUrl: friend.avatarUrl,
        ),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          const begin = Offset(1.0, 0.0);
          const end = Offset.zero;
          const curve = Curves.easeInOutCubic;
          var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
          return SlideTransition(position: animation.drive(tween), child: child);
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Friends'),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primaryTeal,
          labelColor: AppColors.primaryTeal,
          unselectedLabelColor: AppColors.textGrey,
          tabs: [
            Tab(
              icon: const Icon(Icons.people),
              text: 'Friends (${_friends.length})',
            ),
            Tab(
              icon: Badge(
                isLabelVisible: _pendingRequests.isNotEmpty,
                label: Text('${_pendingRequests.length}'),
                child: const Icon(Icons.person_add),
              ),
              text: 'Requests',
            ),
            const Tab(
              icon: Icon(Icons.search),
              text: 'Find',
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryTeal))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildFriendsList(),
                _buildRequestsList(),
                _buildSearchTab(),
              ],
            ),
    );
  }

  Widget _buildFriendsList() {
    if (_friends.isEmpty) {
      return _buildEmptyState(
        icon: Icons.people_outline,
        title: 'No friends yet',
        subtitle: 'Find people to connect with!',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadFriends,
      color: AppColors.primaryTeal,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _friends.length,
        itemBuilder: (context, index) {
          final friend = _friends[index];
          return _AnimatedFriendCard(
            index: index,
            child: _FriendCard(
              user: friend,
              onTap: () => _openChat(friend),
              trailing: IconButton(
                icon: const Icon(Icons.message, color: AppColors.primaryTeal),
                onPressed: () => _openChat(friend),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRequestsList() {
    if (_pendingRequests.isEmpty) {
      return _buildEmptyState(
        icon: Icons.person_add_disabled,
        title: 'No pending requests',
        subtitle: 'Friend requests will appear here',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPendingRequests,
      color: AppColors.primaryTeal,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _pendingRequests.length,
        itemBuilder: (context, index) {
          final request = _pendingRequests[index];
          return _AnimatedFriendCard(
            index: index,
            child: _FriendRequestCard(
              request: request,
              onAccept: () => _respondToRequest(request, 'accept'),
              onDecline: () => _respondToRequest(request, 'reject'),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSearchTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search for users...',
              prefixIcon: const Icon(Icons.search, color: AppColors.primaryTeal),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          _searchQuery = '';
                          _searchResults = [];
                        });
                      },
                    )
                  : null,
              filled: true,
              fillColor: AppColors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: BorderSide(color: AppColors.surfaceGrey),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: BorderSide(color: AppColors.primaryTeal, width: 2),
              ),
            ),
            onChanged: (value) {
              setState(() => _searchQuery = value);
              _searchUsers(value);
            },
          ),
        ),
        Expanded(
          child: _isSearching
              ? const Center(child: CircularProgressIndicator(color: AppColors.primaryTeal))
              : _searchResults.isEmpty
                  ? _buildEmptyState(
                      icon: Icons.search,
                      title: _searchQuery.isEmpty ? 'Search for friends' : 'No results found',
                      subtitle: _searchQuery.isEmpty 
                          ? 'Enter a name to find people' 
                          : 'Try a different search term',
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final user = _searchResults[index];
                        return _AnimatedFriendCard(
                          index: index,
                          child: _SearchResultCard(
                            user: user,
                            onSendRequest: () => _sendFriendRequest(user),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.tealLight.withOpacity(0.3),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 64, color: AppColors.primaryTeal),
          ),
          const SizedBox(height: 24),
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textGrey,
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedFriendCard extends StatefulWidget {
  final int index;
  final Widget child;

  const _AnimatedFriendCard({required this.index, required this.child});

  @override
  State<_AnimatedFriendCard> createState() => _AnimatedFriendCardState();
}

class _AnimatedFriendCardState extends State<_AnimatedFriendCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.3, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

    Future.delayed(Duration(milliseconds: widget.index * 50), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

class _FriendCard extends StatelessWidget {
  final FriendUser user;
  final VoidCallback onTap;
  final Widget? trailing;

  const _FriendCard({
    required this.user,
    required this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shadowColor: AppColors.primaryTeal.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [AppColors.primaryTeal, AppColors.tealDark],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryTeal.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 28,
                      backgroundColor: Colors.transparent,
                      backgroundImage: user.avatarUrl != null
                          ? NetworkImage(user.avatarUrl!)
                          : null,
                      child: user.avatarUrl == null
                          ? Text(
                              user.displayName[0].toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                              ),
                            )
                          : null,
                    ),
                  ),
                  if (user.isOnline)
                    Positioned(
                      right: 2,
                      bottom: 2,
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: AppColors.successGreen,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: user.isOnline ? AppColors.successGreen : AppColors.textGrey,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          user.isOnline ? 'Online' : 'Offline',
                          style: TextStyle(
                            color: user.isOnline ? AppColors.successGreen : AppColors.textGrey,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (trailing != null) trailing!,
            ],
          ),
        ),
      ),
    );
  }
}

class _FriendRequestCard extends StatelessWidget {
  final FriendRequest request;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const _FriendRequestCard({
    required this.request,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shadowColor: AppColors.primaryTeal.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppColors.primaryTeal, AppColors.tealDark],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.transparent,
                    backgroundImage: request.requester.avatarUrl != null
                        ? NetworkImage(request.requester.avatarUrl!)
                        : null,
                    child: request.requester.avatarUrl == null
                        ? Text(
                            request.requester.displayName[0].toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 20,
                            ),
                          )
                        : null,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request.requester.displayName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        timeago.format(request.createdAt),
                        style: const TextStyle(
                          color: AppColors.textGrey,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onDecline,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textGrey,
                      side: const BorderSide(color: AppColors.surfaceGrey),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Decline'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryTeal,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Accept'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchResultCard extends StatelessWidget {
  final FriendUser user;
  final VoidCallback onSendRequest;

  const _SearchResultCard({
    required this.user,
    required this.onSendRequest,
  });

  @override
  Widget build(BuildContext context) {
    Widget actionButton;
    
    switch (user.friendshipStatus) {
      case 'accepted':
        actionButton = OutlinedButton.icon(
          onPressed: null,
          icon: const Icon(Icons.check, size: 18),
          label: const Text('Friends'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.successGreen,
            side: const BorderSide(color: AppColors.successGreen),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        );
        break;
      case 'request_sent':
        actionButton = OutlinedButton.icon(
          onPressed: null,
          icon: const Icon(Icons.schedule, size: 18),
          label: const Text('Pending'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.textGrey,
            side: const BorderSide(color: AppColors.surfaceGrey),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        );
        break;
      case 'request_received':
        actionButton = ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.person_add, size: 18),
          label: const Text('Respond'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orange,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        );
        break;
      default:
        actionButton = ElevatedButton.icon(
          onPressed: onSendRequest,
          icon: const Icon(Icons.person_add, size: 18),
          label: const Text('Add'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryTeal,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        );
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shadowColor: AppColors.primaryTeal.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [AppColors.primaryTeal.withOpacity(0.8), AppColors.tealDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: CircleAvatar(
                radius: 28,
                backgroundColor: Colors.transparent,
                backgroundImage: user.avatarUrl != null
                    ? NetworkImage(user.avatarUrl!)
                    : null,
                child: user.avatarUrl == null
                    ? Text(
                        user.displayName[0].toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user.displayName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppColors.textDark,
                    ),
                  ),
                  if (user.isOnline)
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.successGreen,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'Online',
                          style: TextStyle(
                            color: AppColors.successGreen,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
            actionButton,
          ],
        ),
      ),
    );
  }
}
