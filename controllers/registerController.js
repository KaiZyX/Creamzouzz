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

        // hash le password avant insertion dans la BDD
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creation de nouvelle connection a la bdd
        conn = await mysql.createConnection(dbConfig);

        // Vérifier si l'email existe déjà
        const [emailExists] = await conn.execute('SELECT * FROM User WHERE user_email = ?', [email]);
        if (emailExists.length > 0) {
            console.log(`Email already in use: ${email}`);
            // Utilisez res.render pour renvoyer à la page d'inscription avec un message d'erreur
            return res.render('register', { errorMessage: "This email is already use." });
          }
          

        // Enregistrer la tentative d'enregistrement avec l'adresse électronique et le nom pour le débogage
        console.log('Attempting to register with:', email, username);

        // Exécute la requête d'insertion avec les données fournies
        const [result] = await conn.execute(
            'INSERT INTO User (user_name, user_email, user_address, user_password) VALUES (?, ?, ?, ?)', 
            [username, email, address, hashedPassword]
        );

        // Vérifier si l'insertion a réussi
        console.log('Insert result:', result);


        if (result.affectedRows) {
            console.log('Registration successful for:', email);
            // Enregistrer l'utilisateur en définissant les détails de la session
            req.session.userId = result.insertId; // En supposant que le résultat ait un insertId
            req.session.userName = username;
            // Rediriger l'utilisateur vers la page de paiement

            res.redirect('/login');
        } else {
            console.log('Registration failed for:', email);
            res.status(400).json({ success: false, message: 'Inscription échouée' });
        }

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur', error: error.message });
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

