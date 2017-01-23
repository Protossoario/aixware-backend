process.env.NODE_ENV = 'test';

// Required testing dependencies
const bcrypt = require('bcrypt');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// Require project files
const User = require('../models/user');
const server = require('../../server');

describe('Auth', () => {
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
    describe('POST /api/authenticate', () => {
        it('should return a token', () => {
           chai.request(server)
            .post('/api/authenticate')
            .send({
                username: 'test@dev.com',
                password: 'secret'
            })
            .end((err, res) => {
                if (err) {
                    console.log(res.error);
                    throw err;
                }
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('token');
            });
        });
    });
});