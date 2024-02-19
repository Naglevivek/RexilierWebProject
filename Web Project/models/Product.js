// Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: String,
  category: String,
  price: Number,
  dateAdded: Date,
  sold: { type: Boolean, default: false }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
