const express = require('express');
const router = express.Router();
const pool = require('../db');
const CustomError = require('../utils/CustomError');
const { validateFields, checkInteger, searchBook } = require('../utils/helper');
router.get('/book/search', async (req, res) => {
    const { title, author, isbn } = req.body;
    try {
        const book = await searchBook(title, author, isbn, 1);
        if (book.length === 0) {
            return res.status(404).send('Book not found.');
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
    let query = 'DELETE FROM book WHERE ';
    let values = [];

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
        return res.status(400).send('please you should provide [isbn] OR [title ,author]');
    }
    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).send('no book found');
        }
        res.status(200).send('Book deleted successfully.');
    } catch (err) {
        console.error(err.message);
        return res.status(500).send(err.message);
    }
});
router.put('/book', async (req, res) => {
    const { title, author, isbn, number_of_books, price_per_day, year_of_publishing } = req.body;
    let query = "UPDATE book SET ";
    let values = [];
    try {
        const mybook = await searchBook(title, author, isbn, 1);
        if (mybook.length === 0) {
            return res.status(404).send('Book not found');
        }
        const book_id = mybook[0].book_id;
        if (isbn && checkInteger(isbn, true)) {
            if (values.length !== 0) query += ' , ';
            values.push(isbn);
            query += 'isbn = $' + (values.length);
        }
        if (number_of_books && checkInteger(number_of_books, true)) {
            if (values.length !== 0) query += ' , ';
            values.push(number_of_books);
            query += ' number_of_books = $' + (values.length);
        }
        if (price_per_day && Number(price_per_day) > 0.0) {
            if (values.length !== 0) query += ' , ';
            values.push(price_per_day);
            query += 'price_per_day  =  $' + values.length;
        }
        if (year_of_publishing && checkInteger(year_of_publishing)) {
            if (values.length !== 0) query += ' , ';
            values.push(year_of_publishing);
            query += 'year_of_publishing  =  $' + values.length;
        }
        if (values.length === 0) {
            return res.status(404).send('No details to update');
        }
        values.push(book_id);
        query += ' where book_id = $' + values.length;
        pool.query(query, values);
        res.status(200).send('updated succfully');
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else
            res.status(500).send(err.message);
    }
});
module.exports = router;