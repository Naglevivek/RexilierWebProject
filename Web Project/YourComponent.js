import React, { useState, useEffect } from 'react';
import axios from 'axios';

const YourComponent = () => {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    // Function to fetch transactions data
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/transactions', { params: { month: 'March' } });
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    // Function to fetch statistics data
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('/statistics', { params: { month: 'March' } });
        setStatistics(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    // Function to fetch bar chart data
    const fetchBarChartData = async () => {
      try {
        const response = await axios.get('/bar-chart', { params: { month: 'March' } });
        setBarChartData(response.data);
      } catch (error) {
        console.error('Error fetching bar chart data:', error);
      }
    };

    // Call the fetch functions
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
  }, []); // Empty dependency array to ensure useEffect runs only once

  return (
    <div>
      {/* Render your components using the fetched data */}
    </div>
  );
};

export default YourComponent;