import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";
import { FaPhone, FaPhoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Should come from env

const VideoCall = ({ chatId, otherUser }) => {
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socket = useRef();

    const { user } = ChatState();

    useEffect(() => {
        socket.current = io(ENDPOINT);

        // Request media access immediately or on button click (better UX on button click, but for now init)
        // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        //   setStream(stream);
        //   if (myVideo.current) {
        //     myVideo.current.srcObject = stream;
        //   }
        // });

        socket.current.emit("setup", user);

        socket.current.on("callUser", (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });

        // Cleanup
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    const startCall = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }

            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream,
            });

            peer.on("signal", (data) => {
                socket.current.emit("callUser", {
                    userToCall: otherUser._id,
                    signalData: data,
                    from: user._id,
                    name: user.name,
                });
            });

            peer.on("stream", (stream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
            });

            socket.current.on("callAccepted", (signal) => {
                setCallAccepted(true);
                peer.signal(signal);
            });

            connectionRef.current = peer;
        });
    };

    const answerCall = () => {
        setCallAccepted(true);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }

            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream,
            });

            peer.on("signal", (data) => {
                socket.current.emit("answerCall", { signal: data, to: caller });
            });

            peer.on("stream", (stream) => {
                userVideo.current.srcObject = stream;
            });

            peer.signal(callerSignal);
            connectionRef.current = peer;
        });
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();

        // Stop local stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        window.location.reload(); // Simple reload to reset state for now
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !isVideoEnabled;
            setIsVideoEnabled(!isVideoEnabled);
        }
    }

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !isAudioEnabled;
            setIsAudioEnabled(!isAudioEnabled);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-center gap-4 w-full">
                {stream && (
                    <div className="relative">
                        <video playsInline muted ref={myVideo} autoPlay className="w-64 rounded-lg border-2 border-blue-500" />
                        <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded">You</p>
                    </div>
                )}
                {callAccepted && !callEnded && (
                    <div className="relative">
                        <video playsInline ref={userVideo} autoPlay className="w-64 rounded-lg border-2 border-green-500" />
                        <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded">{name || otherUser.name}</p>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                {!callAccepted && !receivingCall && (
                    <button onClick={startCall} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
                        <FaVideo /> Call
                    </button>
                )}

                {receivingCall && !callAccepted && (
                    <div className="flex flex-col items-center animate-pulse">
                        <p className="text-lg font-semibold">{name} is calling...</p>
                        <button onClick={answerCall} className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded shadow hover:bg-green-600 mt-2">
                            Answer
                        </button>
                    </div>
                )}

                {callAccepted && !callEnded && (
                    <div className="flex gap-4">
                        <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-500 text-white'}`}>
                            {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                        </button>
                        <button onClick={toggleAudio} className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-500 text-white'}`}>
                            {isAudioEnabled ? <FaPhone /> : <FaPhoneSlash />}
                        </button>
                        <button onClick={leaveCall} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600">
                            End Call
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCall;
