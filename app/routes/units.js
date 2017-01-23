"use strict";
const mongoose = require('mongoose');
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
router.post('/:unitId/status', function (req, res) {
    const rawPixelData = req.body.picture.data;
    const width = req.body.picture.width;
    const height = req.body.picture.height;

    let encodedImage = Pictures.encodeJPEG(Pictures.flattenArray(rawPixelData), width, height);

    let directory = new Date().toISOString()
        .substring(0, 10); // extract the Date part of the ISO String representation
    let name = Pictures.generateRandomName() + '.jpeg';
    let dirPath = path.join(global.appRoot, 'uploads', directory);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    let imagePath = path.join(dirPath, name);

    fs.writeFile(imagePath, encodedImage.data, 'binary', function (fsErr) {
        if (fsErr) {
            console.error(fsErr);
            Errors.respondWithFileError(res, fsErr);
        }

        let statusData = req.body;
        delete statusData.picture.data;
        statusData.picture.url = '/uploads/' + directory + '/' + name;
        statusData._unitId = new mongoose.Types.ObjectId(req.params.unitId);

        let newUnitStatus = new UnitStatus(statusData);
        newUnitStatus.save(function (mongoErr, unitStatus) {
            if (mongoErr) {
                console.error(mongoErr);
                Errors.respondWithMongooseError(res, mongoErr);
            }
            res.status(201).json({ 'unitStatus': unitStatus });
        });
    });
});

module.exports = router;
