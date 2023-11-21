// Importation des modules nécessaires
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const express = require('express');
const session = require('express-session');

// Configuration des variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

// Serveur de fichiers statiques
app.use(express.static('public'));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET, // Clé secrète pour la session
  resave: false,
  saveUninitialized: true, // Ne crée pas de session jusqu'à ce qu'elle soit modifiée
  cookie: { secure: 'auto' } // Sécurité du cookie
}));

// Middleware pour analyser les corps des requêtes JSON et URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

// Importation des contrôleurs
const authController = require('./controllers/authController');
const registerController = require('./controllers/registerController');
const CartController = require('./controllers/CartController');

// Middleware pour vérifier si l'utilisateur est connecté
function ensureLoggedIn(req, res, next) {
    if (req.session.userId) {
      next();
    } else {
      res.redirect('/login');
    }
}

// Démarrage du serveur
app.listen(process.env.WEB_PORT, '0.0.0.0', () => {
    console.log("Écoute sur le port " + process.env.WEB_PORT);
});

// Route principale
app.get('/', async (request, response) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [icecreams] = await conn.execute('SELECT * FROM IceCream');
        const [toppings] = await conn.execute('SELECT * FROM Topping');
        await conn.end();

        response.render('index', { icecreams, toppings, user: request.session.userID });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur Interne du Serveur');
    }
});

// Routes pour l'authentification
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.post('/login', authController.login);
app.post('/register', registerController.register);

// Routes pour la gestion du panier
app.post('/cart/add', CartController.addToCart);
app.post('/cart/remove', CartController.removeFromCart);
app.get('/checkout', ensureLoggedIn, (req, res) => res.render('checkout'));
app.post('/cart/checkout', CartController.checkout);

// Middleware pour la gestion des sessions
app.use((req, res, next) => {
    console.log("Session:", req.session);
    next();
});
