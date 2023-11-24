// Écoutez l'événement de soumission du formulaire, pas simplement le clic sur le bouton
document.querySelector('form').addEventListener('submit', function(event) {
    // Empêcher la soumission du formulaire de recharger la page
    event.preventDefault();

    // Obtenir les valeurs des inputs
    const email = document.querySelector('#emailInput').value;
    const password = document.querySelector('#passwordInput').value;

    // Envoyer une requête POST au serveur avec l'email et le mot de passe
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else if (!response.ok) {
            throw new Error(`Erreur: ${response.statusText}`);
        }
    })
    .catch(error => {
        console.error('Il y a eu un problème avec l\'opération fetch: ' + error.message);
    });
    
});
