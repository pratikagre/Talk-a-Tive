import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "../config/axios";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/chat", config);
            setChats(data);
        } catch (error) {
            alert("Failed to Load the chats: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
        // eslint-disable-next-line
    }, [fetchAgain]);

    return (
        <div
            className={`${selectedChat ? "hidden" : "flex"} md:flex flex-col bg-white w-full md:w-[31%] border-r border-gray-200 h-full`}
        >
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <div className="text-xl font-bold text-gray-800 ml-2">Chats</div>
                <GroupChatModal>
                    <button className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 p-2 px-3 rounded-full text-sm font-medium shadow-sm transition-all duration-200 flex items-center gap-2">
                        <span className="text-lg">+</span> New Group
                    </button>
                </GroupChatModal>
            </div>

            <div className="flex flex-col w-full h-full overflow-y-hidden bg-white">
                {chats ? (
                    <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {chats.map((chat) => {
                            const isSelected = selectedChat === chat;
                            const chatName = !chat.isGroupChat
                                ? getSender(loggedUser, chat.users)
                                : chat.chatName;
                            const chatPic = !chat.isGroupChat
                                ? getSenderFull(loggedUser, chat.users)?.pic
                                : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"; // Default group icon (should ideally be unique)

                            return (
                                <div
                                    onClick={() => setSelectedChat(chat)}
                                    className={`cursor-pointer w-full px-4 py-3 flex items-center gap-3 border-b border-gray-50 transition-colors duration-200 ${isSelected
                                            ? "bg-blue-500 text-white hover:bg-blue-600"
                                            : "bg-white hover:bg-gray-50 text-gray-900"
                                        }`}
                                    key={chat._id}
                                >
                                    <img
                                        src={chatPic}
                                        alt={chatName}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0"
                                    />
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                {chatName}
                                            </h4>
                                            {/* Timestamp would go here if available in chat object */}
                                            {/* <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>12:45 PM</span> */}
                                        </div>
                                        {chat.latestMessage ? (
                                            <p className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                                <span className={`${isSelected ? 'text-blue-200' : 'text-gray-800'} font-medium mr-1`}>
                                                    {chat.latestMessage.sender.name === loggedUser?.name ? "You:" : chat.latestMessage.sender.name + ":"}
                                                </span>
                                                {chat.latestMessage.content.length > 35
                                                    ? chat.latestMessage.content.substring(0, 35) + "..."
                                                    : chat.latestMessage.content}
                                            </p>
                                        ) : (
                                            <p className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-400'} italic`}>
                                                Start a conversation
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <div className="text-4xl">💬</div>
                        <p>Loading chats...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Utils function helper
export const getSender = (loggedUser, users) => {
    if (!loggedUser || !users) return "";
    return users[0]?._id === loggedUser?._id ? users[1]?.name : users[0]?.name;
};
export const getSenderFull = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1] : users[0];
};

function Text({ children }) { return <p className="font-semibold">{children}</p> }

export default MyChats;
