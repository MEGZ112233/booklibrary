const express = require('express');
const router = express.Router();
const pool = require('../db');

function validateFields(requiredFields, reqBody) {
    const missingFields = requiredFields.filter(field => !reqBody[field] || reqBody[field].toString().trim() === '');
    return missingFields.length === 0 
        ? "ok" 
        : `Missing or empty fields: ${missingFields.join(', ')}`;
}
// Get all the books 
router.get('/book', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM book');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/book', async (req, res) => {
    const requiredFields = ['title', 'author', 'isbn', 'number_of_books', 'price_per_day', 'year_of_publishing'];
    const validationMsg = validateFields(requiredFields, req.body);
    if (validationMsg !== "ok") {
        return res.status(400).send(validationMsg);
    }
    try {
        const { title, author, isbn, number_of_books, price_per_day, year_of_publishing } = req.body;
        const result = await pool.query(`INSERT INTO book (title, author , isbn, number_of_books , price_per_day,year_of_publishing) VALUES ($1,$2,$3,$4,$5,$6) returning *`,[title,author,isbn,number_of_books,price_per_day,year_of_publishing]); 
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.delete('/book', )
module.exports = router;