const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const conf = require('../../config/app');
const Errors = require('../errors');

function authMiddleware(req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, conf.secret, function (err, decoded) {
            if (err) {
                return Errors.respondWithAuthenticationError(res, 'Invalid access token.');
            } else {
                req.token = decoded;
                next();
            }
        });
    } else {
        return Errors.respondWithAuthenticationError(res, 'This route requires an access token.');
    }
}

// Import routes with their respective prefix
router.use('/units', require('./units'));
router.use('/authenticate', require('./auth'));

// Routes protected by authentication middleware
router.use(authMiddleware);
router.use('/users', require('./users'));

module.exports = router;
