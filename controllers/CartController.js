// CartController.js
const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};


const { updateStockForCartSQL,updateStockForCartRemovalSQL, createOrderSQL, getOrderDetailsSQL } = require('../models/databaseOperations');


exports.addToCart = async (req, res) => {
    const { icecreamId, toppingId, quantity } = req.body;
    try {
        const result = await updateStockForCartSQL(icecreamId, toppingId, quantity);
        res.json(result);
    } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur interne' });
    }
};

exports.removeFromCart = async (req, res) => {
    const { icecreamId, toppingId, quantity } = req.body;
    try {
        const result = await updateStockForCartRemovalSQL(icecreamId, toppingId, quantity);
        res.json(result);
    } catch (error) {
        console.error('Erreur lors du retrait du panier:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur interne' });
    }
};

exports.checkout = async (req, res) => {
    try {
        const { userId, cartItems } = req.body;
        const totalPrice = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);

        const orderId = await createOrderSQL(userId, totalPrice, cartItems);
        const orderDetails = await getOrderDetailsSQL(orderId);

        const cartItemsWithNamesAndFloatPrice = orderDetails.map(item => ({
            ...item,
            name: item.product_name,
            price: parseFloat(item.price)
        }));

        req.session.cartItems = cartItemsWithNamesAndFloatPrice;
        req.session.totalPrice = totalPrice;

        res.json({ success: true, message: "Checkout successful", redirect: '/checkout' });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};