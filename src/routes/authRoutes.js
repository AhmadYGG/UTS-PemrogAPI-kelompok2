const router = require('express').Router();
const ctrl = require('../controllers/authController');
const batasiPercobaan = require('../middlewares/batasiPercobaan');
const { validateDaftar, validateMasuk } = require('../middlewares/validatePengguna');

router.post('/daftar', validateDaftar, batasiPercobaan, ctrl.daftar);
router.post('/masuk', validateMasuk, batasiPercobaan, ctrl.masuk);
router.post('/keluar', ctrl.keluar);
router.get('/saya', ctrl.saya);

module.exports = router;
