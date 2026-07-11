import express from 'express';
import { ObraSocialController } from '../controllers/ObraSocialController.js';

const obraSocialController = new ObraSocialController();
const router = express.Router();

router.route('/').get((req, res, next) => obraSocialController.obtenerTodos(req, res, next));

router.route('/:id').get((req, res, next) => obraSocialController.obtenerPorId(req, res, next));

export default router;
