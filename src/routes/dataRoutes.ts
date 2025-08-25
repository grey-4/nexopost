import { Router } from 'express';
import DataController from '../controllers/dataController';

const router = Router();
const dataController = new DataController();

// /send supports file upload (multipart/form-data) and JSON
export function setDataRoutes(app: Router) {
    app.post('/send', dataController.sendData.bind(dataController));
    app.post('/receive', dataController.receiveData.bind(dataController));
}