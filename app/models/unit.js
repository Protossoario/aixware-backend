const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UnitSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    deletedAt: Date
}, {
    timestamps: { }
});

module.exports = mongoose.model('units', UnitSchema);