import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import { setDataRoutes } from './routes/dataRoutes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for all origins (for cross-platform/browser/mobile access)
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer middleware for file uploads (attach to req.file/req.files)
const upload = multer();
app.use(upload.single('file'));

setDataRoutes(app);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});