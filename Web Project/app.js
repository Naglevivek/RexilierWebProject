const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = 3000;

// MongoDB models
const Transaction = require('./models/Transaction');
const Product = require('./models/Product');

// Database connection
mongoose.connect('mongodb://localhost:27017/databaseName', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Initialize database with seed data from third-party API
const initializeDb = async () => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;
    
    // Assuming data contains transactions and products arrays
    await Promise.all([
      Transaction.insertMany(data.transactions),
      Product.insertMany(data.products)
    ]);

    console.log('Database initialized with seed data');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
};

// Initialize database on server start
initializeDb();

// API to list all transactions with search and pagination
app.get('/transactions', async (req, res) => {
  try {
    const { search, page = 1, perPage = 10, month } = req.query;
    const regex = new RegExp(search, 'i');
    
    let query = {
      $or: [{ title: regex }, { description: regex }]
    };

    // Filter by month if provided
    if (month) {
      const startDate = new Date(month);
      const endDate = new Date(new Date(month).setMonth(startDate.getMonth() + 1));

      query.dateOfSale = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API for statistics
app.get('/statistics', async (req, res) => {
  try {
    const { month } = req.query;
    const startDate = new Date(month);
    const endDate = new Date(new Date(month).setMonth(startDate.getMonth() + 1));

    const totalSaleAmount = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: null, totalAmount: { $sum: "$price" } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate }
    });

    const totalNotSoldItems = await Product.countDocuments({
      sold: false,
      dateAdded: { $gte: startDate, $lt: endDate }
    });

    res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API for bar chart
app.get('/bar-chart', async (req, res) => {
  try {
    const { month } = req.query;
    const startDate = new Date(month);
    const endDate = new Date(new Date(month).setMonth(startDate.getMonth() + 1));

    const priceRanges = [
      { range: '0 - 100', count: await Transaction.countDocuments({ price: { $lte: 100 }, dateOfSale: { $gte: startDate, $lt: endDate } }) },
      { range: '101 - 200', count: await Transaction.countDocuments({ price: { $gte: 101, $lte: 200 }, dateOfSale: { $gte: startDate, $lt: endDate } }) },
      // Add other price ranges as needed
    ];

    res.json(priceRanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API for pie chart
app.get('/pie-chart', async (req, res) => {
  try {
    const { month } = req.query;
    const startDate = new Date(month);
    const endDate = new Date(new Date(month).setMonth(startDate.getMonth() + 1));

    const categories = await Product.aggregate([
      { $match: { dateAdded: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
