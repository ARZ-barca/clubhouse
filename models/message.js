const mongoose = require("mongoose");

const { DateTime } = require("luxon");

const messageSchema = new mongoose.Schema({
  title: { type: String, maxLength: 100, required: true },
  content: { type: String, maxLength: 1000, required: true },
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
});

// todo

messageSchema.virtual("createdAt_isodate").get(function () {
  const dt = DateTime.fromJSDate(this.createdAt);
  console.log(this.createdAt);
  return dt.toISODate();
});

module.exports = mongoose.model("Message", messageSchema);
