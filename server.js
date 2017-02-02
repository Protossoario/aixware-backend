// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');

// Set project's root directory inside a global variable
global.appRoot = path.resolve(__dirname);

// Load database configuration file
const db = require('./config/db');

// Connect to MongoDB database
if (process.env.NODE_ENV === 'test') {
    var url = db.testUrl;
} else if (process.env.NODE_ENV === 'production') {
    var url = db.prodUrl;
} else {
    var url = db.url;
}
mongoose.connect(url);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

// Configure Node ES6 promises
mongoose.Promise = global.Promise;

// Get our API routes
const api = require('./app/routes/api');

const app = express();

// Use morgan for logging Apache-style when not testing
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Point static path to dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes with the "/api" prefix
app.use('/api', cors(), api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Create the uploads folder if it doesn't exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));

// Export app for testing
module.exports = app;
