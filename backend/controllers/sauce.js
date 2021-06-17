// Les controllers contiennent la logique métier

const Sauce = require("../models/Sauce"); // Importation du model "Sauce" (schéma mongoose)
const fs = require("fs"); // Plugin "files systems" permettant de modifier ou supprimer des fichiers contenus dans le serveur (dans le dossier backend)

// Début creation d'une sauce
exports.createSauce = (req, res, next) => { // La méthode "exports" nous permet de récupérer uniquement l'exportation de "createSauce" lorsqu'on utilisera la méthode "require" depuis un fichier externe
    const sauceObject = JSON.parse(req.body.sauce); // Conversion du Body de la requête au format JSON (objet) utilisable
    const sauce = new Sauce({
        ...sauceObject, // L'opérateur "spread (...)" permet, dans ce cas d'utilisation, de faire une copie de la valeur "sauceObject" et de l'attribuer à la constance "sauce"
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Génération de l'URL type : http://localhost/images/nomfichier           
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    // Fin creation d'une sauce

    // Début de l'enregistrement de la sauce dans la BDD à l'aide de la méthode "save"
    sauce
        .save()
        .then(() => res.status(201).json({
            message: "Sauce enregistrée"
        }))
        .catch((error) => res.status(400).json({
            error
        }));
    // Fin de l'enregistrement de la sauce dans la BDD à l'aide de la méthode "save"
};

// Début modification d'une sauce
exports.putSauce = (req, res, next) => { // La méthode "exports" nous permet de récupérer uniquement l'exportation de "putSauce" lorsqu'on utilisera la méthode "require" depuis un fichier externe

    const sauceObject = req.file ? // Si un fichier existe (grâce à l'opérateur ternaire : "?"), alors on copie la sauce générée par l'utilisateur (convertie au format JSON) et on attribue cette valeur à la constance "sauceObject"
        { // Un fichier image a été uploadé ->
            ...JSON.parse(req.body.sauce), // Conversion de la sauce reçue au format Object
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Génération de l'URL type : http://localhost/images/nomfichier
        } : // Aucun fichier image n'a été uploadé ->
        {
            ...req.body // Si aucun fichier n'a été uploadé pour la mise à jour de la sauce, alors on ne copie que le corps de la requête (qui modifiera l'ancienne sauce)
        };

    Sauce.updateOne({ // "updateOne" est une fonction permettant de modifier une ligne de la table "Sauce"
        _id: req.params.id // À l'aide de l'id, identification de la sauce à modifier
    },
        // Modification d'une sauce
        {
            ...sauceObject,
            _id: req.params.id
        })
        .then(() => res.status(200).json({
            message: 'Objet modifié !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
};
// Fin modification d'une sauce

// Début suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ // Recherche de la sauce à supprimer grâce à son ID
        _id: req.params.id
    })
        .then(sauce => {
            const filename = sauce.imageUrl.split("/images/")[1]; // Récupération du nom du fichier (grâce à la méthode "Split", on divise l'URL en 2 et on récupère la deuxième partie de l'URL, soit le nom du fichier)
            fs.unlink(`images/${filename}`, () => { // Suppression du fichier grâce à la fonction "Unlink"
                Sauce.deleteOne({ // Suppression de la ligne de la table "Sauce" de la BDD
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({
                        message: "Sauce supprimée !"
                    }))
                    .catch((error) => res.status(400).json({
                        error
                    }));
            });
        })
        .catch((error) => res.status(500).json({
            error
        }));
};
// Fin suppression d'une sauce

// Début de la récupération d'une sauce spécifique (grâce à son ID)
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ // Ciblage d'une sauce spécifique (grâce à son ID)
        _id: req.params.id
    }) // Une fois que l'on a récupéré une sauce spécifique, alors on réalise les lignes suivantes :
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({
            error
        }));
};
// Fin de la récupération d'une sauce spécifique (grâce à son ID)

// Début de la récupération de toutes les sauces contenues dans la BDD
exports.getAllSauces = (req, res, next) => {
    Sauce.find() // Ciblage de toutes les sauces
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(404).json({
            error
        }));
};
// Fin de la récupération de toutes les sauces contenues dans la BDD

exports.likeSauce = (req, res, next) => {

    // Début du système d'ajout de "likes"
    if (req.body.like === 1) { // Si l'utilisateur a appuyé sur le bouton like ->

        Sauce.updateOne({
            _id: req.params.id // Récupération de la sauce spécifique grâce à son ID
        }, {
            $inc: {
                likes: req.body.like++ // Incrémentation d'un nouveau like grâce à la méthode $inc
            },
            $push: {
                usersLiked: req.body.userId // Ajout de l'userID de l'utilisateur ayant liké la sauce au tableau "userLiked"
            }
        })
            .then(() => res.status(200).json({ message: 'Un like de plus !' }))
            .catch(error => res.status(400).json({ error }));
    }
    // Fin du système d'ajout de "likes"

    // Début du système d'ajout de "dislike"
    else if (req.body.like === -1) { // Si l'utilisateur a appuyé sur le bouton dislike ->
        Sauce.updateOne({
            _id: req.params.id
        }, {
            $inc: {
                dislikes: (req.body.like++) * -1 // Ajout d'1 dislike
            },
            $push:
            {
                usersDisliked: req.body.userId // On pousse l'userId de la personne qui a dislike dans le tableau "usersDisliked"
            }
        })
            .then(() =>
                res.status(200).json({
                    message: 'Un dislike de plus !'
                }))
            .catch(error =>
                res.status(400).json({
                    error
                }));
        // Fin du système d'ajout de "dislike"

    } else { // Si l'utilisateur enlève son like ou dislike ->
        Sauce.findOne({
            _id: req.params.id
        })
            .then(sauce => {
                if (sauce.usersLiked.includes(req.body.userId)) { // Si le tableau "userLiked" contient l'userId de la personne, alors on le supprime et on retire le like
                    Sauce.updateOne({
                        _id: req.params.id
                    }, {

                        $pull: { // Suppression d'un élément du tableau
                            usersLiked: req.body.userId // Suppression de l'userID du tableau "userLiked" de la sauce spécifique
                        }, $inc: {
                            likes: -1 // Soustraction d'un like
                        }
                    })
                        .then((sauce) => {
                            res.status(200).json({
                                message:
                                    'Un like de moins !'
                            })
                        })
                        .catch(error => res.status(400).json({ error }))
                }

                else if (sauce.usersDisliked.includes(req.body.userId)) { // Si le tableau "usersDisliked" contient l'UserId de la personne, alors on le supprime et on retire le dislike

                    Sauce.updateOne({
                        _id: req.params.id
                    }, {
                        $pull: { // Suppression d'un élément du tableau
                            usersDisliked: req.body.userId // Suppression de l'userID du tableau "usersDisliked" de la sauce spécifique
                        }, $inc: {
                            dislikes: -1 // Soustraction d'un dislike
                        }
                    })
                        .then((sauce) => {
                            res.status(200).json({
                                message: 'Un dislike de moins !'
                            })
                        })
                        .catch(error => res.status(400).json({
                            error
                        }))
                }
            })
            .catch(error =>
                res.status(400).json({
                    error
                }));
    }
};