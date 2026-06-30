import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { basicAuthAdmin } from '../middlewares/basicAuth.js';

const authController = new AuthController();
const router = express.Router();

// El usuario activa su cuenta con DNI + email + password
router
  .route('/register')
  .post((req, res, next) => authController.register(req, res, next));

// Login
router
  .route('/login')
  .post((req, res, next) => authController.login(req, res, next));

export default router;

