const mongoose = require('mongoose');

const sumRowSchema = new mongoose.Schema({
  header: { type: String, required: true },
  value: { type: Number, required: true },
});

module.exports = mongoose.model('SumRow', sumRowSchema);
