<?php
// Informations de connexion à la base de données
$serveur = "localhost";      // Adresse du serveur MySQL (généralement "localhost" en local)
$utilisateur = "louka";   // Nom d'utilisateur MySQL
$mot_de_passe = "louka";    // Mot de passe MySQL
$base_de_donnees = "icecream_db";   // Nom de la base de données

// Connexion à la base de données
$connexion = new mysqli($serveur, $utilisateur, $mot_de_passe, $base_de_donnees);

// Vérifier la connexion
if ($connexion->connect_error) {
    die("Échec de la connexion à la base de données : " . $connexion->connect_error);
}

// Variables d'entrée manuelles (à remplacer par les valeurs réelles)
$username = "AnisDali";
$password = "anis";

// Requête SQL pour vérifier l'utilisateur 
$query = "SELECT * FROM User WHERE user_name = ? AND password = ?";
$stmt = $connexion->prepare($query);
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    // L'utilisateur a été trouvé
    echo "Utilisateur trouvé dans la base de données.";
} else {
    // L'utilisateur n'a pas été trouvé
    echo "Utilisateur non trouvé dans la base de données.";
}

// Fermer la connexion à la base de données
$stmt->close();
$connexion->close();
?>
