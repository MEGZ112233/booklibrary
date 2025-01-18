const express = require('express');
const router = express.Router();
const pool = require('../db');
const { searchBook, searchBookTopic, bookExists } = require('../utils/helper');
const CustomError = require('../utils/CustomError');
router.post('/book_topic', async (req, res) => {
    const { title, author, isbn, topic } = req.body;
    try {
        if (!topic) {
            throw new CustomError('the topic must be provided', 400);
        }
        const resultBook = await searchBook(title, author, isbn, topic);
        if (resultBook.length === 0) {
            throw new CustomError('this book does not exist', 404);
        }
        const book_id = resultBook[0].book_id;
        const exist = await searchBookTopic(title, author, isbn, topic);
        if (exist.length !== 0) {
            throw new CustomError('already exist', 400);
        }
        const query = 'INSERT INTO book_topic VALUES ($1,$2)';
        const values = [book_id, topic];
        await pool.query(query, values);
        res.status(201).send('Inserted successfully');
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
});
router.get('/book_topic', async (req, res) => {
    try {
        const { title, author, isbn, topic, limit } = req.body;
        const result = await searchBookTopic(title, author, isbn, topic, limit);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        }
        return res.status(500).send('server erorr');
    }
});

router.delete('/book_topic', async (req, res) => {
    const { title, author, isbn, topic } = req.body;
    try {
        let query = 'DELETE FROM book_topic WHERE 1=1 ';
        let values = [];
        if (topic) {
            values.push(topic);
            query += ' AND topic = $' + values.length;
        }
        if ((title || isbn)) {
            let book_id = await bookExists(title, author, isbn);
            if (book_id === -1) {
                throw new CustomError('the book does not exist ', 404);
            } else {
                values.push(book_id);
                query += ' AND book_id = $' + values.length;
            }
        }

        if (values.length === 0) {
            throw new CustomError('there is no criteria to delete on', 400);
        }
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            throw new CustomError('nothing to delete', 404);
        }
        res.status(200).send('deleted succefuly');
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
});
module.exports = router; 