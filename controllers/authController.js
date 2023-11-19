const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

const login = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const { email, password } = req.body;
        
        console.log('Attempting login with:', email, password);

        const conn = await mysql.createConnection(dbConfig);
        const [users] = await conn.execute('SELECT * FROM user WHERE user_email = ?', [email]);

        console.log('Users found:', users);

        if (users.length > 0) {
            const user = users[0];

            console.log('User from DB:', { ...user, user_password: 'hidden' });

            const match = await bcrypt.compare(password, user.user_password);

            console.log('Password match:', match);

            if (match) {
                // Authentification réussie
                res.json({ success: true, message: 'Authentification réussie' });
            } else {
                // Le mot de passe ne correspond pas
                res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
            }
        } else {
            // Aucun utilisateur trouvé avec cet email
            console.log(`No user found with email: ${email}`);
            res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }
        
        await conn.end();
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
};

module.exports = {
    login
};
