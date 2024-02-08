const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  firstName: { type: String, minLength: 3, maxLength: 50, required: true },
  lastName: { type: String, minLength: 3, maxLength: 500, required: true },
  passwordHash: { type: String, required: true },
  member: { type: Boolean, default: true },
  admin: { type: Boolean, default: true },
});

authorSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

module.exports = mongoose.model("Author", authorSchema);
