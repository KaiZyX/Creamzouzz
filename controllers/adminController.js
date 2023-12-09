// adminController.js
const mysql = require('mysql2/promise');
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
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO IceCream (icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image) VALUES (?, ?,?,?,?,?,?)',
            [icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image]
        );
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
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO Topping (topping_name, topping_price,topping_calory,topping_stock,topping_description,topping_image) VALUES ( ?,?,?,?,?,?)',
            [topping_name, topping_price,topping_calory,topping_stock,topping_description,topping_image]
        );
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
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM IceCream WHERE icecream_id = ?',
            [icecreamId]
        );
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
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM Topping WHERE topping_id = ?',
            [toppingId]
        );
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
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE IceCream SET icecream_brand = ?, icecream_name = ?, icecream_baseprice = ?, icecream_calory = ?, icecream_stock = ?, icecream_description = ?, icecream_image = ? WHERE icecream_id = ?',
            [icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image, icecreamId]
        );
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
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE Topping SET topping_name = ?, topping_price = ?, topping_calory = ?, topping_stock = ?, topping_description = ?, topping_image = ? WHERE topping_id = ?',
            [topping_name, topping_price, topping_calory, topping_stock, topping_description, topping_image, toppingId]
        );
        await connection.end();

        res.send(`<script>alert('Data modified successfully !'); window.location.href = '/admin';</script>`);
    } catch (error) {
        console.error(error);
        res.status(500).send(`<script>alert('Error when modifying topping data !'); window.location.href = '/admin';</script>`);
    }
}

module.exports = { addIcecream, addTopping, deleteIcecream, deleteTopping, modifyIcecream, modifyTopping };
