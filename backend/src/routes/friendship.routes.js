const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendship.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes are protected
router.use(authenticateToken);

// Search users
router.get('/search', friendshipController.searchUsers);

// Get friends list
router.get('/', friendshipController.getFriends);

// Get pending friend requests (received)
router.get('/requests/pending', friendshipController.getPendingRequests);

// Get sent friend requests
router.get('/requests/sent', friendshipController.getSentRequests);

// Send friend request
router.post('/request', friendshipController.sendFriendRequest);

// Accept/Reject friend request
router.put('/request/:friendshipId', friendshipController.respondToFriendRequest);

// Remove friend
router.delete('/:friendId', friendshipController.removeFriend);

module.exports = router;
