
const mysql = require('mysql2/promise');
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
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE User SET user_name = ?, user_email = ?, user_address = ? WHERE user_id = ?',
            [user_name, user_email, user_address, userId]
        );
        await connection.end();

        res.send('User information updated successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user information');
    }
}

// Export the modifyUser function
module.exports = { modifyUser };