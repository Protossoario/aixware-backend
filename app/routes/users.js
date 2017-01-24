const mongose = require('mongoose');
const express = require('express');
const router = express.Router();

const Errors = require('../errors');
const User = require('../models/user');

/**
 *  Return an array with all registered users.
 */
router.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            Errors.respondWithMongooseError(res, err);
        }
        res.json({
            data: users
        });
    });
});

module.exports = router;
