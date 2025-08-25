import path from 'path';
    // Download endpoint for chunked files
    app.get('/download/:filename', (req, res) => {
        const filePath = path.join(__dirname, '../../uploads', req.params.filename);
        res.download(filePath);
    });
import { Router } from 'express';
import DataController from '../controllers/dataController';
import multer from 'multer';

const router = Router();
const dataController = new DataController();

// Multer disk storage for chunk uploads
const chunkStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Use chunk metadata for unique naming
        const { fileId, chunkIndex } = req.body;
        cb(null, `${fileId}_chunk_${chunkIndex}`);
    }
});
const chunkUpload = multer({ storage: chunkStorage });

// /send supports file upload (multipart/form-data) and JSON
export function setDataRoutes(app: Router) {
        app.post('/send', dataController.sendData.bind(dataController));
        app.post('/receive', dataController.receiveData.bind(dataController));
        // Chunked upload endpoint
        app.post('/upload-chunk', chunkUpload.single('chunk'), dataController.uploadChunk.bind(dataController));
        app.post('/finalize-upload', dataController.finalizeUpload.bind(dataController));
}