import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer"; // Will create
import MyChats from "../components/MyChats"; // Will create
import ChatBox from "../components/ChatBox"; // Will create
import { useState } from "react";

const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <div className="flex justify-between w-full h-[91.5vh] p-4">
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && (
                    <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                )}
            </div>
        </div>
    );
};

export default ChatPage;
