// Transaction.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
