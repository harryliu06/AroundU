import express from 'express';
import cors from 'cors';    
import 'dotenv/config'
import { connectToDatabase } from './database/db.js'

import {
    getCurrentUser,
    getUser,
    login,
    signup,
    nearbyUsers,
    updateCurrentUser,
} from './controllers/userController.js';
import {
    acceptFriendRequest,
    addFriend,
    getFriendStatus,
    listFriendRequests,
    listFriends,
    listMessages,
    sendMessage,
} from './controllers/socialController.js';

const app = express();
app.use(express.json());
app.use(cors());
await connectToDatabase();

app.get('/', (req, res) => {
    res.json({ message: 'API is running!'});
});

app.post('/signup', signup);
app.post('/login', login);
app.get('/me', getCurrentUser);
app.patch('/me', updateCurrentUser);
app.get('/users/:id', getUser);
app.get('/nearby-users', nearbyUsers);
app.get('/friends', listFriends);
app.post('/friends/:friendId', addFriend);
app.get('/friends/:friendId/status', getFriendStatus);
app.get('/friend-requests', listFriendRequests);
app.post('/friend-requests/:requestId/accept', acceptFriendRequest);
app.get('/chats/:friendId/messages', listMessages);
app.post('/chats/:friendId/messages', sendMessage);


const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
