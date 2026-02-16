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
        <div className="overflow-y-auto h-full"> {/* Placeholder for ScrollableFeed if not installed */}
            {messages &&
                messages.map((m, i) => (
                    <div style={{ display: "flex" }} key={m._id}>
                        {(isSameSender(messages, m, i, user._id) ||
                            isLastMessage(messages, i, user._id)) && (
                                <div
                                    className="w-8 h-8 rounded-full bg-cover bg-center cursor-pointer mr-1 mt-2"
                                    style={{ backgroundImage: `url(${m.sender.pic})` }}
                                    title={m.sender.name}
                                ></div>
                            )}
                        <span
                            style={{
                                backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                                    }`,
                                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                                marginTop: isSameUser(messages, m, i) ? 3 : 10,
                                borderRadius: "20px",
                                padding: "5px 15px",
                                maxWidth: "75%",
                            }}
                        >
                            {m.fileUrl ? (
                                m.fileType === 'image' ? (
                                    <img src={m.fileUrl} alt="attachment" className="max-w-[200px] rounded mb-1" />
                                ) : (
                                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        {m.content || "Download File"}
                                    </a>
                                )
                            ) : (
                                m.content
                            )}
                            {m.sender._id === user._id && (
                                <button
                                    onClick={() => handleDelete(m._id)}
                                    className="ml-2 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Message"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            )}
                        </span>
                    </div>
                ))}
        </div>
    );
};

export default ScrollableChat;
