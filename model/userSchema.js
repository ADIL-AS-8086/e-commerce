const mongoose = require('mongoose');
require("dotenv").config()



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
   
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
   // You can customize the status options
    default: true, // Default status if not provided
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
