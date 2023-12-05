

// ====== Initialisation des Variables Globales ======n-cart-button
let cartItems = [];
let totalPrice = 0.00;

// Elements du DOM
const navLinks = document.querySelectorAll(".nav-link");
const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
const checkoutButton = document.getElementById('checkout');


document.getElementById('open-cart-button').addEventListener('click', function(event) {
    event.preventDefault();
    if (!userId) {
        showLoginAlert();
    } else {
        toggleCart();
    }
});

document.getElementById("clear-cart-button").addEventListener("click", () => {
    cartItems = [];
    totalPrice = 0.00;
    updateCartDisplay();
    updateTotalPrice();
});


document.getElementById("cart-close").addEventListener('click', () => {
    toggleCart();
});


document.getElementById('admin-button').addEventListener('click', () => {
    window.location.href = '/admin'; // Redirige vers votre route admin
});



// ====== Fonctions Utilitaires pour la Navigation et l'Affichage ======
function smoothScroll(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        window.scrollTo({
            top: target.offsetTop,
            behavior: "smooth"
        });
    }
}

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

function highlightNavLink() {
    const visibleSectionId = detectVisibleSection();
    if (visibleSectionId) {
        navLinks.forEach(link => {
            link.classList[link.getAttribute("href").slice(1) === visibleSectionId ? "add" : "remove"]("active");
        });
    }
}

// ====== Fonctions de Gestion du Panier ======
function updateTotalPrice() {
    if (isNaN(totalPrice)) {
        totalPrice = 0.00;
    }
    const totalPriceElement = document.getElementById('total-price');
    totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}

function updateCartDisplay() {
    const cartContent = document.getElementById("cart-content");
    cartContent.innerHTML = '';
  
    cartItems.forEach(item => {
      const cartItemDiv = document.createElement("div");
      cartItemDiv.classList.add("cart-item");
      cartItemDiv.innerHTML = `
        <div class="cart-item-details">
          <span class="item-name">${item.name} Qty: ${item.quantity}</span>
        </div>
        <button class="cart-item-remove" onclick="removeItemFromCart(${item.icecreamId}, ${item.toppingId}, 1, ${item.price}, '${item.name}')">&times;</button>
      `;
      cartContent.appendChild(cartItemDiv);
    });
  }

// Fonction pour ajouter un article au panier
function addItemToCart(icecreamId, toppingId, quantity, price, itemName) {
    
    fetch('/api/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ icecreamId, toppingId, quantity, price, itemName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Mettre à jour le panier côté client...
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
            sendCartUpdate('add', icecreamId, toppingId, quantity, price, itemName);                
        } else {
            alert("Erreur de stock: " + data.message);
        }
    })
    .catch(error => console.error('Erreur:', error));
}

// Fonction pour retirer un article du panier
function removeItemFromCart(icecreamId, toppingId, quantity, price, itemName) {
    fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ icecreamId, toppingId, quantity, price, itemName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Mettre à jour le panier côté client...
            const existingItem = cartItems.find(item => item.icecreamId === icecreamId && item.toppingId === toppingId);
            if (existingItem) {
                existingItem.quantity -= quantity;
                if (existingItem.quantity <= 0) {
                    cartItems = cartItems.filter(item => item !== existingItem);
                }
                totalPrice -= price * quantity;
                if (totalPrice < 0) totalPrice = 0;
                updateCartDisplay();
                updateTotalPrice();
                sendCartUpdate('remove', icecreamId, toppingId, quantity, price, itemName);
            } else {
                console.error("Item not found in cart:", itemName);
            }
        } else {
            console.error("Erreur:", data.message);
        }
    })
    .catch(error => console.error('Erreur:', error));
}

function sendCartUpdate(action, icecreamId, toppingId, quantity) {
    const dataToSend = {
        userId: userId, // Assurez-vous que userId est défini quelque part dans votre code
        quantity: quantity,
        icecreamId: icecreamId, // Envoyez null tel quel
        toppingId: toppingId   // Envoyez null tel quel
    };

    console.log(`Sending data to server: ${JSON.stringify(dataToSend)}`);

    fetch(`/cart/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log(`Server response for ${action}:`, data))
    .catch(error => console.error('Error updating cart:', error));
}


function processCheckout() {
    console.log('Attempting to process checkout with items:', cartItems, 'and userId:', userId);

    fetch(`/cart/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, cartItems })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Vérifiez le type de contenu de la réponse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json(); // C'est du JSON
        } else {
            throw new Error('Did not receive JSON');
        }
    })
    .then(data => {
        console.log('Checkout response:', data);
        if (data.success) {
            console.log('Checkout successful:', data);
            window.location.href = '/checkout'; // Redirection
        } else {
            console.error('Checkout failed:', data.message);
        }
    })
    .catch(error => console.error('Error during checkout:', error));
}

















// Assurez-vous que le gestionnaire d'événements est correctement attaché
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        console.log('Checkout button clicked');
        processCheckout();
    });
} else {
    console.error('Checkout button not found');
}




function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    console.log('toggleCart before', cartModal.classList.contains('active')); // Pour le débogage
    cartModal.classList.toggle('active');
    console.log('toggleCart after', cartModal.classList.contains('active')); // Pour le débogage
}


// ====== Écouteurs d'Événements ======
// Navigation et Scroll
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").slice(1);
        smoothScroll(targetId);
        navLinks.forEach(navLink => navLink.classList.remove("active"));
        link.classList.add("active");
    });
});

window.addEventListener("scroll", highlightNavLink);
window.addEventListener("load", highlightNavLink);

// Gestion du Panier
openCartButton.addEventListener('click', function(event) {
    event.preventDefault();
    toggleCart();
});

closeButton.addEventListener('click', toggleCart);

addToCartButtons.forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        if (!userId) {
            showLoginAlert();
        } else {
            const icecreamId = this.getAttribute('data-icecream-id');
            const toppingId = this.getAttribute('data-topping-id');
            const quantity = 1; // ou récupérer la quantité d'un champ de saisie
            const price = parseFloat(this.getAttribute('data-price'));
            const itemName = this.getAttribute('data-item-name');
            addItemToCart(icecreamId, toppingId, quantity, price, itemName);
        }
    });
});



function showLoginAlert() {
    alert("Veuillez vous connecter pour accéder au panier.");
}


document.addEventListener('DOMContentLoaded', function () {
    
    let userId = null; // Ceci sera remplacé par la valeur de la variable globale userId si elle est définie.
    if (window.userId) { // Vérifiez si la variable globale est définie.
        userId = window.userId; // Utilisez la valeur de la variable globale.
    }


});



