document.addEventListener("DOMContentLoaded", function () {
    const paymentForm = document.getElementById("payment-form");
    const popup = document.getElementById("popup");

    paymentForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Empêcher la soumission normale du formulaire

        // Afficher la pop-up
        popup.style.display = "block";

        // Attendre 4 secondes avant de cacher la pop-up et potentiellement soumettre le formulaire ou rediriger
        setTimeout(function () {
            popup.style.display = "none";
            window.location.href = '/';
            
        }, 4000); // 4000 millisecondes = 4 secondes
    });
});
