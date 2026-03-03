const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ["OPS", "FINANCE"] }
});

module.exports = mongoose.model("User", UserSchema);