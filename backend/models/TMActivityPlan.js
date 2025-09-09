const mongoose = require('mongoose');

const TMActivityPlanSchema = new mongoose.Schema({
    tableData: {
        type: Array,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('TMActivityPlan', TMActivityPlanSchema);
