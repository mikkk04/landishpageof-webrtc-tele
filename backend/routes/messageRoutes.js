const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const { getConversations, getMessages } = require('../controllers/messageController.js');

router.get('/', auth, getConversations);
router.get('/:conversationId', auth, getMessages);

module.exports = router;