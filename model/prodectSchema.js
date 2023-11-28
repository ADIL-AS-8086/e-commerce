  const mongoose = require("mongoose");


  const { Schema, ObjectId } = mongoose;


  const ProductsSchema = new Schema({
    name: { type: String },
    price:{type:Number,min:0 },
    description: { type: String },
    highlight1:{ type: String },
    highlight2:{ type: String },
    highlight3:{ type: String },
    highlight4:{ type: String },
    stock: { type: Number,min:0 },
    timeStamp: { type: Date },
    images: {type:Array},
    colour: { type: String },
    brand: { type: String},
    sizes: [{ type: String }], 
    categoryId: { type: Schema.Types.ObjectId , ref: 'Category'},
    isDeleted: { type: Boolean, default: false },
    Status: { type: String, enum: ["active", "inactive"], default: "active" },
  },  { timestamps: true });


  const Products = mongoose.model("products", ProductsSchema);

  module.exports = Products;
