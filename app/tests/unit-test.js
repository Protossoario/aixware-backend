process.env.NODE_ENV = 'test';

// Required testing dependencies
const bcrypt = require('bcrypt');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// Project dependencies
const Unit = require('../models/unit');
const User = require('../models/user');
const server = require('../../server');

var authToken;
describe('Unit module', () => {
    beforeEach((done) => {
        Unit.remove();
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
        Unit.remove(() => { User.remove(() => done()) });
    });
    describe('GET /units', () => {
        it('should return an empty array', (done) => {
            chai.request(server)
                .get('/api/units')
                .set('x-access-token', authToken)
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.have.property('body').that.is.an('object');
                    expect(res.body).to.have.property('data').that.is.an('array');
                    expect(res.body.data).to.have.lengthOf(0);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('should return an error when not authenticated', (done) => {
            chai.request(server)
                .get('/api/units')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res).to.have.property('body').that.is.an('object');
                    expect(res.body).to.have.property('error').that.is.an('object');
                    expect(res.body.error).to.have.property('messages');
                    expect(res.body.error.messages).to.deep.equal([ 'This route requires an access token.' ]);
                    done();
                });
        });
    });
    describe('POST /units', () => {
        it('should create a new unit document', (done) => {
            chai.request(server)
                .post('/api/units')
                .send({
                    name: 'Unidad 1'
                })
                .set('x-access-token', authToken)
                .then((res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('data').that.is.an('object');
                    expect(res.body.data).to.include.keys([ '__v', '_id', 'createdAt', 'name', 'updatedAt' ]);
                    expect(res.body.data.name).to.equal('Unidad 1');
                    done();
                })
                .catch((err) => { done(err) });
        });
        it('should not allow creation without an access token', (done) => {
            chai.request(server)
                .post('/api/users')
                .send({
                    name: 'Unidad 1'
                })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res).to.have.property('body').that.is.an('object');
                    expect(res.body).to.have.property('error').that.is.an('object');
                    expect(res.body.error).to.have.property('messages');
                    expect(res.body.error.messages).to.deep.equal([ 'This route requires an access token.' ]);
                    done();
                });
        });
    });
    describe('PUT /units/:unitId', () => {
        it('should edit a unit document and return the new version', (done) => {
            let testUser = new Unit({
                name: 'Unidad 2'
            });
            testUser.save()
                .then((user) => {
                    return chai.request(server)
                        .put('/api/units/' + user._id)
                        .send({
                            name: 'Unidad 3'
                        })
                        .set('x-access-token', authToken);
                })
                .then((res) => {
                    expect(res.body).to.have.property('data').that.is.an('object');
                    expect(res.body.data).to.include.keys([ '__v', '_id', 'createdAt', 'name', 'updatedAt' ]);
                    expect(res.body.data.name).to.equal('Unidad 3');
                    done();
                })
                .catch((err) => { done(err) });
        });
    });
    describe('DELETE /units/:unitId', () => {
        it('should return a document with the deletedAt property set to a timestamp string', (done) => {
            let testUser = new Unit({
                name: 'Unidad 2'
            });
            testUser.save()
                .then((user) => {
                    return chai.request(server)
                        .delete('/api/units/' + user._id)
                        .set('x-access-token', authToken);
                })
                .then((res) => {
                    expect(res.body).to.have.property('data').that.is.an('object');
                    expect(res.body.data).to.include.keys([ '__v', '_id', 'createdAt', 'deletedAt', 'name' ]);
                    expect(res.body.data.name).to.equal('Unidad 2');
                    expect(res.body.data.deletedAt).to.be.a('string');
                    expect(res.body.data.deletedAt).to.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?/);
                    done();
                })
                .catch((err) => { done(err) });
        });
    });
});
