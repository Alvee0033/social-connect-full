const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content, messageType = 'text' } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver ID and content are required' });
        }

        // Create message
        const message = await Message.create({
            senderId,
            receiverId,
            content,
            messageType,
        });

        // Update or create conversation
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { participant1Id: senderId, participant2Id: receiverId },
                    { participant1Id: receiverId, participant2Id: senderId },
                ],
            },
        });

        if (conversation) {
            await conversation.update({
                lastMessageId: message.id,
                lastMessageAt: message.createdAt,
            });
        } else {
            conversation = await Conversation.create({
                participant1Id: senderId,
                participant2Id: receiverId,
                lastMessageId: message.id,
                lastMessageAt: message.createdAt,
            });
        }

        // Fetch message with sender info
        const messageWithUser = await Message.findByPk(message.id, {
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'display_name', 'avatar_url'],
                },
            ],
        });

        res.status(201).json(messageWithUser);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// Get conversation messages
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Get conversation
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if user is part of conversation
        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        const otherId = conversation.participant1Id === userId 
            ? conversation.participant2Id 
            : conversation.participant1Id;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherId },
                    { senderId: otherId, receiverId: userId },
                ],
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'display_name', 'avatar_url'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        // Mark messages as read
        await Message.update(
            { isRead: true, readAt: new Date() },
            {
                where: {
                    senderId: otherId,
                    receiverId: userId,
                    isRead: false,
                },
            }
        );

        res.json(messages.reverse());
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

// Get all conversations
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { participant1Id: userId },
                    { participant2Id: userId },
                ],
            },
            order: [['lastMessageAt', 'DESC']],
        });

        // Enrich conversations with user info and last message
        const enrichedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherId = conv.participant1Id === userId 
                    ? conv.participant2Id 
                    : conv.participant1Id;
                
                const otherUser = await User.findByPk(otherId, {
                    attributes: ['id', 'display_name', 'avatar_url', 'is_online'],
                });

                const lastMessage = conv.lastMessageId 
                    ? await Message.findByPk(conv.lastMessageId)
                    : null;

                const unreadCount = await Message.count({
                    where: {
                        senderId: otherId,
                        receiverId: userId,
                        isRead: false,
                    },
                });

                return {
                    id: conv.id,
                    user: otherUser,
                    lastMessage,
                    unreadCount,
                    lastMessageAt: conv.lastMessageAt,
                };
            })
        );

        res.json(enrichedConversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

// Get or create conversation with user
exports.getOrCreateConversation = async (req, res) => {
    try {
        const { userId: otherUserId } = req.params;
        const userId = req.user.id;

        if (userId === otherUserId) {
            return res.status(400).json({ message: 'Cannot create conversation with yourself' });
        }

        // Check if other user exists
        const otherUser = await User.findByPk(otherUserId);
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { participant1Id: userId, participant2Id: otherUserId },
                    { participant1Id: otherUserId, participant2Id: userId },
                ],
            },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participant1Id: userId,
                participant2Id: otherUserId,
            });
        }

        res.json({
            id: conversation.id,
            user: {
                id: otherUser.id,
                display_name: otherUser.display_name,
                avatar_url: otherUser.avatar_url,
                is_online: otherUser.is_online,
            },
        });
    } catch (error) {
        console.error('Get or create conversation error:', error);
        res.status(500).json({ message: 'Failed to get conversation' });
    }
};
