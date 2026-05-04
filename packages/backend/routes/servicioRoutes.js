import express from "express";
import { ServicioController } from "../controllers/ServicioController.js";

const servicioController = new ServicioController();

const servicioRouter = express.Router();

servicioRouter.route("/").post((req, res) => servicioController.agregar(req, res));

servicioRouter
  .route("/:id")
  .patch((req, res) => servicioController.modificar(req, res))
  .delete((req, res) => servicioController.eliminar(req, res));

export default servicioRouter;