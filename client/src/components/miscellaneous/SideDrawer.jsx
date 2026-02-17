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
    return (
        <>
            <div className="flex justify-between items-center bg-white w-full px-5 py-3 border-b border-gray-200 shadow-sm transition-all">
                <button
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors tooltip duration-200"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <i className="fas fa-search text-lg"></i>
                    <span className="hidden md:flex font-medium text-sm">Search User</span>
                </button>

                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 font-[Outfit] tracking-tight">
                    Talk-A-Tive
                </h1>

                <div className="flex items-center gap-6">
                    {/* Notification Bell */}
                    <div className="relative group">
                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <i className="fas fa-bell text-xl text-gray-600 group-hover:text-purple-600 transition-colors"></i>
                            {notification.length > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                    {notification.length}
                                </span>
                            )}
                        </button>

                        <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white shadow-xl rounded-xl w-80 z-50 border border-gray-100 overflow-hidden transform origin-top-right transition-all">
                            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                                <span className="text-sm font-semibold text-gray-700">Notifications</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {!notification.length && (
                                    <div className="p-4 text-center text-gray-500 text-sm">No New Messages</div>
                                )}
                                {notification.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className="cursor-pointer p-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-3"
                                        onClick={() => {
                                            setSelectedChat(notif.chat);
                                            setNotification(notification.filter((n) => n !== notif));
                                        }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <div className="text-sm text-gray-700">
                                            {notif.chat.isGroupChat
                                                ? <><span className="font-semibold">{notif.chat.chatName}</span>: New Message</>
                                                : <><span className="font-semibold">{getSender(user, notif.chat.users)}</span> sent a message</>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Profile Menu */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                            <img
                                src={user?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                                alt={user?.name}
                                className="w-9 h-9 rounded-full object-cover shadow-sm"
                            />
                            <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                        </button>
                        <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white shadow-xl rounded-xl w-48 z-50 border border-gray-100 overflow-hidden">
                            {/* <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50">
                                My Profile
                            </button> */}
                            <button
                                onClick={logoutHandler}
                                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                            >
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Drawer Overlay */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSearchOpen(false)}>
                <div
                    className={`bg-white w-full md:w-[400px] h-full shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSearchOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Search Users</h2>
                        <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="p-5 flex-1 overflow-hidden flex flex-col">
                        <div className="flex gap-2 mb-6">
                            <input
                                placeholder="Search by name or email"
                                className="flex-1 bg-gray-100 border-none text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white p-3 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg shadow-md transition-all active:scale-95"
                            >
                                Go
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                </div>
                            ) : searchResult.length > 0 ? (
                                searchResult?.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => accessChat(user._id)}
                                        className="group cursor-pointer bg-white hover:bg-purple-50 p-3 rounded-xl border border-gray-100 hover:border-purple-100 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                                    >
                                        <img src={user.pic} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate"><b>Email: </b>{user.email}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                search && !loading && <div className="text-center text-gray-400 mt-10">No users found</div>
                            )}
                            {loadingChat && (
                                <div className="flex items-center justify-center gap-2 text-purple-600 py-4">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                    <span className="text-sm font-medium">Initializing chat...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SideDrawer;
