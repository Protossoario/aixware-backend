const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: { }
});

module.exports = mongoose.model('users', UserSchema);
