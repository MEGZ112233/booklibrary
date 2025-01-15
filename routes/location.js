const express = require('express');
const router = express.Router();
const pool = require('../db');
const { validateFields, checkInteger, searchLocation } = require('../utils/helper');
const CustomError = require('../utils/CustomError');
router.get('/location', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM location');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/location', async (req, res) => {
    const requiredFields = ['location_capacity'];
    const validationMsg = validateFields(requiredFields, req.body);
    if (validationMsg !== "ok") {
        return res.status(400).send(validationMsg);
    }
    const { location_capacity } = req.body;
    if (!checkInteger(location_capacity, true)) {
        return res.status(400).send('invalid value for location capacity ');
    }
    try {
        const result = await pool.query(`INSERT INTO location (location_capacity) VALUES ($1) returning *`, [location_capacity]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.delete('/location', async (req, res) => {
    const requiredFields = ['location_id'];
    const validationMsg = validateFields(requiredFields, req.body);
    if (validationMsg !== "ok") {
        return res.status(400).send(validationMsg);
    }
    const { location_id } = req.body;
    if (!checkInteger(location_id, true)) {
        return res.status(400).send('invalid value for id');
    }
    try {
        const result = await pool.query(`DELETE FROM location where location_id = ($1) returning *`, [location_id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Location not exist');
        }
        res.status(204).send('DELETED');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.put('/location', async (req, res) => {
    const requiredFields = ['location_id', 'location_capacity'];
    const validationMsg = validateFields(requiredFields, req.body);
    if (validationMsg !== "ok") {
        return res.status(400).send(validationMsg);
    }
    const { location_id, location_capacity } = req.body;
    if (!checkInteger(location_id, true) || !checkInteger(location_capacity, true)) {
        return res.status(400).send('Invalid input for location_id or location_capacity');
    }
    try {
        const result = await pool.query(`UPDATE location SET location_capacity = ($2)
   WHERE location_id = ($1) returning *`, [location_id, location_capacity]);
        if (result.rows.length === 0) {
            return res.status(404).send('Location not exist');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.get('/location/search', async (req, res) => {
    const { location_id } = req.body;
    try {
        const result = await searchLocation(location_id, res);
        if (result.length === 0) {
            return res.status(404).send('there is no location by this id');
        }
        return res.status(200).json(result);
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).send(err.message);
        } else {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
    }
});
module.exports = router;