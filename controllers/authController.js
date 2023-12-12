const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};


const { getUserByEmailSQL } = require('../models/databaseOperations');

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const users = await getUserByEmailSQL(email);

        console.log('Request Body:', req.body);
        
        console.log('Attempting login with:', email, password);

        console.log('Users found:', users);

        if (users.length > 0) {
            const user = users[0];

            console.log('User from DB:', { ...user, user_password: 'hidden' });

            const match = await bcrypt.compare(password, user.user_password);

            console.log('Password match:', match);

            if (match) {
                req.session.userId = user.user_id;
                req.session.userName = user.user_name;
                
        
                req.session.save(err => {
                    if (err) {
                        console.error('Session save error:', err);
                        res.status(500).json({ success: false, message: 'Erreur interne du serveur lors de la sauvegarde de la session.' });
                    } else {
                        res.redirect('/');// redirige vers index
                    }
                });
            } else {
                console.log("Login failed for user:", email);
                res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
            }
        } else {
            console.log(`No user found with email: ${email}`);
            res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
};


module.exports = {
    login
};


