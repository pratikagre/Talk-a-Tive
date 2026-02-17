import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios";
import { getSender } from "../MyChats";
// Placeholder for Drawer, Notification, etc using pure React/Tailwind
// Assuming we use a modal or overlay for search

function SideDrawer() {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const {
        user,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
    } = ChatState();

    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    const handleSearch = async () => {
        if (!search) {
            alert("Please Enter something in search");
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            alert("Error Occured!");
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            setIsSearchOpen(false); // Close drawer
        } catch (error) {
            alert("Error fetching the chat");
            setLoadingChat(false);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center bg-white w-full p-2 border-b-4 border-gray-200">
                <button
                    className="flex items-center px-4"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <i className="fas fa-search"></i>
                    <span className="hidden md:flex px-4">Search User</span>
                </button>
                <span className="text-2xl font-sans">Talk-A-Tive</span>
                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative group">
                        <button className="text-2xl p-1 relative">
                            <i className="fas fa-bell text-gray-600"></i>
                            {notification.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                    {notification.length}
                                </span>
                            )}
                        </button>
                        <div className="absolute right-0 hidden group-hover:block bg-white shadow-md rounded p-2 w-64 z-10 border border-gray-200">
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <div
                                    key={notif._id}
                                    className="cursor-pointer p-2 hover:bg-gray-100 text-sm border-b"
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotification(notification.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.users)}`}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile Menu */}
                    <div className="relative group">
                        <button className="flex items-center gap-2">
                            <img src={user?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt={user?.name} className="w-8 h-8 rounded-full border border-gray-300" />
                            <i className="fas fa-chevron-down text-gray-500"></i>
                        </button>
                        <div className="absolute right-0 hidden group-hover:block bg-white shadow-md rounded p-2 w-32 z-10 border border-gray-200">
                            {/* <button className="w-full text-left p-2 hover:bg-gray-100">My Profile</button> */}
                            <button onClick={logoutHandler} className="w-full text-left p-2 hover:bg-gray-100 text-red-500">Logout</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Drawer Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex">
                    <div className="bg-white w-80 h-full p-4 overflow-y-auto">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl">Search Users</h2>
                            <button onClick={() => setIsSearchOpen(false)}>X</button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                placeholder="Search by name or email"
                                className="border p-2 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button onClick={handleSearch} className="bg-blue-500 text-white p-2">Go</button>
                        </div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            searchResult?.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => accessChat(user._id)}
                                    className="bg-gray-200 cursor-pointer hover:bg-teal-500 hover:text-white p-2 rounded mb-2 flex items-center gap-2 mt-4"
                                >
                                    <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p>{user.name}</p>
                                        <p className="text-xs"><b>Email: </b>{user.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {loadingChat && <div>Loading chat...</div>}
                    </div>
                </div>
            )}
        </>
    );
}

export default SideDrawer;
