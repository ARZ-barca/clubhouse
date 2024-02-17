const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  title: { type: String, maxLength: 100, required: true },
  content: { type: String, maxLength: 1000, required: true },
  createdAt: { type: String, default: Date.now },
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "Author" },
});

module.exports = mongoose.model("Message", messageSchema);
