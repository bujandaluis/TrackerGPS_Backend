const express = require('express');
const ubicacionController = require('../controllers/ubicacionController');

const router = express.Router();

router.post('/', ubicacionController.crearUbicacion);
router.get('/', ubicacionController.obtenerHistorial);
router.get('/:identificadorDispositivo', ubicacionController.obtenerUbicacion);

module.exports = router;
