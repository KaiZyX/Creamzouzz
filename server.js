const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static('public'));

const dbConfig = {
    host: 'localhost',
    user: 'root',
    database: 'icecream_db',
    password: 'louka',
    debug: false
};

app.listen(process.env.WEB_PORT, '0.0.0.0', () => {
    console.log("Écoute sur le port " + process.env.WEB_PORT);
});



// Test pour savoir s'il existe un utilisateur 
app.get('/', async (request, response) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM user');
        await conn.end();

        let clientIp = request.ip;
        
        response.render('index', { ip: clientIp, users: rows });
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

app.get('/checkout', function(req, res) {
    res.render('checkout'); 
});