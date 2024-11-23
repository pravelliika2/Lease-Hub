const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, username, password } = req.body;

        // Ideally, you should hash the password before storing it
        const newUser = new User({ firstName, lastName, username, password });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

module.exports = router;
