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
        // Vous devrez vérifier le statut de la réponse ici
        if (!response.ok) {
            throw new Error(`Erreur: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Si l'authentification est réussie, rediriger vers la page de checkout
        if (data.success) {
            window.location.href = '/checkout';
        } else {
            // Afficher un message d'erreur si les identifiants sont incorrects
            alert('Échec de l\'authentification : ' + data.message);
        }
    })
    .catch(error => {
        // Gérer les erreurs de réseau ou de communication avec le serveur ici
        console.error('Il y a eu un problème avec l\'opération fetch: ' + error.message);
    });
});
