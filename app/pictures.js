const crypto = require('crypto');
const jpeg = require('jpeg-js');

/**
 *  Converts an vector of arbitrary dimensions into a one-dimensional array.
 *
 *  @param {Array} arr - Input array of arbitrary size.
 *  @return {Array} A one dimensional array with the contents of arr.
 */
function flattenArray (arr) {
    if (arr.length === 0) {
        return arr;
    }
    if (Array.isArray(arr[0])) {
        return flattenArray(arr[0]).concat(flattenArray(arr.slice(1)));
    }
    return [ arr[0] ].concat(flattenArray(arr.slice(1)));
}

/**
 *  Encodes an array of pixels with 4 channels (RGBA) into JPEG format.
 *
 *  @param {Array} pixelArray - One dimensional array of pixels. Its size must equal width * height * 4.
 *  @param {Number} width - Width in pixels of resulting image.
 *  @param {Number} height - Height in pixels of resulting image.
 */
function encodeJPEG (pixelArray, width, height) {
    return jpeg.encode({
        data: new Buffer(pixelArray),
        width: width,
        height: height
    }, 50);
}

/**
 *  Produces a random hash with better efficiency than Math.random() and Date.now().
 *
 *  @source http://stackoverflow.com/a/14869745/3109284
 *  @return {String} Hexadecimal representation of random bytes.
 */
function generateRandomName () {
    return crypto.randomBytes(8).toString('hex');
}

module.exports = {
    flattenArray: flattenArray,
    encodeJPEG: encodeJPEG,
    generateRandomName: generateRandomName
};
