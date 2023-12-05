// CartController.js
const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

exports.addToCart = async (req, res) => {
    const { icecreamId, toppingId, quantity } = req.body;
    try {
        const conn = await mysql.createConnection(dbConfig);

        let stockColumn = icecreamId ? 'icecream_stock' : 'topping_stock';
        let table = icecreamId ? 'IceCream' : 'Topping';
        let column = icecreamId ? 'icecream_id' : 'topping_id';
        let itemId = icecreamId || toppingId;

        const [rows] = await conn.execute(`SELECT ${stockColumn} FROM ${table} WHERE ${column} = ?`, [itemId]);
        if (rows.length > 0 && rows[0][stockColumn] >= quantity) {
            await conn.execute(`UPDATE ${table} SET ${stockColumn} = ${stockColumn} - ? WHERE ${column} = ?`, [quantity, itemId]);
            res.json({ success: true, message: 'Article ajouté avec succès.' });
        } else {
            res.json({ success: false, message: 'Stock insuffisant.' });
        }
        await conn.end();
    } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur interne' });
    }
};

exports.removeFromCart = async (req, res) => {
    const { icecreamId, toppingId, quantity } = req.body;
    try {
        const conn = await mysql.createConnection(dbConfig);

        let stockColumn = icecreamId ? 'icecream_stock' : 'topping_stock';
        let table = icecreamId ? 'IceCream' : 'Topping';
        let column = icecreamId ? 'icecream_id' : 'topping_id';
        let itemId = icecreamId || toppingId;

        await conn.execute(`UPDATE ${table} SET ${stockColumn} = ${stockColumn} + ? WHERE ${column} = ?`, [quantity, itemId]);
        res.json({ success: true, message: 'Article retiré avec succès.' });

        await conn.end();
    } catch (error) {
        console.error('Erreur lors du retrait du panier:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur interne' });
    }
};

exports.checkout = async (req, res) => {
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        await conn.beginTransaction();

        const { userId, cartItems } = req.body;
        const totalPrice = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);

        const [orderResult] = await conn.execute(`INSERT INTO orders (user_id, order_date, order_totalprice) VALUES (?, NOW(), ?)`, [userId, totalPrice]);
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await conn.execute(`INSERT INTO orderdetails (order_id, product_type, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`, [orderId, item.icecreamId ? 'icecream' : 'topping', item.icecreamId || item.toppingId, item.quantity, parseFloat(item.price)]);
        }

        await conn.commit();

        const [orderDetails] = await conn.execute(`
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

        // Convertissez le prix de chaque élément de la commande en nombre flottant
        const cartItemsWithNamesAndFloatPrice = orderDetails.map(item => ({
            ...item,
            name: item.product_name,
            price: parseFloat(item.price)
        }));



        req.session.cartItems = cartItemsWithNamesAndFloatPrice;
        req.session.totalPrice = totalPrice;

        // Rediriger vers la page de paiement
        res.json({ success: true, message: "Checkout successful", redirect: '/checkout' });

        return;
        
    } catch (error) {
        console.error('Checkout error:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        if (conn) await conn.end();
    }
};



