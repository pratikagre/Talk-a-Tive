import React, { useState } from "react";
import axios from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import { FaUser, FaLock } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setUser } = ChatState(); // Using context

    const navigate = useNavigate();

    const handleClick = () => setShow(!show);

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            alert("Please Fill all the Fields");
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );

            // Save user to local storage
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data); // Update context
            setLoading(false);
            navigate("/chats");
        } catch (error) {
            alert("Error Occured: " + error.response.data.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col relative">
                <label className="text-gray-200 text-sm font-semibold mb-2 ml-1">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-500" />
                    </div>
                    <input
                        value={email}
                        placeholder="Enter Your Email Address"
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/80 border-none text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-purple-400 focus:bg-white block w-full pl-10 p-3 shadow-inner transition-all duration-300 placeholder-gray-500"
                    />
                </div>
            </div>
            <div className="flex flex-col relative">
                <label className="text-gray-200 text-sm font-semibold mb-2 ml-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-500" />
                    </div>
                    <input
                        value={password}
                        type={show ? "text" : "password"}
                        placeholder="Enter Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/80 border-none text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-purple-400 focus:bg-white block w-full pl-10 p-3 pr-16 shadow-inner transition-all duration-300 placeholder-gray-500"
                    />
                    <button
                        className="absolute right-1 top-1 bottom-1 px-4 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white/50 hover:bg-white/80 rounded-full transition-all"
                        onClick={handleClick}
                    >
                        {show ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
            <button
                onClick={submitHandler}
                disabled={loading}
                className="w-full text-white bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 font-bold rounded-full text-md px-5 py-3.5 text-center shadow-[0_4px_14px_0_rgba(100,50,255,0.39)] transform hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </div>
                ) : "Sign In"}
            </button>
            <button
                className="w-full text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 font-medium rounded-full text-sm px-5 py-2.5 text-center transition-all duration-200"
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}
            >
                Get Guest User Credentials
            </button>
        </div>
    );
};

export default Login;
