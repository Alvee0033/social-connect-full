const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');
const friendshipRoutes = require('./routes/friendship.routes');

const User = require('./models/user.model');
const Post = require('./models/post.model');
const Message = require('./models/message.model');
const Conversation = require('./models/conversation.model');
const Friendship = require('./models/friendship.model');

// Associations
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Message associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Conversation associations
User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'conversationsAsParticipant1' });
User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'conversationsAsParticipant2' });
Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });
Conversation.belongsTo(Message, { foreignKey: 'lastMessageId', as: 'lastMessage' });

// Friendship associations
User.hasMany(Friendship, { foreignKey: 'requesterId', as: 'sentFriendRequests' });
User.hasMany(Friendship, { foreignKey: 'addresseeId', as: 'receivedFriendRequests' });
Friendship.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Friendship.belongsTo(User, { foreignKey: 'addresseeId', as: 'addressee' });

const app = express();

// Security Middleware
app.use(helmet()); // Set secure HTTP headers
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter); // Apply rate limiting to all API routes

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('SocialConnect API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendshipRoutes);

module.exports = app;
