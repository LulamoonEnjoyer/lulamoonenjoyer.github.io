const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// File storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profileImage') cb(null, 'uploads/profiles');
        if (file.fieldname === 'postImage') cb(null, 'uploads/posts');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Initialize data files if not present
if (!fs.existsSync('data')) fs.mkdirSync('data');
if (!fs.existsSync('data/posts.json')) fs.writeFileSync('data/posts.json', '[]');
if (!fs.existsSync('data/profiles.json')) fs.writeFileSync('data/profiles.json', '[]');

// API Endpoints

// Save a new post
app.post('/api/posts', upload.single('postImage'), (req, res) => {
    const post = {
        username: req.body.username,
        content: req.body.content,
        image: req.file ? `/uploads/posts/${req.file.filename}` : null,
        timestamp: new Date(),
    };
    const posts = JSON.parse(fs.readFileSync('data/posts.json'));
    posts.push(post);
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
    res.json({ success: true, post });
});

// Save or update a profile
app.post('/api/profiles', upload.single('profileImage'), (req, res) => {
    const profile = {
        username: req.body.username,
        bio: req.body.bio,
        image: req.file ? `/uploads/profiles/${req.file.filename}` : null,
    };
    const profiles = JSON.parse(fs.readFileSync('data/profiles.json'));
    const existingIndex = profiles.findIndex(p => p.username === req.body.username);
    if (existingIndex > -1) profiles[existingIndex] = profile;
    else profiles.push(profile);
    fs.writeFileSync('data/profiles.json', JSON.stringify(profiles, null, 2));
    res.json({ success: true, profile });
});

// Get posts for the timeline
app.get('/api/posts', (req, res) => {
    const posts = JSON.parse(fs.readFileSync('data/posts.json'));
    res.json(posts);
});

// Start server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
