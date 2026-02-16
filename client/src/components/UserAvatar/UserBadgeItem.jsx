import React from "react";
import { FaTimes } from "react-icons/fa";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
    return (
        <div
            className="px-2 py-1 rounded-lg m-1 mb-2 text-xs bg-purple-500 text-white cursor-pointer flex items-center"
            onClick={handleFunction}
        >
            {user.name}
            {admin === user._id && <span> (Admin)</span>}
            <FaTimes className="ml-1" />
        </div>
    );
};

export default UserBadgeItem;
