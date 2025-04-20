import express, { Router } from 'express';
import multer from 'multer';
import { uploadUserImage } from '../controllers/uploadController';

const router: Router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/user/:userId/upload', 
  upload.single('image'),
  uploadUserImage as express.RequestHandler
);

export default router;
