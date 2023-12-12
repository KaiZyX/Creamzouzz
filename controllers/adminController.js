// adminController.js
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

async function addIcecream(req, res) {
    const {icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image } = req.body;

    try {
        const insertQuery = await fs.readFile(path.join(__dirname, '../models/addIcecream.sql'), 'utf-8');
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(insertQuery, [icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image]);
        await connection.end();

        // Redirection vers la page actuelle après l'ajout des données
        res.send(`<script>alert('Data added successfully !'); window.location.href = '/admin';</script>`);

    } catch (error) {
        console.error(error);
        res.status(500).send(`<script>alert('Error adding data !'); window.location.href = '/admin';</script>`);
    }
}


async function addTopping(req, res) {
    const {topping_name, topping_price,topping_calory,topping_stock,topping_description,topping_image } = req.body;

    try {
        const insertQuery = await fs.readFile(path.join(__dirname, '../models/addTopping.sql'), 'utf-8');
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(insertQuery, [topping_name, topping_price, topping_calory, topping_stock, topping_description, topping_image]);
        await connection.end();

        res.send(`<script>alert('Data added successfully !'); window.location.href = '/admin';</script>`);
    } catch (error) {
        console.error(error);
        res.status(500).send(`<script>alert('Error adding data !'); window.location.href = '/admin';</script>`);
    }
}

async function deleteIcecream(req, res) {
    const icecreamId = req.body.icecreamId; // Récupère l'ID de la glace à supprimer depuis la requête

    try {
        const deleteConnectorQuery = await fs.readFile(path.join(__dirname, '../models/deleteConnectorByIcecream.sql'), 'utf-8');
        const deleteIcecreamQuery = await fs.readFile(path.join(__dirname, '../models/deleteIcecreamById.sql'), 'utf-8');

        const connection = await mysql.createConnection(dbConfig);
        // Supprimer les entrées de Connector liées à la glace à supprimer
        await connection.execute(deleteConnectorQuery, [icecreamId]);

        // Ensuite, supprimez la glace
        const [result] = await connection.execute(deleteIcecreamQuery, [icecreamId]);
        
        await connection.end();

        res.send('Glace supprimée avec succès !');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de la glace');
    }
}

async function deleteTopping(req, res) {
    const toppingId = req.body.toppingId; // Récupère l'ID du topping à supprimer depuis la requête

    try {
        const deleteConnectorQuery = await fs.readFile(path.join(__dirname, '../models/deleteConnectorByTopping.sql'), 'utf-8');
        const deleteToppingQuery = await fs.readFile(path.join(__dirname, '../models/deleteToppingById.sql'), 'utf-8');

        const connection = await mysql.createConnection(dbConfig);
        // Supprimer les entrées de Connector liées au topping à supprimer
        await connection.execute(deleteConnectorQuery, [toppingId]);

        // Ensuite, supprimez le topping
        const [result] = await connection.execute(deleteToppingQuery, [toppingId]);
        await connection.end();

        res.send('Topping supprimé avec succès !');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression du topping');
    }
}




async function modifyIcecream(req, res) {
    const { icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image } = req.body;
    const icecreamId = req.params.icecreamId; // Récupère l'ID de la glace à modifier depuis la requête

    try {
        const updateQuery = await fs.readFile(path.join(__dirname, '../models/updateIcecreamById.sql'), 'utf-8');
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(updateQuery, [icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image, icecreamId]);
        await connection.end();

        res.send(`<script>alert('Data modified successfully !'); window.location.href = '/admin';</script>`);
    } catch (error) {
        console.error(error);
        res.status(500).send(`<script>alert('Error when modifying icecream data !'); window.location.href = '/admin';</script>`);
    }
}

async function modifyTopping(req, res) {
    const { topping_name, topping_price, topping_calory, topping_stock, topping_description, topping_image } = req.body;
    const toppingId = req.params.toppingId; // Récupère l'ID du topping à modifier depuis la requête

    try {
        const updateQuery = await fs.readFile(path.join(__dirname, '../models/updateToppingById.sql'), 'utf-8');
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(updateQuery, [topping_name, topping_price, topping_calory, topping_stock, topping_description, topping_image, toppingId]);
        await connection.end();

        res.send(`<script>alert('Data modified successfully !'); window.location.href = '/admin';</script>`);
    } catch (error) {
        console.error(error);
        res.status(500).send(`<script>alert('Error when modifying topping data !'); window.location.href = '/admin';</script>`);
    }
}

module.exports = { addIcecream, addTopping, deleteIcecream, deleteTopping, modifyIcecream, modifyTopping };
