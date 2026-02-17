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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity">
                    <div className="bg-gray-900 p-2 rounded-2xl w-full max-w-5xl relative shadow-2xl border border-gray-800">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-10 right-0 md:-right-10 text-white/50 hover:text-white transition-colors p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="rounded-xl overflow-hidden">
                            <VideoCall chatId={chatId} otherUser={otherUser} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoCallModal;
