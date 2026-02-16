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

            {/* Basic Modal Implementation */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-sans">Create Group Chat</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                X
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <input
                                placeholder="Chat Name"
                                className="border p-2 rounded mb-3"
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <input
                                placeholder="Add Users eg: John, Piyush, Jane"
                                className="border p-2 rounded mb-1"
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                            <div className="flex w-full flex-wrap">
                                {selectedUsers.map((u) => (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleDelete(u)}
                                    />
                                ))}
                            </div>

                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                searchResult
                                    ?.slice(0, 4)
                                    .map((user) => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => handleGroup(user)}
                                        />
                                    ))
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
