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
        const targetId = link.getAttribute("href").slice(1); // Récupère l'ID de la section cible
        smoothScroll(targetId); // Appel de la fonction de défilement en douceur
    });
});
