const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const conf = require('../../config/app');
const Errors = require('../errors');

function authMiddleware(req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    // Ignore authentication for POST /units/:id/status endpoint
    if (req.method === 'POST' && req.originalUrl.match(/.*\/api\/units\/[a-zA-Z0-9]+\/status/) !== null) {
        next();
    } else if (token) {
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
router.use('/authenticate', require('./auth'));
router.use('/setup', require('./setup'));

// Routes protected by authentication middleware
router.use(authMiddleware);
router.use('/units', require('./units'));
router.use('/users', require('./users'));

module.exports = router;
