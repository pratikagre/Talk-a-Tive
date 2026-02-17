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
        <>
            {selectedChat ? (
                <>
                    <div className="text-xl pb-3 px-2 w-full font-sans flex justify-between items-center">
                        <button
                            className="md:hidden flex bg-gray-200 p-2 rounded"
                            onClick={() => setSelectedChat("")}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <VideoCallModal
                                    chatId={selectedChat._id}
                                    otherUser={getSenderFull(user, selectedChat.users)}
                                />
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                    fetchMessages={fetchMessages}
                                />
                            </>
                        )}
                    </div>
                    <div className="flex flex-col justify-end p-3 bg-gray-100 w-full h-full rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="self-center m-auto text-xl">Loading...</div>
                        ) : (
                            <div className="messages custom-scrollbar overflow-y-auto">
                                <ScrollableChat messages={messages} setMessages={setMessages} />
                            </div>
                        )}

                        <div className="mt-3">
                            {isTyping ? <div>Loading...</div> : <></>}
                            <input
                                className="w-full bg-gray-200 p-2 rounded border border-gray-300"
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                                onKeyDown={sendMessage}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <label htmlFor="file-upload" className="cursor-pointer bg-gray-300 p-2 rounded hover:bg-gray-400">
                                    <i className="fas fa-paperclip"></i>
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={async (e) => {
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
                                                    content: file.name, // Or empty
                                                    chatId: selectedChat,
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
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-3xl pb-3 font-sans">
                        Click on a user to start chatting
                    </p>
                </div>
            )}
        </>
    );
};

export default SingleChat;
