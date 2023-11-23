// addController.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

async function addData(req, res) {
    const {icecream_brand, icecream_name, icecream_baseprice,icecream_calory,icecream_stock,icecream_description,icecream_image } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO IceCream (icecream_brand, icecream_name, icecream_baseprice,icecream_calory,icecream_stock,icecream_description,icecream_image) VALUES (?, ?,?,?,?,?,?)',
            [icecream_brand, icecream_name, icecream_baseprice,icecream_calory,icecream_stock,icecream_description,icecream_image]
        );
        await connection.end();

        res.send('Données ajoutées avec succès !');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de l\'ajout des données');
    }
}

module.exports = { addData };
