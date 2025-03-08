import { google } from 'googleapis';
import {Table} from '../models/table.model.js'; 

// Setup Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // You'll need to create this file with your Google API credentials
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Function to fetch data from Google Sheet
export const fetchSheetData = async (sheetId, tabName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: tabName,
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return { headers: [], data: [] };
    }
    
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      return rowData;
    });
    
    return { headers, data };
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    throw error;
  }
};

// Function to setup sheet watching
export const watchSheet = async (sheetId) => {
  // This is a placeholder - Google Sheets API doesn't have a built-in webhook system
  // In a real implementation, you would need to use Google Drive API's watch method
  // or implement polling on a schedule
  console.log(`Watching sheet: ${sheetId}`);
};

// Function to sync sheet data with table
export const syncSheetWithTable = async (tableId) => {
  try {
    const table = await Table.findById(tableId);
    if (!table || !table.googleSheetConfig || !table.googleSheetConfig.sheetId) {
      throw new Error('Table not found or not configured with Google Sheet');
    }
    
    const { sheetId, tabName } = table.googleSheetConfig;
    const { headers, data } = await fetchSheetData(sheetId, tabName);
    
    // Update table columns from sheet headers if necessary
    const existingColumns = table.columns.filter(col => col.fromGoogleSheet);
    const existingColNames = existingColumns.map(col => col.name);
    
    // Add any new columns from the Google Sheet
    headers.forEach(header => {
      if (!existingColNames.includes(header)) {
        table.columns.push({
          name: header,
          type: 'string', // Default type, could implement type detection
          fromGoogleSheet: true
        });
      }
    });
    
    // Update cached data
    table.cachedData = data;
    table.googleSheetConfig.lastSyncTimestamp = new Date();
    
    await table.save();
    return table;
  } catch (error) {
    console.error('Error syncing sheet with table:', error);
    throw error;
  }
};

export default {
  fetchSheetData,
  watchSheet,
  syncSheetWithTable
};