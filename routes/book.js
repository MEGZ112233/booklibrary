const express = require('express');
const router = express.Router();
const pool = require('../db');

function validateFields(requiredFields, reqBody) {
    const missingFields = requiredFields.filter(field => !reqBody[field] || reqBody[field].toString().trim() === '');
    return missingFields.length === 0
        ? "ok"
        : `Missing or empty fields: ${missingFields.join(', ')}`;
}
function checkInteger(input, pos = false) {
    const num = Number(input);
    return Number.isInteger(num) && String(num) == String(input) && (!pos || num > 0);
}

async function searchBook(title, author, isbn, limit) {
    let query = 'SELECT * FROM book WHERE';
    const values = [];
    if (isbn) {
        query += ' isbn = $1';
        values.push(isbn);
    }
    else if (title) {
        query += ' title = $1';
        values.push(title);
        if (author) {
            query += ' AND author = $2';
            values.push(author);
        }
    } else {
        throw new Error('Either ISBN or Title should be provided');
    }
    if (limit && checkInteger(limit, true)) {
        query += 'LIMIT $' + (values.length + 1);
        values.push(limit);
    }
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (err) {
        throw new Error('Error executing search query');
    }
}
router.get('/book/search', async (req, res) => {
    const { title, author, isbn } = req.body;
    console.log(title);
    try {
        const book = await searchBook(title, author, isbn, 1);
        console.log(book);
        if (book.length === 0) {
            return res.status(404).send('no book found');
        }
        res.status(200).json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});
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
        const result = await pool.query(`INSERT INTO book (title, author , isbn, number_of_books , price_per_day,year_of_publishing) VALUES ($1,$2,$3,$4,$5,$6) returning *`, [title, author, isbn, number_of_books, price_per_day, year_of_publishing]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.delete('/book', async (req, res) => {
    const { title, author, isbn } = req.body;
    const query = 'DELETE FROM book WHERE ';
    const values = [];

    if (isbn) {
        query += 'isbn = $1';
        values.push(isbn);
    }
    else if (title && author) {
        query += 'title = $1  AND  author = $2';
        values.push(title);
        values.push(author);
    }
    if (values.length === 0) {
        return res.status(400).send('please you should provide [isbn] OR [title  ,author]');
    }
    try {
        const res = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).send('no book found');
        }
        res.status(200).send('Book deleted successfully.');
    } catch (err) {
        console.error(err.message);
        return res.status(500).send(err.message);
    }
});
router.delete('/book',)
module.exports = router;