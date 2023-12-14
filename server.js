// Importation des modules nécessaires
const dotenv = require('dotenv'); // Variable environnement
const mysql = require('mysql2/promise'); // BDD
const express = require('express');// framework web
const session = require('express-session');// gestion session
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

// Serveur des fichiers statiques css/js/image chemin : commence dans le fichier public 
app.use(express.static('public'));

// Middleware pour analyser les corps de requêtes POST
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
        console.log('User is logged in:', req.session.userId);
        next();
    } else {
        console.log('User is not logged in, redirecting to login page.');
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


        // Renvoie une reponse au client avec le contenue de la page index
        response.render('index', { 
            icecreams: icecreams,
            toppings: toppings,
            user: request.session.userId ? { userID: request.session.userId } : null,
            isAdmin: userRole === 'admin' // Si l'utilisateur est admin ou pas 
        });

    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur Interne du Serveur');
    }
});

// Route pour l'administration
app.get('/admin', async (request, response) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [icecreams] = await conn.execute('SELECT * FROM IceCream');
        const [toppings] = await conn.execute('SELECT * FROM Topping');
        await conn.end();

        // Renvoie une reponse au client avec le contenue de la page pour admin
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
        try {
            const conn = await mysql.createConnection(dbConfig);
            const [userData] = await conn.execute('SELECT * FROM User WHERE user_id = ?', [req.session.userId]);
            await conn.end();

            const user = userData[0];
            res.render('myAccount', { userData: user }); // Renvoie une reponse au client avec le contenue de la page avec ses information 
           
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Erreur interne du serveur');
        }
    } else {
        res.redirect('/login'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    }
});

// Routes pour la gestion des produits et du panier dans la page Admin
app.post('/addIcecream', adminController.addIcecream);
app.post('/addTopping', adminController.addTopping);
app.post('/deleteIcecream', adminController.deleteIcecream);
app.post('/deleteTopping', adminController.deleteTopping);
app.post('/modifyIcecream/:icecreamId', adminController.modifyIcecream);
app.post('/modifyTopping/:toppingId', adminController.modifyTopping);

// Route pour récupérer les détails de la glace pour la modification
app.get('/fetchIcecreamDetails/:icecreamId', async (req, res) => {
    const icecreamId = req.params.icecreamId;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [icecreamDetails] = await connection.execute(
            'SELECT * FROM IceCream WHERE icecream_id = ?',
            [icecreamId]
        );
        await connection.end();

        if (icecreamDetails.length > 0) {
            res.json(icecreamDetails[0]); // Renvoie les détails de la glace au format JSON
        } else {
            res.status(404).send('Icecream not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching icecream details');
    }
});

// Route pour récupérer les détails du topping pour la modification
app.get('/fetchToppingDetails/:toppingId', async (req, res) => {
    const toppingId = req.params.toppingId;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [toppingDetails] = await connection.execute(
            'SELECT * FROM Topping WHERE topping_id = ?',
            [toppingId]
        );
        await connection.end();

        if (toppingDetails.length > 0) {
            res.json(toppingDetails[0]); // Renvoie les détails du topping au format JSON
        } else {
            res.status(404).send('Topping not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching topping details');
    }
});

// Routes pour l'API du panier
app.post('/api/cart/add', CartController.addToCart);
app.post('/api/cart/remove', CartController.removeFromCart);

// Routes pour l'authentification et l'enregistrement
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.post('/login', authController.login);
app.post('/register', registerController.register);

// Route pour le paiement du panier
app.post('/cart/checkout', CartController.checkout);

// Route pour la page de paiement 
app.get('/checkout', ensureLoggedIn, (req, res) => {
    res.render('checkout', { cartItems: req.session.cartItems, totalPrice: req.session.totalPrice });
});

// Routes pour les modifications du account
app.post('/modifyUser', accountController.modifyUser);

// Routes pour logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Erreur de déconnexion');
        } else {
            res.redirect('/'); // Redirige vers la page d'accueil après la déconnexion
        }
    });
});

// Démarrage du serveur 
app.listen(process.env.WEB_PORT, '0.0.0.0', () => {
    console.log("Écoute sur le port " + process.env.WEB_PORT);
});



