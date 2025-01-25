const express = require('express');
const router = express.Router();
const pool = require('../db');
const { borrowerSearch, validateFields, checkInteger } = require('../utils/helper');
const CustomError = require('../utils/CustomError');
router.post('/borrower', async (req, res) => {
    try {
        const requiredFields = ['national_id', 'first_name', 'last_name', 'email'];
        const validationMsg = validateFields(requiredFields, req.body);
        const registered_date = new Date().toISOString().split('T')[0];
        if (validationMsg !== 'ok') {
            throw new CustomError(validationMsg, 400);
        }
        const { national_id, first_name, last_name, email } = req.body;
        if (!checkInteger(national_id) || national_id.toString().length !== 14) {
            throw new CustomError('national_id must be a 14-digit number', 400);
        }
        const searchResult = await borrowerSearch(national_id);
        if (searchResult.length !== 0) {
            throw new CustomError('the borrower is already registered', 400);
        }
        const query = 'INSERT INTO borrower (national_id , first_name , last_name , email , registered_date)  values($1,$2,$3,$4 ,$5)';
        const values = [national_id, first_name, last_name, email, registered_date];
        await pool.query(query, values);
        res.status(201).send('registered successfully');
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else res.status(500).send(err.message);
    }
});
router.get('/borrower', async (req, res) => {
    try {
        const result = await borrowerSearch();
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else res.status(500).send(err.message);
    }
});
router.put('/borrower', async (req, res) => {
    try {
        const { national_id, first_name, last_name, email } = req.body;
        if (!checkInteger(national_id) || national_id.toString().length !== 14) {
            throw new CustomError('national_id must be a 14-digit number', 400);
        }
        const searchResult = await borrowerSearch(national_id);
        if (searchResult.length === 0) {
            throw new CustomError('the borrower does not registered', 404);
        }
        let query = 'UPDATE borrower SET  ';
        const values = [], colNames = [];
        if (first_name) {
            values.push(first_name);
            colNames.push('first_name');
        }
        if (last_name) {
            values.push(last_name);
            colNames.push('last_name');
        }
        if (email) {
            colNames.push('email');
            values.push(email);
        }
        if (values.length === 0) {
            throw new CustomError('no information to update please provide information', 400);
        }
        for (let i = 0; i < values.length; i++) {
            if (i == 0) {
                query += colNames[i] + ' = $' + (i + 1);
            } else {
                query += ' , ' + colNames[i] + ' = $'+(i + 1);
            }
        }
        values.push(national_id);
        query += ' WHERE national_id = $' + values.length;
        await pool.query(query, values);
        res.status(200).send('updated successfuly');
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else res.status(500).send(err.message);
    }
});
router.delete('/borrower', async (req, res) => {
    try {
        const { national_id } = req.body;
        if (!checkInteger(national_id) || national_id.toString().length !== 14) {
            throw new CustomError('national_id must be a 14-digit number', 400);
        }
        const searchResult = await borrowerSearch(national_id);
        if (searchResult.length === 0) {
            throw new CustomError('the borrower does not registered', 404);
        }
        let query = 'DELETE FROM borrower WHERE national_id = $1';
        pool.query(query, [national_id]);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).send(err.message);
        } else res.status(500).send(err.message);
    }
});
module.exports = router; 