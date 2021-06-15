const mongoose = require('mongoose'); // Le plugin "mongoose" permet, entre autre, de réaliser des schémas de données (tables)
const uniqueValidator = require('mongoose-unique-validator');
/* Le plugin "mongoose-unique-validator" ajoute une validation de pré-sauvegarde pour des champs uniques (required) dans un schéma Mongoose.
Cela facilite la gestion des erreurs, car on obtient une erreur de validation Mongoose, plutôt qu'une erreur E11000 de MongoDB (erreur générale) */

// Table (ou schéma) pour l'email et le mdp
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator, {
    type: 'mongoose-unique-validator'
});

module.exports = mongoose.model('User', userSchema);