const mongose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const Errors = require('../errors');
const User = require('../models/user');

/**
 *  Return an array with all registered users.
 */
router.get('/', (req, res) => {
    User.find({ deletedAt: null }, '-password').exec()
        .then((users) => {
            return res.json({
                data: users
            });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

router.post('/', (req, res) => {
    return bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            let newUser = new User(req.body);
            newUser.password = hash;
            return newUser.save();
        })
        .then((user) => {
            let userObj = user.toObject();
            delete userObj.password;
            return res.status(201).json({ data: userObj });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    return User.findById(userId).exec()
        .then((user) => {
            return res.json({ data: user });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

router.put('/:userId', (req, res) => {
    const userId = req.params.userId;
    return User.findByIdAndUpdate(userId, { '$set': req.body }, {
        new: true, // return modified user document as opposed to the original
        runValidators: true,
        fields: '-password'
    }).exec()
        .then((user) => {
            return res.json({ data: user });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

router.delete('/:userId', (req, res) => {
    const userId = req.params.userId;
    return User.findByIdAndUpdate(userId, { '$set': { deletedAt: new Date() } }, {
        new: true,
        runValidators: false,
        fields: '-password'
    }).exec()
        .then((user) => {
            return res.json({ data: user });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

module.exports = router;
