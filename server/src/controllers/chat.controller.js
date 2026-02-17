const asyncHandler = require("express-async-handler");
const supabase = require("../config/supabaseClient");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    // Check if chat exists
    // Complex query in SQL: 
    // Select chats where is_group_chat is false AND exists in chat_users for both req.user.id and userId

    // First, find chat_ids common to both users
    const { data: user1Chats, error: err1 } = await supabase
        .from('chat_users')
        .select('chat_id')
        .eq('user_id', req.user.id);

    if (err1) throw new Error(err1.message);

    const { data: user2Chats, error: err2 } = await supabase
        .from('chat_users')
        .select('chat_id')
        .eq('user_id', userId);

    if (err2) throw new Error(err2.message);

    const user1ChatIds = user1Chats.map(c => c.chat_id);
    const commonChatIds = user2Chats
        .map(c => c.chat_id)
        .filter(id => user1ChatIds.includes(id));

    // Now filter for non-group chats
    let existingChat = null;

    if (commonChatIds.length > 0) {
        const { data, error } = await supabase
            .from('chats')
            .select(`
                *,
                users:chat_users(user_id, users(name, pic, email)),
                latestMessage:messages(*)
            `)
            .in('id', commonChatIds)
            .eq('is_group_chat', false)
            .limit(1)
            .single(); // Might return null if no non-group chat found in common ones

        if (data) existingChat = data;
    }

    if (existingChat) {
        // Transform structure to match Mongoose .populate() format for frontend compatibility
        existingChat.users = existingChat.users.map(u => ({ ...u.users, _id: u.user_id })); // Flatten structure
        res.send(existingChat);
    } else {
        // Create new chat
        const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert([{ chat_name: "sender", is_group_chat: false }])
            .select()
            .single();

        if (createError) throw new Error(createError.message);

        // Add users to chat
        const { error: joinError } = await supabase
            .from('chat_users')
            .insert([
                { chat_id: newChat.id, user_id: req.user.id },
                { chat_id: newChat.id, user_id: userId }
            ]);

        if (joinError) throw new Error(joinError.message);

        // Fetch full chat to return
        const { data: fullChat } = await supabase
            .from('chats')
            .select(`
                *,
                users:chat_users(user_id, users(name, pic, email))
            `)
            .eq('id', newChat.id)
            .single();

        fullChat.users = fullChat.users.map(u => ({ ...u.users, _id: u.user_id }));
        res.status(200).send(fullChat);
    }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
    // Get all chat_ids for user
    const { data: userChatIds } = await supabase
        .from('chat_users')
        .select('chat_id')
        .eq('user_id', req.user.id);

    const chatIds = userChatIds.map(c => c.chat_id);

    const { data: chats, error } = await supabase
        .from('chats')
        .select(`
            *,
            users:chat_users(user_id, users(name, pic, email)),
            groupAdmin:users!group_admin_id(name, pic, email),
            latestMessage:messages(*)
        `)
        .in('id', chatIds)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Transform for frontend
    const formattedChats = chats.map(chat => ({
        ...chat,
        users: chat.users.map(u => ({ ...u.users, _id: u.user_id })),
        _id: chat.id // Frontend expects _id
    }));

    res.status(200).send(formattedChats);
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    // Create Group Chat
    const { data: groupChat, error: createError } = await supabase
        .from('chats')
        .insert([{
            chat_name: req.body.name,
            is_group_chat: true,
            group_admin_id: req.user.id
        }])
        .select()
        .single();

    if (createError) throw new Error(createError.message);

    // Prepare batch insert for chat_users
    // Add admin and all selected users
    const chatUsers = [
        { chat_id: groupChat.id, user_id: req.user.id },
        ...users.map(u => ({ chat_id: groupChat.id, user_id: u._id || u.id }))
        // Using u.id assuming frontend sends user objects with id
    ];

    const { error: joinError } = await supabase
        .from('chat_users')
        .insert(chatUsers);

    if (joinError) throw new Error(joinError.message);

    // Fetch full
    const { data: fullGroupChat } = await supabase
        .from('chats')
        .select(`
            *,
            users:chat_users(user_id, users(name, pic, email)),
            groupAdmin:users!group_admin_id(name, pic, email)
        `)
        .eq('id', groupChat.id)
        .single();

    fullGroupChat.users = fullGroupChat.users.map(u => ({ ...u.users, _id: u.user_id }));
    fullGroupChat._id = fullGroupChat.id;

    res.status(200).json(fullGroupChat);
});

//@description     Rename Group
//@route           PUT /api/chat/rename
//@access          Protected
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const { data: updatedChat, error } = await supabase
        .from('chats')
        .update({ chat_name: chatName })
        .eq('id', chatId)
        .select(`
            *,
            users:chat_users(user_id, users(name, pic, email)),
            groupAdmin:users!group_admin_id(name, pic, email)
        `)
        .single();

    if (error) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        updatedChat.users = updatedChat.users.map(u => ({ ...u.users, _id: u.user_id }));
        updatedChat._id = updatedChat.id;
        res.json(updatedChat);
    }
});

//@description     Add user to Group
//@route           PUT /api/chat/groupadd
//@access          Protected
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const { error } = await supabase
        .from('chat_users')
        .insert([{ chat_id: chatId, user_id: userId }]);

    if (error) {
        res.status(404);
        throw new Error("Chat Not Found or User already added");
    }

    const { data: added } = await supabase
        .from('chats')
        .select(`
            *,
            users:chat_users(user_id, users(name, pic, email)),
            groupAdmin:users!group_admin_id(name, pic, email)
        `)
        .eq('id', chatId)
        .single();

    added.users = added.users.map(u => ({ ...u.users, _id: u.user_id }));
    added._id = added.id;
    res.json(added);
});

//@description     Remove user from Group
//@route           PUT /api/chat/groupremove
//@access          Protected
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const { error } = await supabase
        .from('chat_users')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

    if (error) {
        res.status(404);
        throw new Error("Chat Not Found");
    }

    const { data: removed } = await supabase
        .from('chats')
        .select(`
            *,
            users:chat_users(user_id, users(name, pic, email)),
            groupAdmin:users!group_admin_id(name, pic, email)
        `)
        .eq('id', chatId)
        .single();

    removed.users = removed.users.map(u => ({ ...u.users, _id: u.user_id }));
    removed._id = removed.id;
    res.json(removed);
});

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
};
