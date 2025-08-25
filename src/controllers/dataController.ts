import { Request, Response } from 'express';

// In-memory store for demonstration (replace with DB or queue for production)
let sharedData: any = null;

class DataController {
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
        res.status(200).json({ message: 'Data received successfully', data: sharedData });
        // Optionally clear after fetch for one-time delivery
        // sharedData = null;
    }
}

export default DataController;