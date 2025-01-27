const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());



const port = process.env.PORT || 3000;
const bookRoutes = require('./routes/book');
const locationRoutes = require('./routes/location');
const book_locationRoutes = require('./routes/book_location');
const book_topicRoutes = require('./routes/book_topic');
const borrowerRoutes = require('./routes/borrower');
const borrowing_transactionRouetes = require('./routes/borrowing_transaction');
app.use('/api', bookRoutes);
app.use('/api', locationRoutes);
app.use('/api', book_locationRoutes);
app.use('/api', book_topicRoutes);
app.use('/api', borrowerRoutes);
app.use('/api' , borrowing_transactionRouetes) ; 
app.listen(port, () => {
    console.log("running on port 3000")
});