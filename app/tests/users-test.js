const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const User = require('../models/user');
const server = require('../../server');

describe('Users', () => {
    beforeEach((done) => {
        User.remove()
            .then(() => done());
    });
    afterEach((done) => {
        User.remove(() => done());
    });
    describe('GET /users', () => {
        it('should return an empty array', (done) => {
            chai.request(server)
                .get('/api/users')
                .end((err, res) => {
                    if (err) {
                        console.log(res.error);
                        throw err;
                    }
                    expect(res).to.have.status(200);
                    expect(res).to.have.property('body').that.is.an('array');
                    expect(res.body).to.be.empty;
                    done();
                });
        });
    });
});
