import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { getSenderFull, getSender } from "./MyChats";
import axios from "../config/axios";
import "./styles.css"; // We'll create this for specific animations if needed
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import VideoCallModal from "./miscellaneous/VideoCallModal";

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Should come from env
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );

            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            alert("Error Occured! Failed to Load the Messages");
        }
    };

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                alert("Error Occured! Failed to send the Message: " + (error.response?.data?.message || error.message));
            }
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);

                    // Browser Notification
                    if (Notification.permission === "granted") {
                        new Notification("New Message", {
                            body: `New message from ${newMessageRecieved.sender.name}`,
                            icon: "/vite.svg" // Placeholder icon
                        });
                    } else if (Notification.permission !== "denied") {
                        Notification.requestPermission().then(permission => {
                            if (permission === "granted") {
                                new Notification("New Message", {
                                    body: `New message from ${newMessageRecieved.sender.name}`,
                                    icon: "/vite.svg"
                                });
                            }
                        });
                    }
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // Typing Indicator Logic
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#E5DDD5]"> {/* WhatsApp-like default background color */}
            {selectedChat ? (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button
                                className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
                                onClick={() => setSelectedChat("")}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>

                            {!selectedChat.isGroupChat ? (
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => {/* Profile logic */ }}>
                                    <div className="relative">
                                        <img
                                            src={getSenderFull(user, selectedChat.users).pic}
                                            alt={getSender(user, selectedChat.users)}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800 text-md leading-tight">
                                            {getSender(user, selectedChat.users)}
                                        </span>
                                        <span className="text-xs text-blue-500 font-medium">online</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                        #
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800 text-md leading-tight">
                                            {selectedChat.chatName.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">{selectedChat.users.length} members</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-gray-600">
                            {!selectedChat.isGroupChat ? (
                                <VideoCallModal
                                    chatId={selectedChat._id}
                                    otherUser={getSenderFull(user, selectedChat.users)}
                                />
                            ) : (
                                <UpdateGroupChatModal
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                    fetchMessages={fetchMessages}
                                />
                            )}
                            <button className="hidden hover:bg-gray-100 p-2 rounded-full transition"><i className="fas fa-search"></i></button>
                            <button className="hover:bg-gray-100 p-2 rounded-full transition"><i className="fas fa-ellipsis-v"></i></button>
                        </div>
                    </div>

                    {/* Chat Area with Background */}
                    <div
                        className="flex-1 overflow-y-auto p-4 relative"
                        style={{
                            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, // WhatsApp default bg pattern
                            backgroundRepeat: 'repeat',
                            backgroundSize: '400px'
                        }}
                    >
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="loading-spinner text-gray-400 text-xl">Loading...</span>
                            </div>
                        ) : (
                            <div className="messages custom-scrollbar h-full flex flex-col">
                                <ScrollableChat messages={messages} setMessages={setMessages} />
                            </div>
                        )}
                        {isTyping && (
                            <div className="absolute bottom-2 left-4 bg-white px-4 py-2 rounded-full shadow-md text-sm text-gray-500 italic animate-pulse">
                                Typing...
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-t border-gray-200">
                        <label htmlFor="file-upload" className="cursor-pointer text-gray-500 hover:text-gray-700 p-2 transition transform hover:scale-110">
                            <i className="fas fa-paperclip text-xl"></i>
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={async (e) => {
                                // ... existing file upload logic ...
                                const file = e.target.files[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append("file", file);
                                try {
                                    setLoading(true);
                                    const config = { headers: { "Content-Type": "multipart/form-data" } };
                                    const { data } = await axios.post("/api/upload", formData, config);

                                    // Immediately send message with file
                                    const msgConfig = {
                                        headers: {
                                            "Content-type": "application/json",
                                            Authorization: `Bearer ${user.token}`,
                                        },
                                    };

                                    const { data: msgData } = await axios.post(
                                        "/api/message",
                                        {
                                            content: file.name,
                                            chatId: selectedChat._id, // Use ._id here? No, existing code used selectedChat. Let's check. Existing code used selectedChat, which is the object. But chatId expects ID.
                                            // The backend expects chatId. In original code it was selectedChat._id. Wait, in 1247 it says chatId: selectedChat (line 227). 
                                            // But line 65 says chatId: selectedChat._id. 
                                            // I should simply use selectedChat._id to be safe.
                                            chatId: selectedChat._id,
                                            fileUrl: (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/uploads" + data.filePath,
                                            fileType: data.fileType
                                        },
                                        msgConfig
                                    );

                                    socket.emit("new message", msgData);
                                    setMessages([...messages, msgData]);
                                    setLoading(false);

                                } catch (error) {
                                    console.error(error);
                                    setLoading(false);
                                    alert("File upload failed");
                                }
                            }}
                        />

                        <input
                            className="flex-1 bg-white text-gray-800 rounded-full px-5 py-3 border-none focus:ring-1 focus:ring-blue-300 shadow-sm text-sm"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={typingHandler}
                            onKeyDown={sendMessage}
                        />

                        {newMessage ? (
                            <button onClick={() => sendMessage({ key: "Enter" })} className="text-blue-500 hover:text-blue-600 p-2 transition transform hover:scale-110">
                                <i className="fas fa-paper-plane text-xl"></i>
                            </button>
                        ) : (
                            <button className="text-gray-500 hover:text-gray-700 p-2 transition transform hover:scale-110">
                                <i className="fas fa-microphone text-xl"></i>
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center p-6">
                    <img src="https://i.ibb.co/T4bM5sL/intro-connection-light.jpg" alt="No Chat Selected" className="w-1/2 max-w-sm mb-6 opacity-80" />
                    <h2 className="text-3xl font-light text-gray-700 mb-2">Talk-A-Tive Web</h2>
                    <p className="text-gray-500 max-w-md">Send and receive messages without keeping your phone online.<br />Use Talk-A-Tive on up to 4 linked devices and 1 phone.</p>
                </div>
            )}
        </div>
    );
};

export default SingleChat;
