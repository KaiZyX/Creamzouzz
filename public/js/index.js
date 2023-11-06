


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
        e.preventDefault(); // Empêche le comportement de lien par défaut
        
        // Récupère l'ID de la section cible
        const targetId = link.getAttribute("href").slice(1);
        
        // Appel de la fonction de défilement en douceur
        smoothScroll(targetId);
        
        // Ajoute une classe "active" au lien actuellement cliqué
        navLinks.forEach(navLink => {
            navLink.classList.remove("active");
        });
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
            if (link.getAttribute("href").slice(1) === visibleSectionId) {
                link.classList.add("active"); // Ajoute la classe "active" pour mettre en surbrillance
            } else {
                link.classList.remove("active"); // Supprime la classe "active" pour les autres liens
            }
        });
    }
}

// Ajoutez un gestionnaire d'événements pour le défilement de la page
window.addEventListener("scroll", () => {
    highlightNavLink();
});

// Exécutez la fonction au chargement de la page
window.addEventListener("load", () => {
    highlightNavLink();
});

// Créez une structure de données pour le panier
let cartItems = [];

let totalPrice = 0.00;

// Fonction pour mettre à jour le prix total
function updateTotalPrice() {
    
    const totalPriceElement = document.getElementById('total-price');
    totalPriceElement.textContent = `Prix total : $${totalPrice.toFixed(2)}`;
}

// Lorsqu'un article est ajouté au panier
function addItemToCart(itemName, itemPrice, itemType) {
    // Recherchez si l'article est déjà dans le panier
    const existingItem = cartItems.find(item => item.name === itemName && item.type === itemType);

    if (existingItem) {
        // Si l'article existe déjà, augmentez la quantité
        existingItem.quantity++;
    } else {
        // Sinon, ajoutez un nouvel article au panier
        const newItem = {
            name: itemName,
            price: itemPrice,
            type: itemType, // Ajoutez le type de l'article
            quantity: 1
        };
        cartItems.push(newItem);
    }

    // Mettez à jour l'affichage du panier
    updateCartDisplay();
    // Ajoutez le prix de l'article au prix total
    totalPrice += itemPrice;
    
    updateTotalPrice();
}


// Lorsqu'un article est retiré du panier
function removeItemFromCart(itemName, itemPrice) {
    const existingItem = cartItems.find(item => item.name === itemName);
    if (existingItem) {
        // Si l'article existe déjà, diminuez la quantité
        existingItem.quantity--;

        // Vérifiez si la quantité est devenue zéro
        if (existingItem.quantity === 0) {
            // Si c'est le cas, retirez l'article du tableau cartItems
            const itemIndex = cartItems.findIndex(item => item.name === itemName);
            if (itemIndex !== -1) {
                cartItems.splice(itemIndex, 1);
            }
        }

        // Soustrayez le prix de l'article du prix total
        totalPrice -= itemPrice;
        // Mettez à jour l'affichage du prix total
        updateTotalPrice();
        // Mettez à jour l'affichage du panier
        updateCartDisplay();
    }
}





// Fonction pour mettre à jour l'affichage du panier
function updateCartDisplay() {
    const cartContent = document.getElementById("cart-content");
    cartContent.innerHTML = ""; // Effacez le contenu précédent du panier

    // Créez des sections distinctes pour les glaces et les toppings
    const iceCreamSection = document.createElement("div");
    iceCreamSection.classList.add("cart-section", "ice-cream-section");
    iceCreamSection.innerHTML = "<h3>Glace :</h3>"; // Ajoutez le titre "Glace"

    const toppingSection = document.createElement("div");
    toppingSection.classList.add("cart-section", "topping-section");
    toppingSection.innerHTML = "<h3>Toppings :</h3>"; // Ajoutez le titre "Toppings"

    cartItems.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <span class="item-quantity">${item.quantity}</span>
            <span class="item-name">${item.name}</span>
            <span class="item-price">$${(item.price.toFixed(2))*item.quantity}</span>
        `;

        if (item.type === 'glace') {
            iceCreamSection.appendChild(cartItem); // Ajoutez l'article à la section "glace"
        } else if (item.type === 'topping') {
            toppingSection.appendChild(cartItem); // Ajoutez l'article à la section "topping"
        }
    });

    // Ajoutez les sections au panier
    cartContent.appendChild(iceCreamSection);
    cartContent.appendChild(toppingSection);
}
// Écoutez les clics sur les boutons "Acheter"
const buyButtons = document.querySelectorAll(".buy-button");
buyButtons.forEach(button => {
    button.addEventListener("click", () => {
        const itemName = button.getAttribute("data-item-name");
        const itemPrice = parseFloat(button.getAttribute("data-item-price"));
        addToCart(itemName, itemPrice);
    });
});

// Exemple de bouton "Vider le panier"

const clearCartButton = document.getElementById("clear-cart-button");
clearCartButton.addEventListener("click", () => {
    cartItems = []; // Videz le panier
    totalPrice = 0.00; // Réinitialisez le prix total à zéro
    updateCartDisplay(); // Mettez à jour l'affichage du panier
    updateTotalPrice(); // Mettez à jour l'affichage du prix total
});


// Appelez updateCartDisplay pour afficher le panier initial lors du chargement de la page
updateCartDisplay();

const openCartButton = document.getElementById("open-cart-button");
const cartModal = document.getElementById("cart-modal");
const closeButton = document.querySelector(".close");

// Ajoutez un gestionnaire d'événements pour ouvrir la fenêtre modale du panier
openCartButton.addEventListener("click", () => {
    cartModal.style.display = "block"; // Affiche la fenêtre modale
});

// Ajoutez un gestionnaire d'événements pour fermer la fenêtre modale
closeButton.addEventListener("click", () => {
    cartModal.style.display = "none"; // Masque la fenêtre modale
});



document.getElementById('checkout').addEventListener('click', function() {
    window.location.href = '/login';
});
