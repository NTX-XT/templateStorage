const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CapabilitySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    icon_image: {
        type: String,
        required: false
    },
    banner_image: {
        type: String,
        required: false
    },
    visible: {
        type: Boolean,
        required: false,
        default: false
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default:0
    },
    createdAt:{
        type: String,
        required: false
    },
    updatedAt: {
        type: String,
        required: false
    }
});

const Capability = mongoose.model('Capability', CapabilitySchema);
module.exports = Capability;