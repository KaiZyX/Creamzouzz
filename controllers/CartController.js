// CartController.js
const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
};

exports.addToCart = async (req, res) => {
    try {
        console.log("Add to cart request received with body:", req.body);

        // Destructurer le corps de la requête pour extraire les informations nécessaires
        const { icecreamId, toppingId, quantity } = req.body;

        // Vérifier que les informations nécessaires sont présentes et valides
        if (!icecreamId || !toppingId || !quantity) {
            return res.status(400).json({ success: false, message: 'Missing item details for adding to cart' });
        }

        // Convertir la quantité en nombre et vérifier si c'est un nombre positif
        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid quantity' });
        }

        // Initialiser le panier dans la session s'il n'existe pas
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Rechercher si l'article est déjà dans le panier de la session
        let cartItem = req.session.cart.find(item => item.icecreamId === icecreamId && item.toppingId === toppingId);

        // Si l'article est déjà dans le panier, augmenter la quantité
        if (cartItem) {
            cartItem.quantity += parsedQuantity;
        } else {
            // Sinon, ajouter le nouvel article au panier avec la quantité spécifiée
            req.session.cart.push({ icecreamId, toppingId, quantity: parsedQuantity });
        }

        // Répondre avec succès et retourner le panier mis à jour
        return res.json({ success: true, message: 'Item added to cart', cart: req.session.cart });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
    
    
exports.removeFromCart = async (req, res) => {
    console.log("Remove from cart request received with body:", req.body);
    const { userId, icecreamId, toppingId, quantity } = req.body;
    // Même logique que pour addToCart, mais en soustrayant ou supprimant l'article du panier.

    try {
        const conn = await mysql.createConnection(dbConfig);
        // Mettre à jour ou supprimer l'article du panier
        await conn.execute(
            `UPDATE cart SET quantity = quantity - ? WHERE user_id = ? AND icecream_id = ? AND topping_id = ? AND quantity >= ?`,
            [quantity, userId, icecreamId, toppingId, quantity]
        );
        await conn.execute(
            `DELETE FROM cart WHERE quantity <= 0`
        );
        await conn.end();
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.checkout = async (req, res) => {
    console.log("Checkout request received with body:", req.body);
    let { userId, cartItems } = req.body;

    console.log("Processing checkout for userId:", userId);

    // Utiliser un userId temporaire si non connecté
    if (!userId) {
        userId = -1; // ou une autre valeur spéciale pour les utilisateurs non connectés
    }

    try {
        const conn = await mysql.createConnection(dbConfig);
        await conn.beginTransaction();

        // Création d'une nouvelle commande avec userId temporaire ou réel
        const [order] = await conn.execute(
            `INSERT INTO orders (user_id, order_date, order_totalprice) VALUES (?, NOW(), ?)`,
            [userId, cartItems.reduce((total, item) => total + item.price * item.quantity, 0)]
        );

        for (const item of cartItems) {
            await conn.execute(
                `INSERT INTO order_details (order_id, product_type, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`,
                [order.insertId, 'icecream', item.icecreamId, item.quantity, item.price]
            );
        }

        await conn.commit();
        await conn.end();
        res.json({ success: true, message: 'Checkout successful' });
    } catch (error) {
        console.error('Checkout error:', error);
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


// N'oubliez pas d'ajouter votre propre logique pour gérer les erreurs et les cas particuliers.
