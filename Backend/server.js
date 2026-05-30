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
    addFriend,
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
app.get('/chats/:friendId/messages', listMessages);
app.post('/chats/:friendId/messages', sendMessage);


const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
