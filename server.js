// Importation des modules nécessaires
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const express = require('express');
const session = require('express-session');
const path = require('path'); // Module pour gérer les chemins de fichiers



// Chargement des variables d'environnement de .env
dotenv.config();

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

// Initialisation d'Express et Configuration de Vues
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

// Serveur de fichiers statiques
app.use(express.static('public'));

// Middleware pour analyser les corps de requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

// Middleware pour afficher les informations de session
app.use((req, res, next) => {
    console.log("Session:", req.session);
    next();
});

// Middleware pour vérifier l'authentification de l'utilisateur
function ensureLoggedIn(req, res, next) {
    if (req.session.userId) {
      next();
    } else {
      res.redirect('/login');
    }
}

// Importation des contrôleurs
const authController = require('./controllers/authController');
const registerController = require('./controllers/registerController');
const CartController = require('./controllers/CartController');
const adminController = require('./controllers/adminController');
const accountController = require('./controllers/accountController');


// Route principale /
app.get('/', async (request, response) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        let userRole = null;

        if (request.session.userId) {
            const [rows] = await conn.execute('SELECT user_role FROM User WHERE user_id = ?', [request.session.userId]);
            if (rows.length > 0) {
                userRole = rows[0].user_role;
            }
        }

        const [icecreams] = await conn.execute('SELECT * FROM IceCream');
        const [toppings] = await conn.execute('SELECT * FROM Topping');
        await conn.end();

        response.render('index', { 
            icecreams: icecreams,
            toppings: toppings,
            user: request.session.userId ? { userID: request.session.userId } : null,
            isAdmin: userRole === 'admin' // Pass isAdmin true or false to the view
        });

    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur Interne du Serveur');
    }
});


// Route pour la gestion du compte utilisateur 
app.get('/account', async (req, res) => {
    if (req.session.userId) {
        let conn;
        try {
            conn = await mysql.createConnection(dbConfig);
            console.log(`User ID: ${req.session.userId}`);

            if (rows.length > 0) {
                    console.log(`Client User ID: ${req.session.userId} - Accessing myAccount.ejs`);
                    res.render('/myAccount', { user: req.session.userId }); // Page de compte standard pour les clients
            } else {
                console.log(`No user found with ID: ${req.session.userId} - Redirecting to login`);
                req.session.destroy(() => {
                    res.redirect('/login'); // Si l'utilisateur n'existe pas dans la DB, détruire la session et rediriger vers login
                });
            }
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Erreur interne du serveur');
        } finally {s
            if (conn) {
                await conn.end();
            }
        }
    } else {
        console.log('No user session found - Redirecting to login');
        res.redirect('/login'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    }
});


// Route pour l'administration
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

// Route pour la modification Account 
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


// Route pour la page de paiement 
app.get('/checkout', ensureLoggedIn, (req, res) => {
    res.render('checkout', { cartItems: req.session.cartItems, totalPrice: req.session.totalPrice });
});

// Routes pour la gestion des produits et du panier dans la page Admin
app.post('/addIcecream', adminController.addIcecream);
app.post('/addTopping', adminController.addTopping);
app.post('/deleteIcecream', adminController.deleteIcecream);
app.post('/deleteTopping', adminController.deleteTopping);
app.post('/modifyIcecream/:icecreamId', adminController.modifyIcecream);
app.post('/modifyTopping/:toppingId', adminController.modifyTopping);

// Routes pour l'API du panier
app.post('/api/cart/add', CartController.addToCart);
app.post('/api/cart/remove', CartController.removeFromCart);

// Routes pour l'authentification et l'enregistrement
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.post('/login', authController.login);
app.post('/register', registerController.register);

// Routes pour les modifications du account
app.post('/modifyUser', accountController.modifyUser);

// Route pour le paiement du panier
app.get('/checkout', ensureLoggedIn, (req, res) => res.render('checkout'));
app.post('/cart/checkout', CartController.checkout);

// Démarrage du serveur 
app.listen(process.env.WEB_PORT, '0.0.0.0', () => {
    console.log("Écoute sur le port " + process.env.WEB_PORT);
});



