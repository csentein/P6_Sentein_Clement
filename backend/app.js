const express = require('express'); // Importation du framework Express (permettant de simplifier la configuration d'un serveur avec NodeJS)
const bodyParser = require('body-parser'); // Importation du package BodyParser permettant d'extraire les corps de requête pour avoir accès aux variables des requêtes (req.body) (Extrait Objet -> Format JSON)
const mongoose = require('mongoose'); // Importation du package mongoose permettant la connection à la Base de donnée (mongoDB)
const helmet = require('helmet'); // Importation du package helmet permettant de sécuriser l'App Express en définissant divers-en-têtes HTTP & OWASP

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express(); // Importation du framework Express (permettant de simplifier la configuration d'un serveur avec NodeJS)

app.use((req, res, next) => { // Middleware permettant d'ajouter des entêtes HTTP afin de permettre au client d'accéder au site
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permettre à tous les clients (IP) d'accéder au serveur
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autorisation de tout types de requêtes (verbes HTTP) envoyées vers le serveur
    next();
});

// Début Connection à la Base de donnée MongoDB
mongoose.connect('mongodb+srv://admin:15022001@cluster0.hc0cs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
// Fin Connection à la Base de donnée MongoDB

app.use(helmet());
app.use(bodyParser.json());
app.use('/images', express.static('./images/')); // Permet de mettre à disposition des clients le dossier "images"
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app; // Exportation pour le fichier server.js