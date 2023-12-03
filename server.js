const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session'); // Importez express-session

dotenv.config(); // Cela charge les variables d'environnement de .env

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static('public'));

// Configurez express-session
app.use(session({
  secret: process.env.SESSION_SECRET, // Utilisez une variable d'environnement pour votre secret
  resave: false,
  saveUninitialized: true, // Ne créez pas de session jusqu'à ce que quelque chose y soit stocké
  cookie: { secure: 'auto' } // Activez 'secure' uniquement en production
}));

// Middleware pour analyser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

// Importez les contrôleurs
const authController = require('./controllers/authController');
const registerController = require('./controllers/registerController');
const CartController = require('./controllers/CartController');
const adminController = require('./controllers/adminController');

// Middleware pour vérifier si l'utilisateur est connecté avant d'ajouter au panier
function ensureLoggedIn(req, res, next) {
    if (req.session.userId) { // Assurez-vous que c'est la même casse que dans le contrôleur de connexion
      next();
    } else {
      res.redirect('/login');
    }
  }

app.listen(process.env.WEB_PORT, '0.0.0.0', () => {
    console.log("Écoute sur le port " + process.env.WEB_PORT);
});

app.get('/', async (request, response) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [icecreams] = await conn.execute('SELECT * FROM IceCream');
        const [toppings] = await conn.execute('SELECT * FROM Topping');
        await conn.end();

        response.render('index', { 
            icecreams: icecreams,
            toppings: toppings,
            user: request.session.userID // Ajoutez l'ID utilisateur à l'objet pour la vue, si connecté
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur Interne du Serveur');
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

app.get('/login', function(req, res) {
    res.render('login'); 
});

app.get('/register', function(req, res) {
    res.render('register'); 
});

app.get('/checkout', ensureLoggedIn, function(req, res) {
    // Utilisez ensureLoggedIn pour protéger cette route
    res.render('checkout'); 
});
app.get('/admin', function(req, res) {
    res.render('admin'); 
});

app.post('/login', authController.login);
app.post('/register', registerController.register);

// Utilisez ensureLoggedIn comme middleware pour ces routes
app.post('/cart/add', ensureLoggedIn, (req, res) => {
    CartController.addToCart(req, res);
});

app.post('/cart/remove', ensureLoggedIn, (req, res) => {
    CartController.removeFromCart(req, res);
});

app.post('/cart/checkout', ensureLoggedIn, (req, res) => {
    CartController.checkout(req, res);
});

// Autres routes et middleware...
app.use((req, res, next) => {
    console.log("Session:", req.session);
    next();
});

// N'oubliez pas de définir SESSION_SECRET et JWT_SECRET dans votre fichier .env

app.post('/addIcecream', adminController.addIcecream);
app.post('/addTopping', adminController.addTopping);
app.post('/deleteIcecream', adminController.deleteIcecream);
app.post('/deleteTopping', adminController.deleteTopping);
app.post('/modifyIcecream/:icecreamId', adminController.modifyIcecream);
app.post('/modifyTopping/:toppingId', adminController.modifyTopping);
