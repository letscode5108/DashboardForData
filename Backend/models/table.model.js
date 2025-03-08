import mongoose, {Schema} from "mongoose";
const TableSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  columns: [{
    name: String,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'date'],
      default: 'string'
    },
    fromGoogleSheet: {
      type: Boolean,
      default: false
    }
  }],
  googleSheetConfig: {
    sheetId: String,
    tabName: String,
    lastSyncTimestamp: Date
  },
  cachedData: [{
    type: mongoose.Schema.Types.Mixed
  }],
  dashboardOnlyData: [{
    type: mongoose.Schema.Types.Mixed
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update timestamps
TableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});





export const Table = mongoose.model('Table', TableSchema);