# Real-Time Chat & Video Calling App

A full-stack web application featuring real-time messaging, group chats, video calling, and file sharing.

## Features

- **Authentication:** Secure Login & Signup with JWT.
- **Real-time Chat:** Instant messaging using Socket.io.
- **Group Chats:** Create, manage, and update group conversations.
- **Video Calling:** 1-on-1 video calls using WebRTC (Simple Peer).
- **File Uploads:** Share images and files in chats.
- **Advanced Features:**
  - Message Deletion
  - Message Search
  - Push Notifications (In-App & Browser)
  - Typing Indicators

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Chakra UI (Logic adapted to Tailwind), Socket.io Client, Simple Peer.
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io, Multer.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project folder.

2.  **Backend Setup:**
    ```bash
    cd server
    npm install
    ```
    - Create a `.env` file in `server/` with the following:
      ```env
      PORT=5000
      MONGO_URI=your_mongodb_connection_string
      JWT_SECRET=your_jwt_secret
      CLIENT_URL=http://localhost:5173
      ```
    - Start the server:
      ```bash
      npm run dev
      ```

3.  **Frontend Setup:**
    ```bash
    cd client
    npm install
    ```
    - Start the client:
      ```bash
      npm run dev
      ```

4.  **Access the App:**
    - Open your browser and go to `http://localhost:5173`.

## Usage
- Register a new account.
- Search for users to start a chat.
- Create a group chat via "New Group Chat".
- Click the video icon in a chat to start a video call.
- Use the paperclip icon to upload files.
- Hover over your messages to delete them.

## Troubleshooting
- **Video Call Issues:** Ensure `simple-peer` is installed (`npm install simple-peer` in client).
- **File Uploads:** Ensure `server/uploads` directory exists (auto-created).
