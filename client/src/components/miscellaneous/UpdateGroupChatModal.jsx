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

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-sans">{selectedChat.chatName}</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                X
                            </button>
                        </div>

                        <div className="flex w-full flex-wrap pb-3">
                            {selectedChat.users.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    admin={selectedChat.groupAdmin}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2 mb-3">
                            <input
                                placeholder="Chat Name"
                                className="border p-2 rounded w-full"
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <button
                                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                                onClick={handleRename}
                                disabled={renameloading}
                            >
                                Update
                            </button>
                        </div>

                        <input
                            placeholder="Add User to group"
                            className="border p-2 rounded w-full mb-1"
                            onChange={(e) => handleSearch(e.target.value)}
                        />

                        {loading ? (
                            <div className="text-center">Loading...</div>
                        ) : (
                            searchResult?.slice(0, 4).map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleAddUser(user)}
                                />
                            ))
                        )}

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handleRemove(user)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Leave Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UpdateGroupChatModal;
