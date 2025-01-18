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

async function searchBook(title, author, isbn, limit = 1) {
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
async function searchBookLocation(title, author, isbn, location_id) {
    // UNTESTED
    console.log('UNTESTED');
    if (!location_id || !checkInteger(location_id, true)) {
        throw new CustomError('invalid location_id', 400);
    }
    try {
        const resultBook = await searchBook(title, author, isbn, 1);
        if (resultBook.length === 0) {
            throw new CustomError('This book does not exist', 404);
        }
        const book_id = resultBook[0].book_id;
        const query = 'SELECT * FROM book_location WHERE book_id = $1 AND location_id = $2';
        const values = [book_id, location_id];
        const result = await pool.query(query, values);
        return result.rows;
    } catch (err) {
        if (err instanceof CustomError) throw err;
        else throw new CustomError('Error occurred at searching at book location ', 500);
    }
}
async function searchBookTopic(title, author, isbn, topic, limit) {
    try {
        let query = 'SELECT * FROM book_topic WHERE 1 =1';
        let values = [];
        if ((title || isbn)) {
            const resultBook = await searchBook(title, author, isbn, 1);
            if (resultBook.length !== 0) {
                const book_id = resultBook[0].book_id;
                values.push(book_id);
                query += ' AND book_id = $' + values.length;
            }
        }
        if (topic) {
            values.push(topic);
            query += ' AND topic = $' + values.length;
        }
        if (checkInteger(limit, true)) {
            values.push(limit);
            query += ' LIMIT $' + values.length;
        }
        const resultBookTopic = await pool.query(query, values);
        return resultBookTopic.rows;
    } catch (err) {
        if (err instanceof CustomError) throw err;
        else {
            console.error(err.message);
            throw new CustomError('Error occurred at searching book Topic', 500);
        }
    }
}
async function bookExists(title, author, isbn) {
    // return id if it's exist return -1 if doesnot exist 
    try {
        const resultBook = await searchBook(title, author, isbn, 1);
        if (resultBook.length !== 0){
            return resultBook[0].book_id ; 
        }else return -1  ; 
    } catch (err) {
        if (err instanceof CustomError) throw err;
        else {
            console.error(err.message);
            throw new CustomError('Error occurred at checking existence book', 500);
        }
    }
}
module.exports = {
    validateFields,
    checkInteger,
    searchBook,
    searchLocation,
    searchBookLocation,
    searchBookTopic,
    bookExists
};