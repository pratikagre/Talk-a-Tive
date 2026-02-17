import { useState } from "react";
import axios from "../../config/axios";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import { FaEye } from "react-icons/fa";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameloading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const { selectedChat, setSelectedChat, user } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${query}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            alert("Failed to Load the Search Results");
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameloading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/rename`,
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameloading(false);
        } catch (error) {
            alert("Error Occured! Failed to Rename");
            setRenameloading(false);
        }
        setGroupChatName("");
    };

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            alert("User Already in group!");
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            alert("Only admins can add someone!");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/groupadd`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            alert("Error Occured! Failed to Add User");
            setLoading(false);
        }
    };

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            alert("Only admins can remove someone!");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            alert("Error Occured! Failed to Remove User");
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                <FaEye />
            </button>

            {/* Clean Modal Implementation */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-transform scale-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold font-sans tracking-wide">{selectedChat.chatName}</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex w-full flex-wrap gap-2 pb-2">
                                {selectedChat.users.map((u) => (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        admin={selectedChat.groupAdmin}
                                        handleFunction={() => handleRemove(u)}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    placeholder="Rename Chat"
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent p-3 transition-all outline-none"
                                    value={groupChatName}
                                    onChange={(e) => setGroupChatName(e.target.value)}
                                />
                                <button
                                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                                    onClick={handleRename}
                                    disabled={renameloading}
                                >
                                    {renameloading ? "..." : "Update"}
                                </button>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Add Member</label>
                                <input
                                    placeholder="Search users..."
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full p-3 transition-all outline-none"
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                </div>
                            ) : (
                                <div className="max-h-40 overflow-y-auto custom-scrollbar border border-gray-100 rounded-lg">
                                    {searchResult?.slice(0, 4).map((user) => (
                                        <div key={user._id} className="border-b last:border-0 border-gray-50">
                                            <UserListItem
                                                key={user._id}
                                                user={user}
                                                handleFunction={() => handleAddUser(user)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
                            <button
                                onClick={() => handleRemove(user)}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transform transition active:scale-95 flex items-center gap-2"
                            >
                                <i className="fas fa-sign-out-alt"></i> Leave Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UpdateGroupChatModal;
