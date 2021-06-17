const bcrypt = require("bcrypt"); // Plugin permettant de crypter les Mots de Passes
const User = require("../models/User"); // Importation du model "User" (schéma mongoose)
const jwt = require("jsonwebtoken"); // Plugin permettant de sécuriser et conserver la connection au niveau de la session avec des tokens uniques
const passwordValidator = require('password-validator'); // Sécurité password
const maskData = require("maskdata"); // Plugin permettant de masquer (a************r) une adresse email

const schema = new passwordValidator();

schema // Critères pour le MDP
    .has().uppercase()                              // Doit contenir des majuscules
    .has().lowercase()                              // Doit contenir des minuscules
    .is().min(6)                                    // Longueur minimale : 6
    .is().max(30)                                   // Longueur maximale : 30
    .has().digits()                                 // Doit contenir des numéros
    .has().not().spaces()                           // Ne doit pas contenir d'espaces

// Début paramètres pour le masquage de l'adresse email
const emailMaskOptions = {
    maskWith: "*",
    unmaskedStartCharactersBeforeAt: 1,
    unmaskedEndCharactersAfterAt: 1,
    maskAtTheRate: false,
};
// Fin paramètres pour le masquage de l'adresse email

// Début de l'inscription de l'utilisateur
exports.signup = (req, res, next) => { // La méthode "exports" nous permet de récupérer uniquement l'exportation du "Signup" lorsqu'on utilisera la méthode "require" depuis un fichier externe
    if (schema.validate(req.body.password)) {
        // Si le schéma correspond, la fonction suivante est exécutée
        bcrypt.hash(req.body.password, 10) // "Salage" (salt, cryptage) du mdp 10 fois (plus cette valeur est élevée, et plus le mdp est sécurisé mais la fonction sera plus lente). Nombre 10 = valeur par défaut. Le cryptage est irréversible : on ne peut pas décrypter le mot de passe mais on peut comparer la forme cryptée à une autre forme cryptée pour voir si elles proviennent de la même chaîne de caractères.
            .then(hash => {
                const user = new User({ // Création de l'utilisateur (email & password)
                    //1   email: req.body.email,
                    email: maskData.maskEmail2(req.body.email, emailMaskOptions), // Masquage de l'adresse email récupérée dans le corps de la requête
                    password: hash
                });
                user.save() // Enregistrement de l'utilisateur dans la BDD grâce à la méthode ".save"
                    .then(() => res.status(201).json({
                        message: 'Utilisateur créé !'
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }));
            })
            .catch(error => res.status(500).json({ // Si le Salage du mdp a échoué, alors on renvoi une erreur ainsi qu'un code HTTP 500 (Internal Server Error)
                error
            }));
    } else {
        // Si le schéma ne correspond pas (maj, min, pas d'espace, 6 caractères min, etc.), alors on renvoi une erreur
        res.status(401).json({
            error: Error.message = "Votre mot de passe doit contenir des majuscules, des minuscules, des numéros, sa longueur doit être comprise entre 6 et 30 caractères et il ne doit pas contenir d'espaces."
        });

    }
};
// Fin de l'inscription de l'utilisateur

// Début de la connection de l'utilisateur
exports.login = (req, res, next) => { // La méthode "exports" nous permet de récupérer uniquement l'exportation du "login" lorsqu'on utilisera la méthode "require" depuis un fichier externe
    //1 User.findOne({ email: req.body.email }) // Utilisation de la méthode "findOne" permet de vérifier si l'email envoyé par l'utilisateur existe bien dans la BDD
    User.findOne({ email: maskData.maskEmail2(req.body.email, emailMaskOptions), }) // Utilisation de la méthode "findOne" permet de vérifier si l'email envoyé par l'utilisateur existe bien dans la BDD + Masquage de l'email récupérée dans le corps de la requête

        .then((user) => {
            if (!user) { // Renvoi du message "error" si l'adresse email n'existe pas
                return res.status(401).json({ error: "Adresse email non trouvée !" });
            }
            bcrypt // Si l'adresse email existe, on utilise la fonction "bcypt" avec la méthode ".compare" pour vérifier si le mdp envoyé par l'utilisateur correspond bien au mdp crypté de la BDD
                .compare(req.body.password, user.password) // Comparaison du mot de passe envoyé par l'utilisateur avec celui crypté dans la BDD
                .then((valid) => {
                    if (!valid) { // (Réception : Boolean (true ou false)) Si le MDP est incorrect, alors on renvoi une erreur (code 401)
                        return res.status(401).json({ error: "Mot de passe incorrect !" }); // Erreur 401 : Erreur de l'utilisateur
                    }
                    res.status(200).json({ // Si le MDP est correct, on renvoi l'ID utilisateur (généré par MongoDB) et le TOKEN (permettant de sécuriser et conserver l'instance de connection)
                        userId: user._id,
                        token: jwt.sign( // Génération du TOKEN unique (le TOKEN est une chaîne de caractère cryptée). Ce TOKEN généré fonctionnera durant 24h. Les tokens JWT sont encodés (et non cryptés), et peuvent donc être décodés avec la clé secrète.
                            { userId: user._id }, // À l'intérieur du token, nous encodons des données (payloads). Dans cette configuration, nous encodons le userId pour nous assurer que chaque requête est bien correspondante à un compte utilisateur spécifique
                            `${process.env.DB_TOKEN}`, // Clé secrète d'encodage envoyée depuis l'environnement (.env). Cette chaine de caractère est unique et aléatoire
                            { expiresIn: "24h", } // Expiration du token après 24h
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error })); // Erreur 500 : Erreur interne (erreur de connection, etc.) indépendante de l'utilisateur
        })
        .catch((error) => res.status(500).json({ error }));
};
// Fin de la connection de l'utilisateur