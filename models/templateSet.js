const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TemplateSetSchema = new Schema({
    templateSetTitle: {
        type: String,
        required: true,
        unique: true
    },
    templatesInSet: {
        type: Array,
        required: true,
        default: []
    }
});

const TemplateSet = mongoose.model('TemplateSet', TemplateSetSchema);

module.exports = TemplateSet;