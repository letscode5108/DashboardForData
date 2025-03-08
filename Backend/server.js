// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';

import { initialize,startSyncScheduler } from './utils/realTimeUtil.js';



// Load environment variables
dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}


));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


const server = http.createServer(app);

// Initialize Socket.IO

initialize(server);
startSyncScheduler();




// Import routes here
import authRouter from './Router/auth.router.js';
import tableRouter from './Router/table.router.js';
//Routes Definition
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tables", tableRouter);







// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});