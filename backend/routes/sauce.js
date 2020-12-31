const express = require('express');
const router = express.Router();


const sauceCtrl = require('../controllers/sauce');
const auth = require('../middlewear/auth');
const multer = require('../middlewear/multer-config');


router.get('/', auth, sauceCtrl.getSauces);
router.get('/:id',auth, sauceCtrl.getOneSauce);
router.post('/', multer, sauceCtrl.createSauce);
router.put('/:id', multer, sauceCtrl.modifySauce);
router.delete('/:id',auth,sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.sauceLiked);

module.exports = router;