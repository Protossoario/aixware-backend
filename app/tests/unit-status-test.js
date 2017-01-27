process.env.NODE_ENV = 'test';

// Require dev dependencies
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// Require project files
const User = require('../models/user');
const UnitStatus = require('../models/unit-status');
const server = require('../../server');

var authToken;
describe('UnitStatus module', () => {
    beforeEach((done) => {
        User.remove()
            .then(() => {
                return bcrypt.hash('secret', 10);
            })
            .then((hash) => {
                let testUser = new User({
                    firstName: 'Test',
                    lastName: 'Dev',
                    email: 'test@dev.com',
                    password: hash
                });
                return testUser.save();
            })
            .then((user) => {
                return chai.request(server)
                    .post('/api/authenticate')
                    .send({
                        username: 'test@dev.com',
                        password: 'secret'
                    });
            })
            .then((res) => {
                authToken = res.body.data.token;
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
    afterEach((done) => {
        User.remove(() => done());
    });
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
                        done(err);
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
        it('should return a properly formatted error for an empty payload', (done) => {
            let unitId = crypto.randomBytes(12).toString('hex');
            chai.request(server)
                .post('/api/units/' + unitId + '/status')
                .send({})
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error).to.have.property('messages');
                    expect(res.body.error.messages).to.deep.equal([ 'Missing picture data.' ]);
                    done();
                });
        });
    });
    describe('GET /units/:unitId/status', () => {
        it('should return the most recently created status', (done) => {
            const unitId = crypto.randomBytes(12).toString('hex');
            let testStatus = new UnitStatus({
                _unitId: unitId,
                latitude: 0,
                longitude: 0,
                picture: {
                    url: '/uploads/test.jpg',
                    width: 1,
                    height: 1
                },
                acceleration: 0,
                velocity: 0
            });
            testStatus.save()
                .then((status) => {
                    return chai.request(server)
                        .get('/api/units/' + unitId + '/status')
                        .set('x-access-token', authToken);
                })
                .then((res) => {
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data).to.have.property('latitude');
                    expect(res.body.data).to.have.property('longitude');
                    expect(res.body.data.latitude).to.be.a('number');
                    expect(res.body.data.longitude).to.be.a('number');
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });
});
