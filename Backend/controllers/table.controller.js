import {Table} from '../models/table.model.js';
import { syncSheetWithTable } from '../utils/googleSheetsUtil.js';
import { broadcastTableUpdate } from '../utils/realTimeUtil.js';

// Create a new table
export const createTable = async (req, res) => {
  try {
    const { name, columns } = req.body;
    
    if (!name || !columns || !Array.isArray(columns)) {
      return res.status(400).json({ message: 'Table name and columns are required' });
    }
    
    // Format columns properly
    const formattedColumns = columns.map(col => ({
      name: col.name,
      type: col.type || 'string',
      fromGoogleSheet: false
    }));
    
    const table = new Table({
      name,
      columns: formattedColumns,
      cachedData: [],
      dashboardOnlyData: []
    });
    
    await table.save();
    res.status(201).json({ 
      message: 'Table created successfully', 
      tableId: table._id,
      table 
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ message: 'Failed to create table', error: error.message });
  }
};

// Get all tables
export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({}, 'name columns googleSheetConfig createdAt updatedAt');
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Failed to fetch tables', error: error.message });
  }
};

// Get table by ID
export const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    const mergedData = mergeTableData(table);
    
    res.json({
      table: {
        _id: table._id,
        name: table.name,
        columns: table.columns,
        googleSheetConfig: table.googleSheetConfig,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      },
      data: mergedData
    });
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ message: 'Failed to fetch table', error: error.message });
  }
};

// Update table structure
export const updateTable = async (req, res) => {
  try {
    const { name, columns } = req.body;
    const tableId = req.params.id;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Update name if provided
    if (name) {
      table.name = name;
    }
    
    // Update or add new columns
    if (columns && Array.isArray(columns)) {
      // Keep Google Sheet columns
      const googleSheetColumns = table.columns.filter(col => col.fromGoogleSheet);
      const googleSheetColNames = googleSheetColumns.map(col => col.name);
      
      // Add new dashboard-only columns
      const newColumns = columns.filter(col => !googleSheetColNames.includes(col.name))
        .map(col => ({
          name: col.name,
          type: col.type || 'string',
          fromGoogleSheet: false
        }));
      
      table.columns = [...googleSheetColumns, ...newColumns];
    }
    
    await table.save();
    await broadcastTableUpdate(tableId);
    
    res.json({ message: 'Table updated successfully', table });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ message: 'Failed to update table', error: error.message });
  }
};

// Delete table
export const deleteTable = async (req, res) => {
  try {
    const tableId = req.params.id;
    const result = await Table.findByIdAndDelete(tableId);
    
    if (!result) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ message: 'Failed to delete table', error: error.message });
  }
};

// Connect table to Google Sheet
export const connectGoogleSheet = async (req, res) => {
  try {
    const { sheetId, tabName } = req.body;
    const tableId = req.params.id;
    
    if (!sheetId || !tabName) {
      return res.status(400).json({ message: 'Sheet ID and tab name are required' });
    }
    
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    table.googleSheetConfig = {
      sheetId,
      tabName,
      lastSyncTimestamp: null
    };
    
    await table.save();
    
    // Initial sync with Google Sheet
    await syncSheetWithTable(tableId);
    await broadcastTableUpdate(tableId);
    
    res.json({ message: 'Connected to Google Sheet successfully', table });
  } catch (error) {
    console.error('Error connecting to Google Sheet:', error);
    res.status(500).json({ message: 'Failed to connect to Google Sheet', error: error.message });
  }
};

// Add or update data in the table (dashboard-only)
export const updateTableData = async (req, res) => {
  try {
    const { data } = req.body;
    const tableId = req.params.id;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Data array is required' });
    }
    
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Update dashboard-only data
    table.dashboardOnlyData = data;
    await table.save();
    
    // Broadcast update to all connected clients
    await broadcastTableUpdate(tableId);
    
    res.json({ message: 'Table data updated successfully' });
  } catch (error) {
    console.error('Error updating table data:', error);
    res.status(500).json({ message: 'Failed to update table data', error: error.message });
  }
};

// Manually trigger sync with Google Sheet
export const syncGoogleSheet = async (req, res) => {
  try {
    const tableId = req.params.id;
    
    await syncSheetWithTable(tableId);
    await broadcastTableUpdate(tableId);
    
    res.json({ message: 'Google Sheet sync completed successfully' });
  } catch (error) {
    console.error('Error syncing with Google Sheet:', error);
    res.status(500).json({ message: 'Failed to sync with Google Sheet', error: error.message });
  }
};

// Helper function to merge cached data and dashboard-only data
function mergeTableData(table) {
  if (!table.cachedData) return [];
  
  const result = JSON.parse(JSON.stringify(table.cachedData)); // Deep copy
  
  // If there's dashboard-only data, merge it with cached data
  if (table.dashboardOnlyData && table.dashboardOnlyData.length > 0) {
    table.dashboardOnlyData.forEach((dashboardRow, index) => {
      if (index < result.length) {
        // Merge with existing row
        result[index] = { ...result[index], ...dashboardRow };
      } else {
        // Add new row that only exists in dashboard
        result.push(dashboardRow);
      }
    });
  }
  
  return result;
}