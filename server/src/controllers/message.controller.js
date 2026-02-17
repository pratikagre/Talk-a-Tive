const asyncHandler = require("express-async-handler");
const supabase = require("../config/supabaseClient");

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 20;

    // Search query
    let query = supabase
        .from('messages')
        .select(`
            *,
            sender:users(name, pic, email),
            chat:chats(*)
        `, { count: 'exact' })
        .eq('chat_id', chatId);

    if (req.query.search) {
        query = query.ilike('content', `%${req.query.search}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: messages, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    // Transform for frontend
    const formattedMessages = messages.map(msg => ({
        ...msg,
        _id: msg.id,
        sender: { ...msg.sender, _id: msg.sender_id },
        chat: { ...msg.chat, _id: msg.chat_id }
    }));

    res.json({
        messages: formattedMessages.reverse(),
        page,
        pages: Math.ceil(count / pageSize)
    });
});

//@description     Create New Message
//@route           POST /api/message
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, fileUrl, fileType } = req.body;

    if ((!content && !fileUrl) || !chatId) {
        if ((!content && !fileUrl) || !chatId) {
            console.log("Invalid data passed into request", req.body);
            return res.status(400).json({
                message: "Invalid data passed into request. content or chatId missing.",
                received: req.body
            });
        }

        const newMessage = {
            sender_id: req.user.id,
            content: content,
            chat_id: chatId,
            file_url: fileUrl,
            file_type: fileType
        };

        const { data: message, error } = await supabase
            .from('messages')
            .insert([newMessage])
            .select(`
            *,
            sender:users(name, pic, email),
            chat:chats(*)
        `)
            .single();

        if (error) {
            res.status(400);
            throw new Error(error.message);
        }

        // Populate chat users for socket.io logic (frontend expects 'chat.users')
        const { data: chatUsers } = await supabase
            .from('chat_users')
            .select('user_id, users(name, pic, email)')
            .eq('chat_id', chatId);

        const fullMessage = {
            ...message,
            _id: message.id,
            sender: { ...message.sender, _id: message.sender_id },
            chat: {
                ...message.chat,
                _id: message.chat_id,
                users: chatUsers.map(u => ({ ...u.users, _id: u.user_id }))
            }
        };

        // Update latest message in chats table (using separate update as trigger logic is complex for now)
        await supabase
            .from('chats')
            .update({ latest_message_id: message.id })
            .eq('id', chatId);

        res.json(fullMessage);
    });

//@description     Delete Message
//@route           DELETE /api/message/:id
//@access          Protected
const deleteMessage = asyncHandler(async (req, res) => {
    // First fetch message to check ownership
    const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (fetchError || !message) {
        res.status(404);
        throw new Error("Message not found");
    }

    // Check if user is sender
    if (message.sender_id !== req.user.id) {
        res.status(401);
        throw new Error("You can't delete this message");
    }

    const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', req.params.id);

    if (deleteError) {
        res.status(400);
        throw new Error(deleteError.message);
    }

    res.json({ message: "Message Removed" });
});

module.exports = { allMessages, sendMessage, deleteMessage };
