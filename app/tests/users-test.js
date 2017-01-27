// Required testing dependencies
const bcrypt = require('bcrypt');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// Project dependencies
const User = require('../models/user');
const server = require('../../server');

var authToken;
describe('Users module', () => {
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
            });
    });
    afterEach((done) => {
        User.remove(() => done());
    });
    describe('GET /users', () => {
        it('should return an array of users', (done) => {
            chai.request(server)
                .get('/api/users')
                .set('x-access-token', authToken)
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.have.property('body').that.is.an('object');
                    expect(res.body).to.have.property('data').that.is.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('should return an error when not authenticated', (done) => {
            chai.request(server)
                .get('/api/users')
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
    describe('POST /users', () => {
        it('should create a user document', (done) => {
            chai.request(server)
                .post('/api/users')
                .send({
                    firstName: 'Julia',
                    lastName: 'Lopez',
                    email: 'julia.lopez@gmail.com',
                    password: 'secret'
                })
                .set('x-access-token', authToken)
                .then((res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('data').that.is.an('object');
                    expect(res.body.data).to.include.keys([ 'firstName', 'lastName', 'email' ]);
                    expect(res.body.data).to.not.include.keys([ 'password' ]);
                    done();
                })
                .catch((err) => { done(err) });
        });
        it('should not allow creation without an access token', (done) => {
            chai.request(server)
                .post('/api/users')
                .send({
                    firstName: 'José',
                    lastName: 'Lourdes',
                    email: 'jose.lourdes@gmail.com',
                    password: 'secret'
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
    describe('PUT /users', () => {
        it('should edit a user document and return the new version', (done) => {
            let testUser = new User({
                firstName: 'Juan',
                lastName: 'Lozano',
                email: 'juan.lozano@gmail.com',
                password: 'unhashedpassword'
            });
            testUser.save()
                .then((user) => {
                    return chai.request(server)
                        .put('/api/users/' + user._id)
                        .send({
                            firstName: 'Juanito',
                            lastName: 'Limón',
                            email: 'juanito.limon@gmail.com'
                        })
                        .set('x-access-token', authToken);
                })
                .then((res) => {
                    expect(res.body).to.have.property('data').that.is.an('object');
                    expect(res.body.data).to.include.keys([ 'firstName', 'lastName', 'email' ]);
                    expect(res.body.data).to.not.include.keys([ 'password' ]);
                    expect(res.body.data.firstName).to.equal('Juanito');
                    expect(res.body.data.lastName).to.equal('Limón');
                    expect(res.body.data.email).to.equal('juanito.limon@gmail.com');
                    done();
                })
                .catch((err) => { done(err) });
        });
        it('should require the old password to change it', (done) => {
            chai.request(server)
                .post('/api/users')
                .send({
                    firstName: 'Jorge',
                    lastName: 'Lagos',
                    email: 'jorge.lagos@hotmail.com',
                    password: 'secret'
                })
                .set('x-access-token', authToken)
                .then((res) => {
                    return chai.request(server)
                        .put('/api/users/' + res.body.data._id)
                        .send({
                            password: 'new-secret'
                        })
                        .set('x-access-token', authToken);
                })
                .then((res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.not.have.property('data');
                    done(new Error('Should not be getting through here.'));
                })
                .catch((err) => {
                    expect(err).to.not.be.null;
                    done();
                });
        });
    });
    describe('DELETE /users/:userId', () => {
        it('should edit a user document and return the new version', (done) => {
            let testUser = new User({
                firstName: 'Juan',
                lastName: 'Lozano',
                email: 'juan.lozano@gmail.com',
                password: 'unhashedpassword'
            });
            testUser.save()
                .then((user) => {
                    return chai.request(server)
                        .delete('/api/users/' + user._id)
                        .set('x-access-token', authToken);
                })
                .then((res) => {
                    expect(res.body).to.have.property('data').that.is.an('object');
                    expect(res.body.data).to.have.property('deletedAt');
                    expect(res.body.data).to.not.have.property('password');
                    expect(res.body.data.deletedAt).to.be.a('string');
                    expect(res.body.data.deletedAt).to.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?/);
                    done();
                })
                .catch((err) => { done(err) });
        });
    });
});
