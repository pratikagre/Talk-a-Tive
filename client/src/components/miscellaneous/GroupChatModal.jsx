import { useState } from "react";
import axios from "../../config/axios";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

const GroupChatModal = ({ children }) => {
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Simple modal state

    const { user, chats, setChats } = ChatState();

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

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            alert("Please fill all the feilds");
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(
                `/api/chat/group`,
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            setChats([data, ...chats]);
            setIsOpen(false);
            alert("New Group Chat Created!");
        } catch (error) {
            alert("Failed to Create the Chat");
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            alert("User already added");
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    return (
        <>
            <span onClick={() => setIsOpen(true)}>{children}</span>

            {/* Clean Modal Implementation */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-transform scale-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold font-sans tracking-wide">Create Group Chat</h2>
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
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Chat Name</label>
                                <input
                                    placeholder="e.g. Weekend Trip"
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full p-3 transition-all outline-none"
                                    onChange={(e) => setGroupChatName(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Add Members</label>
                                <input
                                    placeholder="Search users..."
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full p-3 transition-all outline-none"
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex w-full flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                                {selectedUsers.map((u) => (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleDelete(u)}
                                    />
                                ))}
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
                                                user={user}
                                                handleFunction={() => handleGroup(user)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
                            <button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transform transition active:scale-95"
                            >
                                Create Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GroupChatModal;
