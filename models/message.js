const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  title: { type: String, minLength: 3, maxLength: 50, required: true },
  content: { type: String, minLength: 3, maxLength: 500, required: true },
  createdAt: { type: String, default: Date.now },
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "Author" },
});

module.exports = mongoose.model("Message", messageSchema);
