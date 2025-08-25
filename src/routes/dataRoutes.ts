
import { Router } from 'express';
import DataController from '../controllers/dataController';
import multer from 'multer';
import path from 'path';

const router = Router();
const dataController = new DataController();

// Multer for small files (memory or disk, field 'file')
const smallFileUpload = multer();
// Multer disk storage for chunk uploads (field 'chunk')
const chunkStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const { fileId, chunkIndex } = req.body;
        cb(null, `${fileId}_chunk_${chunkIndex}`);
    }
});
const chunkUpload = multer({ storage: chunkStorage });

// /send supports file upload (multipart/form-data) and JSON
export function setDataRoutes(app: Router) {
    app.post('/send', smallFileUpload.single('file'), dataController.sendData.bind(dataController));
    app.post('/receive', dataController.receiveData.bind(dataController));
    // Chunked upload endpoint
    app.post('/upload-chunk', chunkUpload.single('chunk'), dataController.uploadChunk.bind(dataController));
    app.post('/finalize-upload', dataController.finalizeUpload.bind(dataController));
    // Download endpoint for chunked files
    app.get('/download/:filename', (req: any, res: any) => {
        const filePath = path.join(__dirname, '../../uploads', req.params.filename);
        res.download(filePath);
    });
}