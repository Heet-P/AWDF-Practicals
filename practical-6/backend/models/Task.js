const mongoose = require('mongoose');

// MongoDB itself is schema-less; Mongoose enforces this shape in the application
// before any document reaches the database.
const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'title is required'] },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: { values: ['low', 'medium', 'high'], message: 'priority must be low, medium or high' },
    default: 'medium',
  },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook: trim whitespace from the title.
// Note: save hooks run on create()/save(), not on findByIdAndUpdate().
taskSchema.pre('save', function (next) {
  if (typeof this.title === 'string') this.title = this.title.trim();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
