import ScrollableFeed from "react-scrollable-feed"; // Need to install this, or use custom scroll
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import axios from "../config/axios";

const ScrollableChat = ({ messages, setMessages }) => { // Accepting setMessages to update state
    const { user } = ChatState();

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`/api/message/${id}`, config);
            // Optimistically update UI
            // In real app, emit socket event "delete message"
            setMessages(messages.filter(m => m._id !== id));
        } catch (error) {
            alert("Failed to delete message");
        }
    };

    return (
        <div className="overflow-y-auto flex flex-col gap-2 p-2 pb-0">
            {messages &&
                messages.map((m, i) => {
                    const isOwnMessage = m.sender._id === user._id;
                    return (
                        <div key={m._id} className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            {/* Avatar for received messages */}
                            {!isOwnMessage && (isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
                                <div
                                    className="w-8 h-8 rounded-full bg-cover bg-center cursor-pointer mr-2 mt-1 shadow-sm border border-gray-200"
                                    style={{ backgroundImage: `url(${m.sender.pic})` }}
                                    title={m.sender.name}
                                ></div>
                            )}
                            {!isOwnMessage && !(isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
                                <div className="w-8 mr-2"></div> // Spacer
                            )}

                            <div
                                style={{
                                    maxWidth: "75%",
                                    marginLeft: isOwnMessage ? "auto" : 0,
                                }}
                                className={`relative px-3 py-2 text-sm shadow-md rounded-lg ${isOwnMessage
                                        ? "bg-[#dcf8c6] text-gray-800 rounded-tr-none"
                                        : "bg-white text-gray-800 rounded-tl-none"
                                    }`}
                            >
                                {/* Sender Name in Group Chat */}
                                {!isOwnMessage && m.chat.isGroupChat && (
                                    <p className="text-xs font-bold text-orange-500 mb-1">
                                        {m.sender.name}
                                    </p>
                                )}

                                {/* Message Content / File */}
                                <div className="mb-1">
                                    {m.fileUrl ? (
                                        m.fileType === 'image' ? (
                                            <div className="group relative">
                                                <img src={m.fileUrl} alt="attachment" className="max-w-[250px] max-h-[300px] rounded object-cover" />
                                                <a href={m.fileUrl} download className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition">
                                                    <i className="fas fa-download"></i>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-black/5 rounded-lg border border-black/10">
                                                <div className="bg-red-500 text-white p-2 rounded">
                                                    <i className="fas fa-file-pdf"></i>
                                                </div>
                                                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium truncate max-w-[150px]">
                                                    {m.content || "Download File"}
                                                </a>
                                                <span className="text-xs text-gray-500 font-mono">PDF</span>
                                            </div>
                                        )
                                    ) : (
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                            {m.content}
                                        </p>
                                    )}
                                </div>

                                {/* Timestamp & Status */}
                                <div className="flex justify-end items-center gap-1 mt-1 -mb-1 opacity-70">
                                    <span className="text-[10px] text-gray-500">
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isOwnMessage && (
                                        <i className="fas fa-check-double text-[10px] text-blue-500"></i>
                                    )}
                                </div>

                                {/* Delete Button on Hover */}
                                {isOwnMessage && (
                                    <button
                                        onClick={() => handleDelete(m._id)}
                                        className="absolute -left-8 top-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Delete Message"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default ScrollableChat;
