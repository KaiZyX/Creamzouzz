
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

const { updateUserSQL } = require('../models/databaseOperations');


async function modifyUser(req, res) {
    const { user_name, user_email, user_address } = req.body;
    const userId = req.session.userId; // Récupère l'ID de l'utilisateur depuis la session

    try {
        await updateUserSQL(userId, [user_name, user_email, user_address]);
        res.send(`<script>alert('Information modified successfully !'); window.location.href = '/myAccount';</script>`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user information');
    }
}

// Export the modifyUser function
module.exports = { modifyUser };