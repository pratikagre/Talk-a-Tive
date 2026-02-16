import React from "react";

const UserListItem = ({ user, handleFunction }) => {
    return (
        <div
            onClick={handleFunction}
            className="cursor-pointer bg-gray-200 hover:bg-teal-500 hover:text-white w-full flex items-center text-black px-3 py-2 mb-2 rounded-lg"
        >
            <img
                className="w-8 h-8 rounded-full mr-2"
                src={user.pic}
                alt={user.name}
            />
            <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs">
                    <b>Email : </b>
                    {user.email}
                </p>
            </div>
        </div>
    );
};

export default UserListItem;
