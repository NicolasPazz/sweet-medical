import express from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { basicAuthAdmin } from '../middlewares/basicAuth.js';

const adminController = new AdminController();
const router = express.Router();

// Admin: dar de alta un paciente (inactivo)
router
  .route('/paciente')
  .post(basicAuthAdmin, (req, res, next) => adminController.crearPacienteAdmin(req, res, next));

// Admin: dar de alta un médico (inactivo)
router
  .route('/medico')
  .post(basicAuthAdmin, (req, res, next) => adminController.crearMedicoAdmin(req, res, next));

// Admin: dar de alta un usuario con uno o más roles (Paciente y/o Médico)
router
  .route('/usuario')
  .post(basicAuthAdmin, (req, res, next) => adminController.crearUsuarioAdmin(req, res, next));

export default router;
