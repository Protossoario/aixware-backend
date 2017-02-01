const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UnitSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    licensePlate: {
        type: String,
        required: true
    },
    year: Number,
    make: String,
    deletedAt: Date
}, {
    timestamps: { }
});

module.exports = mongoose.model('units', UnitSchema);