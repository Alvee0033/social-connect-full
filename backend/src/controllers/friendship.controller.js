const Friendship = require('../models/friendship.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
    try {
        const { addresseeId } = req.body;
        const requesterId = req.user.id;

        if (requesterId === addresseeId) {
            return res.status(400).json({ message: 'Cannot send friend request to yourself' });
        }

        // Check if user exists
        const addressee = await User.findByPk(addresseeId);
        if (!addressee) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requesterId, addresseeId },
                    { requesterId: addresseeId, addresseeId: requesterId },
                ],
            },
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                return res.status(400).json({ message: 'Already friends' });
            }
            if (existingFriendship.status === 'pending') {
                return res.status(400).json({ message: 'Friend request already sent' });
            }
            if (existingFriendship.status === 'blocked') {
                return res.status(400).json({ message: 'Cannot send friend request' });
            }
        }

        const friendship = await Friendship.create({
            requesterId,
            addresseeId,
            status: 'pending',
        });

        res.status(201).json({
            id: friendship.id,
            addressee: {
                id: addressee.id,
                display_name: addressee.display_name,
                avatar_url: addressee.avatar_url,
            },
            status: 'pending',
        });
    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({ message: 'Failed to send friend request' });
    }
};

// Accept/Reject friend request
exports.respondToFriendRequest = async (req, res) => {
    try {
        const { friendshipId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        const userId = req.user.id;

        const friendship = await Friendship.findByPk(friendshipId);
        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        // Only addressee can respond to the request
        if (friendship.addresseeId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (friendship.status !== 'pending') {
            return res.status(400).json({ message: 'Friend request already processed' });
        }

        friendship.status = action === 'accept' ? 'accepted' : 'rejected';
        await friendship.save();

        const requester = await User.findByPk(friendship.requesterId, {
            attributes: ['id', 'display_name', 'avatar_url'],
        });

        res.json({
            id: friendship.id,
            requester,
            status: friendship.status,
        });
    } catch (error) {
        console.error('Respond to friend request error:', error);
        res.status(500).json({ message: 'Failed to respond to friend request' });
    }
};

// Get pending friend requests
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await Friendship.findAll({
            where: {
                addresseeId: userId,
                status: 'pending',
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'display_name', 'avatar_url'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(requests);
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ message: 'Failed to fetch friend requests' });
    }
};

// Get sent friend requests
exports.getSentRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await Friendship.findAll({
            where: {
                requesterId: userId,
                status: 'pending',
            },
            include: [
                {
                    model: User,
                    as: 'addressee',
                    attributes: ['id', 'display_name', 'avatar_url'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(requests);
    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({ message: 'Failed to fetch sent requests' });
    }
};

// Get friends list
exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { requesterId: userId },
                    { addresseeId: userId },
                ],
                status: 'accepted',
            },
        });

        const friendIds = friendships.map((f) =>
            f.requesterId === userId ? f.addresseeId : f.requesterId
        );

        const friends = await User.findAll({
            where: {
                id: {
                    [Op.in]: friendIds,
                },
            },
            attributes: ['id', 'display_name', 'avatar_url', 'is_online'],
        });

        res.json(friends);
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ message: 'Failed to fetch friends' });
    }
};

// Remove friend
exports.removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        const friendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requesterId: userId, addresseeId: friendId },
                    { requesterId: friendId, addresseeId: userId },
                ],
                status: 'accepted',
            },
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        await friendship.destroy();

        res.json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({ message: 'Failed to remove friend' });
    }
};

// Search users to add as friends
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const users = await User.findAll({
            where: {
                id: { [Op.ne]: userId },
                display_name: {
                    [Op.iLike]: `%${query}%`,
                },
            },
            attributes: ['id', 'display_name', 'avatar_url', 'is_online'],
            limit: 20,
        });

        // Get friendship status for each user
        const usersWithStatus = await Promise.all(
            users.map(async (user) => {
                const friendship = await Friendship.findOne({
                    where: {
                        [Op.or]: [
                            { requesterId: userId, addresseeId: user.id },
                            { requesterId: user.id, addresseeId: userId },
                        ],
                    },
                });

                let friendshipStatus = 'none';
                let friendshipId = null;
                if (friendship) {
                    friendshipStatus = friendship.status;
                    friendshipId = friendship.id;
                    if (friendship.status === 'pending') {
                        friendshipStatus = friendship.requesterId === userId 
                            ? 'request_sent' 
                            : 'request_received';
                    }
                }

                return {
                    id: user.id,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url,
                    is_online: user.is_online,
                    friendshipStatus,
                    friendshipId,
                };
            })
        );

        res.json(usersWithStatus);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Failed to search users' });
    }
};
