const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

// Modifie un utilisateur 
const updateUserSQL = async (userId, userData) => {
    const query = 'UPDATE User SET user_name = ?, user_email = ?, user_address = ? WHERE user_id = ?';
    return executeQuery(query, [...userData, userId]);
};

// Ajouter une glace
const addIcecreamSQL = async (icecreamData) => {
    const query = 'INSERT INTO IceCream (icecream_brand, icecream_name, icecream_baseprice, icecream_calory, icecream_stock, icecream_description, icecream_image) VALUES (?, ?,?,?,?,?,?)';
    return executeQuery(query, icecreamData);
};

// Ajouter un topping
const addToppingSQL = async (toppingData) => {
    const query = 'INSERT INTO Topping (topping_name, topping_price,topping_calory,topping_stock,topping_description,topping_image) VALUES ( ?,?,?,?,?,?)';
    return executeQuery(query, toppingData);
};

// Supprimer une glace
const deleteIcecreamSQL = async (icecreamId) => {
    await executeQuery('DELETE FROM Connector WHERE conn_icecream = ?', [icecreamId]);
    return executeQuery('DELETE FROM IceCream WHERE icecream_id = ?', [icecreamId]);
};

// Supprimer un topping
const deleteToppingSQL = async (toppingId) => {
    await executeQuery('DELETE FROM Connector WHERE conn_topping = ?', [toppingId]);
    return executeQuery('DELETE FROM Topping WHERE topping_id = ?', [toppingId]);
};

// Modifier une glace
const modifyIcecreamSQL = async (icecreamId, icecreamData) => {
    const query = 'UPDATE IceCream SET icecream_brand = ?, icecream_name = ?, icecream_baseprice = ?, icecream_calory = ?, icecream_stock = ?, icecream_description = ?, icecream_image = ? WHERE icecream_id = ?';
    return executeQuery(query, [...icecreamData, icecreamId]);
};

// Modifier un topping
const modifyToppingSQL = async (toppingId, toppingData) => {
    const query = 'UPDATE Topping SET topping_name = ?, topping_price = ?, topping_calory = ?, topping_stock = ?, topping_description = ?, topping_image = ? WHERE topping_id = ?';
    return executeQuery(query, [...toppingData, toppingId]);
};

// Recuperer User grace au mail
const getUserByEmailSQL = async (email) => {
    const query = 'SELECT * FROM user WHERE user_email = ?';
    return executeQuery(query, [email]);
};


// Update les stock des articles quand ajouté au panier 
const updateStockForCartSQL = async (icecreamId, toppingId, quantity) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        let stockColumn = icecreamId ? 'icecream_stock' : 'topping_stock';
        let table = icecreamId ? 'IceCream' : 'Topping';
        let column = icecreamId ? 'icecream_id' : 'topping_id';
        let itemId = icecreamId || toppingId;

        const [rows] = await connection.execute(`SELECT ${stockColumn} FROM ${table} WHERE ${column} = ?`, [itemId]);

        if (rows.length > 0 && rows[0][stockColumn] >= quantity) {
            await connection.execute(`UPDATE ${table} SET ${stockColumn} = ${stockColumn} - ? WHERE ${column} = ?`, [quantity, itemId]);
            return { success: true, message: 'Article ajouté avec succès.' };
        } else {
            return { success: false, message: 'Stock insuffisant.' };
        }
    } finally {
        await connection.end();
    }
};


// Update les stock des articles quand enleve du panier 
const updateStockForCartRemovalSQL = async (icecreamId, toppingId, quantity) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        let stockColumn = icecreamId ? 'icecream_stock' : 'topping_stock';
        let table = icecreamId ? 'IceCream' : 'Topping';
        let column = icecreamId ? 'icecream_id' : 'topping_id';
        let itemId = icecreamId || toppingId;

        await connection.execute(`UPDATE ${table} SET ${stockColumn} = ${stockColumn} + ? WHERE ${column} = ?`, [quantity, itemId]);
        return { success: true, message: 'Article retiré avec succès.' };
    } finally {
        await connection.end();
    }
};


//Création de l'order 
const createOrderSQL = async (userId, totalPrice, cartItems) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.execute(`INSERT INTO orders (user_id, order_date, order_totalprice) VALUES (?, NOW(), ?)`, [userId, totalPrice]);
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await connection.execute(`INSERT INTO orderdetails (order_id, product_type, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`, [orderId, item.icecreamId ? 'icecream' : 'topping', item.icecreamId || item.toppingId, item.quantity, parseFloat(item.price)]);
        }

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
};

// Création de l'order details 
const getOrderDetailsSQL = async (orderId) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [orderDetails] = await connection.execute(`
            SELECT od.detail_id, od.order_id, od.product_type, od.product_id, od.quantity, od.price,
            (CASE 
                WHEN od.product_type = 'icecream' THEN ic.icecream_name
                WHEN od.product_type = 'topping' THEN t.topping_name
            END) AS product_name
            FROM orderdetails od
            LEFT JOIN IceCream ic ON od.product_id = ic.icecream_id AND od.product_type = 'icecream'
            LEFT JOIN Topping t ON od.product_id = t.topping_id AND od.product_type = 'topping'
            WHERE od.order_id = ?
        `, [orderId]);
        return orderDetails;
    } finally {
        await connection.end();
    }
};

// Register un utilisateur 
const registerUserSQL = async (username, email, address, hashedPassword) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // Vérifier si l'email existe déjà
        const [emailExists] = await connection.execute('SELECT * FROM User WHERE user_email = ?', [email]);
        if (emailExists.length > 0) {
            return { success: false, message: "Email already in use" };
        }

        // Insérer l'utilisateur dans la base de données
        const [result] = await connection.execute(
            'INSERT INTO User (user_name, user_email, user_address, user_password) VALUES (?, ?, ?, ?)',
            [username, email, address, hashedPassword]
        );

        return { success: true, insertId: result.insertId };
    } finally {
        await connection.end();
    }
};


// Fonction utilitaire pour exécuter les requêtes
const executeQuery = async (query, params) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(query, params);
        return result;
    } finally {
        await connection.end();
    }
};

module.exports = {
    registerUserSQL,
    createOrderSQL,
    getOrderDetailsSQL,
    updateStockForCartRemovalSQL,
    updateStockForCartSQL,
    updateUserSQL,
    addIcecreamSQL,
    addToppingSQL,
    deleteIcecreamSQL,
    deleteToppingSQL,
    modifyIcecreamSQL,
    modifyToppingSQL,
    getUserByEmailSQL,
};
