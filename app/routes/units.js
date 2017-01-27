const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const Errors = require('../errors');
const Pictures = require('../pictures');
const Unit = require('../models/unit');
const UnitStatus = require('../models/unit-status');

/**
 *  Receives the unit status update and converts the included picture data into a file.
 */
router.post('/:unitId/status', (req, res) => {
    if (!('picture' in req.body)) {
        return res.json({ error: { 'messages': [ 'Missing picture data.' ] } });
    }
    const rawPixelData = req.body.picture.data;
    const width = req.body.picture.width;
    const height = req.body.picture.height;

    const unitId = req.params.unitId;

    let encodedImage = Pictures.encodeJPEG(Pictures.flattenArray(rawPixelData), width, height);

    let directory = new Date().toISOString()
        .substring(0, 10); // extract the Date part of the ISO String representation
    let name = Pictures.generateRandomName() + '.jpeg';
    let dirPath = path.join(global.appRoot, 'uploads', directory);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    let imagePath = path.join(dirPath, name);

    fs.writeFile(imagePath, encodedImage.data, 'binary', (fsErr) => {
        if (fsErr) {
            console.error(fsErr);
            Errors.respondWithFileError(res, fsErr);
        }

        let statusData = req.body;
        delete statusData.picture.data;
        statusData.picture.url = '/uploads/' + directory + '/' + name;
        statusData._unitId = new mongoose.Types.ObjectId(unitId);

        let newUnitStatus = new UnitStatus(statusData);
        newUnitStatus.save((mongoErr, unitStatus) => {
            if (mongoErr) {
                console.error(mongoErr);
                Errors.respondWithMongooseError(res, mongoErr);
            }
            res.status(201).json({ 'unitStatus': unitStatus });
        });
    });
});

router.get('/:unitId/status', (req, res) => {
    const unitId = req.params.unitId;
    // Using find().limit(1) instead of findOne() for faster queries
    return UnitStatus.find({ _unitId: new ObjectId(unitId) }).sort({ createdAt: 'desc' }).limit(1).exec()
        .then((result) => {
            const statusData = result.length > 0 ? result[0] : {};
            return res.json({ data: statusData });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        })
});

/**
 *  Read all units which have not been soft-deleted, i.e. have deletedAt as null
 */
router.get('/', (req, res) => {
    return Unit.find({ deletedAt: null }).exec()
        .then((result) => {
            return res.json({ data: result });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

router.post('/', (req, res) => {
    let newUnit = new Unit(req.body);
    return newUnit.save()
        .then((unit) => {
            return res.status(201).json({ data: unit });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

router.get('/:unitId', (req, res) => {
    const unitId = req.params.unitId;
    return Unit.findById(unitId).exec()
        .then((unit) => {
            return res.json({ data: unit });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

router.put('/:unitId', (req, res) => {
    const unitId = req.params.unitId;
    return Unit.findByIdAndUpdate(unitId, { '$set': req.body }, {
        new: true, // return the modified document as opposed to the original
        runValidators: true
    }).exec()
        .then((unit) => {
            return res.json({ data: unit });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

/**
 *  Soft-delete the unit by setting the deletedAt property to the current timestamp
 */
router.delete('/:unitId', (req, res) => {
    const unitId = req.params.unitId;
    return Unit.findByIdAndUpdate(unitId, { '$set': { deletedAt: new Date() } }, {
        new: true,
        runValidators: false
    }).exec()
        .then((unit) => {
            return res.json({ data: unit });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        });
});

module.exports = router;
