// Required testing dependencies
const bcrypt = require('bcrypt');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// Project dependencies
const User = require('../models/user');
const server = require('../../server');

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
                done();
            });
    });
    afterEach((done) => {
        User.remove(() => done());
    });
    describe('GET /users', () => {
        it('should return an array of users', (done) => {
            chai.request(server)
                .post('/api/authenticate')
                .send({
                    username: 'test@dev.com',
                    password: 'secret'
                })
                .then((res) => {
                    return chai.request(server)
                        .get('/api/users')
                        .set('x-access-token', res.body.data.token);
                })
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
});
