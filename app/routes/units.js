const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const Errors = require('../errors');
const Pictures = require('../pictures');
const UnitStatus = require('../models/unit-status');

/**
 *  Receives the unit status update and converts the included picture data into a file.
 */
router.post('/:unitId/status', (req, res) => {
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
    return UnitStatus.find({ _unitId: new ObjectId(unitId) }).sort({ createdAt: 'desc' }).limit(1).exec()
        .then((result) => {
            const statusData = result.length > 0 ? result[0] : {};
            return res.json({ data: statusData });
        })
        .catch((err) => {
            return Errors.respondWithMongooseError(res, err);
        })
});

module.exports = router;
