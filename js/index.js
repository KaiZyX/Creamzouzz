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



