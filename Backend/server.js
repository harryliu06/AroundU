import express from 'express';
import cors from 'cors';    

import { getUser, login, signup } from './controllers/userController.js';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ message: 'API is running!'});
});

app.post('/signup', signup);
app.post('/login', login);
app.get('/users/:id', getUser);


app.listen(8000, () => {
    console.log('Server running on port 8000');
});
