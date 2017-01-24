process.env.NODE_ENV = 'test';

// Require dev dependencies
const crypto = require('crypto');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// Require project files
const UnitStatus = require('../models/unit-status');
const server = require('../../server');

describe('UnitStatus module', () => {
    describe('POST /units/:unitId/status', () => {
        it('should save status without the pixel array to the database', (done) => {
            let unitId = crypto.randomBytes(12).toString('hex');
            let statusData = {
                latitude: 0,
                longitude: 0,
                picture: {
                    data: [
                        [ 0xFF, 0x00, 0x00, 0xFF ]
                    ],
                    width: 1,
                    height: 1
                },
                acceleration: 0,
                velocity: 0
            };
            chai.request(server)
                .post('/api/units/' + unitId + '/status')
                .send(statusData)
                .end((err, res) => {
                    if (err) {
                        console.log(res.error);
                        throw err;
                    }
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('unitStatus');
                    expect(res.body.unitStatus).to.have.property('picture');
                    expect(res.body.unitStatus.picture).not.to.have.property('data');
                    expect(res.body.unitStatus).to.have.property('_unitId');
                    done();
                });
        });
    });
});
