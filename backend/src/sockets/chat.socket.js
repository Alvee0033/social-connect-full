const Message = require('../models/message.model');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Store online users: { odinguserId: socketId }
const onlineUsers = new Map();

const setupSocketHandlers = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = user.id;
            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket auth error:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId}`);

        // Add user to online users
        onlineUsers.set(userId, socket.id);

        // Update user online status
        await User.update({ is_online: true }, { where: { id: userId } });

        // Broadcast online status to friends
        socket.broadcast.emit('user_online', { userId });

        // Join user's personal room
        socket.join(userId);

        // Handle sending messages
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, content, messageType = 'text' } = data;

                // Create message
                const message = await Message.create({
                    senderId: userId,
                    receiverId,
                    content,
                    messageType,
                });

                // Update or create conversation
                let conversation = await Conversation.findOne({
                    where: {
                        [Op.or]: [
                            { participant1Id: userId, participant2Id: receiverId },
                            { participant1Id: receiverId, participant2Id: userId },
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
                        participant1Id: userId,
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

                const messageData = {
                    id: messageWithUser.id,
                    senderId: messageWithUser.senderId,
                    receiverId: messageWithUser.receiverId,
                    content: messageWithUser.content,
                    messageType: messageWithUser.messageType,
                    isRead: messageWithUser.isRead,
                    createdAt: messageWithUser.createdAt,
                    sender: messageWithUser.sender,
                    conversationId: conversation.id,
                };

                // Send to sender
                socket.emit('message_sent', messageData);

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('new_message', messageData);
                }
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle typing indicator
        socket.on('typing_start', (data) => {
            const { receiverId } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', { userId });
            }
        });

        socket.on('typing_stop', (data) => {
            const { receiverId } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_stopped_typing', { userId });
            }
        });

        // Handle message read
        socket.on('mark_read', async (data) => {
            try {
                const { messageIds, senderId } = data;
                
                await Message.update(
                    { isRead: true, readAt: new Date() },
                    { where: { id: { [Op.in]: messageIds } } }
                );

                // Notify sender that messages were read
                const senderSocketId = onlineUsers.get(senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messages_read', { 
                        messageIds, 
                        readBy: userId 
                    });
                }
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        // Handle friend request notification
        socket.on('friend_request_sent', (data) => {
            const { addresseeId } = data;
            const addresseeSocketId = onlineUsers.get(addresseeId);
            if (addresseeSocketId) {
                io.to(addresseeSocketId).emit('new_friend_request', {
                    requesterId: userId,
                    requester: {
                        id: socket.user.id,
                        display_name: socket.user.display_name,
                        avatar_url: socket.user.avatar_url,
                    },
                });
            }
        });

        // Handle friend request response notification
        socket.on('friend_request_responded', (data) => {
            const { requesterId, action } = data;
            const requesterSocketId = onlineUsers.get(requesterId);
            if (requesterSocketId) {
                io.to(requesterSocketId).emit('friend_request_response', {
                    addresseeId: userId,
                    addressee: {
                        id: socket.user.id,
                        display_name: socket.user.display_name,
                        avatar_url: socket.user.avatar_url,
                    },
                    action,
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);
            
            onlineUsers.delete(userId);
            
            // Update user online status
            await User.update({ is_online: false }, { where: { id: userId } });

            // Broadcast offline status
            socket.broadcast.emit('user_offline', { userId });
        });
    });
};

module.exports = { setupSocketHandlers, onlineUsers };
