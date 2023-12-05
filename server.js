// Importation des modules nécessaires
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const express = require('express');
const session = require('express-session');
const path = require('path'); // Ajouté du nouveau code

dotenv.config(); // Cela charge les variables d'environnement de .env

// Configuration de la connexion à la base de données (identique dans les deux versions)
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

// Initialisation d'Express et Configuration de Vues (identique dans les deux versions)
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

// Serveur de fichiers statiques (identique dans les deux versions)
app.use(express.static('public'));

// Middleware pour analyser les corps des requêtes JSON et URL-encoded (identique dans les deux versions)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la session (identique dans les deux versions)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

// Middleware pour la gestion des sessions (ajouté du nouveau code)
app.use((req, res, next) => {
    console.log("Session:", req.session);
    next();
});

// Middleware pour vérifier si l'utilisateur est connecté (identique dans les deux versions)
function ensureLoggedIn(req, res, next) {
    if (req.session.userId) {
      next();
    } else {
      res.redirect('/login');
    }
}

// Importation des contrôleurs (identique dans les deux versions)
const authController = require('./controllers/authController');
const registerController = require('./controllers/registerController');
const CartController = require('./controllers/CartController');
const adminController = require('./controllers/adminController');
const { Console } = require('console');


// Route principale `/` avec les modifications du nouveau code
app.get('/', async (request, response) => {
    try {
        console.log("Est-ce que l'utilisateur est connecté?", !!request.session.userId);
        const conn = await mysql.createConnection(dbConfig);
        const [icecreams] = await conn.execute('SELECT * FROM IceCream');
        const [toppings] = await conn.execute('SELECT * FROM Topping');
        await conn.end();

        response.render('index', { 
            icecreams: icecreams,
            toppings: toppings,
            user: request.session.userId ? { userID: request.session.userId } : null
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur Interne du Serveur');
    }
});



// Ajout de la route `/account` 
app.get('/account', async (req, res) => {
    if (req.session.userId) {
        let conn;
        try {
            conn = await mysql.createConnection(dbConfig);
            const [rows] = await conn.execute('SELECT user_role FROM User WHERE user_id = ?', [req.session.userId]);

            console.log(`User ID: ${req.session.userId}, User Role: ${rows.length > 0 ? rows[0].user_role : 'Non trouvé'}`);

            if (rows.length > 0) {
                const userRole = rows[0].user_role;
                if (userRole === 'admin') {
                    console.log(`Admin User ID: ${req.session.userId} - Accessing admin.ejs`);
                    res.redirect('/admin');
                } else {
                    console.log(`Client User ID: ${req.session.userId} - Accessing myAccount.ejs`);
                    res.render('/myAccount', { user: req.session.userId }); // Page de compte standard pour les clients
                }
            } else {
                console.log(`No user found with ID: ${req.session.userId} - Redirecting to login`);
                req.session.destroy(() => {
                    res.redirect('/login'); // Si l'utilisateur n'existe pas dans la DB, détruire la session et rediriger vers login
                });
            }
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Erreur interne du serveur');
        } finally {
            if (conn) {
                await conn.end();
            }
        }
    } else {
        console.log('No user session found - Redirecting to login');
        res.redirect('/login'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    }
});


app.get('/myAccount', async (req, res) => {
    if (req.session.userId) {
        let conn;
        try {
            conn = await mysql.createConnection(dbConfig);
            const [userData] = await conn.execute('SELECT * FROM User WHERE user_id = ?', [req.session.userId]);
            await conn.end();

            if (userData.length > 0) {
                const user = userData[0];
                res.render('myAccount', { userData: user });
            } else {
                res.render('myAccount', { userData: null });
            }
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Erreur interne du serveur');
        }
    } else {
        res.redirect('/login'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    }
});



  

app.get('/admin', async (request, response) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [icecreams] = await conn.execute('SELECT * FROM IceCream');
        const [toppings] = await conn.execute('SELECT * FROM Topping');
        await conn.end();

        response.render('admin', { 
            icecreams: icecreams,
            toppings: toppings,
            user: request.session.userID // Ajoutez l'ID utilisateur à l'objet pour la vue, si connecté
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur Interne du Serveur');
    }
});



app.post('/addIcecream', adminController.addIcecream);
app.post('/addTopping', adminController.addTopping);
app.post('/deleteIcecream', adminController.deleteIcecream);
app.post('/deleteTopping', adminController.deleteTopping);
app.post('/modifyIcecream/:icecreamId', adminController.modifyIcecream);
app.post('/modifyTopping/:toppingId', adminController.modifyTopping);





















// Autres routes d'authentification et de gestion du panier (identique dans les deux versions)
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.post('/login', authController.login);
app.post('/register', registerController.register);
app.post('/cart/add', ensureLoggedIn, CartController.addToCart);
app.post('/cart/remove', ensureLoggedIn, CartController.removeFromCart);
app.get('/checkout', ensureLoggedIn, (req, res) => res.render('checkout'));
app.post('/cart/checkout', CartController.checkout);

// Démarrage du serveur (identique dans les deux versions)
app.listen(process.env.WEB_PORT, '0.0.0.0', () => {
    console.log("Écoute sur le port " + process.env.WEB_PORT);
});

