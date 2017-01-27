const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UnitStatusSchema = new Schema({
    _unitId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    acceleration: {
        type: Number
    },
    velocity: {
        type: Number,
        required: true
    },
    picture: {
        url: {
            type: String,
            required: true
        },
        width: {
            type: Number,
            required: true
        } ,
        height: {
            type: Number,
            required: true
        }
    }
}, {
    timestamps: { }
});

module.exports = mongoose.model('unit-status', UnitStatusSchema);
