
const mysql = require('mysql2/promise');
const fs = require('fs').promises; // Ajout de cette ligne pour utiliser le module fs
const path = require('path');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

async function modifyUser(req, res) {
    const { user_name, user_email, user_address } = req.body;
    const userId = req.session.userId; // Récupère l'ID de l'utilisateur depuis la session

    try {
        const query = await fs.readFile(path.join(__dirname, '../models/updateUser.sql'), 'utf-8');
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(query, [user_name, user_email, user_address, userId]);
        await connection.end();

        res.send(`<script>alert('Information modified successfully !'); window.location.href = '/myAccount';</script>`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user information');
    }
}

// Export the modifyUser function
module.exports = { modifyUser };