// registerController.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

const { registerUserSQL } = require('../models/databaseOperations');

// La fonction d'inscription exportée
exports.register = async (req, res) => {
    try {
        const { username, email, address, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await registerUserSQL(username, email, address, hashedPassword);

        if (!result.success) {
            return res.render('register', { errorMessage: result.message });
        }

        req.session.userId = result.insertId;
        req.session.userName = username;
        res.redirect('/login');
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur', error: error.message });
    }
};

