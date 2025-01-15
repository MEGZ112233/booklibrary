const express = require('express');
const router = express.Router();
const pool = require('../db');
const CustomError = require('./CustomError');
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
        throw new CustomError('Either ISBN or Title must be provided', 400);
    }
    if (limit && checkInteger(limit, true)) {
        query += 'LIMIT $' + (values.length + 1);
        values.push(limit);
    }
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (err) {
        throw new CustomError('An error occurred while searching for the book.', 500);
    }
}
async function searchLocation(location_id) {
    let query = 'SELECT * FROM location WHERE';
    let values = [];
    if (location_id && checkInteger(location_id, true)) {
        try {
            values.push(location_id);
            query += ' location_id = $' + values.length;
            const result = await pool.query(query, values);
            return result.rows;
        } catch (err) {
            throw new CustomError(err.message, 500);
        }
    } else {
        throw new CustomError('invalid location_id', 400);
    }
}
module.exports = {
    validateFields,
    checkInteger,
    searchBook,
    searchLocation,
};