import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import '../../../../core/theme/app_colors.dart';
import '../bloc/search_bloc.dart';
import '../bloc/search_event.dart';
import '../bloc/search_state.dart';

class UserSearchDelegate extends SearchDelegate {
  @override
  List<Widget>? buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
          showSuggestions(context);
        },
      ),
    ];
  }

  @override
  Widget? buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    return _buildSearchContent(context);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return _buildSearchContent(context);
  }

  Widget _buildSearchContent(BuildContext context) {
    return BlocProvider(
      create: (context) => GetIt.I<SearchBloc>()..add(SearchQueryChanged(query)),
      child: BlocBuilder<SearchBloc, SearchState>(
        builder: (context, state) {
          if (query.isEmpty) {
            return const Center(child: Text('Search for real people on Niggabook'));
          }

          if (state is SearchLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is SearchLoaded) {
            if (state.users.isEmpty) {
              return const Center(child: Text('No users found.'));
            }
            return ListView.builder(
              itemCount: state.users.length,
              itemBuilder: (context, index) {
                final user = state.users[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.tealLight,
                    child: Text(
                      user.displayName[0].toUpperCase(),
                      style: const TextStyle(color: AppColors.tealDark, fontWeight: FontWeight.bold),
                    ),
                  ),
                  title: Text(user.displayName),
                  subtitle: Text(user.email),
                  onTap: () {
                    // Navigate to user profile or chat
                    close(context, user);
                  },
                );
              },
            );
          } else if (state is SearchError) {
            return Center(child: Text('Error: ${state.message}'));
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
