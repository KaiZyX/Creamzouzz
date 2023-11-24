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

// Ajoutez des gestionnaires d'événements pour les liens de navigation
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").slice(1);
        smoothScroll(targetId);
        navLinks.forEach(navLink => navLink.classList.remove("active"));
        link.classList.add("active");
    });
});

// Fonction pour détecter la section visible
function detectVisibleSection() {
    const sections = document.querySelectorAll("section");
    let visibleSectionId = null;
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            visibleSectionId = section.getAttribute("id");
        }
    });
    return visibleSectionId;
}

// Fonction pour mettre en surbrillance le lien de la barre de navigation correspondant
function highlightNavLink() {
    const visibleSectionId = detectVisibleSection();
    if (visibleSectionId) {
        navLinks.forEach(link => {
            link.classList[link.getAttribute("href").slice(1) === visibleSectionId ? "add" : "remove"]("active");
        });
    }
}

window.addEventListener("scroll", highlightNavLink);
window.addEventListener("load", highlightNavLink);

let cartItems = [];
let totalPrice = 0.00;
let userId = null; // Devrait être mis à jour lors de la connexion de l'utilisateur

function updateTotalPrice() {
    if (isNaN(totalPrice)) {
        totalPrice = 0.00;
    }
    const totalPriceElement = document.getElementById('total-price');
    totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}


// Ajouter un article au panier
function addItemToCart(icecreamId, toppingId, quantity, price, itemName) {

    console.log("Adding to cart:", { icecreamId, toppingId, quantity, price, itemName });
    // Vérifier si l'article est déjà dans le panier
    const existingItem = cartItems.find(item => item.icecreamId === icecreamId && item.toppingId === toppingId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartItems.push({ icecreamId, toppingId, quantity, price, name: itemName });
    }

    totalPrice += price * quantity;
    updateCartDisplay();
    updateTotalPrice();

    // Envoyer la mise à jour au serveur
    sendCartUpdate('add', icecreamId, toppingId, quantity, price, itemName);
}


// Remove an item from the cart
function removeItemFromCart(icecreamId, toppingId, quantity, price, itemName) {
    console.log("Removing from cart:", { icecreamId, toppingId, quantity, price, itemName });

    // Find the existing item in the cart
    const existingItem = cartItems.find(item => item.icecreamId === icecreamId && item.toppingId === toppingId);
    if (existingItem) {
        // Subtract the quantity
        existingItem.quantity -= quantity;
        if (existingItem.quantity <= 0) {
            // Remove the item from the cart if the quantity falls to zero or below
            cartItems = cartItems.filter(item => item !== existingItem);
        }
        // Update the total price
        totalPrice -= price * quantity;
        // Ensure the total price does not go negative
        if (totalPrice < 0) totalPrice = 0;
        
        // Update the cart display
        updateCartDisplay();
        // Update the total price display
        updateTotalPrice();

        // Send the cart update to the server
        sendCartUpdate('remove', icecreamId, toppingId, quantity, price, itemName);
    } else {
        console.error("Item not found in cart:", itemName);
    }
}


function updateCartDisplay() {
    const cartContent = document.getElementById("cart-content");
    cartContent.innerHTML = "";

    cartItems.forEach(item => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("cart-item");
        cartItemDiv.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <span class="item-quantity">Qty: ${item.quantity}</span>
        `;
        cartContent.appendChild(cartItemDiv);
    });
}


// Envoyer une mise à jour du panier au serveur
function sendCartUpdate(action, icecreamId, toppingId, quantity) {
    fetch(`/cart/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, icecreamId, toppingId, quantity })
    })
    .then(response => response.json())
    .then(data => console.log(`Server response for ${action}:`, data))
    .catch(error => console.error('Error updating cart:', error));
}

// Gestion du paiement
function processCheckout() {
    fetch(`/cart/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, cartItems })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Checkout successful:', data);
            // Gérer la confirmation de la commande ici
        } else {
            console.error('Checkout failed:', data.message);
        }
    })
    .catch(error => console.error('Error during checkout:', error));
}

// Gestionnaires d'événements pour le panier et le paiement
document.getElementById('checkout').addEventListener('click', () => {
    if (!userId) {
        window.location.href = '/login';
    } else {
        processCheckout();
    }
});

const clearCartButton = document.getElementById("clear-cart-button");
clearCartButton.addEventListener("click", () => {
    cartItems = [];
    totalPrice = 0.00;
    updateCartDisplay();
    updateTotalPrice();
});


const openCartButton = document.getElementById("open-cart-button");
const cartModal = document.getElementById("cart-modal");
const closeButton = document.querySelector(".close");

openCartButton.addEventListener("click", () => cartModal.style.display = "block");
closeButton.addEventListener("click", () => cartModal.style.display = "none");

