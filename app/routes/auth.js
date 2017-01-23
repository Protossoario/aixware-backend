const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Errors = require('../errors');

const saltRounds = 10;

router.post('/', (req, res) => {
    User.findOne({
        email: req.body.username
    }, function (err, user) {
        if (err) {
            Errors.respondWithMongooseError(res, err);
        }

        if (!user) {
            Errors.respondWithAuthenticationError('Username not found.');
        } else if (bcrypt.compareSync(req.body.password, user.password)) {
            Errors.respondWithAuthenticationError('Incorrect password.');
        } else {
            let token = jwt.sign(user, app.get('secret'), {
                expiresInMinutes: 1440
            });
            res.json({
                data: {
                    success: true,
                    message: 'Authentication successful.',
                    token: token
                }
            });
        }
    });
});

module.exports = router;
