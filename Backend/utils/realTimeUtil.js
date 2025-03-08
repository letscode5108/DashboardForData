import { Server } from 'socket.io';
import {Table} from '../models/table.model.js'; 
import { syncSheetWithTable } from '../utils/googleSheetsUtil.js';

// Initialize Socket.IO
let io;

const initialize = (server) => {
  io = new Server(server);
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Handle client subscribing to table updates
    socket.on('subscribeTo', async (tableId) => {
      console.log(`Client ${socket.id} subscribed to table ${tableId}`);
      socket.join(`table:${tableId}`);
      
      try {
        const table = await Table.findById(tableId);
        if (table) {
          // Send initial data to new subscriber
          socket.emit('tableData', {
            tableId,
            columns: table.columns,
            data: mergeTableData(table)
          });
        }
      } catch (error) {
        console.error('Error sending initial data:', error);
        socket.emit('error', { message: 'Failed to load table data' });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
};

// Merge cached data from Google Sheets with dashboard-only data
const mergeTableData = (table) => {
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
};

// Broadcast table updates to all connected clients
const broadcastTableUpdate = (tableId) => {
  if (!io) return Promise.reject(new Error('Socket.IO not initialized'));
  
  return Table.findById(tableId)
    .then(table => {
      if (!table) throw new Error('Table not found');
      
      const mergedData = mergeTableData(table);
      
      io.to(`table:${tableId}`).emit('tableData', {
        tableId,
        columns: table.columns,
        data: mergedData
      });
      
      return { success: true };
    })
    .catch(error => {
      console.error('Error broadcasting table update:', error);
      throw error;
    });
};

// Schedule Google Sheet sync periodically (every 5 minutes)
// In a production app, you might want to use a proper job scheduler like node-cron
const startSyncScheduler = () => {
  setInterval(async () => {
    try {
      const tables = await Table.find({ 'googleSheetConfig.sheetId': { $exists: true, $ne: null } });
      
      for (const table of tables) {
        try {
          await syncSheetWithTable(table._id);
          await broadcastTableUpdate(table._id);
          console.log(`Synced table ${table.name} with Google Sheet`);
        } catch (error) {
          console.error(`Error syncing table ${table.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in sync scheduler:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
};

export {
  initialize,
  broadcastTableUpdate,
  startSyncScheduler
};