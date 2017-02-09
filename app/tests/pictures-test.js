const chai = require('chai');
const expect = chai.expect;

const Pictures = require('../pictures');

describe('Pictures.flattenArray()', function () {
    it('should return an empty array when an empty array is given', function () {
        expect(Pictures.flattenArray([])).to.deep.equal([]);
    });
    it('should return a flat array when a matrix is given', function () {
        let input = [[ 1, 2 ], [ 3, 4 ]];
        let output = [ 1, 2, 3, 4 ];
        expect(Pictures.flattenArray(input)).to.deep.equal(output);
    });
    it('should return a flat array when a three-dimensional array is given', function () {
        let input = [[[ 1, 2, 3 ], [ 4, 5, 6 ]], [[ 7, 8, 9 ], [ 10, 11, 12 ]]];
        let output = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
        expect(Pictures.flattenArray(input)).to.deep.equal(output);
    });
    it('should return a flat array when an irregular matrix is given', function () {
        let input = [[ 1, 2 ], 3, [[ 4, 5 ], [ 6, 7 ]], 8 ];
        let output = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
        expect(Pictures.flattenArray(input)).to.deep.equal(output);
    });
});

describe('Pictures.encodeJPEG()', function () {
    it('should return a Buffer object with the same width and height', function () {
        let encodedData = Pictures.encodeJPEG(new Buffer([ 0xFF, 0x00, 0x00, 0xFF ]), 1, 1);
        expect(encodedData.data).to.be.an.instanceOf(Buffer);
        expect(encodedData.width).to.equal(1);
        expect(encodedData.height).to.equal(1);
    });
});

describe('Pictures.generateRandomName()', function () {
    it('should generate a string of 16 characters', function () {
        expect(Pictures.generateRandomName()).to.have.lengthOf(16);
    });
    it('should generate 100 names in quick succession without collisions', function () {
        let names = [];
        for (let i = 0; i < 100; i++) {
            names.push(Pictures.generateRandomName());
        }
        for (let i = 0; i < 99; i++) {
            for (let j = i + 1; j < 100; j++) {
                expect(names[i]).to.not.equal(names[j]);
            }
        }
    });
});
