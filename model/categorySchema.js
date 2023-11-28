const mongoose = require("mongoose");

const { Schema } = mongoose;

const categorySchema = new Schema({
  categoryname: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    required: true,
  },
 
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
