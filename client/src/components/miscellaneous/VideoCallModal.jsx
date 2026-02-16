import { useState } from "react";
import VideoCall from "./VideoCall";
import { FaVideo } from "react-icons/fa";

const VideoCallModal = ({ chatId, otherUser }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="bg-gray-200 p-2 rounded hover:bg-gray-300">
                <FaVideo />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="bg-white p-4 rounded-lg w-full max-w-4xl relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                        >
                            X
                        </button>
                        <VideoCall chatId={chatId} otherUser={otherUser} />
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoCallModal;
