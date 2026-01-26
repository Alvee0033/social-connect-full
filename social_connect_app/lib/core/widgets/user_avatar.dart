import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class UserAvatar extends StatelessWidget {
  final String? imageUrl;
  final double radius;
  final bool isActive;

  const UserAvatar({
    super.key,
    this.imageUrl,
    this.radius = 20,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CircleAvatar(
          radius: radius,
          backgroundColor: AppColors.grey,
          backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
          child: imageUrl == null
              ? Icon(
                  Icons.person,
                  size: radius,
                  color: AppColors.white,
                )
              : null,
        ),
        if (isActive)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              height: radius * 0.6,
              width: radius * 0.6,
              decoration: BoxDecoration(
                color: AppColors.successGreen,
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.white,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
