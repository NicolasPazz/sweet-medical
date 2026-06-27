import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { basicAuth } from '../middlewares/basicAuth.js';

const authController = new AuthController();
const router = express.Router();

// Admin: dar de alta un paciente (inactivo)
router
  .route('/admin/crear-paciente')
  .post(basicAuth, (req, res, next) => authController.crearPacienteAdmin(req, res, next));

// Admin: dar de alta un médico (inactivo)
router
  .route('/admin/crear-medico')
  .post(basicAuth, (req, res, next) => authController.crearMedicoAdmin(req, res, next));

// El usuario activa su cuenta con DNI + email + password
router
  .route('/register')
  .post((req, res, next) => authController.register(req, res, next));

// Login
router
  .route('/login')
  .post((req, res, next) => authController.login(req, res, next));

export default router;

