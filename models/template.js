const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
  department: {
    type: String,
    required: true
  },
  capability: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
      type: String,
      required: true
  },
  cost: String,
  mapImageURL: String,
  downloadURL: {
      type: String,
      required: true
  },
  githubID: String,
  dateUploaded: String,
  authorEmail: {
      type: String,
      required: true
  },
  audience: String,
  visible: {
      type: Boolean,
      default: true
  }, 
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

const Template = mongoose.model('template', TemplateSchema);

module.exports = Template;