const express = require('express');
const router = express.Router();

// Import routes with their respective prefix
router.use('/units', require('./units'));
router.use('/users', require('./users'));
router.use('/authenticate', require('./auth'));

module.exports = router;
