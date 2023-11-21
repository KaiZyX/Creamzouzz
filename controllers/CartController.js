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

        // Assurez-vous que l'un des deux ID est fourni et que la quantité est valide
        if ((!icecreamId && !toppingId) || !quantity) {
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
        res.status(500).json({ success: false, message: 'Internal Server Error', requestBody: req.body });
    }
};
    




exports.removeFromCart = async (req, res) => {
    console.log("Remove from cart request received with body:", req.body);
    const { userId, icecreamId, toppingId, quantity } = req.body;

    // Vérifier si les informations nécessaires sont présentes
    if (!userId || (icecreamId === undefined && toppingId === undefined) || !quantity) {
        return res.status(400).json({ success: false, message: 'Missing necessary details for removing from cart' });
    }

    const icecreamIdVal = (icecreamId === '' || icecreamId === null) ? null : icecreamId;
    const toppingIdVal = (toppingId === '' || toppingId === null) ? null : toppingId;

    try {
        const conn = await mysql.createConnection(dbConfig);

        // Trouver l'article dans le panier
        const [existingItems] = await conn.execute(
            `SELECT quantity FROM cart WHERE user_id = ? AND icecream_id = ? AND topping_id = ?`,
            [userId, icecreamIdVal, toppingIdVal]
        );

        if (existingItems.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        const currentQuantity = existingItems[0].quantity;

        if (currentQuantity > quantity) {
            // Réduire la quantité
            await conn.execute(
                `UPDATE cart SET quantity = quantity - ? WHERE user_id = ? AND (icecream_id = ? OR topping_id = ?)`,
                [quantity, userId, icecreamIdVal, toppingIdVal]
            );
        } else {
            // Supprimer l'article du panier
            await conn.execute(
                `DELETE FROM cart WHERE user_id = ? AND (icecream_id = ? OR topping_id = ?)`,
                [userId, icecreamIdVal, toppingIdVal]
            );
        }
        await conn.end();
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};




exports.checkout = async (req, res) => {
    let conn; // Déclaration de la variable de connexion ici
    console.log("Checkout request received with body:", req.body);
    let { userId, cartItems } = req.body;

    // Utilisez l'ID de l'utilisateur anonyme pour les utilisateurs non connectés
    const effectiveUserId = userId ? userId : 1; // Utilisez 1 pour les commandes temporaires

    try {
        conn = await mysql.createConnection(dbConfig); // Initialisation de la connexion
        await conn.beginTransaction();

        const [orderResult] = await conn.execute(
            `INSERT INTO orders (user_id, order_date, order_totalprice) VALUES (?, NOW(), ?)`,
            [effectiveUserId, cartItems.reduce((total, item) => total + item.price * item.quantity, 0)]
        );

        const orderId = orderResult.insertId;

        // Insérer les détails de la commande
        for (const item of cartItems) {
            await conn.execute(
                `INSERT INTO orderdetails (order_id, product_type, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.icecreamId ? 'icecream' : 'topping', item.icecreamId || item.toppingId, item.quantity, item.price]
            );
        }

        await conn.commit();

        // Stocker temporairement l'orderId dans la session si l'utilisateur n'est pas connecté
        if (!userId) {
            req.session.tempOrderId = orderId;
        }

        res.json({ success: true, message: 'Checkout successful', orderId: orderId });
    } catch (error) {
        console.error('Checkout error:', error);
        if (conn) {
            await conn.rollback(); // Annuler la transaction en cas d'erreur
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        if (conn) {
            try {
                await conn.end(); // Fermer la connexion à la fin
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
};




