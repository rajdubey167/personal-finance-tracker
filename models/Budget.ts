import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: false,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Add non-unique compound index for better query performance
budgetSchema.index({ month: 1, category: 1 });

budgetSchema.pre('save', function(next) {
  if (!this.category || this.category.trim() === '') {
    this.category = null;
  }
  next();
});

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

export default Budget; 