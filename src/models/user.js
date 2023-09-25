const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide your email"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  question: {
    type: String,
    required: [true, "Please tell us your question"],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
