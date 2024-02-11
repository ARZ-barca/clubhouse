const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  firstname: { type: String, minLength: 3, maxLength: 50, required: true },
  lastname: { type: String, minLength: 3, maxLength: 50 },
  username: { type: String, minLength: 3, maxLength: 50, required: true },
  passwordHash: { type: String, required: true },
  member: { type: Boolean, default: true },
  admin: { type: Boolean, default: true },
});

authorSchema.virtual("fullname").get(function () {
  return this.firstName + " " + this.lastName;
});

module.exports = mongoose.model("User", authorSchema);
