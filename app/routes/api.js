const express = require('express');
const router = express.Router();

// Import routes with their respective prefix
router.use('/units', require('./units'));

module.exports = router;
