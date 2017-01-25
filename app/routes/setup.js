const mongose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const Errors = require('../errors');
const User = require('../models/user');

/**
 *  Create the default admin user if it doesn't exist
 */
router.get('/', function (req, res, next) {
    User.findOne({ email: 'lalo.sa.94@gmail.com' }, 'firstName lastName email')
        .then((user) => {
            if (user) {
                return res.json({ data: user });
            } else {
                return bcrypt.hash('IlWiBSwG', 10)
                    .then((hash) => {
                        let admin = new User({
                            firstName: 'Eduardo',
                            lastName: 'Sánchez',
                            password: hash,
                            email: 'lalo.sa.94@gmail.com'
                        });
                        return admin.save();
                    })
                    .then((user) => {
                        return res.json({
                            data: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email
                            }
                        });
                    });
            }
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

module.exports = router;
