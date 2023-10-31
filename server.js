const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static('dirst'));

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

app.get('/', async (request, response) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM user');
        await conn.end();

        let clientIp = request.ip;
        response.send(`Bonjour, cher ${clientIp}. J'ai trouvé ${rows.length} utilisateurs dans la base de données.`);
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur Interne du Serveur');
    }
});
