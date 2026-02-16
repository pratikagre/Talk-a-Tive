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
            alert("Failed to Load the chats");
        }
    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
        // eslint-disable-next-line
    }, [fetchAgain]);

    return (
        <div
            className={`${selectedChat ? "hidden" : "flex"
                } md:flex flex-col items-center p-3 bg-white w-full md:w-[31%] rounded-lg border border-gray-200`}
        >
            <div className="pb-3 px-3 text-2xl font-sans flex w-full justify-between items-center">
                My Chats
                <GroupChatModal>
                    <button className="bg-gray-200 p-2 rounded text-sm hover:bg-gray-300">
                        + New Group Chat
                    </button>
                </GroupChatModal>
            </div>
            <div className="flex flex-col bg-gray-100 p-3 w-full h-full rounded-lg overflow-y-hidden">
                {chats ? (
                    <div className="overflow-y-scroll scrollbar-none">
                        {chats.map((chat) => (
                            <div
                                onClick={() => setSelectedChat(chat)}
                                className={`cursor-pointer px-3 py-2 rounded-lg mb-2 ${selectedChat === chat
                                    ? "bg-teal-500 text-white"
                                    : "bg-gray-200 text-black"
                                    }`}
                                key={chat._id}
                            >
                                <Text>
                                    {!chat.isGroupChat
                                        ? getSender(loggedUser, chat.users)
                                        : chat.chatName}
                                </Text>
                                {chat.latestMessage && (
                                    <p className="text-xs">
                                        <b>{chat.latestMessage.sender.name}: </b>
                                        {chat.latestMessage.content.length > 50
                                            ? chat.latestMessage.content.substring(0, 51) + "..."
                                            : chat.latestMessage.content}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>Loading chats...</div>
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
