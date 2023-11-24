// registerController.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

// La fonction d'inscription exportée
exports.register = async (req, res) => {
    let conn; // Déclarez conn en dehors pour qu'elle soit accessible dans finally
    try {
        // Log des données reçues
        console.log('Received registration data:', req.body);

        const { username, email, address, password } = req.body;

        // Hash the password before inserting into database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new database connection
        conn = await mysql.createConnection(dbConfig);

        // Vérifier si l'email existe déjà
        const [emailExists] = await conn.execute('SELECT * FROM User WHERE user_email = ?', [email]);
        if (emailExists.length > 0) {
            console.log(`Email already in use: ${email}`);
            // Utilisez res.render pour renvoyer à la page d'inscription avec un message d'erreur
            return res.render('register', { errorMessage: "This email is already use." });
          }
          

        // Log the attempt to register with email and name for debugging
        console.log('Attempting to register with:', email, username);

        // Execute the insertion query with the provided data
        const [result] = await conn.execute(
            'INSERT INTO User (user_name, user_email, user_address, user_password) VALUES (?, ?, ?, ?)', 
            [username, email, address, hashedPassword]
        );

        // Check if the insert was successful
        console.log('Insert result:', result);

        // ... (previous code remains unchanged)

        if (result.affectedRows) {
            console.log('Registration successful for:', email);
            // Log the user in by setting session details
            req.session.userId = result.insertId; // Assuming the result has an insertId
            req.session.userName = username;
            // Redirect the user to the checkout page
            res.redirect('/checkout');
        } else {
            console.log('Registration failed for:', email);
            res.status(400).json({ success: false, message: 'Inscription échouée' });
        }

        // ... (rest of the code remains unchanged)

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    } finally {
        // Ensure the database connection is closed
        if (conn) {
            try {
                await conn.end();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
};

