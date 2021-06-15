const multer = require("multer"); // Plugin permettant de gérer les fichiers entrants dans les requêtes HTTP

const MIME_TYPES = { // Types de fichiers acceptés, en l'occurence : JPG et PNG uniquement
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => { // La fonction "destination" indique à multer d'enregistrer les fichiers dans le dossier "images"
        callback(null, "images");
    },
    filename: (req, file, callback) => { // La fonction "filename" indique à multer d'utiliser le nom d'origine, de remplacer les espaces par des underscores et d'ajouter un timestamp "Date.now()" comme nom de fichier
        const name = file.originalname.split(" ").join("_"); // Utilisation du nom d'origine & remplacement des espaces par des underscores
        const extension = MIME_TYPES[file.mimetype]; // Ajout d'un timestamp "Date.now()" comme nom de fichier (à la fin du nom du fichier, on ajoute le nombre de ms depuis 1970 pour rendre le nom unique)
        callback(null, name + Date.now() + '.' + extension); // Mise en place du nom du fichier (name + Date.now() + '.' + extension)
    }
});

module.exports = multer({ storage }).single('image'); // Exportation de l'élément multer (constante storage) + téléchargement de l'image