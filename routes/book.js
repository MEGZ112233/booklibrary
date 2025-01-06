const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// Get all the books 
router.get('/book', async(req, res) => {
    try{
        const result  = await pool.query('SELECT * FROM book');
        res.json(result.rows) ; 
    }catch(err){
        console.error(err.message) ; 
        res.status(500).send('Server Error');
    }
});

module.exports = router;