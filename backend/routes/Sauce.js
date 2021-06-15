// Les routes ne contiennent que la logique de routing (nous importons la logique métier depuis les fichiers controllers)

const express = require("express"); // Importation du framework Express (permettant de simplifier la configuration d'un serveur avec NodeJS)
const router = express.Router(); // Initialisation du router Express (permettant de faire démarrer le serveur sur Sauce.js)

const sauceCtrl = require("../controllers/sauce"); // Importation du controller "sauce.js"
const auth = require("../middleware/auth"); // Importation du système d'authentification à l'aide des tokens 
const multer = require("../middleware/multer-config"); // Importation de multer, middleware permettant de gérer les fichiers (images) entrants

router.get("/", auth, sauceCtrl.getAllSauces);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.put("/:id", auth, multer, sauceCtrl.putSauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;