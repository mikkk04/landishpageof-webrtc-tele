const Conversation = require('../models/Conversation.js');
const Message = require('../models/Message.js');

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id })
            .populate({ path: 'participants', select: 'name specialty' })
            .populate('appointment', 'appointmentTime meetingId'); // This line is crucial
            
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .populate('sender', 'name');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};