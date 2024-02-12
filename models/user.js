const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  firstname: { type: String, maxLength: 50, required: true },
  lastname: { type: String, maxLength: 50 },
  username: { type: String, maxLength: 50, required: true },
  passwordHash: { type: String, required: true },
  member: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
});

authorSchema.virtual("fullname").get(function () {
  return this.firstName + " " + this.lastName;
});

module.exports = mongoose.model("User", authorSchema);
