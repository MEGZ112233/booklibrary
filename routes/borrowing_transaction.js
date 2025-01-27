const express = require('express');
const router = express.Router();
const pool = require('../db');
const { searchBook, checkInteger, validateFields, borrowerSearch, addDays, transactionSearch } = require('../utils/helper');
const CustomError = require('../utils/CustomError');
router.post('/borrowing_transaction', async (req, res) => {
    const { title, author, isbn } = req.body;
    try {
        const resBook = await searchBook(title, author, isbn, 1);
        if (resBook.length === 0) {
            throw new CustomError('This book does not exist', 404);
        }
        const book_id = resBook[0].book_id, price_per_day = resBook[0].price_per_day;
        const requiredFields = ['days', 'national_id'];
        const validationMsg = validateFields(requiredFields, req.body);
        if (validationMsg !== 'ok') {
            throw new CustomError(validationMsg, 400);
        }
        const { national_id, days } = req.body;
        if (!checkInteger(national_id, true)) {
            throw new CustomError('national-id  must be a integer number', 400);
        }

        const resBorrower = await borrowerSearch(national_id);

        if (resBorrower.length === 0) {
            throw new CustomError('this person does not registered yet', 404);
        }
        if (!checkInteger(days, true)) {
            throw new CustomError('Days must be a integer number', 400);
        }

        const curr_date = new Date();
        const start_date = addDays(curr_date, 0);
        const end_date = addDays(curr_date, days);
        const total_price = days * price_per_day;
        let query = 'INSERT INTO borrowing_transaction (book_id , national_id , start_date , end_date , total_price) VALUES ($1,$2,$3,$4,$5) returning *';
        const values = [book_id, national_id, start_date, end_date, total_price];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
});
router.put('/borrowing_transaction', async (req, res) => {
    const { title, author, isbn } = req.body;
    try {
        const resBook = await searchBook(title, author, isbn, 1);
        if (resBook.length === 0) {
            throw new CustomError('This book does not exist', 404);
        }
        const book_id = resBook[0].book_id;
        const requiredFields = ['national_id'];
        const validationMsg = validateFields(requiredFields, req.body);
        if (validationMsg !== 'ok') {
            throw new CustomError(validationMsg, 400);
        }
        const { national_id } = req.body;
        if (!checkInteger(national_id, true)) {
            throw new CustomError('national-id  must be a integer number', 400);
        }
        const resBorrower = await borrowerSearch(national_id);
        if (resBorrower.length === 0) {
            throw new CustomError('this person does not registered yet', 404);
        }
        const transactionResult = await transactionSearch(national_id, book_id, 1);
        if (transactionResult.length === 0) {
            throw new CustomError('this transaction have not happened', 404);
        }
        const transaction_id = transactionResult[0].transaction_id;
        let query = 'UPDATE  borrowing_transaction SET returned =  TRUE  WHERE transaction_id = $1 returning *';
        const values = [transaction_id];
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
});

router.get('/borrowing_transaction/current-books', async (req, res) => {
    try {
        const requiredFields = ['national_id'];
        const validationMsg = validateFields(requiredFields, req.body);
        if (validationMsg !== 'ok') {
            throw new CustomError(validationMsg, 400);
        }
        const { national_id , limit } = req.body;
        if (!checkInteger(national_id, true)) {
            throw new CustomError('national-id  must be a integer number', 400);
        }
        const resBorrower = await borrowerSearch(national_id);
        if (resBorrower.length === 0) {
            throw new CustomError('this person does not registered yet', 404);
        }
        let query =  'SELECT book.title FROM book INNER JOIN borrowing_transaction ON book.book_id = borrowing_transaction.book_id WHERE borrowing_transaction.national_id = $1  AND borrowing_transaction.returned = FALSE '; 
        const values = [national_id];
        if (limit && checkInteger(limit,true)){
            query += ' LIMIT $2' ; 
            values.push(limit) ; 
        }
        const result = await pool.query(query, values);
        if (result.length === 0){
            return res.status(200).send('No borrowing history found') ; 
        }
        res.status(200).json(result.rows);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
});


router.get('/borrowing_transaction/overdue', async (req, res) => {
    try {
        const { limit } = req.body;
        if (!checkInteger(national_id, true)) {
            throw new CustomError('national-id  must be a integer number', 400);
        }
        let query = 'SELECT  b.title,  br.first_name,   br.last_name FROM book b INNER JOIN borrowing_transaction bt ON b.book_id = bt.book_id INNER JOIN borrower br ON br.national_id = bt.national_id WHERE NOW() > bt.end_date AND bt.returned = FALSE;' ; 
        const values = [national_id];
        if (limit && checkInteger(limit,true)){
            query += ' LIMIT $1' ; 
            values.push(limit) ; 
        }
        const result = await pool.query(query, values);
        if (result.length === 0){
            return res.status(200).send('No borrowing history found') ; 
        }
        res.status(200).json(result.rows);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else {
            res.status(500).send(err.message);
        }
    }
});

module.exports = router; 