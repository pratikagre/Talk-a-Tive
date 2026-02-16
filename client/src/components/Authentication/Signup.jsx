import React, { useState } from "react";
import axios from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [pic, setPic] = useState();
    const [loading, setLoading] = useState(false);
    const { setUser } = ChatState();

    const navigate = useNavigate();

    const handleClick = () => setShow(!show);

    const postDetails = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            alert("Please Select an Image!");
            setLoading(false);
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "your_cloud_name"); // Placeholder
            fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    console.log(data.url.toString());
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        } else {
            alert("Please Select an Image!");
            setLoading(false);
        }
    };

    const submitHandler = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
            alert("Please Fill all the Fields");
            setLoading(false);
            return;
        }
        if (password !== confirmpassword) {
            alert("Passwords Do Not Match");
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
                "/api/user",
                { name, email, password, pic },
                config
            );
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
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
                <label className="font-semibold">Name</label>
                <input
                    placeholder="Enter Your Name"
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>
            <div className="flex flex-col">
                <label className="font-semibold">Email Address</label>
                <input
                    placeholder="Enter Your Email Address"
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>
            <div className="flex flex-col">
                <label className="font-semibold">Password</label>
                <div className="relative">
                    <input
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
            <div className="flex flex-col">
                <label className="font-semibold">Confirm Password</label>
                <div className="relative">
                    <input
                        type={show ? "text" : "password"}
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmpassword(e.target.value)}
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
            <div className="flex flex-col">
                <label className="font-semibold">Profile Picture</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                    className="border p-2 rounded"
                />
            </div>
            <button
                onClick={submitHandler}
                disabled={loading}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
                {loading ? "Loading..." : "Sign Up"}
            </button>
        </div>
    );
};

export default Signup;
