// registerController.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

exports.register = async (req, res) => {
    let conn; 
    try {
        console.log('Received registration data:', req.body);

        const { username, email, address, password } = req.body; 

        const hashedPassword = await bcrypt.hash(password, 10);

        conn = await mysql.createConnection(dbConfig);

        console.log('Attempting to register with:', email, username);

        const [result] = await conn.execute(
            'INSERT INTO User (user_name, user_email, user_address, user_password) VALUES (?, ?, ?, ?)', 
            [username, email, address, hashedPassword]
        );

        console.log('Insert result:', result);

        if (result.affectedRows) {
            console.log('Registration successful for:', email);
            res.redirect('/checkout');
          } else {
            console.log('Registration failed for:', email);
            res.status(400).json({ success: false, message: 'Inscription échouée' });
          }
          
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    } finally {
        if (conn) {
            try {
                await conn.end();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
};
