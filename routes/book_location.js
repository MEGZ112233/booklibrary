const express = require('express');
const router = express.Router();
const pool = require('../db');
const { searchBook, searchLocation } = require('../utils/helper');
const CustomError = require('../utils/CustomError');
router.post('/book_location', async (req, res) => {
    const { title, author, isbn, location_id } = req.body;
    try {
        const resBook = await searchBook(title, author, isbn, 1);
        const resLocation = await searchLocation(location_id);
        if (resBook.length === 0) {
            return res.status(404).send('This book does not exist');
        }
        if (resLocation.length === 0) {
            return res.status(404).send('This location does not exist');
        }
        const book_id = resBook[0].book_id;
        const query = 'insert into book_location values ($1 , $2)';
        const values = [book_id, location_id];
        await pool.query(query, values);
        res.status(201).send('Inserted successfully');
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message) ; 
        } else{
            res.status(500).send(err.message);
        }
    }
});
router.get('/book_location', async (req, res) => {
    try {
        const query = 'SELECT * FROM book_location';
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).send('server erorr');
    }
});
router.delete('/book_location', async (req, res) => {
    const { title, author, isbn, location_id } = req.body;
    try {
        const resBook = await searchBook(title, author, isbn, 1);
        const resLocation = await searchLocation(location_id);
        if (resBook.length === 0) {
            return res.status(404).send('This book does not exist');
        }
        if (resLocation.length === 0) {
            return res.status(404).send('This location does not exist');
        }
        const book_id = resBook[0].book_id;
        const query = 'DELETE FROM book_location WHERE book_id = $1 AND location_id = $2';
        const values = [book_id, location_id];
        await pool.query(query, values);
        res.status(201).send('deleted  successfully');
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message) ; 
        } else{
            res.status(500).send(err.message);
        }
    }
});

module.exports = router; 