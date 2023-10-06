// smooth-scroll.js

// Fonction pour le défilement en douceur lors du clic sur un lien de navigation
function smoothScroll(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        window.scrollTo({
            top: target.offsetTop,
            behavior: "smooth"
        });
    }
}

// Fonction pour ajouter un article au panier
function addToCart(productName, price) {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    // Crée un élément de liste pour l'article
    const item = document.createElement('li');
    item.textContent = productName + ' - ' + price + ' €';
    
    // Ajoute l'article à la liste du panier
    cartItems.appendChild(item);

    // Met à jour le total du panier
    const currentTotal = parseFloat(cartTotal.textContent);
    cartTotal.textContent = (currentTotal + price).toFixed(2); // Met en forme le total avec 2 décimales
}

// Gestionnaire d'événement pour les boutons "Ajouter au panier"
const addToCartButtons = document.querySelectorAll('.addToCart');
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const productName = button.getAttribute('data-product');
        const price = parseFloat(button.getAttribute('data-price'));
        addToCart(productName, price);
    });
});

// Gestionnaire d'événement pour le bouton "Valider la commande"
const checkoutButton = document.getElementById('checkout-button');
checkoutButton.addEventListener('click', () => {
    // Ici, vous pouvez implémenter le processus de paiement, par exemple, en redirigeant l'utilisateur vers une page de paiement.
    // Vous devrez également envoyer les détails du panier au serveur pour finaliser la commande.
});


// Ajoutez des gestionnaires d'événements pour les liens de navigation
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault(); // Empêche le comportement de lien par défaut
        const targetId = link.getAttribute("href").slice(1); // Récupère l'ID de la section cible
        smoothScroll(targetId); // Appel de la fonction de défilement en douceur
    });
});
