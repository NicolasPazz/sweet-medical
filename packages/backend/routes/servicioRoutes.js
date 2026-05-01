import express from "express";
import { ServicioController } from "../controllers/ServicioController.js";

const servicioController = new ServicioController();

const router = express.Router();

router.route("/").post((req, res) => servicioController.agregar(req, res));

router
  .route("/:id")
  .patch((req, res) => servicioController.modificar(req, res))
  .delete((req, res) => servicioController.eliminar(req, res));
