import express from "express";
import {
  getAllSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getAllTags,
  getDocumentHistory,
  getDocumentVersion,
} from "../controllers/documentationController";

const router = express.Router();

// Rutas para espacios de documentación
router.get("/spaces", getAllSpaces as express.RequestHandler);
router.get("/spaces/:id", getSpaceById as express.RequestHandler);
router.post("/spaces", createSpace as express.RequestHandler);
router.put("/spaces/:id", updateSpace as express.RequestHandler);
router.delete("/spaces/:id", deleteSpace as express.RequestHandler);

// Rutas para documentos
router.get("/documents", getAllDocuments as express.RequestHandler);
router.get("/documents/:id", getDocumentById as express.RequestHandler);
router.post("/documents", createDocument as express.RequestHandler);
router.put("/documents/:id", updateDocument as express.RequestHandler);
router.delete("/documents/:id", deleteDocument as express.RequestHandler);

// Rutas para etiquetas
router.get("/tags", getAllTags as express.RequestHandler);

// Rutas para historial de versiones
router.get("/documents/:id/history", getDocumentHistory as express.RequestHandler);
router.get("/documents/:id/history/:version", getDocumentVersion as express.RequestHandler);

export default router;
