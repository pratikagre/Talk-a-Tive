import React, { useState } from "react";
import axios from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

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
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <label className="font-semibold">Email Address</label>
                <input
                    value={email}
                    placeholder="Enter Your Email Address"
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>
            <div className="flex flex-col">
                <label className="font-semibold">Password</label>
                <div className="relative">
                    <input
                        value={password}
                        type={show ? "text" : "password"}
                        placeholder="Enter Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <button
                        className="absolute right-2 top-2 text-sm text-gray-600"
                        onClick={handleClick}
                    >
                        {show ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
            <button
                onClick={submitHandler}
                disabled={loading}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
                {loading ? "Loading..." : "Login"}
            </button>
            <button
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
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
