import express from 'express';
import { UsuarioController } from '../controllers/UsuarioController.js';
import { basicAuthUser } from '../middlewares/basicAuth.js';

const usuarioRouter = express.Router();
const usuarioController = new UsuarioController();

// GET /usuarios/me — devuelve el usuario autenticado con su perfil
usuarioRouter
  .route('/me')
  .get(basicAuthUser, (req, res, next) => usuarioController.me(req, res, next));

export default usuarioRouter;
