import express from 'express';
import { 
  createTable, 
  getAllTables, 
  getTableById, 
  updateTable, 
  deleteTable, 
  connectGoogleSheet, 
  syncGoogleSheet, 
  updateTableData 
} from '../controllers/table.controller.js';

const router = express.Router();

// Table CRUD routes
router.post('/', createTable);
router.get('/', getAllTables);
router.get('/:id', getTableById);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);
router.put('/:id/data', updateTableData);

// Google Sheet integration routes
router.post('/:id/connect-google-sheet', connectGoogleSheet);
router.post('/:id/sync-google-sheet', syncGoogleSheet);




export default router;