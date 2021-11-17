const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BuildVersionSchema = new Schema({
    version: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

const BuildVersion = mongoose.model('BuildVersion', BuildVersionSchema);
module.exports = BuildVersion;