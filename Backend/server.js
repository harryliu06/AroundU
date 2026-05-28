import express from 'express';
import cors from 'cors';    
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'secret_key';

const users = [{
    id: 1,
    email: 'user@example.com',
    password: await bcrypt.hash('password123', 10), 
    profile: {
        fullName: 'Demo User',
        age: 22,
        schoolOrWork: 'AroundU',
        bio: 'This is a demo account.',
        interests: ['Coffee', 'Music', 'Food']
    }
}];
let nextUserId = 2;

function getPublicUser(user) {
    return {
        id: user.id,
        email: user.email,
        profile: user.profile
    };
}

function createToken(user) {
    return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
}

app.get('/', (req, res) => {
    res.json({ message: 'API is running!'});
});

app.post('/signup', async (req, res) => {
    const { email, password, profile } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    if (users.some((user) => user.email === normalizedEmail)) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    if (!profile?.fullName || !profile?.age || !Array.isArray(profile?.interests)) {
        return res.status(400).json({ message: 'Profile information is required.' });
    }

    const user = {
        id: nextUserId,
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        profile: {
            fullName: String(profile.fullName).trim(),
            age: Number(profile.age),
            schoolOrWork: String(profile.schoolOrWork || '').trim(),
            bio: String(profile.bio || '').trim(),
            interests: profile.interests.map((interest) => String(interest)).filter(Boolean)
        }
    };

    nextUserId += 1;
    users.push(user);

    res.status(201).json({
        message: 'Account created successfully',
        token: createToken(user),
        user: getPublicUser(user)
    });
});

app.post('/login', async (req, res) => {
    console.log("Login endpoint hit");
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
        return res.status(401).json({ message: 'Invalid Email' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid Password' });
    }

    res.json({ 
        message: "Login successful",
        token: createToken(user), 
        user: getPublicUser(user)
    });
});

app.get('/users/:id', (req, res) => {
    const user = users.find((item) => item.id === Number(req.params.id));

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: getPublicUser(user) });
});


app.listen(8000, () => {
    console.log('Server running on port 8000');
});
