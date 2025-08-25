import { Request, Response } from 'express';

// In-memory store for demonstration (replace with DB or queue for production)
let sharedData: any = null;

import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

class DataController {
    // Handle chunk upload
    uploadChunk(req: Request, res: Response) {
        const { fileId, chunkIndex, totalChunks, originalname, mimetype } = req.body;
        // File is saved by multer in uploads/ as fileId_chunk_chunkIndex
        // Optionally, store metadata for later assembly
        res.status(200).json({ message: `Chunk ${chunkIndex} uploaded` });
    }

    // Finalize upload: assemble chunks into a single file
    finalizeUpload(req: Request, res: Response) {
        const { fileId, totalChunks, originalname, mimetype } = req.body;
        const writeStream = fs.createWriteStream(path.join(UPLOAD_DIR, `${fileId}_${originalname}`));
        let current = 0;
        function appendNext() {
            if (current >= totalChunks) {
                writeStream.end();
                // Save reference for download
                sharedData = {
                    type: 'file',
                    originalname,
                    mimetype,
                    fileId,
                    path: path.join(UPLOAD_DIR, `${fileId}_${originalname}`)
                };
                return res.status(200).json({ message: 'File assembled', fileId });
            }
            const chunkPath = path.join(UPLOAD_DIR, `${fileId}_chunk_${current}`);
            const readStream = fs.createReadStream(chunkPath);
            readStream.pipe(writeStream, { end: false });
            readStream.on('end', () => {
                fs.unlinkSync(chunkPath); // Remove chunk after appending
                current++;
                appendNext();
            });
            readStream.on('error', err => {
                writeStream.close();
                return res.status(500).json({ message: 'Error assembling file', error: err.message });
            });
        }
        appendNext();
    }
    // Accepts any data type, including files (multipart/form-data)
    sendData(req: Request, res: Response) {
        // If file upload, use req.file or req.files (needs multer middleware)
        if (req.file) {
            sharedData = {
                type: 'file',
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                buffer: req.file.buffer.toString('base64'), // send as base64
            };
        } else {
            sharedData = {
                type: 'data',
                content: req.body,
            };
        }
        res.status(200).json({ message: 'Data sent successfully', data: sharedData });
    }

    // Returns the last shared data (simulate cross-device fetch)
    receiveData(req: Request, res: Response) {
        if (!sharedData) {
            return res.status(404).json({ message: 'No data available' });
        }
        // If file is chunked, send a download URL instead of base64
        if (sharedData.type === 'file' && sharedData.path) {
            // Provide a download endpoint
            return res.status(200).json({
                message: 'Data received successfully',
                data: {
                    type: 'file',
                    originalname: sharedData.originalname,
                    mimetype: sharedData.mimetype,
                    fileId: sharedData.fileId,
                    downloadUrl: `/download/${sharedData.fileId}_${sharedData.originalname}`
                }
            });
        }
        res.status(200).json({ message: 'Data received successfully', data: sharedData });
        // Optionally clear after fetch for one-time delivery
        // sharedData = null;
    }
}

export default DataController;