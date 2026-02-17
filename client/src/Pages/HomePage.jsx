import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));

        if (user) navigate("/chats");
    }, [navigate]);

    return (
        <div className="max-w-xl mx-auto">
            <div className="flex justify-center p-3 bg-white w-full m-40px-0-15px-0 rounded-lg border-width-1px">
                <h1 className="text-4xl font-work-sans color-black">Talk-A-Tive</h1>
            </div>
            <div className="bg-white w-full p-4 rounded-lg border-width-1px">
                {/* Simple Tabs Implementation using State or Headless UI if needed. For now, simple state toggling */}
                <AuthTabs />
            </div>
        </div>
    );
}

function AuthTabs() {
    const [activeTab, setActiveTab] = React.useState('login');

    return (
        <div>
            <div className="flex mb-4">
                <button
                    className={`flex-1 py-2 ${activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('login')}
                >
                    Login
                </button>
                <button
                    className={`flex-1 py-2 ${activeTab === 'signup' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('signup')}
                >
                    Sign Up
                </button>
            </div>
            <div>
                {activeTab === 'login' ? <Login /> : <Signup />}
            </div>
        </div>
    );
}

export default HomePage;
