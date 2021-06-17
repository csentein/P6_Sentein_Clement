const jwt = require("jsonwebtoken"); // Importation du plugin "jsnwebtoken" pour le système de token
// require('dotenv').config(); // dotenv permet de copier les variables d'environnement dans un fichier externe .env. Dans notre cas, nous n'avons pas de variable d'environnement (le port utilisé est 4200).

// Début comparaison du token envoyé dans la requête de l'utilisateur avec celui contenu dans la BDD
module.exports = (req, res, next) => {
    if (req.headers != null && req.headers.authorization != null) { // Si req.headers est égal à null, il retournera une erreur grâce à la ligne "req.headers != null" (ligne utile)
        var token = req.headers.authorization.split(" ")[1]; // Récupération du token provenant de la requête
        console.log(req.headers); // Affichage du header de la requête (avec le token visible)

        var decodedToken = jwt.verify(token, `${process.env.DB_TOKEN}`); // Fonction permettant de comparer le token envoyé dans la requête par l'utilisateur et le token stocké dans la BDD correspondant à compte utilisateur (decodedToken est un objet). Variable environnement = variable stockée dans l'environnement (système) du client
        var userId = decodedToken.userId; // Récupération du UserID dans l'objet "decodedToken" (qui est le token au format JSON envoyé par la requête)

        if (userId == null) { // Si userId est null, alors on stop l'exécution du script et on envoie un message d'erreur "UserID invalide" dans la console
            throw "UserID manquant";
        }

        else if (req.body.userId && req.body.userId !== userId) {
            throw "UserID non valable";
        }

        else {
            next();
        }

    } else {
        res.status(401).json({
            error: error | 'Requête non authentifiée !'
        });
    }
};
// Fin comparaison du token envoyé dans la requête de l'utilisateur avec celui contenu dans la BDD
