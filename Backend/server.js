import express from 'express';
import cors from 'cors';    
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

const users = [{
    id: 1,
    email: 'user@example.com',
    password: await bcrypt.hash('password123', 10)
}];

app.get('/', (req, res) => {
    res.json({ message: 'API is running!'});
});

app.post('/login', async (req, res) => {
    console.log("Login endpoint hit");
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Invalid Email' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid Password' });
    }

    const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });

    res.json({ 
        message: "Login successful",
        token, 
        user: {
            id: user.id,
            email: user.email
        }
    });
});

app.listen(8000, () => {
    console.log('Server running on port 8000');
});