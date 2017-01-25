const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Errors = require('../errors');

const conf = require('../../config/app');

router.post('/', (req, res) => {
    if (!req.body.username || !req.body.password) {
        console.log(req.body);
        return Errors.respondWithAuthenticationError(res, 'Missing fields.');
    }
    User.findOne({ email: req.body.username })
        .then((user) => {
            if (user) {
                return bcrypt.compare(req.body.password, user.password);
            }
            return Errors.respondWithAuthenticationError(res, 'Username not found.');
        })
        .then((result) => {
            if (result) {
                let token;
                try {
                    token = jwt.sign({
                        data: req.body.username,
                        // expire token in 24 hours (60 s * 60 m * 24 h)
                        exp: Math.floor(Date.now() / 1000) + (60 * 60) * 24
                    }, conf.secret);
                } catch (err) {
                    return Errors.respondWithAuthenticationError(res, 'Could not sign token.');
                }
                return res.json({
                    data: {
                        success: true,
                        message: 'Authentication successful.',
                        token: token
                    }
                });
            }
            return Errors.respondWithAuthenticationError(res, 'Wrong password.');
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        })
});

module.exports = router;
